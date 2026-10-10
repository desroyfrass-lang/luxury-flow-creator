import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type Ctx = { supabase: any; userId: string };

async function assertFounderStaff({ supabase, userId }: Ctx) {
  const [a, s] = await Promise.all([
    supabase.rpc("has_role", { _user_id: userId, _role: "admin" }),
    supabase.rpc("has_role", { _user_id: userId, _role: "super_admin" }),
  ]);
  if (a.error || s.error) throw new Error("Could not check your access right now.");
  if (!a.data && !s.data) throw new Error("Founder access only.");
}

export type QueueRow = {
  variantId: string;
  productId: string;
  productTitle: string;
  categoryKey: string | null;
  publicationStatus: string;
  optionLabel: string | null;
  sku: string | null;
  variantImageUrl: string | null;
  status: string;
  method: string | null;
  reviewNote: string;
  reviewedAt: string | null;
};

export const listTryOnQueue = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<QueueRow[]> => {
    await assertFounderStaff(context);
    const { data, error } = await context.supabase
      .from("tryon_readiness")
      .select(
        "variant_id,product_id,status,method,review_note,reviewed_at,canonical_products(title,category_key,publication_status),canonical_product_variants(option_label,sku,image_url,created_at)",
      )
      .order("created_at", { ascending: true });
    if (error) throw new Error("Could not load the preparation queue.");
    return (data ?? []).map((r: any) => ({
      variantId: r.variant_id,
      productId: r.product_id,
      productTitle: r.canonical_products?.title ?? "",
      categoryKey: r.canonical_products?.category_key ?? null,
      publicationStatus: r.canonical_products?.publication_status ?? "",
      optionLabel: r.canonical_product_variants?.option_label ?? null,
      sku: r.canonical_product_variants?.sku ?? null,
      variantImageUrl: r.canonical_product_variants?.image_url ?? null,
      status: r.status,
      method: r.method,
      reviewNote: r.review_note,
      reviewedAt: r.reviewed_at,
    }));
  });

const decideSchema = z.object({
  variantId: z.string().uuid(),
  status: z.enum(["not_ready", "in_review", "ready", "not_supported"]),
  method: z.enum(["full_body_garment", "feet_legs", "head_shoulders"]).nullable(),
  note: z.string().max(2000),
});

export const decideTryOnReadiness = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => decideSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertFounderStaff(context);
    const { error } = await context.supabase.rpc("founder_decide_tryon_readiness", {
      _variant_id: data.variantId,
      _status: data.status,
      _method: data.method as string,
      _note: data.note,
    });
    if (error) throw new Error(error.message || "Could not save the decision. Nothing was changed.");
    return { ok: true };
  });
