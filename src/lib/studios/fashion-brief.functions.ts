import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { buildProductHandoff } from "@/lib/vendors/product-handoff";
import { EMPTY_FASHION_BRIEF, fashionBriefIdsSchema, fashionBriefSaveSchema, type FashionBrief } from "./fashion-brief";

type Ctx = { supabase: any; userId: string };

/** Re-verifies Founder/owner access and product↔variant match from saved rows. Throws if not allowed. */
async function verify({ supabase, userId }: Ctx, productId: string, variantId: string) {
  const [a, s, p, v] = await Promise.all([
    supabase.rpc("has_role", { _user_id: userId, _role: "admin" }),
    supabase.rpc("has_role", { _user_id: userId, _role: "super_admin" }),
    supabase.from("canonical_products").select("id,title,category_key,draft_status,publication_status,vendor_id,vendor_profiles(owner_id)").eq("id", productId).maybeSingle(),
    supabase.from("canonical_product_variants").select("id,product_id,source_variant_ref,sku,option_label,image_url").eq("id", variantId).maybeSingle(),
  ]);
  if (a.error || s.error || p.error || v.error) throw new Error("Could not check this product right now.");
  const row = p.data as any;
  const product = row ? { ...row, vendor_owner_id: row.vendor_profiles?.owner_id ?? null } : null;
  buildProductHandoff({ userId, isFounderStaff: !!(a.data || s.data) }, product, v.data as any);
}

const toBrief = (r: any): FashionBrief =>
  r ? { concept: r.concept, stylingDirection: r.styling_direction, notes: r.notes, updatedAt: r.updated_at } : EMPTY_FASHION_BRIEF;

export const getFashionBrief = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => fashionBriefIdsSchema.parse(d))
  .handler(async ({ data, context }) => {
    await verify(context, data.productId, data.variantId);
    const { data: row, error } = await context.supabase
      .from("fashion_design_briefs")
      .select("concept,styling_direction,notes,updated_at")
      .eq("product_id", data.productId).eq("variant_id", data.variantId).maybeSingle();
    if (error) throw new Error("Could not load the design brief.");
    return toBrief(row);
  });

export const saveFashionBrief = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => fashionBriefSaveSchema.parse(d))
  .handler(async ({ data, context }) => {
    await verify(context, data.productId, data.variantId);
    const { supabase, userId } = context;
    const fields = { concept: data.concept, styling_direction: data.stylingDirection, notes: data.notes, updated_by: userId };
    const { data: existing, error: readErr } = await supabase
      .from("fashion_design_briefs").select("id").eq("product_id", data.productId).eq("variant_id", data.variantId).maybeSingle();
    if (readErr) throw new Error("Could not save the design brief.");
    const res = existing
      ? await supabase.from("fashion_design_briefs").update(fields).eq("id", existing.id).select("concept,styling_direction,notes,updated_at").single()
      : await supabase.from("fashion_design_briefs").insert({ ...fields, product_id: data.productId, variant_id: data.variantId, created_by: userId }).select("concept,styling_direction,notes,updated_at").single();
    if (res.error) throw new Error("Could not save the design brief. Nothing was changed.");
    return toBrief(res.data);
  });
