import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import { ProfitBreakdownPanel } from "./profit-breakdown-panel";
import { roundMoney, sumMoney } from "@/lib/commerce/money";
import { DEFAULT_INPUTS, parseStoredInputs } from "@/lib/commerce/pricing-worksheet";

const variants = ["S", "M", "L", "XL", "2XL", "3XL"].map((s) => ({ id: s, option_label: `Sky Blue ${s}`, sku: null, supplier_cost: 6.97, currency: "USD" }));
const now = new Date("2026-10-11T10:00:00Z");
const q = (price: number, exp = "2026-10-14T09:00:00Z") => ({ method: "LuWei Ordinary US", price, currency: "USD", fetched_at: "2026-10-11T09:00:00Z", expires_at: exp, aging_days: "5-11" });
// React SSR inserts <!-- --> between text pieces; strip them so text assertions read naturally.
const render = (p: Partial<React.ComponentProps<typeof ProfitBreakdownPanel>> = {}) =>
  renderToString(<ProfitBreakdownPanel currency="USD" offerCost={6.97} variants={variants} knownShipping={{ amount: 7.35, note: "quote" }} now={now} {...p} />).replaceAll("<!-- -->", "");

describe("Pricing Room final price", () => {
  it("prefills 40% after illustrative processing, packaging and other expenses", () => {
    const html = render();
    expect(html).toContain('value="27.41"');
    expect(html).toContain("frassy-target-provisional");
    expect(html).not.toContain("Verified — keeps the protected 25%");
  });
  it("shows 30% and 25% options too", () => {
    const html = render();
    expect(html).toContain("USD 23.32");
    expect(html).toContain("USD 21.70");
  });
  it("a saved Founder price is restored on reload", () => {
    const html = render({ initial: { finalPrice: 29.99, inputs: DEFAULT_INPUTS, updatedAt: "2026-10-11T11:00:00Z" }, onSave: () => {} });
    expect(html).toContain('value="29.99"');
    expect(html).toContain("Last saved 2026-10-11 11:00");
  });
});

describe("variant-specific costs", () => {
  it("each variant uses its own supplier cost and shipping quote", () => {
    const vs = [{ ...variants[0], supplier_cost: 6.97 }, { ...variants[5], supplier_cost: 8.5 }];
    const html = render({ variants: vs, quotes: { S: [q(7.23)], "3XL": [q(9.1)] } });
    const small = render({ variants: vs, quotes: { S: [q(7.23)], "3XL": [q(9.1)] }, initial: { finalPrice: 40, inputs: DEFAULT_INPUTS, updatedAt: now.toISOString() } });
    expect(small).toContain('value="40.00"');
    expect(html).toContain("Supplier USD 8.50 · Shipping USD 9.10");
    // costliest variant: (8.50 + 9.10 + .50 + .50 + .30) / (.60 - .03)
    expect(html).toContain('value="33.16"');
  });
  it("expired quote fails closed", () => {
    const html = render({ knownShipping: null, quotes: Object.fromEntries(variants.map((v) => [v.id, [q(7.23, "2026-10-11T09:30:00Z")]])) });
    expect(html).toContain("Quote expired");
  });
  it("shipping is included, never a checkout charge", () => {
    const html = render();
    expect(html).toContain("Standard shipping included in the price");
    expect(html).toContain("not charged shipping again");
  });
  it("unknown costs show readable blocking status, not zeros", () => {
    const html = render();
    expect(html).toContain("Policy not confirmed");
    expect(html).toContain("Approval blocked");
  });
});

describe("money + persistence foundations", () => {
  it("rounds deterministically", () => {
    expect(roundMoney(1.005)).toBe(1.01);
    expect(sumMoney(0.1, 0.2)).toBe(0.3);
  });
  it("malformed saved inputs fall back to safe defaults", () => {
    expect(parseStoredInputs({ bogus: true })).toEqual(DEFAULT_INPUTS);
  });
  it("save/load are Founder-only and never write prices, Shopify or CJ", () => {
    const src = readFileSync("src/lib/vendors/pricing-room.functions.ts", "utf8").replace(/^\s*\/\/.*$/gm, "");
    expect(src.match(/assertFounder\(context\)/g)?.length).toBe(4);
    expect(src).not.toMatch(/shopify|cjdropshipping|canonical_product_variants"\)\.update|vendor_offers/i);
    const mig = readFileSync("drizzle/migrations/0033_pricing_room_worksheets.sql", "utf8");
    expect(mig).toMatch(/has_role\(auth\.uid\(\), 'admin'\)/);
    expect(mig).not.toMatch(/TO anon/);
  });
});
