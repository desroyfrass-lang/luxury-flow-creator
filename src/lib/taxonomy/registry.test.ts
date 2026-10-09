import { describe, expect, it } from "vitest";
import {
  TAXONOMY,
  PRIMARY_STORES,
  OVERLAYS,
  getTaxonomyNode,
  registryIntegrityErrors,
  validateClassification,
} from "./registry";

const handles = new Set(TAXONOMY.map((n) => n.handle).filter(Boolean));

describe("FRASS taxonomy registry", () => {
  it("has the seven primary stores and four overlays, never mixed", () => {
    expect(PRIMARY_STORES.map((s) => s.id)).toEqual([
      "marketplace", "kicks", "drip", "bare-drip", "kids", "plus", "luxury-house",
    ]);
    expect(OVERLAYS.map((o) => o.id)).toEqual([
      "social-media-virals", "founder-picks", "new-arrivals", "best-sellers",
    ]);
    const p = new Set<string>(PRIMARY_STORES.map((s) => s.id));
    expect(OVERLAYS.some((o) => p.has(o.id))).toBe(false);
  });

  it("has no duplicate keys or handles", () => {
    expect(registryIntegrityErrors()).toEqual([]);
  });

  it("preserves existing storefront handles", () => {
    for (const h of [
      "street-kicks-men", "classic-kicks-women",
      "mens-work-drip-dress-shirts", "frass-drip-90s-street",
      "womens-bare-drip-lingerie-bras", "mens-bare-drip-swimwear-swim-trunks",
      "kids-6-12-boys-school-uniform-shirts", "kids-0-3-girls-kicks-casual",
    ]) expect(handles.has(h)).toBe(true);
  });

  it("kids use School Drip, never Work Drip, across all four age groups", () => {
    const kids = TAXONOMY.filter((n) => n.store === "kids").map((n) => n.handle!);
    expect(kids.some((h) => /-work-/.test(h))).toBe(false);
    for (const age of ["0-3", "3-6", "6-12", "12-plus"])
      expect(kids.some((h) => h.startsWith(`kids-${age}-`) && h.includes("-school-"))).toBe(true);
  });

  it("Plus+ mirrors standard handles with -plus", () => {
    expect(handles.has("mens-work-drip-dress-shirts-plus")).toBe(true);
    expect(handles.has("street-kicks-men-plus")).toBe(true);
    expect(handles.has("womens-bare-drip-swimwear-bikini-sets-plus")).toBe(true);
    const plus = TAXONOMY.filter((n) => n.store === "plus");
    expect(plus.every((n) => n.handle!.endsWith("-plus"))).toBe(true);
  });

  it("rejects an overlay as primary store", () => {
    expect(validateClassification({ primaryStore: "founder-picks", categoryKey: "marketplace/home-living" }))
      .toContain("overlay_cannot_be_primary");
  });

  it("rejects primary store used as overlay and duplicate overlays", () => {
    const e = validateClassification({
      primaryStore: "marketplace", categoryKey: "marketplace/home-living",
      overlays: ["kicks", "new-arrivals", "new-arrivals"],
    });
    expect(e).toContain("primary_store_used_as_overlay");
    expect(e).toContain("duplicate_overlay");
  });

  it("rejects category belonging to a different store", () => {
    expect(validateClassification({ primaryStore: "kids", categoryKey: "drip/mens-work-drip-dress-shirts" }))
      .toContain("category_not_in_primary_store");
  });

  it("keeps Luxury House and Marketplace subcategories pending", () => {
    expect(validateClassification({ primaryStore: "luxury-house", categoryKey: "luxury-house/_categories" }))
      .toContain("category_pending_founder_confirmation");
    expect(getTaxonomyNode("marketplace/_subcategories")?.status).toBe("pending");
  });

  it("infant swim gear sits in Marketplace Baby & Kids behind a safety gate", () => {
    const key = "marketplace/baby-kids/swimming-water-play";
    expect(getTaxonomyNode(key)?.store).toBe("marketplace");
    expect(validateClassification({ primaryStore: "marketplace", categoryKey: key })).toContain("safety_gate_required");
    expect(validateClassification({ primaryStore: "marketplace", categoryKey: key, safetyGateCleared: "infant-water-safety" })).toEqual([]);
  });

  it("accepts a valid fashion classification with overlays", () => {
    expect(validateClassification({
      primaryStore: "drip", categoryKey: "drip/mens-work-drip-dress-shirts",
      overlays: ["founder-picks", "social-media-virals"],
    })).toEqual([]);
  });
});
