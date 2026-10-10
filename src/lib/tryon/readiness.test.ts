import { describe, expect, it } from "vitest";
import { tryOnAdapter, departmentOf } from "./readiness";

describe("try-on readiness adapter (planning only)", () => {
  it("pilot blouse category is full-body and approvable", () => {
    expect(tryOnAdapter("drip/womens-vacay-drip-vacation-fits")).toEqual({ method: "full_body_garment", support: "supported" });
  });
  it("kids are excluded", () => {
    expect(tryOnAdapter("kids/tees").support).toBe("excluded");
  });
  it("shapewear is paused", () => {
    expect(tryOnAdapter("shape/bodysuits").support).toBe("paused");
  });
  it("bridal needs extra review, shoes later", () => {
    expect(tryOnAdapter("bridal/gowns").support).toBe("extra_review");
    expect(tryOnAdapter("kicks/sneakers").support).toBe("later");
  });
  it("department is first category segment", () => {
    expect(departmentOf("drip/womens")).toBe("drip");
    expect(departmentOf(null)).toBe("uncategorised");
  });
});
