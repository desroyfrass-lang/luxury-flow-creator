import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import { ProfitBreakdownPanel } from "./profit-breakdown-panel";
import { profitBreakdown } from "@/lib/commerce/pricing-floor";

const variants = ["S", "M", "L", "XL", "2XL", "3XL"].map((s) => ({ id: s, option_label: `Sky Blue ${s}`, sku: null, supplier_cost: 6.97, currency: "USD" }));

describe("Vendor Room worksheet initial render", () => {
  const html = renderToString(<ProfitBreakdownPanel currency="USD" offerCost={6.97} variants={variants} knownShipping={{ amount: 7.35, note: "quote" }} />);
  it("shipping included: prefills 19.10 ((6.97 + 7.35) ÷ 0.75, rounded up)", () => {
    expect(html).toContain('value="19.10"');
    expect(html).toContain("provisional-price-note");
  });
  it("fills every variant row without typing, and never shows it as verified", () => {
    expect(html.match(/USD 19\.10/g)!.length).toBeGreaterThanOrEqual(6);
    expect(html).not.toContain("25% protected profit verified");
  });
  it("recalculates from a changed price", () => {
    const b = profitBreakdown({
      listPrice: 25, currency: "USD", supplierCost: { amount: 6.97, state: "verified" }, shippingCost: { amount: 7.35, state: "estimated" },
      packagingCost: { amount: null, state: "missing" }, otherCost: { amount: null, state: "missing" },
      processingFeePct: { amount: null, state: "missing" }, processingFeeFixed: { amount: null, state: "missing" },
      discountPct: { amount: null, state: "not_applicable" }, commissionPct: { amount: null, state: "pending_policy" },
    });
    expect(b.provisional.profitBeforeMissing).toBe(10.68);
    expect(b.canApprove).toBe(false);
  });
});

describe("target range display", () => {
  it("initial pilot render shows only lower-bound target estimates, never a verified recommendation", () => {
    const html = renderToString(<ProfitBreakdownPanel currency="USD" offerCost={6.97} variants={variants} knownShipping={{ amount: 7.35, note: "quote" }} />);
    expect(html).toContain("frassy-target-provisional");
    expect(html).not.toContain("frassy-target-verified");
    expect(html).toContain("USD 23.87");
  });
});

describe("standard shipping included", () => {
  const now = new Date("2026-10-11T10:00:00Z");
  const q = (price: number, exp: string) => ({ method: "LuWei Ordinary US", price, currency: "USD", fetched_at: "2026-10-11T09:00:00Z", expires_at: exp, aging_days: "5-11" });
  it("shows shipping as included and never as a checkout charge", () => {
    const html = renderToString(<ProfitBreakdownPanel currency="USD" offerCost={6.97} variants={variants} knownShipping={{ amount: 7.35, note: "quote" }} now={now} />);
    expect(html).toContain("Standard shipping included in the price");
    expect(html).not.toContain("Customer pays (default)");
  });
  it("a fresh saved CJ quote replaces the earlier reading: 6.97 + 7.23 → 18.94", () => {
    const quotes = Object.fromEntries(variants.map((v) => [v.id, [q(7.23, "2026-10-14T09:00:00Z")]]));
    const html = renderToString(<ProfitBreakdownPanel currency="USD" offerCost={6.97} variants={variants} knownShipping={{ amount: 7.35, note: "quote" }} quotes={quotes} now={now} />);
    expect(html).toContain('value="18.94"');
  });
  it("an expired quote fails closed (no provisional price from shipping)", () => {
    const quotes = Object.fromEntries(variants.map((v) => [v.id, [q(7.23, "2026-10-11T09:30:00Z")]]));
    const html = renderToString(<ProfitBreakdownPanel currency="USD" offerCost={6.97} variants={variants} quotes={quotes} now={now} />);
    expect(html).toContain("Quote expired");
    expect(html).not.toContain("25% protected profit verified");
  });
});
