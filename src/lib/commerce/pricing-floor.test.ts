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
