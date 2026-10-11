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

import { roundMoney } from "./money";
const r2 = roundMoney;
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

/** Founder-approved target range (2026-10-11): 40% preferred start, 30–39.99% acceptable,
 *  25–29.99% Founder review, below 25% blocked. 40% is a target, never a floor. */
export const RETAIL_TARGET_PREFERRED_PCT = 40;
export const RETAIL_TARGET_ACCEPTABLE_MIN_PCT = 30;
export type MarginBand = "preferred" | "acceptable" | "founder_review" | "blocked";
export function marginBand(marginPct: number): MarginBand {
  if (marginPct >= RETAIL_TARGET_PREFERRED_PCT - 1e-9) return "preferred";
  if (marginPct >= RETAIL_TARGET_ACCEPTABLE_MIN_PCT - 1e-9) return "acceptable";
  if (marginPct >= RETAIL_MIN_MARGIN_PCT - 1e-9) return "founder_review";
  return "blocked";
}

/** Lowest listed whole-cent price whose margin (shared retailMargin math) reaches targetPct. */
export function priceForMargin(c: RetailCosts, targetPct: number): FloorResult {
  const err = missingCost(c);
  const landed = err ? 0 : r2(c.supplierCost + c.shippingCost + c.packagingCost + c.otherCost);
  if (err) return { floorPrice: null, landedCost: landed, reason: err };
  const keep = 1 - c.processingFeePct / 100 - (c.commissionPct ?? 0) / 100 - targetPct / 100;
  if (keep <= 0) return { floorPrice: null, landedCost: landed, reason: "Fees and margin leave no room for costs." };
  const ok = (p: number) => (retailMargin(p, c).marginPct ?? -Infinity) >= targetPct - 1e-9 && exactMargin(p, c) >= targetPct - 1e-9;
  const charged = (landed + c.processingFeeFixed) / keep;
  let p = Math.ceil((charged / (1 - (c.discountPct ?? 0) / 100)) * 100) / 100;
  for (let k = 0; k < 20 && !ok(p); k++) p = r2(p + 0.01);
  for (let k = 0; k < 20 && ok(r2(p - 0.01)); k++) p = r2(p - 0.01);
  return { floorPrice: p, landedCost: landed, reason: null };
}
function exactMargin(listPrice: number, c: RetailCosts): number {
  const charged = listPrice * (1 - (c.discountPct ?? 0) / 100);
  const costs = c.supplierCost + c.shippingCost + c.packagingCost + c.otherCost + charged * (c.processingFeePct / 100) + c.processingFeeFixed + charged * ((c.commissionPct ?? 0) / 100);
  return ((charged - costs) / charged) * 100;
}

/** Lowest listed price (whole cents) that keeps the 25% minimum margin. */
export function minimumGuardrailPrice(c: RetailCosts): FloorResult {
  return priceForMargin(c, RETAIL_MIN_MARGIN_PCT);
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
  /** What the CUSTOMER pays for shipping at checkout (customer-paid default). Shipping revenue is
   *  never counted as product profit; only the processing fee charged on it is a FRASS cost. */
  customerShippingCharge?: CostEntry;
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
  /** Always computed from whatever is known; missing costs count as 0, so these are LOWER bounds only. */
  band: MarginBand | null;
  /** Only when every cost is verified (none estimated/missing/pending). */
  targets: { preferred: number | null; acceptableMin: number | null } | null;
  provisional: { targetPreferredOnKnown: number | null; targetAcceptableOnKnown: number | null; charged: number | null; knownCost: number | null; profitBeforeMissing: number | null; floorOnKnownCosts: number | null; missing: string[] };
};

const LABELS: Record<string, string> = {
  supplierCost: "Supplier cost", shippingCost: "FRASS net shipping cost (free/subsidy only)", packagingCost: "Packaging",
  processingFeePct: "Payment processing (%)", processingFeeFixed: "Payment processing (fixed)",
  discountPct: "Discount", commissionPct: "Commission (only if applicable)", otherCost: "Other costs",
};

const val = (e: CostEntry) => (e.state === "not_applicable" ? 0 : e.amount);

const RANK: Record<CostState, number> = { not_applicable: 0, verified: 1, estimated: 2, missing: 3, pending_policy: 4 };
const worstState = (...xs: CostState[]) => xs.reduce((a, b) => (RANK[b] > RANK[a] ? b : a), "not_applicable" as CostState);

