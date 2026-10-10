import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fashionBriefSaveSchema, fashionBriefIdsSchema, FASHION_BRIEF_MAX } from "./fashion-brief";

const P = "11111111-1111-4111-8111-111111111111";
const V = "22222222-2222-4222-8222-222222222222";
const sql = readFileSync("drizzle/migrations/0028_fashion_design_briefs.sql", "utf8");
const fns = readFileSync("src/lib/studios/fashion-brief.functions.ts", "utf8");

describe("R2 fashion design brief", () => {
  it("rejects invalid IDs and oversize text; trims", () => {
    expect(() => fashionBriefIdsSchema.parse({ productId: "x", variantId: V })).toThrow();
    expect(() => fashionBriefSaveSchema.parse({ productId: P, variantId: V, concept: "a".repeat(FASHION_BRIEF_MAX + 1), stylingDirection: "", notes: "" })).toThrow();
    expect(fashionBriefSaveSchema.parse({ productId: P, variantId: V, concept: " soft ", stylingDirection: "", notes: "" }).concept).toBe("soft");
  });
  it("server re-verifies Founder/owner and variant match before every read and save", () => {
    expect(fns.match(/await verify\(context/g)?.length).toBe(2);
    expect(fns).toContain("buildProductHandoff");
    expect(fns).toContain("requireSupabaseAuth");
    expect(fns).not.toContain("client.server");
    expect(fns).not.toMatch(/canonical_products"\)\.(update|insert|upsert|delete)|canonical_product_variants"\)\.(update|insert|upsert|delete)/);
  });
  it("database enforces isolation, variant match, open-draft only and immutable keys", () => {
    expect(sql).toContain("ENABLE ROW LEVEL SECURITY");
    expect(sql).toContain("v.owner_id = auth.uid()");
    expect(sql).toContain("Variant does not belong to this product");
    expect(sql).toContain("publication_status = 'unpublished'");
    expect(sql).toContain("NEW.product_id := OLD.product_id");
    expect(sql).not.toMatch(/TO anon/);
    expect(sql).not.toMatch(/GRANT[^;]*DELETE[^;]*authenticated/);
  });
  it("Fashion Studio shows the brief only after a verified handoff, without generation", () => {
    const route = readFileSync("src/routes/_authenticated/studios.fashion.tsx", "utf8");
    expect(route).toContain("handoff.data && productId && variantId ? <FashionBriefPanel");
    const panel = readFileSync("src/components/studios/fashion-brief-panel.tsx", "utf8");
    expect(panel).toContain("Reload saved brief");
    expect(panel).not.toMatch(/generate|images\/generations|tryon/i);
  });
});
