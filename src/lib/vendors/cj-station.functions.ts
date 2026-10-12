// Founder CJ review station — server side. Reads stored cj_import_queue rows,
// creates private drafts through create_classified_product_draft, and only
// after a confirmed save marks the queue row "drafted" (reversible). Never
// imports to the storefront, publishes, or writes to Shopify or CJ.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { isEditableProductCategory } from "./cj-pilot";
import { draftPayload, mapQueueRow, type StationItem } from "./cj-station";

async function requireFounder(ctx: { supabase: any; userId: string }) {
  const [a, s] = await Promise.all([
    ctx.supabase.rpc("has_role", { _user_id: ctx.userId, _role: "admin" }),
    ctx.supabase.rpc("has_role", { _user_id: ctx.userId, _role: "super_admin" }),
  ]);
  if (a.error || s.error || !(a.data || s.data)) throw new Error("Founder access only.");
}

const COLS = "id, cj_pid, cj_data, title, image_url, source_price, status, created_at";

async function findDraft(supabase: any, pid: string): Promise<string | null> {
  const { data, error } = await supabase.from("product_sources").select("product_id").eq("source_type", "cj").eq("source_ref", pid).limit(1).maybeSingle();
  if (error) throw new Error(error.message);
  return data?.product_id ?? null;
}

export const listCjStation = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ items: StationItem[]; counts: { pending: number; drafted: number }; podProviders: Array<{ name: string; status: string }> }> => {
    await requireFounder(context);
    const { data, error } = await context.supabase.from("cj_import_queue").select(COLS)
      .in("status", ["pending", "drafted"]).order("created_at", { ascending: true }).limit(200);
    if (error) throw new Error(error.message);
    const rows = (data ?? []) as any[];
    const pids = rows.map((r) => r.cj_pid);
    const links = new Map<string, string>();
    if (pids.length) {
      const { data: src, error: e2 } = await context.supabase.from("product_sources").select("product_id, source_ref").eq("source_type", "cj").in("source_ref", pids);
      if (e2) throw new Error(e2.message);
      for (const s of src ?? []) links.set(s.source_ref, s.product_id);
    }
    const items = rows.map((r) => mapQueueRow(r, links.get(r.cj_pid) ?? null));
    // Persisted print-on-demand records, reported with their real status (never implied connected).
    const { data: pods } = await context.supabase.from("pod_providers").select("name, status").order("name");
    const podProviders = ((pods ?? []) as any[]).map((x) => ({ name: String(x.name), status: String(x.status) }));
    return { items, podProviders, counts: { pending: items.filter((i) => i.status === "pending").length, drafted: items.filter((i) => i.status === "drafted").length } };
  });

export const saveCjStationDraft = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({
    queueId: z.string().uuid(),
    vendorId: z.string().uuid(),
    finalName: z.string().trim().min(3).max(120),
    primaryStore: z.string().min(1),
    categoryKey: z.string().min(1),
  }).parse(i))
  .handler(async ({ data, context }) => {
    await requireFounder(context);
    if (!isEditableProductCategory(data.primaryStore, data.categoryKey)) throw new Error("Choose a confirmed product category.");
    const { data: row, error } = await context.supabase.from("cj_import_queue").select(COLS).eq("id", data.queueId).maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Queue record not found.");
    if (row.status !== "pending" && row.status !== "drafted") throw new Error("This record is not open for review.");
    const { data: vendor } = await context.supabase.from("vendor_profiles").select("id, owner_id, vendor_kind").eq("id", data.vendorId).maybeSingle();
    if (!vendor || vendor.owner_id !== context.userId || vendor.vendor_kind !== "supplier") throw new Error("Choose one of your own supplier brands.");

    // Idempotent: one draft per CJ product. A retry reuses the existing draft.
    let productId = await findDraft(context.supabase, row.cj_pid);
    const reused = Boolean(productId);
    if (!productId) {
      const item = mapQueueRow(row); // built from the stored server record, never the browser
      const p = draftPayload(item);
      const { data: id, error: rpcErr } = await context.supabase.rpc("create_classified_product_draft", {
        _vendor_id: data.vendorId, _title: data.finalName, _description: "", _source_type: "cj", _source_ref: row.cj_pid,
        _primary_store: data.primaryStore, _category_key: data.categoryKey, _supplier_original_name: item.supplierTitle,
        _offer: p.offer, _media: p.media, _variants: p.variants,
      });
      if (rpcErr) {
        if (rpcErr.code === "23505") productId = await findDraft(context.supabase, row.cj_pid);
        if (!productId) throw new Error(`Draft not saved: ${rpcErr.message}`);
      } else productId = id as string;
    }
    // Only after the draft is confirmed: mark the queue row drafted (reversible). CJ snapshot is untouched.
    const { data: marked, error: mErr } = await context.supabase.from("cj_import_queue")
      .update({ status: "drafted", title: data.finalName, decided_by: context.userId, decided_at: new Date().toISOString() })
      .eq("id", row.id).in("status", ["pending", "drafted"]).select("id, status").maybeSingle();
    if (mErr || !marked) throw new Error("Draft saved, but the queue was not updated. Saving again is safe.");
    return { productId: productId as string, reused, queueStatus: "drafted" as const, published: false as const };
  });

/** Reverse "drafted" back to pending. The private draft is kept, never deleted. */
export const reopenCjStationItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ queueId: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    await requireFounder(context);
    const { data: row, error } = await context.supabase.from("cj_import_queue")
      .update({ status: "pending" }).eq("id", data.queueId).eq("status", "drafted").select("id, status").maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Only drafted records can be reopened.");
    return { queueStatus: "pending" as const };
  });
