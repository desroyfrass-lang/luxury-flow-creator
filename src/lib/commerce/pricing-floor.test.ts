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

  it("pilot floor: $14.32 landed + 2.9% + $0.30 → $20.27; one cent less is blocked", () => {
    const r = minimumGuardrailPrice(pilot);
    expect(r.landedCost).toBe(14.32);
    expect(r.floorPrice).toBe(20.27);
    expect(retailMargin(20.27, pilot).safe).toBe(true);
    expect(retailMargin(20.26, pilot).safe).toBe(false);
  });

  it("a discount raises the listed floor so the charged price still keeps 25%", () => {
    const r = minimumGuardrailPrice({ ...pilot, discountPct: 20 });
    expect(r.floorPrice!).toBeGreaterThan(20.27);
    expect(retailMargin(20.27, { ...pilot, discountPct: 20 }).safe).toBe(false);
    expect(retailMargin(r.floorPrice!, { ...pilot, discountPct: 20 }).safe).toBe(true);
  });

  it("packaging and other costs are counted", () => {
    expect(minimumGuardrailPrice({ ...pilot, packagingCost: 1, otherCost: 0.5 }).floorPrice!).toBeGreaterThan(20.27);
  });

  it("missing costs refuse a price", () => {
    const { shippingCost: _s, ...noShip } = pilot;
    expect(minimumGuardrailPrice(noShip as RetailCosts).floorPrice).toBeNull();
    expect(minimumGuardrailPrice({ ...pilot, supplierCost: 0 }).floorPrice).toBeNull();
    expect(retailMargin(50, { ...pilot, processingFeePct: Number.NaN }).safe).toBe(false);
  });

  it("unsafe retail price writes are blocked", () => {
    expect(() => assertRetailPriceSafe(19.99, pilot)).toThrow(/blocked/);
    expect(() => assertRetailPriceSafe(20.27, pilot)).not.toThrow();
    expect(() => assertRetailPriceSafe(50, { ...pilot, supplierCost: Number.NaN })).toThrow(/blocked/);
  });

  it("commission policy is untouched and not used for retail (allocation stays 8 in affiliate defaults)", () => {
    expect(DEFAULT_POLICY.platform_allocation_rate).toBe(8);
    expect(DEFAULT_POLICY.default_min_margin_pct).toBe(20);
  });
});
