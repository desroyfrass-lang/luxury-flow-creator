import { describe, expect, it } from "vitest";
import { RETAIL_MIN_MARGIN_PCT, assertRetailPriceSafe, minimumGuardrailPrice, retailMargin, type RetailCosts } from "./pricing-floor";
import { DEFAULT_POLICY } from "@/lib/affiliate-intelligence";

const pilot: RetailCosts = {
  supplierCost: 6.97, shippingCost: 7.35, packagingCost: 0, otherCost: 0,
  processingFeePct: 2.9, processingFeeFixed: 0.3, currency: "USD",
};

describe("FRASS KICKS retail minimum 25% margin", () => {
  it("the rule is 25%", () => expect(RETAIL_MIN_MARGIN_PCT).toBe(25));

  it("is margin, not markup: $100 cost at $125 is unsafe (20% margin)", () => {
    const c = { ...pilot, supplierCost: 100, shippingCost: 0, processingFeePct: 0, processingFeeFixed: 0 };
    expect(retailMargin(125, c).safe).toBe(false);
    expect(retailMargin(125, c).marginPct).toBe(20);
    expect(retailMargin(133.34, c).safe).toBe(true);
  });

  it("pilot floor: $14.32 landed + 2.9% + $0.30 → $20.28; one cent less is blocked", () => {
    const r = minimumGuardrailPrice(pilot);
    expect(r.landedCost).toBe(14.32);
    expect(r.floorPrice).toBe(20.28);
    expect(retailMargin(20.28, pilot).safe).toBe(true);
    expect(retailMargin(20.27, pilot).safe).toBe(false);
  });

  it("a discount raises the listed floor so the charged price still keeps 25%", () => {
    const r = minimumGuardrailPrice({ ...pilot, discountPct: 20 });
    expect(r.floorPrice!).toBeGreaterThan(20.28);
    expect(retailMargin(20.27, { ...pilot, discountPct: 20 }).safe).toBe(false);
    expect(retailMargin(r.floorPrice!, { ...pilot, discountPct: 20 }).safe).toBe(true);
  });

  it("packaging and other costs are counted", () => {
    expect(minimumGuardrailPrice({ ...pilot, packagingCost: 1, otherCost: 0.5 }).floorPrice!).toBeGreaterThan(20.28);
  });

  it("missing costs refuse a price", () => {
    const { shippingCost: _s, ...noShip } = pilot;
    expect(minimumGuardrailPrice(noShip as RetailCosts).floorPrice).toBeNull();
    expect(minimumGuardrailPrice({ ...pilot, supplierCost: 0 }).floorPrice).toBeNull();
    expect(retailMargin(50, { ...pilot, processingFeePct: Number.NaN }).safe).toBe(false);
  });

  it("unsafe retail price writes are blocked", () => {
    expect(() => assertRetailPriceSafe(19.99, pilot)).toThrow(/blocked/);
    expect(() => assertRetailPriceSafe(20.28, pilot)).not.toThrow();
    expect(() => assertRetailPriceSafe(50, { ...pilot, supplierCost: Number.NaN })).toThrow(/blocked/);
  });

  it("commission policy is untouched and not used for retail (allocation stays 8 in affiliate defaults)", () => {
    expect(DEFAULT_POLICY.platform_allocation_rate).toBe(8);
    expect(DEFAULT_POLICY.default_min_margin_pct).toBe(20);
  });
});

import { profitBreakdown, type BreakdownInput } from "./pricing-floor";

const v = (amount: number) => ({ amount, state: "verified" as const });
const base: BreakdownInput = {
  listPrice: 30, currency: "USD",
  supplierCost: v(6.97), shippingCost: v(7.35), packagingCost: v(0), otherCost: v(0),
  processingFeePct: v(2.9), processingFeeFixed: v(0.3),
  discountPct: { amount: null, state: "not_applicable" }, commissionPct: { amount: null, state: "not_applicable" },
};

