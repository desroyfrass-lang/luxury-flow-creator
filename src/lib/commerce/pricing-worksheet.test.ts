import { describe, expect, it } from "vitest";
import { DEFAULT_INPUTS, ILLUSTRATIVE_INPUTS, planningBreakdown, withPlanningEstimates, parseStoredInputs, worksheetInputsSchema, assertEditableWorksheet } from "./pricing-worksheet";
import { profitBreakdown, type BreakdownInput } from "./pricing-floor";

const estimate = (amount: number) => ({ amount, state: "estimated" as const });
const base: BreakdownInput = {
  listPrice: null, currency: "USD", supplierCost: { amount: 6.97, state: "verified" }, shippingCost: estimate(7.35),
  packagingCost: estimate(.5), otherCost: estimate(.5), processingFeePct: estimate(3), processingFeeFixed: estimate(.3),
  discountPct: { amount: null, state: "not_applicable" }, commissionPct: { amount: 0, state: "pending_policy" },
};
describe("A1 pricing planning rules", () => {
  it("40% recommendation includes percentage and fixed costs, rounded UP", () => {
    const p = planningBreakdown(base);
    expect(p.preferred).toBe(27.41);
    expect(planningBreakdown({ ...base, listPrice: 27.41 }).marginPct).toBe(40.01);
    expect(planningBreakdown({ ...base, listPrice: 27.40 }).marginPct).toBe(39.99);
    expect(p.minimum).toBe(21.70);
  });
  it("one price cascades net profit, margin and percentage fee", () => {
    const a = planningBreakdown({ ...base, listPrice: 30 });
    const b = planningBreakdown({ ...base, listPrice: 40 });
    expect(a.profit).toBe(13.48);
    expect(b.profit).toBe(23.18);
    expect(a.result.lines.find((x) => x.key === "processingFeePct")?.amount).toBe(.9);
    expect(b.result.lines.find((x) => x.key === "processingFeePct")?.amount).toBe(1.2);
  });
  it("pilot US shipping and all illustrative costs produce exact projected values", () => {
    const p = planningBreakdown({ ...base, listPrice: 27.41 });
    expect(p.profit).toBe(10.97);
    expect(p.marginPct).toBe(40.01);
    expect(p.result.totalCost).toBe(16.44);
    expect(p.result.lines.find((x) => x.key === "shippingCost")?.amount).toBe(7.35);
    expect(p.result.lines.find((x) => x.key === "processingFeePct")?.amount).toBe(.82);
    expect(p.result.lines.find((x) => x.key === "processingFeeFixed")?.amount).toBe(.30);
    expect(p.result.lines.find((x) => x.key === "packagingCost")?.amount).toBe(.50);
    expect(p.result.lines.find((x) => x.key === "otherCost")?.amount).toBe(.50);
    expect(p.result.canApprove).toBe(false);
  });
  it("10% discount charges percentage fees on discounted revenue, not list price", () => {
    const p = planningBreakdown({ ...base, listPrice: 40, discountPct: estimate(10), commissionPct: estimate(10) });
    expect(p.result.charged).toBe(36);
    expect(p.result.lines.find((x) => x.key === "processingFeePct")?.amount).toBe(1.08);
    expect(p.result.lines.find((x) => x.key === "commissionPct")?.amount).toBe(3.60);
    expect(p.profit).toBe(15.70);
    expect(p.preferred).toBe(36.93);
    expect(planningBreakdown({ ...base, discountPct: estimate(10), commissionPct: { amount: null, state: "not_applicable" } }).preferred).toBe(30.45);
  });
  it("discount and applicable commission enter the target equation once", () => {
    const b = { ...base, discountPct: estimate(10), commissionPct: estimate(10) };
    expect(planningBreakdown(b).preferred).toBe(36.93);
    expect(planningBreakdown({ ...b, listPrice: 36.93 }).marginPct).toBeGreaterThanOrEqual(40);
  });
  it("conditional no commission is not verified approval", () => {
    expect(planningBreakdown(base).conditionalCommission).toBe(true);
    expect(profitBreakdown({ ...base, listPrice: 40 }).canApprove).toBe(false);
    expect(profitBreakdown({ ...base, listPrice: 40 }).status).toBe("incomplete");
  });
  it("missing or expired shipping never becomes a zero-cost projection", () => {
    const p = planningBreakdown({ ...base, listPrice: 40, shippingCost: { amount: null, state: "missing" } });
    expect(p.preferred).toBeNull();
    expect(p.profit).toBeNull();
    expect(p.marginPct).toBeNull();
  });
  it("actual below-25% floor is blocked even for planning", () => {
    expect(planningBreakdown({ ...base, listPrice: 21.69 }).result.status).toBe("below_minimum");
    expect(planningBreakdown({ ...base, listPrice: 21.70 }).result.status).toBe("protected_estimated");
  });
  it("legacy blanks gain visible estimates without overwriting saved overrides", () => {
    expect(withPlanningEstimates(DEFAULT_INPUTS)).toEqual(ILLUSTRATIVE_INPUTS);
    const saved = { ...DEFAULT_INPUTS, packagingCost: { amount: "2.25", state: "estimated" as const } };
    expect(withPlanningEstimates(parseStoredInputs(JSON.parse(JSON.stringify(saved)))) .packagingCost.amount).toBe("2.25");
    expect(DEFAULT_INPUTS.packagingCost.state).toBe("missing");
  });
  it("variant-specific supplier and included shipping determine the costliest target", () => {
    const a = planningBreakdown(base);
    const b = planningBreakdown({ ...base, supplierCost: { amount: 8.5, state: "verified" }, shippingCost: estimate(9.1) });
    expect(a.preferred).toBe(27.41);
    expect(b.preferred).toBe(33.16);
    expect(b.result.canApprove).toBe(false);
  });
});

