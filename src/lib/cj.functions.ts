import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * CJ Dropshipping API integration.
 * Docs: https://developers.cjdropshipping.com/en/api/overview.html
 * Auth: POST /authentication/getAccessToken { email, password: apiKey }
 * Token lifetime: 15 days.
 */

const CJ_BASE = "https://developers.cjdropshipping.com/api2.0/v1";

// In-worker cache for the CJ access token (per instance; short-lived).
let cachedToken: { token: string; expiresAt: number } | null = null;

async function cjLogin(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.token;
  }
  const email = process.env.CJ_EMAIL;
  const apiKey = process.env.CJ_API_KEY;
  if (!email || !apiKey) {
    throw new Error("CJ credentials missing. Set CJ_EMAIL and CJ_API_KEY.");
  }
  const res = await fetch(`${CJ_BASE}/authentication/getAccessToken`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: apiKey }),
  });
  const json = (await res.json()) as {
    code: number;
    message: string;
    result: boolean;
    data?: { accessToken: string; accessTokenExpiryDate: string };
  };
  if (!json.result || !json.data?.accessToken) {
    throw new Error(`CJ login failed: ${json.message || "unknown error"}`);
  }
  const expiresAt = new Date(json.data.accessTokenExpiryDate).getTime() || Date.now() + 12 * 3600_000;
  cachedToken = { token: json.data.accessToken, expiresAt };
  return json.data.accessToken;
}

async function cjGet<T = unknown>(path: string, params: Record<string, string | number> = {}): Promise<T> {
  const token = await cjLogin();
  const url = new URL(`${CJ_BASE}${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));
  const res = await fetch(url.toString(), {
    headers: { "CJ-Access-Token": token, "Content-Type": "application/json" },
  });
  const json = (await res.json()) as { code: number; message: string; result: boolean; data?: T };
  if (!json.result) throw new Error(`CJ API error: ${json.message}`);
  return json.data as T;
}

/** Pull one page of CJ products (raw list). */
export const listCjProducts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { pageNum?: number; pageSize?: number; keyword?: string }) => d)
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Admin only");

    const params: Record<string, string | number> = {
      pageNum: data.pageNum ?? 1,
      pageSize: Math.min(data.pageSize ?? 20, 50),
    };
    if (data.keyword) params.productNameEn = data.keyword;

    const res = await cjGet<{ list: Array<Record<string, unknown>>; total: number; pageNum: number; pageSize: number }>(
      "/product/list",
      params,
    );
    return res;
  });

/** Fetch the current CJ product being reviewed (the oldest pending item, or null). */
export const nextPendingCj = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Admin only");
    const { data, error } = await context.supabase
      .from("cj_import_queue")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data;
  });

/** Queue counters for the admin dashboard. */
export const queueStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Admin only");
    const { data, error } = await context.supabase.from("cj_import_queue").select("status");
    if (error) throw error;
    const counts: Record<string, number> = { pending: 0, categorized: 0, imported: 0, skipped: 0 };
    for (const r of data ?? []) counts[r.status] = (counts[r.status] ?? 0) + 1;
    return counts;
  });

/**
 * Pull a page from CJ and upsert each product into the queue as 'pending'.
 * Idempotent by cj_pid.
 */
export const importCjPage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { pageNum?: number; pageSize?: number; keyword?: string }) => d)
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Admin only");

    const params: Record<string, string | number> = {
      pageNum: data.pageNum ?? 1,
      pageSize: Math.min(data.pageSize ?? 20, 50),
    };
    if (data.keyword) params.productNameEn = data.keyword;

    const res = await cjGet<{ list: Array<Record<string, unknown>>; total: number }>(
      "/product/list",
      params,
    );

    const rows = (res.list ?? []).map((p) => {
      const pid = String(p.pid ?? p.productId ?? "");
      const src = Number(p.sellPrice ?? 0);
      // Simple markup: 2.5× rounded to .99, floor at $9.99
      const suggested = Math.max(9.99, Math.round(src * 2.5) - 0.01);
      return {
        cj_pid: pid,
        cj_data: p,
        title: String(p.productNameEn ?? p.productName ?? "Untitled"),
        image_url: String(p.productImage ?? ""),
        source_price: isFinite(src) ? src : null,
        suggested_price: isFinite(suggested) ? suggested : null,
        status: "pending",
      };
    });

    if (rows.length === 0) return { inserted: 0, total: res.total };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("cj_import_queue")
      .upsert(rows, { onConflict: "cj_pid", ignoreDuplicates: true });
    if (error) throw error;
    return { inserted: rows.length, total: res.total };
  });

/** Save the admin's categorization decision for a queue item. */
export const categorizeCj = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      id: string;
      title?: string;
      suggested_price?: number;
      brand?: string; // frass-kicks | frass-drip | bare-drip
      gender?: string; // men | women | unisex
      category?: string; // work, party, casual, street, vacay, sport, swimwear, ...
      subcategory?: string; // jackets, sweaters, corset-tops, ...
      tags?: string[];
      notes?: string;
    }) => d,
  )
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Admin only");

    const patch: Record<string, unknown> = {
      status: "categorized",
      decided_by: context.userId,
      decided_at: new Date().toISOString(),
    };
    for (const k of ["title", "suggested_price", "brand", "gender", "category", "subcategory", "tags", "notes"] as const) {
      if (data[k] !== undefined) patch[k] = data[k];
    }

    const { error } = await context.supabase.from("cj_import_queue").update(patch).eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

/** Skip an item without importing it. */
export const skipCj = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; reason?: string }) => d)
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Admin only");
    const { error } = await context.supabase
      .from("cj_import_queue")
      .update({
        status: "skipped",
        notes: data.reason ?? null,
        decided_by: context.userId,
        decided_at: new Date().toISOString(),
      })
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });
