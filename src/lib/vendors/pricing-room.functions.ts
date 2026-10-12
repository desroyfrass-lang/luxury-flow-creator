// Founder/admin-only Pricing Room backend. Worksheets are keyed by canonical
// product + destination (US/CA/GB/JM). Calculations are always recomputed on
// the server from saved sources; approval is Founder-only (super_admin), audited,
// and never writes a product price, Shopify, CJ or checkout.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { saveWorksheetSchema, parseStoredInputs, destinationSchema, DEFAULT_INPUTS, assertEditableWorksheet, type WorksheetInputs } from "@/lib/commerce/pricing-worksheet";
import { computeDestinationPricing } from "@/lib/commerce/destination-pricing";

type Ctx = { supabase: any; userId: string };
async function hasRole(ctx: Ctx, role: "admin" | "super_admin") {
  const { data, error } = await ctx.supabase.rpc("has_role", { _user_id: ctx.userId, _role: role });
  return !error && data === true;
}
async function assertFounder(ctx: Ctx) {
  if (!(await hasRole(ctx, "admin"))) throw new Error("Founder access only.");
}
const key = z.object({ productId: z.string().uuid(), destination: destinationSchema.default("US") });
const COLS = "final_price, inputs, updated_at, revision, approval_status, approved_revision, approved_at";

function shape(row: any) {
  return {
    finalPrice: row.final_price == null ? null : Number(row.final_price),
    inputs: parseStoredInputs(row.inputs),
    updatedAt: row.updated_at as string,
    revision: row.revision as number,
    approvalStatus: row.approval_status as "draft" | "approved" | "revised_after_approval",
    approvedRevision: (row.approved_revision ?? null) as number | null,
    approvedAt: (row.approved_at ?? null) as string | null,
  };
}

export const getPricingWorksheet = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => key.parse(i))
  .handler(async ({ data, context }) => {
    await assertFounder(context);
    const { data: row, error } = await context.supabase.from("pricing_room_worksheets").select(COLS)
      .eq("product_id", data.productId).eq("destination", data.destination).maybeSingle();
    if (error) throw new Error("Could not read the saved worksheet.");
    return row ? { destination: data.destination, ...shape(row) } : null;
  });

export const listPricingWorksheets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ productId: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    await assertFounder(context);
    const { data: rows, error } = await context.supabase.from("pricing_room_worksheets").select(`destination, ${COLS}`)
      .eq("product_id", data.productId).order("destination");
    if (error) throw new Error("Could not read saved worksheets.");
    return (rows ?? []).map((r: any) => ({ destination: r.destination as string, ...shape(r) }));
  });

export const savePricingWorksheet = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => saveWorksheetSchema.parse(i))
  .handler(async ({ data, context }) => {
    await assertFounder(context);
    const { data: product } = await context.supabase.from("canonical_products").select("id").eq("id", data.productId).maybeSingle();
    if (!product) throw new Error("Product not found.");
    const { data: existing, error: readErr } = await context.supabase.from("pricing_room_worksheets").select("revision, inputs")
      .eq("product_id", data.productId).eq("destination", data.destination).maybeSingle();
    if (readErr) throw new Error("Could not read the saved worksheet.");
    assertEditableWorksheet(data.inputs, existing ? parseStoredInputs(existing.inputs) : null);
    if (existing && data.expectedRevision == null) throw new Error("Reload the saved worksheet before editing; its version is required.");
    const { pricing } = await evaluate(context, data.productId, data.destination, { inputs: data.inputs, finalPrice: data.finalPrice });
    const previousMethod = existing ? parseStoredInputs(existing.inputs).shippingMethod : undefined;
    if (data.inputs.shippingMethod && data.inputs.shippingMethod !== previousMethod && !pricing.requirements.find((r) => r.key === "shipping_method")?.met) {
      throw new Error("Choose a standard method with fresh CJ quotes for every variant in this country.");
    }
    const summary = { status: pricing.basis, marginPct: pricing.lowestMarginPct, approvable: pricing.ready };
    const payload = { final_price: data.finalPrice, inputs: data.inputs, summary, updated_by: context.userId };
    let row: any;
    if (!existing) {
      if (data.expectedRevision) throw new Error("This worksheet no longer exists. Reload and try again.");
      const r = await context.supabase.from("pricing_room_worksheets")
        .insert({ product_id: data.productId, destination: data.destination, ...payload }).select(COLS).single();
      if (r.error) throw new Error(r.error.code === "23505" ? "Someone saved this worksheet at the same time. Reload and try again." : "Could not save the worksheet.");
      row = r.data;
    } else {
      if (data.expectedRevision && data.expectedRevision !== existing.revision) {
        throw new Error("This worksheet was changed elsewhere. Reload to see the latest before saving.");
      }
      const r = await context.supabase.from("pricing_room_worksheets").update(payload)
        .eq("product_id", data.productId).eq("destination", data.destination).eq("revision", existing.revision)
        .select(COLS).maybeSingle();
      if (r.error) throw new Error("Could not save the worksheet.");
      if (!r.data) throw new Error("This worksheet was changed elsewhere. Reload to see the latest before saving.");
      row = r.data;
    }
    const s = shape(row);
    return { destination: data.destination, ...s, changed: !existing || s.revision !== existing.revision };
  });