describe("editable worksheet safety", () => {
  it("persists bounded private notes without changing cost math", () => {
    const i = worksheetInputsSchema.parse({ ...ILLUSTRATIVE_INPUTS, founderNotes: "  Review my costs  ", businessPolicyNotes: "Country policy", taxDutyNotes: "Unconfirmed" });
    expect(i.founderNotes).toBe("Review my costs");
    expect(parseStoredInputs(JSON.parse(JSON.stringify(i))).businessPolicyNotes).toBe("Country policy");
    expect(planningBreakdown(base).preferred).toBe(27.41);
    expect(() => worksheetInputsSchema.parse({ ...i, founderNotes: "a".repeat(2001) })).toThrow();
  });
  it("rejects unsafe numeric settings and extra safety-rule overrides", () => {
    for (const amount of ["-1", "NaN", "1e4", "1.12345", "1000001"]) expect(() => worksheetInputsSchema.parse({ ...ILLUSTRATIVE_INPUTS, packagingCost: { amount, state: "estimated" } })).toThrow();
    expect(() => worksheetInputsSchema.parse({ ...ILLUSTRATIVE_INPUTS, discountPct: { amount: "100", state: "estimated" } })).toThrow();
    expect(() => worksheetInputsSchema.parse({ ...ILLUSTRATIVE_INPUTS, minimumMargin: 5 })).toThrow();
  });
  it("edits cannot create or alter a verified fee declaration", () => {
    const forged = { ...ILLUSTRATIVE_INPUTS, processingFeePct: { amount: "3", state: "verified" as const } };
    expect(() => assertEditableWorksheet(forged, null)).toThrow("trusted source");
    expect(() => assertEditableWorksheet(forged, ILLUSTRATIVE_INPUTS)).toThrow();
    expect(() => assertEditableWorksheet(forged, forged)).not.toThrow();
    expect(() => assertEditableWorksheet({ ...forged, processingFeePct: { amount: "4", state: "verified" } }, forged)).toThrow();
    expect(() => assertEditableWorksheet({ ...forged, processingFeePct: { amount: "4", state: "estimated" } }, forged)).not.toThrow();
  });
});