/** Processing fee on the customer's shipping charge, merged into "other costs" (counted once). */
export function withShippingProcessing(i: BreakdownInput): { input: BreakdownInput; shippingProcessing: number | null; warning: string | null } {
  const ch = i.customerShippingCharge;
  if (!ch || ch.state === "not_applicable" || i.processingFeePct.state === "not_applicable") return { input: i, shippingProcessing: 0, warning: null };
  const chargeOk = ch.state !== "missing" && ch.state !== "pending_policy" && ch.amount != null && Number.isFinite(ch.amount);
  const pctOk = i.processingFeePct.state !== "missing" && i.processingFeePct.state !== "pending_policy" && i.processingFeePct.amount != null;
  const fee = chargeOk && pctOk ? r2(ch.amount! * i.processingFeePct.amount! / 100) : null;
  const other = i.otherCost.state === "not_applicable" ? 0 : i.otherCost.amount;
  const state = worstState(i.otherCost.state === "not_applicable" ? "verified" : i.otherCost.state, ch.state, i.processingFeePct.state);
  return {
    input: { ...i, otherCost: { amount: fee != null && other != null ? r2(other + fee) : null, state } },
    shippingProcessing: fee,
    warning: chargeOk ? (ch.state === "estimated" ? "Customer shipping charge is an estimate — end-to-end margin not verified." : null) : "Customer shipping charge at checkout not confirmed — its processing fee is unknown, so end-to-end margin cannot be verified.",
  };
}

export function profitBreakdown(raw: BreakdownInput): Breakdown {
  const sp = withShippingProcessing(raw);
  const i = sp.input;
  const warnings: string[] = sp.warning ? [sp.warning] : [];
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

  const missing = keys.filter((k) => { const e = i[k]; return e.state !== "not_applicable" && (e.state === "missing" || e.state === "pending_policy" || e.amount == null || !Number.isFinite(e.amount)); }).map((k) => LABELS[k]);
  const z = (e: CostEntry) => { const x = val(e); return x != null && Number.isFinite(x) && e.state !== "missing" && e.state !== "pending_policy" ? x : 0; };
  const known: RetailCosts = {
    supplierCost: z(i.supplierCost), shippingCost: z(i.shippingCost), packagingCost: z(i.packagingCost), otherCost: z(i.otherCost),
    processingFeePct: z(i.processingFeePct), processingFeeFixed: z(i.processingFeeFixed), discountPct: z(i.discountPct), commissionPct: z(i.commissionPct), currency: i.currency,
  };
  const pCharged = i.listPrice && i.listPrice > 0 ? r2(i.listPrice * (1 - known.discountPct! / 100)) : null;
  const pm = pCharged != null && known.supplierCost > 0 ? retailMargin(i.listPrice!, known) : null;
  const provisional = {
    charged: pCharged,
    knownCost: pm?.profit != null && pCharged != null ? r2(pCharged - pm.profit) : null,
    profitBeforeMissing: pm?.profit ?? null,
    floorOnKnownCosts: known.supplierCost > 0 ? minimumGuardrailPrice(known).floorPrice : null,
    targetPreferredOnKnown: known.supplierCost > 0 ? priceForMargin(known, RETAIL_TARGET_PREFERRED_PCT).floorPrice : null,
    targetAcceptableOnKnown: known.supplierCost > 0 ? priceForMargin(known, RETAIL_TARGET_ACCEPTABLE_MIN_PCT).floorPrice : null,
    missing,
  };

  const allVerified = costs != null && !incompleteCosts(i) && !estimated;
  const targets = allVerified ? { preferred: priceForMargin(costs!, RETAIL_TARGET_PREFERRED_PCT).floorPrice, acceptableMin: priceForMargin(costs!, RETAIL_TARGET_ACCEPTABLE_MIN_PCT).floorPrice } : null;
  const band = m?.marginPct != null ? marginBand(m.marginPct) : null;
  if (band === "founder_review" && status === "protected_verified") warnings.push("Margin is 25–29.99%: allowed only with Founder review.");
  const canApprove = status === "protected_verified" && band !== "founder_review";

  return { band, targets, provisional, status, canApprove, charged, lines, totalCost, profit, marginPct: m?.marginPct ?? null, protectedProfit, surplus, floorPrice: floor, warnings };
}

function incompleteCosts(i: BreakdownInput): boolean {
  return (["supplierCost", "shippingCost", "packagingCost", "processingFeePct", "processingFeeFixed", "discountPct", "commissionPct", "otherCost"] as const)
    .some((k) => { const e = i[k]; return e.state !== "not_applicable" && (e.state === "missing" || e.state === "pending_policy" || e.amount == null || !Number.isFinite(e.amount)); });
}
