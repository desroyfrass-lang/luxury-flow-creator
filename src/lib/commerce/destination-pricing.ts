// Destination-specific Pricing Room engine (pure, deterministic, server + tests).
// Fails closed: unknown shipping, currency/FX or supplier data never becomes a
// zero cost, US costs are never reused for another destination, and estimates
// are never reported as verified. Produces readiness requirements with
// provenance for Founder approval. Never writes prices anywhere.
import { profitBreakdown, marginBand, RETAIL_MIN_MARGIN_PCT, type BreakdownInput, type CostEntry, type MarginBand } from "./pricing-floor";
import { planningBreakdown, type WorksheetInputs } from "./pricing-worksheet";
import { standardQuote, zoneForCountry, type SavedQuote } from "./shipping-zones";

export type DestinationQuote = SavedQuote & { dest_country: string };
export type VariantSource = {
  variantId: string;
  label: string;
  supplierCost: number | null;
  supplierCurrency: string | null;
  quotes: DestinationQuote[];
};
export type Requirement = { key: string; label: string; met: boolean; provenance: string };
export type VariantResult = {
  variantId: string; label: string;
  supplier: CostEntry; shipping: CostEntry; shippingSource: string;
  preferred: number | null; minimum: number | null;
  projectedProfit: number | null; projectedMarginPct: number | null;
  verifiedStatus: string;
};
export type DestinationPricing = {
  destination: string; retailCurrency: string | null; costCurrency: "USD";
  finalPrice: number | null;
  variants: VariantResult[];
  costliestVariantId: string | null;
  recommendedPrice: number | null; minimumPrice: number | null;
  lowestMarginPct: number | null; band: MarginBand | null;
  requirements: Requirement[];
  ready: boolean; requiresReviewNote: boolean;
  basis: "verified" | "estimated" | "blocked";
};

function entry(e: { amount: string; state: CostEntry["state"] }): CostEntry {
  if (e.state === "not_applicable") return { amount: null, state: "not_applicable" };
  const t = e.amount.trim();
  const n = t === "" ? NaN : Number(t);
  if (!Number.isFinite(n) || n < 0) return { amount: null, state: e.state === "pending_policy" ? "pending_policy" : "missing" };
  return { amount: n, state: e.state };
}
const decided = (e: CostEntry) => e.state === "verified" || e.state === "not_applicable";

