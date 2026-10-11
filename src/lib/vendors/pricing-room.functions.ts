// Founder/admin-only Pricing Room persistence. Saves overrides + last summary
// for one canonical product. Never writes a product price, Shopify or CJ.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { saveWorksheetSchema, parseStoredInputs } from "@/lib/commerce/pricing-worksheet";

async function assertFounder(ctx: { supabase: any; userId: string }) {
  const { data } = await ctx.supabase.rpc("has_role", { _user_id: ctx.userId, _role: "admin" });
  if (data !== true) throw new Error("Founder access only.");
}

export const getPricingWorksheet = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ productId: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    await assertFounder(context);
    const { data: row, error } = await context.supabase
      .from("pricing_room_worksheets").select("final_price, inputs, updated_at").eq("product_id", data.productId).maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return null;
    return { finalPrice: row.final_price == null ? null : Number(row.final_price), inputs: parseStoredInputs(row.inputs), updatedAt: row.updated_at };
  });

export const savePricingWorksheet = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => saveWorksheetSchema.parse(i))
  .handler(async ({ data, context }) => {
    await assertFounder(context);
    const { data: product } = await context.supabase.from("canonical_products").select("id").eq("id", data.productId).maybeSingle();
    if (!product) throw new Error("Product not found.");
    const { data: row, error } = await context.supabase.from("pricing_room_worksheets").upsert({
      product_id: data.productId, destination: "US", final_price: data.finalPrice,
      inputs: data.inputs, summary: data.summary, updated_by: context.userId, updated_at: new Date().toISOString(),
    }).select("updated_at").single();
    if (error) throw new Error(error.message);
    return { updatedAt: row.updated_at };
  });
