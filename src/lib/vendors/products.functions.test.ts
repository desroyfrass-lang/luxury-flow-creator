import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { VENDOR_SETTABLE_DRAFT_STATUSES } from "./products.functions";

const fnSrc = readFileSync("src/lib/vendors/products.functions.ts", "utf8");
const migration = readFileSync("drizzle/migrations/0019_universal_vendor_phase_a.sql", "utf8");

describe("Universal Vendor Phase A rules", () => {
  it("vendors can never set approved, rejected or published themselves", () => {
    expect(VENDOR_SETTABLE_DRAFT_STATUSES).not.toContain("approved");
    expect(VENDOR_SETTABLE_DRAFT_STATUSES).not.toContain("rejected");
    expect(fnSrc).not.toMatch(/publication_status:\s*"published"/);
  });

  it("source references are unique per source type", () => {
    expect(migration).toContain("UNIQUE (source_type, source_ref)");
  });

  it("Founder decisions write the audit ledger in the same database function", () => {
    expect(migration).toMatch(/founder_decide_product[\s\S]*INSERT INTO public\.founder_audit_ledger/);
    expect(migration).toMatch(/founder_set_vendor_verification[\s\S]*INSERT INTO public\.founder_audit_ledger/);
  });

  it("a product needs a verified vendor before Founder review", () => {
    expect(migration).toContain("Vendor must be verified before Founder review");
  });

  it("publication cannot change in Phase A", () => {
    expect(migration).toContain("Publication status cannot be changed in this phase");
  });

  it("Phase A never touches the CJ queue, Shopify or media", () => {
    expect(fnSrc).not.toMatch(/cj_import_queue|shopify|generateImage|imagegen/i);
    expect(migration).not.toMatch(/cj_import_queue/);
  });
});
