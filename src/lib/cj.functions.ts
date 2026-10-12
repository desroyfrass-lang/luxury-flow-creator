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

export async function cjGet<T = unknown>(path: string, params: Record<string, string | number> = {}): Promise<T> {
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

type CjListResponse = { list: unknown[]; total: number; pageNum: number; pageSize: number };


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
    const { error } = await (supabaseAdmin.from("cj_import_queue") as any)
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

    const { error } = await (context.supabase.from("cj_import_queue") as any).update(patch).eq("id", data.id);
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

// ── Founder CJ review queue (read + draft name only; never imports/publishes) ──
export type CjReviewItem = {
  id: string;
  cjPid: string;
  supplierTitle: string;
  draftName: string | null;
  imageUrl: string | null;
  images: string[];
  supplierPrice: number | null;
  status: string;
  createdAt: string;
};

function supplierImages(cj: Record<string, unknown>, primary: string | null): string[] {
  const out = new Set<string>();
  if (primary) out.add(primary);
  for (const key of ["productImage", "productImageSet", "bigImage"]) {
    const v = cj[key];
    let arr: unknown[] = [];
    if (Array.isArray(v)) arr = v;
    else if (typeof v === "string") {
      try { const p = JSON.parse(v); arr = Array.isArray(p) ? p : [v]; } catch { arr = [v]; }
    }
    for (const u of arr) if (typeof u === "string" && /^https:\/\//.test(u)) out.add(u);
  }
  return [...out].slice(0, 12);
}

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (data !== true) throw new Error("Founder only");
}

/** Every pending CJ queue record, with the supplier's original title kept from cj_data. */
export const founderListCjPending = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<CjReviewItem[]> => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("cj_import_queue")
      .select("id, cj_pid, cj_data, title, image_url, source_price, status, created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(200);
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => {
      const cj = (r.cj_data ?? {}) as Record<string, unknown>;
      const original = String(cj.productNameEn ?? cj.productName ?? r.title ?? "Untitled");
      return {
        id: r.id,
        cjPid: r.cj_pid,
        supplierTitle: original,
        draftName: r.title && r.title !== original ? r.title : null,
        imageUrl: r.image_url || null,
        images: supplierImages(cj, r.image_url || null),
        supplierPrice: r.source_price == null ? null : Number(r.source_price),
        status: r.status,
        createdAt: r.created_at,
      };
    });
  });

/** Save a Founder working name. CJ's original (cj_data) and status are never changed. */
export const founderSaveCjDraftName = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; name: string }) => {
    const name = String(d?.name ?? "").trim();
    if (!/^[0-9a-f-]{36}$/i.test(String(d?.id))) throw new Error("Invalid record");
    if (name.length < 2 || name.length > 120) throw new Error("Name must be 2–120 characters");
    return { id: d.id, name };
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { data: row, error } = await context.supabase
      .from("cj_import_queue")
      .update({ title: data.name })
      .eq("id", data.id)
      .eq("status", "pending")
      .select("id, title")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Record not found or no longer pending");
    return { ok: true, name: row.title };
  });
