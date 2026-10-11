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
  commissionPct?: number; // commission on the charged price, ONLY when applicable (counted once)
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
  const cm = c.commissionPct ?? 0;
  if (!Number.isFinite(cm) || cm < 0 || cm >= 100) return "Commission must be between 0% and 100%.";
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
    + charged * (c.processingFeePct / 100) + c.processingFeeFixed
    + charged * ((c.commissionPct ?? 0) / 100);
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
  const keep = 1 - c.processingFeePct / 100 - (c.commissionPct ?? 0) / 100 - RETAIL_MIN_MARGIN_PCT / 100;
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

// ---------------------------------------------------------------------------
// Vendor Room Protected Profit + Surplus Profit breakdown (Founder/Admin only).
// Uses retailMargin above as the single source of math. Each cost carries a
// state; anything missing or pending blocks approval, and estimates can show a
// number but never verify the 25% minimum.

export type CostState = "verified" | "estimated" | "missing" | "not_applicable" | "pending_policy";
export type CostEntry = { amount: number | null; state: CostState };
export type BreakdownInput = {
  listPrice: number | null; // proposed/approved listed price; null = none set
  currency: string;
  supplierCost: CostEntry;
  shippingCost: CostEntry;
  packagingCost: CostEntry;
  otherCost: CostEntry;
  processingFeePct: CostEntry;
  processingFeeFixed: CostEntry;
  discountPct: CostEntry; // not_applicable = no discount
  commissionPct: CostEntry; // not_applicable = no commission on this sale
};
export type BreakdownStatus = "protected_verified" | "protected_estimated" | "below_minimum" | "incomplete";
export type Breakdown = {
  status: BreakdownStatus;
  canApprove: boolean;
  charged: number | null;
  lines: Array<{ key: string; label: string; amount: number | null; state: CostState }>;
  totalCost: number | null;
  profit: number | null;
  marginPct: number | null;
  protectedProfit: number | null;
  surplus: number | null;
  floorPrice: number | null;
  warnings: string[];
};

const LABELS: Record<string, string> = {
  supplierCost: "Supplier cost", shippingCost: "Shipping paid by FRASS", packagingCost: "Packaging",
  processingFeePct: "Payment processing (%)", processingFeeFixed: "Payment processing (fixed)",
  discountPct: "Discount", commissionPct: "Commission (only if applicable)", otherCost: "Other costs",
};

const val = (e: CostEntry) => (e.state === "not_applicable" ? 0 : e.amount);

export function profitBreakdown(i: BreakdownInput): Breakdown {
  const warnings: string[] = [];
  const keys = ["supplierCost", "shippingCost", "packagingCost", "processingFeePct", "processingFeeFixed", "discountPct", "commissionPct", "otherCost"] as const;
  let incomplete = false;
  let estimated = false;
  for (const k of keys) {
    const e = i[k];
    if (e.state === "missing" || e.state === "pending_policy" || (e.state !== "not_applicable" && (e.amount == null || !Number.isFinite(e.amount)))) {
      incomplete = true;
      warnings.push(e.state === "pending_policy" ? `${LABELS[k]}: waiting on a Founder policy decision.` : `${LABELS[k]}: not provided.`);
    } else if (e.state === "estimated") {
      estimated = true;
      warnings.push(`${LABELS[k]}: estimate only — must be verified before approval.`);
    }
  }
  if (i.listPrice == null || !(i.listPrice > 0)) { incomplete = true; warnings.push("No selling price set yet."); }

  const costs: RetailCosts | null = incomplete && [i.supplierCost, i.shippingCost, i.packagingCost, i.otherCost, i.processingFeePct, i.processingFeeFixed, i.discountPct, i.commissionPct].some((e) => val(e) == null)
    ? null
    : {
        supplierCost: val(i.supplierCost)!, shippingCost: val(i.shippingCost)!, packagingCost: val(i.packagingCost)!,
        otherCost: val(i.otherCost)!, processingFeePct: val(i.processingFeePct)!, processingFeeFixed: val(i.processingFeeFixed)!,
        discountPct: val(i.discountPct)!, commissionPct: val(i.commissionPct)!, currency: i.currency,
      };

  const floor = costs ? minimumGuardrailPrice(costs).floorPrice : null;
  const charged = costs && i.listPrice && i.listPrice > 0 ? r2(i.listPrice * (1 - costs.discountPct! / 100)) : null;
  const m = costs && i.listPrice && i.listPrice > 0 ? retailMargin(i.listPrice, costs) : null;
  if (m?.reason && !m.safe && m.marginPct == null) { incomplete = true; warnings.push(m.reason); }

  const lines = keys.filter((k) => k !== "discountPct").map((k) => {
    const e = i[k];
    let amount: number | null = val(e);
    if (k === "processingFeePct" && amount != null) amount = charged != null ? r2(charged * amount / 100) : null;
    if (k === "commissionPct" && amount != null) amount = charged != null ? r2(charged * amount / 100) : null;
    return { key: k, label: LABELS[k], amount, state: e.state };
  });
  const profit = m?.profit ?? null;
  const protectedProfit = charged != null ? r2(charged * RETAIL_MIN_MARGIN_PCT / 100) : null;
  const totalCost = charged != null && profit != null ? r2(charged - profit) : null;
  const surplus = profit != null && protectedProfit != null ? r2(profit - protectedProfit) : null;

  let status: BreakdownStatus;
  if (m && m.marginPct != null && !m.safe) { status = "below_minimum"; warnings.unshift(m.reason!); }
  else if (incomplete || !m) status = "incomplete";
  else status = estimated ? "protected_estimated" : "protected_verified";

  return { status, canApprove: status === "protected_verified", charged, lines, totalCost, profit, marginPct: m?.marginPct ?? null, protectedProfit, surplus, floorPrice: floor, warnings };
}