export function computeDestinationPricing(args: {
  destination: string; inputs: WorksheetInputs; finalPrice: number | null;
  variants: VariantSource[]; now: Date; fxVerified?: false;
}): DestinationPricing {
  const dest = args.destination.toUpperCase();
  const zone = zoneForCountry(dest);
  const retailCurrency = zone?.currency ?? null;
  const fxOk = retailCurrency === "USD"; // no verified FX source exists; never invent one
  const i = args.inputs;
  const shared = {
    packagingCost: entry(i.packagingCost), otherCost: entry(i.otherCost),
    processingFeePct: entry(i.processingFeePct), processingFeeFixed: entry(i.processingFeeFixed),
    discountPct: entry(i.discountPct), commissionPct: entry(i.commissionPct),
  };
  const method = i.shippingMethod?.trim() || null;

  const variants: VariantResult[] = args.variants.map((v) => {
    const supplierOk = v.supplierCost != null && Number.isFinite(v.supplierCost) && v.supplierCost > 0 && v.supplierCurrency === "USD";
    const supplier: CostEntry = supplierOk ? { amount: v.supplierCost, state: "verified" } : { amount: null, state: "missing" };
    // Only quotes for THIS destination, in USD, count. Never borrow another country's.
    const own = v.quotes.filter((q) => q.dest_country.toUpperCase() === dest && q.currency === "USD");
    const pool = method ? own.filter((q) => q.method === method) : own;
    const sq = zone ? standardQuote(dest, pool, args.now, i.oversized ? "oversized" : null) : { status: "unsupported" as const, reason: `${dest} is not a FRASS shipping zone.` };
    let shipping: CostEntry = { amount: null, state: "missing" };
    let shippingSource = "";
    if (sq.status === "ok") {
      shipping = { amount: sq.quote.price, state: method ? "verified" : "estimated" };
      shippingSource = `CJ freightCalculate "${sq.quote.method}" fetched ${sq.quote.fetched_at}, expires ${sq.quote.expires_at}${method ? "" : " (cheapest option; standard method not chosen)"}`;
    } else if (sq.status === "stale") shippingSource = `Saved CJ quote expired ${sq.quote.expires_at}`;
    else if (sq.status === "missing") shippingSource = method ? `No saved ${dest} quote for method "${method}"` : `No saved ${dest} quote`;
    else shippingSource = sq.reason;

    const input: BreakdownInput = { listPrice: args.finalPrice, currency: "USD", supplierCost: supplier, shippingCost: shipping, ...shared };
    const plan = fxOk ? planningBreakdown(input) : null;
    const actual = profitBreakdown(input);
    return {
      variantId: v.variantId, label: v.label, supplier, shipping, shippingSource,
      preferred: plan?.preferred ?? null, minimum: plan?.minimum ?? null,
      projectedProfit: plan?.profit ?? null, projectedMarginPct: plan?.marginPct ?? null,
      verifiedStatus: fxOk ? actual.status : "incomplete",
    };
  });

  const all = <T,>(xs: (T | null)[]) => (xs.length && xs.every((x) => x != null) ? (xs as T[]) : null);
  const prefs = all(variants.map((v) => v.preferred));
  const mins = all(variants.map((v) => v.minimum));
  const margins = all(variants.map((v) => v.projectedMarginPct));
  const recommendedPrice = prefs ? Math.max(...prefs) : null;
  const costliest = prefs ? variants[prefs.indexOf(recommendedPrice!)].variantId : null;
  const lowestMarginPct = margins ? Math.min(...margins) : null;
  const band = lowestMarginPct != null ? marginBand(lowestMarginPct) : null;

  const req = (key: string, label: string, met: boolean, provenance: string): Requirement => ({ key, label, met, provenance });
  const policy = (k: keyof typeof shared, label: string) =>
    req(k, label, decided(shared[k]), shared[k].state === "verified" ? "Founder-entered verified value" : shared[k].state === "not_applicable" ? "Founder marked not applicable" : `Currently ${shared[k].state.replace("_", " ")}`);
  const requirements: Requirement[] = [
    req("zone", "Destination is a configured FRASS shipping zone", !!zone, zone ? `shipping-zones config: ${zone.name}` : "Not configured"),
    req("currency", "Retail currency is known (no unverified exchange rate)", fxOk, fxOk ? "USD costs, USD retail" : `${retailCurrency ?? "unknown"} retail needs a verified exchange-rate source — none connected`),
    req("variants", "Product has saved variants", variants.length > 0, `${variants.length} variant(s) on file`),
    req("supplier", "Every variant has a verified USD supplier cost", variants.length > 0 && variants.every((v) => v.supplier.state === "verified"), "canonical_product_variants.supplier_cost (CJ import)"),
    req("shipping_fresh", `Every variant has a fresh ${dest} shipping quote`, variants.length > 0 && variants.every((v) => v.shipping.amount != null), "cj_shipping_quotes (read-only CJ freightCalculate)"),
    req("shipping_method", "Founder chose the standard shipping method", !!method, method ? `Method "${method}"` : "Not chosen — cheapest quote used as estimate"),
    policy("processingFeePct", "Payment processing % verified"),
    policy("processingFeeFixed", "Payment processing fixed fee verified"),
    policy("packagingCost", "Packaging cost verified"),
    policy("otherCost", "Other expenses verified"),
    policy("discountPct", "Discount decided"),
    policy("commissionPct", "Commission applicability decided"),
    req("final_price", "Final selling price saved", args.finalPrice != null && args.finalPrice > 0, args.finalPrice != null ? `${args.finalPrice} USD` : "Not set"),
    req("minimum", `Every variant keeps at least ${RETAIL_MIN_MARGIN_PCT}% verified margin`, variants.length > 0 && variants.every((v) => v.verifiedStatus === "protected_verified"), lowestMarginPct != null ? `Lowest projected margin ${lowestMarginPct}%` : "Not computable"),
  ];
  const ready = requirements.every((r) => r.met);
  const anyEstimated = variants.some((v) => v.projectedMarginPct != null);
  return {
    destination: dest, retailCurrency, costCurrency: "USD", finalPrice: args.finalPrice, variants,
    costliestVariantId: costliest, recommendedPrice, minimumPrice: mins ? Math.max(...mins) : null,
    lowestMarginPct, band, requirements, ready,
    requiresReviewNote: band === "founder_review",
    basis: ready ? "verified" : anyEstimated ? "estimated" : "blocked",
  };
}
