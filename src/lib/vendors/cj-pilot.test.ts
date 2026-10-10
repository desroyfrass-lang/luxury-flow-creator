import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { PILOT_CATEGORY, PILOT_CJ_PID, isPilotCategoryAllowed, cleanSuggestions, isInMyProducts, mapCjDetail } from "./cj-pilot";
import { validateClassification } from "@/lib/taxonomy/registry";

const fnSrc = readFileSync("src/lib/vendors/cj-pilot.functions.ts", "utf8");
const migration = readFileSync("drizzle/migrations/0026_product_pilot_classification_media_variants.sql", "utf8");

describe("Pilot P1 data truthfulness", () => {
  it("pilot category is a real, active category in the registry", () => {
    expect(validateClassification(PILOT_CATEGORY)).toEqual([]);
  });
  it("pilot accepts Women's Drip categories the Founder picks and refuses others", () => {
    expect(isPilotCategoryAllowed("drip", "drip/womens-work-drip-work-blouses")).toBe(true);
    expect(isPilotCategoryAllowed("drip", "drip/womens-vacay-drip-vacation-fits")).toBe(true);
    expect(isPilotCategoryAllowed("drip", "drip/mens-work-drip-shirts")).toBe(false);
    expect(isPilotCategoryAllowed("kids", "drip/womens-work-drip-work-blouses")).toBe(false);
  });
  it("ownership check matches only the pilot product", () => {
    expect(isInMyProducts([{ productId: PILOT_CJ_PID }])).toBe(true);
    expect(isInMyProducts([{ productId: "123", sku: "CJX" }])).toBe(false);
  });
  it("refuses a CJ response for a different product", () => {
    expect(() => mapCjDetail({ pid: "999" })).toThrow();
  });
  it("keeps unknowns null and drops non-https photos", () => {
    const d = mapCjDetail({ pid: PILOT_CJ_PID, productNameEn: "X", sellPrice: "6.97", productImageSet: ["https://a/1.jpg", "http://b/2.jpg"], variants: [] });
    expect(d.images).toEqual(["https://a/1.jpg"]);
    expect(d.stock).toBeNull();
    expect(d.leadTimeDays).toBeNull();
    expect(d.supplierCost).toBe(6.97);
  });
});

describe("Frassy naming", () => {
  it("keeps one name per style, distinct, and never the supplier name", () => {
    const out = cleanSuggestions([
      { style: "simple_elegant", name: "Sky Shell", why: "a" },
      { style: "playful", name: "sky shell", why: "dup" },
      { style: "playful", name: "Breezy Boss", why: "b" },
      { style: "caribbean_frass", name: "Original Name", why: "c" },
    ], "Original Name");
    expect(out.map((s) => s.name)).toEqual(["Sky Shell", "Breezy Boss"]);
  });
});

describe("Pilot P1 safety", () => {
  it("draft needs both Founder confirmations and is pinned to the pilot category", () => {
    expect(fnSrc).toContain("confirmName: z.literal(true)");
    expect(fnSrc).toContain("confirmCategory: z.literal(true)");
    expect(fnSrc).toContain("isPilotCategoryAllowed(data.primaryStore, data.categoryKey)");
  });
  it("re-reads CJ on the server and checks My Products before any draft", () => {
    expect(fnSrc).toContain("/product/myProduct/query");
    expect(fnSrc.indexOf("readPilotFromCj()", fnSrc.indexOf("createPilotDraft"))).toBeGreaterThan(0);
  });
  it("never publishes, writes the CJ queue, verifies vendors or uses full database rights", () => {
    expect(fnSrc).not.toMatch(/cj_import_queue|supabaseAdmin|publication_status:\s*"published"|founder_set_vendor_verification|productCreate/);
    expect(fnSrc).not.toContain('"/product/list"');
  });
  it("new photo/variant tables are owner-only and created atomically", () => {
    expect(migration).toContain("ENABLE ROW LEVEL SECURITY");
    expect(migration).toMatch(/create_classified_product_draft[\s\S]*SECURITY INVOKER/);
    expect(migration).not.toMatch(/TO anon/);
  });
});
