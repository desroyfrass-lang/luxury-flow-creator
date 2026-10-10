// CJ pilot pricing guardrail — derived ONLY from the existing Affiliate
// Intelligence profit model (src/lib/affiliate-intelligence.ts): unit costs,
// payment fees, platform allocation and minimum margin. It answers one
// question: "what is the lowest price that keeps the agreed minimum margin?"
// It is a floor, not an approved retail price. No markup, rounding or
// charm-pricing rule exists in the project, so none is applied here.
import { BLANK_ECONOMICS, analyzeProduct, type AffiliatePolicy, DEFAULT_POLICY } from "@/lib/affiliate-intelligence";

export type FloorInput = {
  supplierCost: number; // verified CJ variant cost
  shippingCost: number; // verified CJ freight quote
  currency: string;
  policy?: Pick<AffiliatePolicy, "platform_allocation_rate" | "default_min_margin_pct">;
};

export type FloorResult = {
  floorPrice: number | null;
  landedCost: number;
  reason: string | null;
};

export function minimumGuardrailPrice(i: FloorInput): FloorResult {
  const policy = { ...DEFAULT_POLICY, ...(i.policy ?? {}) };
  const cost = Number(i.supplierCost);
  const ship = Number(i.shippingCost);
  if (!(cost > 0) || !(ship >= 0)) return { floorPrice: null, landedCost: 0, reason: "Verified supplier cost and shipping are required." };
  const landed = Math.round((cost + ship) * 100) / 100;
  const pct = (BLANK_ECONOMICS.payment_fee_pct + policy.platform_allocation_rate + policy.default_min_margin_pct) / 100;
  if (pct >= 1) return { floorPrice: null, landedCost: landed, reason: "Fees, allocation and margin leave no room for costs." };
  // Smallest whole cent that the existing engine itself confirms meets the margin.
  let p = Math.ceil(((landed + BLANK_ECONOMICS.payment_fee_fixed) / (1 - pct)) * 100) / 100;
  for (let k = 0; k < 20 && !meetsMargin(p, cost, ship, i.currency, policy); k++) p = Math.round((p + 0.01) * 100) / 100;
  for (let k = 0; k < 20 && p > 0.01 && meetsMargin(Math.round((p - 0.01) * 100) / 100, cost, ship, i.currency, policy); k++) p = Math.round((p - 0.01) * 100) / 100;
  return { floorPrice: p, landedCost: landed, reason: null };
}

export function meetsMargin(price: number, cost: number, ship: number, currency: string, policy: AffiliatePolicy): boolean {
  const a = analyzeProduct(
    { ...BLANK_ECONOMICS, selling_price: price, cost_of_goods: cost, shipping_cost: ship, currency, target_margin_pct: policy.default_min_margin_pct },
    policy,
  );
  return a.netBeforeAffiliate - a.targetProfit >= -0.005;
}
