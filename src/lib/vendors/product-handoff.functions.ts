import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { buildProductHandoff } from "./product-handoff";

/** Read-only: resolves everything from saved rows; only IDs come from the browser. */
export const getProductHandoff = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ productId: z.string().uuid(), variantId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const [a, s, p, v] = await Promise.all([
      supabase.rpc("has_role", { _user_id: userId, _role: "admin" }),
      supabase.rpc("has_role", { _user_id: userId, _role: "super_admin" }),
      supabase.from("canonical_products").select("id,title,category_key,draft_status,publication_status,vendor_id,vendor_profiles(owner_id)").eq("id", data.productId).maybeSingle(),
      supabase.from("canonical_product_variants").select("id,product_id,source_variant_ref,sku,option_label,image_url").eq("id", data.variantId).maybeSingle(),
    ]);
    if (a.error || s.error || p.error || v.error) throw new Error("Could not check this product right now.");
    const row = p.data as any;
    const product = row ? { ...row, vendor_owner_id: row.vendor_profiles?.owner_id ?? null } : null;
    return buildProductHandoff({ userId, isFounderStaff: !!(a.data || s.data) }, product, v.data as any);
  });
