import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { computeDestinationPricing, type VariantSource } from "./destination-pricing";
import { ILLUSTRATIVE_INPUTS, saveWorksheetSchema, type WorksheetInputs } from "./pricing-worksheet";

const now = new Date("2026-10-11T12:00:00Z");
const q = (dest: string, price: number, method = "CJPacket", exp = "2026-10-13T00:00:00Z") =>
  ({ dest_country: dest, method, price, currency: "USD", fetched_at: "2026-10-11T10:00:00Z", expires_at: exp });
const v = (id: string, cost: number, quotes = [q("US", 7.35)]): VariantSource => ({ variantId: id, label: id, supplierCost: cost, supplierCurrency: "USD", quotes });
const verified: WorksheetInputs = {
  processingFeePct: { amount: "3", state: "verified" }, processingFeeFixed: { amount: "0.30", state: "verified" },
  packagingCost: { amount: "0.50", state: "verified" }, otherCost: { amount: "0.50", state: "verified" },
  discountPct: { amount: "", state: "not_applicable" }, commissionPct: { amount: "", state: "not_applicable" },
  oversized: false, shippingMethod: "CJPacket",
};
const run = (o: Partial<Parameters<typeof computeDestinationPricing>[0]>) =>
  computeDestinationPricing({ destination: "US", inputs: ILLUSTRATIVE_INPUTS, finalPrice: null, variants: [v("S", 6.97)], now, ...o });

describe("destination pricing engine", () => {
  it("US pilot: 40% recommendation rounds up to 27.41 and stays an estimate", () => {
    const r = run({});
    expect(r.recommendedPrice).toBe(27.41);
    expect(r.minimumPrice).toBe(21.70);
    expect(r.ready).toBe(false);
    expect(r.basis).toBe("estimated");
    expect(r.variants[0].shipping.state).toBe("estimated");
  });
  it("costliest variant sets the recommended price", () => {
    const r = run({ variants: [v("S", 6.97), v("3XL", 8.5, [q("US", 9.1)])] });
    expect(r.recommendedPrice).toBe(33.16);
    expect(r.costliestVariantId).toBe("3XL");
  });
  it("never reuses US shipping for Canada", () => {
    const r = run({ destination: "CA", variants: [v("S", 6.97, [q("US", 7.35)])] });
    expect(r.variants[0].shipping.amount).toBeNull();
    expect(r.recommendedPrice).toBeNull();
  });
  it("non-USD destinations fail closed without a verified exchange rate", () => {
    const r = run({ destination: "GB", variants: [v("S", 6.97, [q("GB", 9)])] });
    expect(r.recommendedPrice).toBeNull();
    expect(r.requirements.find((x) => x.key === "currency")?.met).toBe(false);
    expect(r.basis).toBe("blocked");
  });
  it("unsupported destination is blocked", () => {
    expect(run({ destination: "FR" }).requirements.find((x) => x.key === "zone")?.met).toBe(false);
  });
  it("expired quote refuses a price", () => {
    const r = run({ variants: [v("S", 6.97, [q("US", 7.35, "CJPacket", "2026-10-11T11:00:00Z")])] });
    expect(r.recommendedPrice).toBeNull();
    expect(r.variants[0].shippingSource).toContain("expired");
  });
  it("missing supplier cost or non-USD supplier cost fails closed", () => {
    expect(run({ variants: [{ ...v("S", 6.97), supplierCost: null }] }).recommendedPrice).toBeNull();
    expect(run({ variants: [{ ...v("S", 6.97), supplierCurrency: "CNY" }] }).recommendedPrice).toBeNull();
  });
  it("oversized items need an individual quote", () => {
    expect(run({ inputs: { ...ILLUSTRATIVE_INPUTS, oversized: true } }).recommendedPrice).toBeNull();
  });
  it("chosen method uses only that method's quote and counts as verified", () => {
    const r = run({ inputs: verified, variants: [v("S", 6.97, [q("US", 5, "Cheap"), q("US", 7.35, "CJPacket")])] });
    expect(r.variants[0].shipping).toEqual({ amount: 7.35, state: "verified" });
  });
  it("all verified + price at 40% target is ready", () => {
    const r = run({ inputs: verified, finalPrice: 27.41 });
    expect(r.ready).toBe(true);
    expect(r.basis).toBe("verified");
    expect(r.band).toBe("preferred");
  });
  it("all verified but price below 25% is not ready", () => {
    expect(run({ inputs: verified, finalPrice: 21.69 }).ready).toBe(false);
  });
  it("25–29.99% band requires a Founder review note", () => {
    const r = run({ inputs: verified, finalPrice: 22.5 });
    expect(r.band).toBe("founder_review");
    expect(r.requiresReviewNote).toBe(true);
  });
  it("pending commission blocks readiness", () => {
    const r = run({ inputs: { ...verified, commissionPct: { amount: "0", state: "pending_policy" } }, finalPrice: 30 });
    expect(r.ready).toBe(false);
  });
  it("blank estimate amounts are missing, never zero", () => {
    const r = run({ inputs: { ...ILLUSTRATIVE_INPUTS, packagingCost: { amount: "", state: "estimated" } } });
    expect(r.recommendedPrice).toBeNull();
  });
});

describe("worksheet save validation", () => {
  const base = { productId: "00000000-0000-4000-8000-000000000000", finalPrice: 27.41, inputs: ILLUSTRATIVE_INPUTS, summary: { status: "x", marginPct: 40, approvable: false } };
  it("defaults legacy saves to US and rejects unknown destinations", () => {
    expect(saveWorksheetSchema.parse(base).destination).toBe("US");
    expect(() => saveWorksheetSchema.parse({ ...base, destination: "FR" })).toThrow();
    expect(saveWorksheetSchema.parse({ ...base, destination: "JM" }).destination).toBe("JM");
  });
  it("rejects zero or negative final price", () => {
    expect(() => saveWorksheetSchema.parse({ ...base, finalPrice: 0 })).toThrow();
  });
});

describe("server access control", () => {
  const src = readFileSync("src/lib/vendors/pricing-room.functions.ts", "utf8");
  it("every Pricing Room server function requires sign-in", () => {
    expect(src.match(/createServerFn/g)!.length).toBe(src.match(/middleware\(\[requireSupabaseAuth\]\)/g)!.length);
  });
  it("approval is Founder (super_admin) only and reads and writes are admin only", () => {
    expect(src).toContain('hasRole(context, "super_admin")');
    expect(src.match(/await assertFounder\(context\)/g)!.length).toBe(4);
  });
  it("reads and saves are always scoped to product AND destination", () => {
    expect(src).not.toMatch(/upsert\(/);
    expect(src.match(/\.eq\("destination", data\.destination\)/g)!.length).toBeGreaterThanOrEqual(4);
  });
});
