import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { buildProductHandoff, type HandoffProductRow, type HandoffVariantRow } from "./product-handoff";

const product: HandoffProductRow = { id: "p1", title: "Saved Name", category_key: "drip/womens-vacay-drip-vacation-fits", draft_status: "draft", publication_status: "unpublished", vendor_id: "v1", vendor_owner_id: "owner" };
const variant: HandoffVariantRow = { id: "var1", product_id: "p1", source_variant_ref: "cj-1", sku: "SKU-1", option_label: "Sky Blue-S", image_url: "https://cf.cjdropshipping.com/a.jpg" };
const owner = { userId: "owner", isFounderStaff: false };

describe("P2-0 product handoff", () => {
  it("builds the contract from saved rows", () => {
    const h = buildProductHandoff(owner, product, variant);
    expect(h).toMatchObject({ productId: "p1", name: "Saved Name", variant: { colour: "Sky Blue", size: "S", sku: "SKU-1" }, photo: { url: variant.image_url } });
    expect(h.categoryPath).toContain("Vacation Fits");
  });
  it("allows Founder staff who are not the owner", () => {
    expect(buildProductHandoff({ userId: "x", isFounderStaff: true }, product, variant).productId).toBe("p1");
  });
  it("rejects strangers", () => {
    expect(() => buildProductHandoff({ userId: "x", isFounderStaff: false }, product, variant)).toThrow(/Founder or the brand owner/);
  });
  it("rejects a variant from another product", () => {
    expect(() => buildProductHandoff(owner, product, { ...variant, product_id: "p2" })).toThrow(/does not belong/);
  });
  it("rejects missing, published and rejected products", () => {
    expect(() => buildProductHandoff(owner, null, variant)).toThrow(/not found/);
    expect(() => buildProductHandoff(owner, { ...product, publication_status: "published" }, variant)).toThrow(/private drafts/);
    expect(() => buildProductHandoff(owner, { ...product, draft_status: "rejected" }, variant)).toThrow(/Rejected/);
  });
  it("never passes a non-https photo; gives a truthful fallback", () => {
    expect(buildProductHandoff(owner, product, { ...variant, image_url: "javascript:x" }).photo).toEqual({ url: null, reason: "No authentic photo is linked to this variant." });
  });
  it("server function takes only IDs, checks auth, and never writes", () => {
    const src = readFileSync("src/lib/vendors/product-handoff.functions.ts", "utf8");
    expect(src).toContain("requireSupabaseAuth");
    expect(src).toMatch(/productId: z\.string\(\)\.uuid\(\), variantId: z\.string\(\)\.uuid\(\)/);
    expect(src).not.toMatch(/\.(insert|update|upsert|delete)\(/);
  });
});
