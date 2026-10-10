import { describe, expect, it } from "vitest";
import { TAXONOMY, PRIMARY_STORES } from "./registry";
import { TAXONOMY_PATHS, classificationBreadcrumb } from "./hierarchy";
import { isPilotCategoryAllowed } from "@/lib/vendors/cj-pilot";

describe("Pilot category organization", () => {
  it("covers all nine departments without adding classification keys", () => {
    expect(new Set(TAXONOMY_PATHS.map((p) => p.node.store))).toEqual(new Set(PRIMARY_STORES.map((s) => s.id)));
    expect(TAXONOMY_PATHS.map((p) => p.node.key)).toEqual(TAXONOMY.map((n) => n.key));
  });
  it("preserves the Vacation Fits parent hierarchy", () => {
    const entry = TAXONOMY_PATHS.find((p) => p.node.key === "drip/womens-vacay-drip-vacation-fits");
    expect(entry?.department).toBe("Frass Drip");
    expect(entry?.audience).toBe("Women");
    expect(entry?.subcategory).toBe("Vacation Fits");
  });
  it("preserves Work Blouses hierarchy without changing its key", () => {
    expect(classificationBreadcrumb("drip/womens-work-drip-work-blouses")).toContain("Frass Drip → Women");
    expect(TAXONOMY_PATHS.find((p) => p.node.key === "drip/womens-work-drip-work-blouses")?.subcategory).toBe("Work Blouses");
  });
  it("unsupported departments never become pilot-saveable", () => {
    for (const p of TAXONOMY_PATHS.filter((p) => p.node.store !== "drip" || p.audience !== "Women")) {
      expect(isPilotCategoryAllowed(p.node.store, p.node.key)).toBe(false);
    }
  });
});