async function evaluate(ctx: Ctx, productId: string, destination: string, draft?: { inputs: WorksheetInputs; finalPrice: number | null }) {
  const [{ data: variants, error: vErr }, { data: ws, error: wErr }] = await Promise.all([
    ctx.supabase.from("canonical_product_variants").select("id, option_label, sku, supplier_cost, currency").eq("product_id", productId).limit(100),
    ctx.supabase.from("pricing_room_worksheets").select(COLS).eq("product_id", productId).eq("destination", destination).maybeSingle(),
  ]);
  if (vErr || wErr) throw new Error("Could not read pricing sources.");
  const ids = (variants ?? []).map((v: any) => v.id);
  const { data: quotes, error: qErr } = ids.length
    ? await ctx.supabase.from("cj_shipping_quotes").select("variant_id, dest_country, method, price, currency, aging_days, fetched_at, expires_at")
        .in("variant_id", ids).eq("dest_country", destination).order("fetched_at", { ascending: false }).limit(1000)
    : { data: [], error: null };
  if (qErr) throw new Error("Could not read saved shipping quotes.");
  const worksheet = ws ? shape(ws) : null;
  const pricing = computeDestinationPricing({
    destination, inputs: draft?.inputs ?? worksheet?.inputs ?? DEFAULT_INPUTS, finalPrice: draft ? draft.finalPrice : worksheet?.finalPrice ?? null, now: new Date(),
    variants: (variants ?? []).map((v: any) => ({
      variantId: v.id, label: v.option_label || v.sku || v.id,
      supplierCost: v.supplier_cost == null ? null : Number(v.supplier_cost), supplierCurrency: v.currency ?? null,
      quotes: (quotes ?? []).filter((q: any) => q.variant_id === v.id).map((q: any) => ({ ...q, price: Number(q.price) })),
    })),
  });
  return { worksheet, pricing };
}

/** Server-side recalculation + financial-readiness check for one destination. */
export const evaluatePricingDestination = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => key.parse(i))
  .handler(async ({ data, context }) => {
    await assertFounder(context);
    const r = await evaluate(context, data.productId, data.destination);
    return { ...r, evaluatedAt: new Date().toISOString() };
  });

/** Founder-only approval of the saved revision. Records approval state only — never publishes or writes prices. */
export const approvePricingWorksheet = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => key.extend({ expectedRevision: z.number().int().positive(), note: z.string().trim().max(1000).optional() }).parse(i))
  .handler(async ({ data, context }) => {
    if (!(await hasRole(context, "super_admin"))) throw new Error("Only the Founder can approve a price.");
    const { worksheet, pricing } = await evaluate(context, data.productId, data.destination);
    if (!worksheet) throw new Error("Save the worksheet before approving.");
    if (worksheet.revision !== data.expectedRevision) throw new Error("The worksheet changed since it was checked. Check it again.");
    if (!pricing.ready) {
      const unmet = pricing.requirements.filter((r) => !r.met).map((r) => r.label);
      throw new Error(`Not ready for approval: ${unmet.join("; ")}.`);
    }
    if (pricing.requiresReviewNote && !data.note) throw new Error("Margin is in the 25–29.99% review band — add a Founder review note.");
    const snapshot = { ready: true, evaluatedAt: new Date().toISOString(), pricing };
    const { data: res, error } = await context.supabase.rpc("founder_approve_pricing_worksheet", {
      _product_id: data.productId, _destination: data.destination, _expected_revision: data.expectedRevision,
      _snapshot: snapshot, _note: data.note ?? "",
    });
    if (error) throw new Error(error.message);
    return res as { status: string; revision: number; approved_at: string; already: boolean };
  });
