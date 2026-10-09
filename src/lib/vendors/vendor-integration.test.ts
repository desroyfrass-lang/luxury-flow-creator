import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const fnSrc = readFileSync("src/lib/vendors/products.functions.ts", "utf8");
const atomic = readFileSync("drizzle/migrations/0021_vendor_atomic_draft_creation.sql", "utf8");
const page = readFileSync("src/routes/_authenticated/workspace.vendors.tsx", "utf8");

describe("Vendor integration with member identity", () => {
  it("draft creation is one database call (no partial writes)", () => {
    expect(fnSrc).toContain('rpc("create_product_draft"');
    expect(fnSrc).not.toMatch(/from\("canonical_products"\)\s*\.insert/);
    expect(atomic).toContain("SECURITY INVOKER");
  });

  it("vendor identity reuses the existing profile and Frass Card, not a second onboarding", () => {
    expect(fnSrc).toContain('from("profiles")');
    expect(fnSrc).toContain('from("business_cards")');
  });

  it("partner_vendors free-text IDs are never used as vendor authority", () => {
    expect(fnSrc).not.toMatch(/\.from\(["']partner_vendors["']\)|get_active_partner_vendor_ids/);
    expect(page).not.toMatch(/partner_vendors|getMyAllowedVendorIds/);
  });

  it("the workspace never publishes or touches checkout", () => {
    expect(page).not.toMatch(/publication_status|checkout|shopify|card_listings|card_orders/i);
  });
});
