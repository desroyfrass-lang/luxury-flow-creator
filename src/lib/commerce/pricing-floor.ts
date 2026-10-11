// FRASS KICKS retail price guardrail — Founder-approved rule (2026-10-11):
// every retail product sale must keep AT LEAST 25% PROFIT MARGIN after all
// applicable selling costs. Margin is profit ÷ actual (post-discount) selling
// price — NOT markup on cost.
//
// Separation: this module never reads affiliate_policy. Affiliate commission
// (and its allocation figure) is a different system. No retail sales
// allocation / platform cut has been established, so none is applied.
// Every cost must be supplied explicitly; missing costs refuse a price.

export const RETAIL_MIN_MARGIN_PCT = 25;

export type RetailCosts = {
  supplierCost: number; // verified supplier cost per unit
  shippingCost: number; // shipping paid by FRASS (0 only if verified free)
  packagingCost: number;
  otherCost: number; // any other real applicable per-unit cost
  processingFeePct: number; // payment processing % of charged price
  processingFeeFixed: number; // payment processing fixed fee per order
  discountPct?: number; // discount applied to the listed price (0–<100)
  currency: string;
};

export type FloorResult = { floorPrice: number | null; landedCost: number; reason: string | null };
export type SafetyResult = { safe: boolean; marginPct: number | null; profit: number | null; reason: string | null };

const r2 = (n: number) => Math.round(n * 100) / 100;
const REQUIRED: Array<keyof RetailCosts> = [
  "supplierCost", "shippingCost", "packagingCost", "otherCost", "processingFeePct", "processingFeeFixed",
];

function missingCost(c: Partial<RetailCosts>): string | null {
  for (const k of REQUIRED) {
    const v = c[k];
    if (typeof v !== "number" || !Number.isFinite(v) || v < 0) return `Missing or invalid cost: ${k}.`;
  }
  if (!(c.supplierCost! > 0)) return "Verified supplier cost is required.";
  const d = c.discountPct ?? 0;
  if (!Number.isFinite(d) || d < 0 || d >= 100) return "Discount must be between 0% and 100%.";
  if (!c.currency) return "Currency is required.";
  return null;
}

/** Profit and margin for a listed retail price, after discount and every cost. */
export function retailMargin(listPrice: number, c: RetailCosts): SafetyResult {
  const err = missingCost(c);
  if (err) return { safe: false, marginPct: null, profit: null, reason: err };
  if (!(listPrice > 0)) return { safe: false, marginPct: null, profit: null, reason: "Price must be above zero." };
  const charged = listPrice * (1 - (c.discountPct ?? 0) / 100);
  const costs = c.supplierCost + c.shippingCost + c.packagingCost + c.otherCost
    + charged * (c.processingFeePct / 100) + c.processingFeeFixed;
  const profit = charged - costs;
  const marginPct = (profit / charged) * 100;
  const safe = marginPct >= RETAIL_MIN_MARGIN_PCT - 1e-9;
  return {
    safe,
    marginPct: r2(marginPct),
    profit: r2(profit),
    reason: safe ? null : `Margin ${r2(marginPct)}% is below the ${RETAIL_MIN_MARGIN_PCT}% minimum.`,
  };
}

/** Lowest listed price (whole cents) that keeps the 25% minimum margin. */
export function minimumGuardrailPrice(c: RetailCosts): FloorResult {
  const err = missingCost(c);
  const landed = err ? 0 : r2(c.supplierCost + c.shippingCost + c.packagingCost + c.otherCost);
  if (err) return { floorPrice: null, landedCost: landed, reason: err };
  const keep = 1 - c.processingFeePct / 100 - RETAIL_MIN_MARGIN_PCT / 100;
  if (keep <= 0) return { floorPrice: null, landedCost: landed, reason: "Fees and margin leave no room for costs." };
  const charged = (landed + c.processingFeeFixed) / keep;
  let p = Math.ceil((charged / (1 - (c.discountPct ?? 0) / 100)) * 100) / 100;
  for (let k = 0; k < 20 && !retailMargin(p, c).safe; k++) p = r2(p + 0.01);
  for (let k = 0; k < 20 && retailMargin(r2(p - 0.01), c).safe; k++) p = r2(p - 0.01);
  return { floorPrice: p, landedCost: landed, reason: null };
}

/** Call before ANY retail price write. Throws when the price is unsafe or costs are missing. */
export function assertRetailPriceSafe(listPrice: number, c: RetailCosts): void {
  const s = retailMargin(listPrice, c);
  if (!s.safe) throw new Error(`Retail price blocked: ${s.reason}`);
}
