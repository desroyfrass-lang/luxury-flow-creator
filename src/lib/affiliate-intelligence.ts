// Frass Affiliate Intelligence Engine — pure, client-safe profitability math.
//
// Constitutional rule: the Platform Allocation Engine (8%) and the Affiliate
// Intelligence Engine are separate systems. Allocation is read as an input
// here; it is never altered by an affiliate decision.

export type AffiliatePolicy = {
  platform_allocation_rate: number;
  min_commission_rate: number;
  max_commission_rate: number;
  default_commission_rate: number;
  default_min_margin_pct: number;
  promo_label: string | null;
  promo_max_commission_rate: number | null;
  promo_starts_at: string | null;
  promo_ends_at: string | null;
};

export const DEFAULT_POLICY: AffiliatePolicy = {
  platform_allocation_rate: 8,
  min_commission_rate: 3,
  max_commission_rate: 25,
  default_commission_rate: 12,
  default_min_margin_pct: 20,
  promo_label: null,
  promo_max_commission_rate: null,
  promo_starts_at: null,
  promo_ends_at: null,
};

export type ProductEconomics = {
  id?: string;
  product_ref: string;
  title: string;
  currency: string;
  selling_price: number;
  cost_of_goods: number;
  packaging_cost: number;
  shipping_cost: number;
  other_cost: number;
  payment_fee_pct: number;
  payment_fee_fixed: number;
  marketplace_fee_pct: number;
  tax_pct: number;
  discount_pct: number;
  target_margin_pct: number;
  estimated_monthly_units: number;
  affiliate_enabled: boolean;
  commission_rate: number | null;
  notes?: string | null;
};

export const BLANK_ECONOMICS: ProductEconomics = {
  product_ref: "",
  title: "",
  currency: "USD",
  selling_price: 0,
  cost_of_goods: 0,
  packaging_cost: 0,
  shipping_cost: 0,
  other_cost: 0,
  payment_fee_pct: 2.9,
  payment_fee_fixed: 0.3,
  marketplace_fee_pct: 0,
  tax_pct: 0,
  discount_pct: 0,
  target_margin_pct: 20,
  estimated_monthly_units: 0,
  affiliate_enabled: false,
  commission_rate: null,
};

export const CAMPAIGN_KINDS = [
  { value: "standard", label: "Standard affiliate" },
  { value: "launch", label: "Product launch" },
  { value: "holiday", label: "Holiday campaign" },
  { value: "influencer", label: "Influencer collaboration" },
  { value: "ambassador", label: "Ambassador program" },
  { value: "limited", label: "Limited-time promotion" },
] as const;

export type Analysis = {
  effectivePrice: number;
  unitCosts: number;
  processingFees: number;
  taxes: number;
  platformAllocation: number;
  netBeforeAffiliate: number;
  targetProfit: number;
  headroom: number;
  minRate: number;
  recommendedRate: number;
  maxRate: number;
  viable: boolean;
  breakEvenRate: number;
  /** Plain-English reasoning the Builder sees. */
  explanation: string[];
};

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

