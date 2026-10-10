import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { isEditableProductCategory } from "./cj-pilot";

const sql = readFileSync("drizzle/migrations/0027_product_draft_editing_history.sql", "utf8");
const fn = readFileSync("src/lib/vendors/cj-pilot.functions.ts", "utf8");
const upd = fn.slice(fn.indexOf("updatePilotDraft"));

describe("P2a draft editing", () => {
  it("accepts real product categories in any department", () => {
    expect(isEditableProductCategory("drip", "drip/womens-vacay-drip-vacation-fits")).toBe(true);
    expect(isEditableProductCategory("drip", "drip/womens-work-drip-work-blouses")).toBe(true);
  });
  it("refuses invented, mismatched and overlay categories", () => {
    expect(isEditableProductCategory("drip", "drip/womens-invented")).toBe(false);
    expect(isEditableProductCategory("kids", "drip/womens-work-drip-work-blouses")).toBe(false);
    expect(isEditableProductCategory("virals", "drip/womens-work-drip-work-blouses")).toBe(false);
  });
  it("server requires Founder, explicit confirm, and validates category before the database call", () => {
    expect(upd).toContain("requireFounderStaff(context)");
    expect(upd).toContain("confirm: z.literal(true)");
    expect(upd.indexOf("isEditableProductCategory")).toBeLessThan(upd.indexOf("update_classified_product_draft"));
    expect(upd).not.toMatch(/supabaseAdmin|publication_status|supplier_original_name/);
  });
  it("database door checks Founder, ownership and draft-only status", () => {
    expect(sql).toMatch(/update_classified_product_draft[\s\S]*SECURITY INVOKER/);
    expect(sql).toContain("has_role(uid,'admin') OR public.has_role(uid,'super_admin')");
    expect(sql).toContain("owns_vendor(p.vendor_id)");
    expect(sql).toContain("draft_status NOT IN ('draft','prepared') OR p.publication_status <> 'unpublished'");
    expect(sql).toMatch(/FROM PUBLIC, anon;\s*GRANT EXECUTE ON FUNCTION public\.update_classified_product_draft/);
  });
  it("CJ provenance is immutable", () => {
    expect(sql).toContain("original supplier name cannot be changed");
    expect(sql).toContain("vendor of a product cannot be changed");
    for (const t of ["canonical_product_media", "canonical_product_variants", "product_sources"])
      expect(sql).toMatch(new RegExp(`BEFORE UPDATE OR DELETE ON public\\.${t}`));
  });
  it("history is append-only, private and written in the same transaction", () => {
    expect(sql).toContain("GRANT SELECT ON public.canonical_product_history TO authenticated;");
    expect(sql).not.toMatch(/GRANT (INSERT|UPDATE|DELETE)[^;]*canonical_product_history TO authenticated/);
    expect(sql).not.toMatch(/canonical_product_history[^;]*TO anon/);
    expect(sql).toMatch(/AFTER UPDATE ON public\.canonical_products/);
    expect(sql).toContain("auth.uid(), OLD.title, NEW.title");
  });
});
