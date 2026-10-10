import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const panel = readFileSync("src/components/vendors/cj-pilot-panel.tsx", "utf8");
const picker = readFileSync("src/components/vendors/supplier-variant-picker.tsx", "utf8");

describe("Vendor Brands handoff restoration", () => {
  it("three creative cards keep distinct intents and link only with a verified handoff", () => {
    for (const engine of ['engine: "image/video"', 'engine: "capsule or lookbook"', 'engine: "try-on"']) expect(panel).toContain(engine);
    expect(panel).toContain('search={{ productId: handoff.productId, variantId: handoff.variant.id }}');
    expect(panel).toContain("{handoff ? (");
    expect(panel).toContain("Choose a colour and size first");
    expect(panel).toContain("engine is connected)");
    expect(panel).not.toMatch(/generateTryOn|images\/generations/);
  });
  it("untouched saved draft offers Done, never a forced rename", () => {
    expect(panel).not.toContain('"change the name or category"');
    expect(panel).toContain("Already saved — nothing to change.");
    expect(panel).toMatch(/unchanged \? \([\s\S]*Done[\s\S]*Save changes/);
  });
  it("saved-card picker preselects a saved variant and shows handoff above the large preview", () => {
    expect(picker).toContain("productId ? variants.find((v) => v.id)?.ref ?? null : null");
    expect(picker.indexOf('aria-label="Product handoff"')).toBeLessThan(picker.indexOf('aria-label="Selected variant preview"'));
    expect(panel).toContain("onHandoff={setHandoff}");
  });
  it("refetched variants re-sync the saved card after first save", () => {
    expect(panel).toContain("initialDraft.variants?.length]");
  });
  it("CJ preview picker stays unlinked and labelled unsaved", () => {
    expect(panel).toContain("<SupplierVariantPicker variants={d.variants} />");
    expect(panel).toContain("not yet a saved product");
  });
});
