import { describe, expect, it } from "vitest";
import { minimumGuardrailPrice, meetsMargin } from "./pricing-floor";
import { DEFAULT_POLICY } from "@/lib/affiliate-intelligence";

describe("CJ pricing guardrail floor (existing profit model only)", () => {
  it("pilot blouse: $6.97 cost + $7.35 cheapest CJ US freight, 8% allocation, 20% margin", () => {
    const r = minimumGuardrailPrice({ supplierCost: 6.97, shippingCost: 7.35, currency: "USD", policy: { platform_allocation_rate: 8, default_min_margin_pct: 20 } });
    expect(r.landedCost).toBe(14.32);
    expect(r.floorPrice).toBe(21.15);
  });
  it("the floor passes the margin check and one cent less fails", () => {
    const pol = { ...DEFAULT_POLICY, platform_allocation_rate: 8, default_min_margin_pct: 20 };
    expect(meetsMargin(21.15, 6.97, 7.35, "USD", pol)).toBe(true);
    expect(meetsMargin(21.14, 6.97, 7.35, "USD", pol)).toBe(false);
  });
  it("a 10% allocation raises the floor", () => {
    const r = minimumGuardrailPrice({ supplierCost: 6.97, shippingCost: 7.35, currency: "USD", policy: { platform_allocation_rate: 10, default_min_margin_pct: 20 } });
    expect(r.floorPrice!).toBeGreaterThan(21.15);
  });
  it("refuses without verified cost", () => {
    expect(minimumGuardrailPrice({ supplierCost: 0, shippingCost: 7, currency: "USD" }).floorPrice).toBeNull();
  });
});