export function analyzeProduct(
  e: ProductEconomics,
  policy: AffiliatePolicy = DEFAULT_POLICY,
): Analysis {
  const price = Math.max(0, Number(e.selling_price) || 0);
  const effectivePrice = round2(price * (1 - clamp(Number(e.discount_pct) || 0, 0, 100) / 100));

  const unitCosts = round2(
    (Number(e.cost_of_goods) || 0) +
      (Number(e.packaging_cost) || 0) +
      (Number(e.shipping_cost) || 0) +
      (Number(e.other_cost) || 0),
  );
  const processingFees = round2(
    (effectivePrice * ((Number(e.payment_fee_pct) || 0) + (Number(e.marketplace_fee_pct) || 0))) / 100 +
      (Number(e.payment_fee_fixed) || 0),
  );
  const taxes = round2((effectivePrice * (Number(e.tax_pct) || 0)) / 100);
  const platformAllocation = round2((effectivePrice * policy.platform_allocation_rate) / 100);

  const netBeforeAffiliate = round2(
    effectivePrice - unitCosts - processingFees - taxes - platformAllocation,
  );
  const targetProfit = round2((effectivePrice * (Number(e.target_margin_pct) || 0)) / 100);
  const headroom = round2(netBeforeAffiliate - targetProfit);

  const rawMax = effectivePrice > 0 ? (headroom / effectivePrice) * 100 : 0;
  const breakEvenRate =
    effectivePrice > 0 ? round2(clamp((netBeforeAffiliate / effectivePrice) * 100, 0, 100)) : 0;

  const viable = headroom > 0 && effectivePrice > 0 && rawMax >= policy.min_commission_rate;

  const maxRate = viable ? round2(clamp(rawMax, 0, policy.max_commission_rate)) : 0;
  const minRate = viable ? round2(Math.min(policy.min_commission_rate, maxRate)) : 0;
  const recommendedRate = viable
    ? round2(clamp(Math.round(maxRate * 0.7 * 10) / 10, minRate, maxRate))
    : 0;

  const explanation: string[] = [];
  if (effectivePrice <= 0) {
    explanation.push("Set a selling price and I can run the numbers for this product.");
  } else if (!viable) {
    explanation.push(
      `After costs, fees, the ${policy.platform_allocation_rate}% platform allocation and your ${e.target_margin_pct}% target margin, there is nothing left to pay an affiliate.`,
    );
    explanation.push(
      "My recommendation: no affiliate program for this item yet — raise the price, lower the cost of goods, or reduce shipping before enabling affiliates.",
    );
  } else {
    explanation.push(
      `At ${fmt(effectivePrice, e.currency)} you keep ${fmt(netBeforeAffiliate, e.currency)} after costs, fees and the ${policy.platform_allocation_rate}% platform allocation.`,
    );
    explanation.push(
      `Your ${e.target_margin_pct}% target margin protects ${fmt(targetProfit, e.currency)}, leaving ${fmt(headroom, e.currency)} of affiliate headroom.`,
    );
    explanation.push(
      `That supports up to ${maxRate}%. I recommend ${recommendedRate}% — strong enough to motivate affiliates, safe enough to keep the business healthy.`,
    );
    if (maxRate >= 18) {
      explanation.push("This product could support a stronger seasonal incentive if you want one.");
    }
  }

  return {
    effectivePrice,
    unitCosts,
    processingFees,
    taxes,
    platformAllocation,
    netBeforeAffiliate,
    targetProfit,
    headroom,
    minRate,
    recommendedRate,
    maxRate,
    viable,
    breakEvenRate,
    explanation,
  };
}

export type Simulation = {
  affiliatePayout: number;
  builderPayout: number;
  platformAllocation: number;
  marginPct: number;
  belowTarget: boolean;
  aboveCeiling: boolean;
  monthlyBuilderPayout: number;
  monthlyAffiliatePayout: number;
  advice: string;
};

export function simulate(
  e: ProductEconomics,
  rate: number,
  policy: AffiliatePolicy = DEFAULT_POLICY,
  analysis?: Analysis,
): Simulation {
  const a = analysis ?? analyzeProduct(e, policy);
  const affiliatePayout = round2((a.effectivePrice * Math.max(0, rate)) / 100);
  const builderPayout = round2(a.netBeforeAffiliate - affiliatePayout);
  const marginPct = a.effectivePrice > 0 ? round2((builderPayout / a.effectivePrice) * 100) : 0;
  const belowTarget = marginPct < (Number(e.target_margin_pct) || 0);
  const aboveCeiling = rate > policy.max_commission_rate;
  const units = Math.max(0, Number(e.estimated_monthly_units) || 0);

  let advice: string;
  if (aboveCeiling) {
    advice = `${rate}% is above the platform ceiling of ${policy.max_commission_rate}%. Frass caps commissions to keep the ecosystem sustainable.`;
  } else if (!a.viable) {
    advice = "This product cannot safely carry an affiliate commission yet — adjust price or costs first.";
  } else if (belowTarget) {
    advice = `A ${rate}% affiliate commission would drop your profit to ${marginPct}%, below your ${e.target_margin_pct}% target. I recommend staying between ${a.minRate}% and ${a.maxRate}%, or increasing your selling price before offering more.`;
  } else if (rate < a.minRate) {
    advice = `${rate}% is unlikely to motivate affiliates. ${a.minRate}% is the lowest meaningful incentive.`;
  } else if (rate > a.recommendedRate) {
    advice = `${rate}% is still sustainable, but higher than necessary — ${a.recommendedRate}% usually converts just as well.`;
  } else {
    advice = `${rate}% is a healthy, sustainable incentive for this product.`;
  }

  return {
    affiliatePayout,
    builderPayout,
    platformAllocation: a.platformAllocation,
    marginPct,
    belowTarget,
    aboveCeiling,
    monthlyBuilderPayout: round2(builderPayout * units),
    monthlyAffiliatePayout: round2(affiliatePayout * units),
    advice,
  };
}

export function fmt(amount: number, currency = "USD") {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function promoActive(policy: AffiliatePolicy, now = new Date()): boolean {
  if (!policy.promo_label || policy.promo_max_commission_rate == null) return false;
  const start = policy.promo_starts_at ? new Date(policy.promo_starts_at) : null;
  const end = policy.promo_ends_at ? new Date(policy.promo_ends_at) : null;
  if (start && now < start) return false;
  if (end && now > end) return false;
  return true;
}