describe("Vendor Room protected profit + surplus", () => {
  it("uses the same math as the 25% guardrail", () => {
    const b = profitBreakdown(base);
    const m = retailMargin(30, pilot);
    expect(b.profit).toBe(m.profit);
    expect(b.marginPct).toBe(m.marginPct);
    expect(b.floorPrice).toBe(20.28);
  });

  it("protected profit is 25% of charged price; surplus is the rest", () => {
    const b = profitBreakdown(base);
    expect(b.protectedProfit).toBe(7.5);
    expect(b.surplus).toBe(Math.round((b.profit! - 7.5) * 100) / 100);
    expect(b.status).toBe("protected_verified");
    expect(b.canApprove).toBe(true);
  });

  it("discount reduces the charged price before the 25% is measured", () => {
    const b = profitBreakdown({ ...base, discountPct: v(20) });
    expect(b.charged).toBe(24);
    expect(b.protectedProfit).toBe(6);
  });

  it("commission is counted once, only when it applies", () => {
    const none = profitBreakdown(base);
    const ten = profitBreakdown({ ...base, commissionPct: v(10) });
    expect(Math.round((none.profit! - ten.profit!) * 100) / 100).toBe(3);
  });

  it("missing costs or pending commission policy block approval", () => {
    expect(profitBreakdown({ ...base, shippingCost: { amount: null, state: "missing" } }).canApprove).toBe(false);
    const p = profitBreakdown({ ...base, commissionPct: { amount: null, state: "pending_policy" } });
    expect(p.status).toBe("incomplete");
    expect(p.canApprove).toBe(false);
  });

  it("estimates show numbers but never approve", () => {
    const b = profitBreakdown({ ...base, shippingCost: { amount: 7.35, state: "estimated" } });
    expect(b.status).toBe("protected_estimated");
    expect(b.canApprove).toBe(false);
  });

  it("below 25% is blocked", () => {
    const b = profitBreakdown({ ...base, listPrice: 20.27 });
    expect(b.status).toBe("below_minimum");
    expect(b.canApprove).toBe(false);
  });

  it("no selling price means incomplete", () => {
    expect(profitBreakdown({ ...base, listPrice: null }).status).toBe("incomplete");
  });
});

describe("Vendor Room cascade with missing costs", () => {
  const partial: BreakdownInput = {
    ...base, listPrice: 30,
    processingFeePct: { amount: null, state: "missing" }, processingFeeFixed: { amount: null, state: "missing" },
    shippingCost: { amount: 7.35, state: "estimated" }, commissionPct: { amount: null, state: "pending_policy" },
  };
  it("one price still produces lower-bound numbers but never approves", () => {
    const b = profitBreakdown(partial);
    expect(b.canApprove).toBe(false);
    expect(b.provisional.charged).toBe(30);
    expect(b.provisional.knownCost).toBe(14.32);
    expect(b.provisional.profitBeforeMissing).toBe(15.68);
    expect(b.provisional.missing).toContain("Commission (only if applicable)");
  });
  it("floor on known costs is lower than the full floor (missing costs raise it)", () => {
    const b = profitBreakdown(partial);
    expect(b.provisional.floorOnKnownCosts).toBe(19.1);
    expect(b.provisional.floorOnKnownCosts!).toBeLessThan(20.28);
  });
});

import { RETAIL_TARGET_PREFERRED_PCT, RETAIL_TARGET_ACCEPTABLE_MIN_PCT, marginBand, priceForMargin } from "./pricing-floor";

