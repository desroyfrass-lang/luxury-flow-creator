import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import { ProfitBreakdownPanel } from "./profit-breakdown-panel";
import { profitBreakdown } from "@/lib/commerce/pricing-floor";

const variants = ["S", "M", "L", "XL", "2XL", "3XL"].map((s) => ({ id: s, option_label: `Sky Blue ${s}`, sku: null, supplier_cost: 6.97, currency: "USD" }));

describe("Vendor Room worksheet initial render", () => {
  const html = renderToString(<ProfitBreakdownPanel currency="USD" offerCost={6.97} variants={variants} knownShipping={{ amount: 7.35, note: "quote" }} />);
  it("prefills the provisional price 19.10 (14.32 ÷ 0.75, rounded up)", () => {
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
