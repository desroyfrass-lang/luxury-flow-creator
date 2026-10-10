// Regression inventory for Pilot P1 / P2a — every feature that must never disappear.
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
const panel = readFileSync("src/components/vendors/cj-pilot-panel.tsx", "utf8");
const picker = readFileSync("src/components/vendors/pilot-category-picker.tsx", "utf8");
const page = readFileSync("src/routes/_authenticated/workspace.vendors.tsx", "utf8");
const list = readFileSync("src/lib/vendors/products.functions.ts", "utf8");
const saved = panel.slice(panel.indexOf("function PilotSaved"));

describe("Pilot regression inventory", () => {
  it("1. saved draft loads its real CJ photos, variants and original name from the database", () => {
    expect(list).toMatch(/canonical_product_media\(url, position, source\)/);
    expect(list).toMatch(/canonical_product_variants\(/);
    expect(list).toContain("supplier_original_name");
    expect(page).toContain("canonical_product_media");
  });
  it("2. photos render on the saved card and before saving, with visible failure fallback", () => {
    expect(saved).toContain("<SupplierPhotos urls={draft.media ?? []} />");
    expect(panel).toContain("<SupplierPhotos urls={d.images} />");
    expect(panel).toContain("onError={() => setFailed");
    expect(panel).toContain("did not load");
    expect(panel).toContain("No supplier photos are saved");
  });
  it("3. Frassy's three suggestions exist before saving and in Edit, labelled as suggestions", () => {
    expect(panel.match(/<NameSuggestions /g)?.length).toBe(2);
    expect(saved).toContain("suggestPilotNames");
    expect(panel).toContain("Suggestion · ");
    expect(saved).toContain("your final say");
  });
  it("4. four cascading category selectors remain", () => {
    for (const l of ["Department", "Audience / gender", "Collection", "Subcategory"]) expect(picker).toContain(`aria-label="${l}"`);
    expect(saved).toContain('mode="edit"');
  });
  it("5. Edit / Save / Cancel / confirm remain and call the guarded server door", () => {
    for (const t of ["Edit name and category", "Save changes", "Cancel", "I confirm:", "updatePilotDraft"]) expect(saved).toContain(t);
  });
  it("6. variants, cost and original name are shown read-only", () => {
    expect(saved).toContain("sizes/colours");
    expect(saved).toContain("(permanent)");
    expect(saved).toContain("supplier's original name (private)");
  });
  it("7. honest next-step blockers and manual entry separation stay", () => {
    expect(saved.match(/Not connected yet/g)?.length).toBeGreaterThanOrEqual(1);
    expect(page).toContain("not connected to CJ Pilot P1");
  });
});