describe("Founder target range 30–40% (25% stays the hard minimum)", () => {
  it("bands", () => {
    expect(RETAIL_TARGET_PREFERRED_PCT).toBe(40);
    expect(RETAIL_TARGET_ACCEPTABLE_MIN_PCT).toBe(30);
    expect(marginBand(40)).toBe("preferred");
    expect(marginBand(39.99)).toBe("acceptable");
    expect(marginBand(30)).toBe("acceptable");
    expect(marginBand(29.99)).toBe("founder_review");
    expect(marginBand(25)).toBe("founder_review");
    expect(marginBand(24.99)).toBe("blocked");
  });
  it("target prices use the same margin math and reach their target", () => {
    const p40 = priceForMargin(pilot, 40).floorPrice!;
    const p30 = priceForMargin(pilot, 30).floorPrice!;
    expect(retailMargin(p40, pilot).marginPct!).toBeGreaterThanOrEqual(40);
    expect(retailMargin(p40 - 0.01, pilot).marginPct!).toBeLessThan(40);
    expect(p30).toBeLessThan(p40);
    expect(minimumGuardrailPrice(pilot).floorPrice).toBe(20.28);
  });
  it("recommendation only when every cost is verified", () => {
    expect(profitBreakdown(base).targets?.preferred).toBe(priceForMargin(pilot, 40).floorPrice);
    expect(profitBreakdown({ ...base, shippingCost: { amount: 7.35, state: "estimated" } }).targets).toBeNull();
    expect(profitBreakdown({ ...base, commissionPct: { amount: null, state: "pending_policy" } }).targets).toBeNull();
  });
  it("40% is not a floor: a 35% price is acceptable and approvable", () => {
    const p = priceForMargin(pilot, 35).floorPrice!;
    const b = profitBreakdown({ ...base, listPrice: p });
    expect(b.band).toBe("acceptable");
    expect(b.canApprove).toBe(true);
  });
  it("25–29.99% needs Founder review, not auto-approval", () => {
    const b = profitBreakdown({ ...base, listPrice: 21 });
    expect(b.band).toBe("founder_review");
    expect(b.canApprove).toBe(false);
  });
  it("provisional targets are lower bounds when costs are missing", () => {
    const b = profitBreakdown({ ...base, processingFeePct: { amount: null, state: "missing" }, processingFeeFixed: { amount: null, state: "missing" } });
    expect(b.targets).toBeNull();
    expect(b.provisional.targetPreferredOnKnown).toBe(23.87);
  });
});

describe("shipping responsibility (customer pays by default)", () => {
  const cust = { ...base, shippingCost: v(0) };
  it("customer-paid: CJ shipping is not a product cost; only the card fee on the shipping charge is", () => {
    const b = profitBreakdown({ ...cust, customerShippingCharge: v(8) });
    const noShip = profitBreakdown({ ...cust, customerShippingCharge: { amount: null, state: "not_applicable" } });
    expect(Math.round((noShip.profit! - b.profit!) * 100) / 100).toBe(0.23); // 2.9% of 8
    expect(b.status).toBe("protected_verified");
  });
  it("unconfirmed customer shipping charge blocks verified end-to-end margin", () => {
    const b = profitBreakdown({ ...cust, customerShippingCharge: { amount: null, state: "missing" } });
    expect(b.canApprove).toBe(false);
    expect(b.warnings.join(" ")).toMatch(/not confirmed/);
  });
  it("free shipping offer counts the full FRASS shipping cost", () => {
    expect(profitBreakdown({ ...base, customerShippingCharge: { amount: null, state: "not_applicable" } }).profit)
      .toBe(Math.round((profitBreakdown(cust).profit! - 7.35) * 100) / 100);
  });
  it("pilot provisional with customer-paid shipping: 6.97 only → 25% 9.30, 30% 9.96, 40% 11.62", () => {
    const b = profitBreakdown({ ...cust, listPrice: null, processingFeePct: { amount: null, state: "missing" }, processingFeeFixed: { amount: null, state: "missing" } });
    expect(b.provisional.floorOnKnownCosts).toBe(9.3);
    expect(b.provisional.targetAcceptableOnKnown).toBe(9.96);
    expect(b.provisional.targetPreferredOnKnown).toBe(11.62);
    expect(b.targets).toBeNull();
  });
});
