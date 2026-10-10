// Try-On Phase C (technical setup) — Founder-only check of a saved supplier photo.
// Reads the variant from the database (never a browser-supplied link), fetches only
// from verified CJ image servers, and returns facts about the file. No AI, no
// generation, no storage writes, no change to the product or its readiness.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { PILOT_CJ_PID } from "@/lib/vendors/cj-pilot";
import { PILOT_IMAGE_MAX_BYTES, imageSize, refuseCjImageUrl, sniffImage } from "./pilot-image";

export type PilotImageCheck = {
  ok: boolean;
  reason: string | null;
  sizeLabel: string | null;
  host: string | null;
  fileType: string | null;
  bytes: number | null;
  width: number | null;
  height: number | null;
  sha256: string | null;
  checkedAt: string;
};

export const checkPilotVariantImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ variantId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }): Promise<PilotImageCheck> => {
    const { supabase, userId } = context;
    const [a, s] = await Promise.all([
      supabase.rpc("has_role", { _user_id: userId, _role: "admin" }),
      supabase.rpc("has_role", { _user_id: userId, _role: "super_admin" }),
    ]);
    if (a.error || s.error || !(a.data || s.data)) throw new Error("Founder access only.");

    const { data: v, error } = await supabase
      .from("canonical_product_variants")
      .select("id,option_label,image_url,canonical_products(publication_status,product_sources(source_type,source_ref))")
      .eq("id", data.variantId)
      .maybeSingle();
    if (error || !v) throw new Error("That size isn't among your saved products.");
    const p = (v as any).canonical_products;
    const sources: Array<{ source_type: string; source_ref: string }> = p?.product_sources ?? [];
    const base = { sizeLabel: v.option_label, checkedAt: new Date().toISOString() };
    const fail = (reason: string): PilotImageCheck => ({ ok: false, reason, host: null, fileType: null, bytes: null, width: null, height: null, sha256: null, ...base });

    if (p?.publication_status !== "unpublished") return fail("Only private unpublished pilot drafts can be checked here.");
    if (!sources.some((x) => x.source_type === "cj" && x.source_ref === PILOT_CJ_PID)) return fail("Only the approved CJ pilot product can be checked here.");

    const refused = refuseCjImageUrl(v.image_url);
    if (refused) return fail(refused);
    const url = new URL(v.image_url!);

    let res: Response;
    try {
      res = await fetch(url.toString(), { redirect: "error", signal: AbortSignal.timeout(10_000) });
    } catch {
      return fail("The CJ image server didn't respond (or tried to redirect elsewhere).");
    }
    if (!res.ok) return fail(`The CJ image server answered ${res.status}.`);
    if (!(res.headers.get("content-type") ?? "").toLowerCase().startsWith("image/")) return fail("The link did not return an image.");
    if (Number(res.headers.get("content-length") ?? 0) > PILOT_IMAGE_MAX_BYTES) return fail("The photo is too large.");
    const buf = new Uint8Array(await res.arrayBuffer());
    if (buf.length === 0 || buf.length > PILOT_IMAGE_MAX_BYTES) return fail("The photo is empty or too large.");
    const kind = sniffImage(buf);
    if (!kind) return fail("The file is not a real JPEG, PNG or WebP photo.");
    const dims = imageSize(buf, kind);
    const hash = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", buf)))
      .map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 16);
    return { ok: true, reason: null, host: url.hostname, fileType: kind, bytes: buf.length, width: dims?.width ?? null, height: dims?.height ?? null, sha256: hash, ...base };
  });
