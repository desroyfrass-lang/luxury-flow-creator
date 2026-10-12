// Read-only CJ supplier detail cache for queue records. Only GET /product/query;
// writes only the private cj_detail* columns. Never imports, publishes or writes to Shopify/CJ.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { cjGet } from "@/lib/cj.functions";
import { canRefreshDetail, mapCjQueueDetail } from "./cj-station";

async function requireFounder(ctx: { supabase: any; userId: string }) {
  const [a, s] = await Promise.all([
    ctx.supabase.rpc("has_role", { _user_id: ctx.userId, _role: "admin" }),
    ctx.supabase.rpc("has_role", { _user_id: ctx.userId, _role: "super_admin" }),
  ]);
  if (a.error || s.error || !(a.data || s.data)) throw new Error("Founder access only.");
}

/** Read-only CJ detail refresh for one queue record (rate-limited). Writes only the private cache columns. */
export const refreshCjQueueDetail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ queueId: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    await requireFounder(context);
    const { data: row, error } = await context.supabase.from("cj_import_queue").select("id, cj_pid, cj_detail_fetched_at").eq("id", data.queueId).maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Queue record not found.");
    if (!canRefreshDetail(row.cj_detail_fetched_at, Date.now())) throw new Error("Details were fetched less than 10 minutes ago. Try again later.");
    const fetchedAt = new Date().toISOString();
    try {
      const raw = await cjGet<Record<string, unknown>>("/product/query", { pid: row.cj_pid });
      const detail = mapCjQueueDetail(raw ?? {}, row.cj_pid, fetchedAt);
      const { error: uErr } = await context.supabase.from("cj_import_queue")
        .update({ cj_detail: detail as any, cj_detail_fetched_at: fetchedAt, cj_detail_error: null }).eq("id", row.id);
      if (uErr) throw new Error(`Details fetched but not saved: ${uErr.message}`);
      return { ok: true as const, images: detail.images.length, variants: detail.variants.length, fetchedAt };
    } catch (e) {
      const msg = (e instanceof Error ? e.message : "CJ request failed").slice(0, 300);
      // Keep any earlier cached detail; only record the failure.
      await context.supabase.from("cj_import_queue").update({ cj_detail_error: msg }).eq("id", row.id);
      throw new Error(`CJ details unavailable: ${msg}`);
    }
  });
