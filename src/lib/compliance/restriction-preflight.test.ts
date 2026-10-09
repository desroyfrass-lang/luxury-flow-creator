import { describe, expect, it } from "vitest";
import {
  blockedMessage,
  evaluateCart,
  isCartId,
  resolveEnforcementMode,
  rowToRule,
  sanitizeDestination,
  type RestrictionRuleRow,
  type ServerCartLine,
} from "./restriction-preflight";

const now = new Date("2026-10-09T00:00:00Z");
const line: ServerCartLine = { variantId: "gid://shopify/ProductVariant/1", productId: "gid://shopify/Product/9", title: "Blouse — S" };
const row = (o: Partial<RestrictionRuleRow>): RestrictionRuleRow => ({
  id: "r1", target_level: "listing", target_ref: line.productId, country: "JM", subdivision: null,
  effect: "allow", reason: "verified_permitted", applies_to: "both", min_age: null,
  evidence_source: "Test", evidence_reference: "doc", verified_at: "2026-09-01", expires_at: null,
  approval: "approved", approved_by: "founder", approved_at: "2026-09-02", ...o,
});
const JM = { country: "JM" };
const run = (rows: RestrictionRuleRow[] | null, o: Partial<Parameters<typeof evaluateCart>[0]> = {}) =>
  evaluateCart({ mode: "enforce", destination: JM, lines: [line], rules: rows ? rows.map(rowToRule) : null, now, ...o });

describe("restriction preflight (R2)", () => {
  it("staged rollout: production off by default, preview shadow by default", () => {
    expect(resolveEnforcementMode("frasskicks.com", {})).toBe("off");
    expect(resolveEnforcementMode("luxury-flow-creator.lovable.app", { preview: "enforce" })).toBe("off");
    expect(resolveEnforcementMode("frasskicks.com", { production: "enforce" })).toBe("enforce");
    expect(resolveEnforcementMode("id-preview--x.lovable.app", {})).toBe("shadow");
    expect(resolveEnforcementMode("localhost:8080", { preview: "enforce" })).toBe("enforce");
    expect(resolveEnforcementMode("frasskicks.com", { production: "bogus" })).toBe("off");
  });

  it("no rules → blocked in enforce mode (fail closed)", () => {
    const r = run([]);
    expect(r.blocked).toBe(true);
    expect(r.allowCheckout).toBe(false);
    expect(r.items[0]!.decision).toBe("REVIEW_REQUIRED");
  });

  it("shadow mode evaluates but never blocks", () => {
    const r = run([], { mode: "shadow" });
    expect(r.blocked).toBe(true);
    expect(r.allowCheckout).toBe(true);
  });

  it("verified allow → checkout allowed", () => {
    expect(run([row({})]).allowCheckout).toBe(true);
  });

  it("pending (unapproved) rule from storage never allows", () => {
    expect(run([row({ approval: "pending" })]).allowCheckout).toBe(false);
  });

  it("destination switch re-evaluates: allowed in JM, review in US", () => {
    expect(run([row({})]).allowCheckout).toBe(true);
    expect(run([row({})], { destination: { country: "US" } }).allowCheckout).toBe(false);
  });

  it("legal ban stored on variant restricts", () => {
    const r = run([row({}), row({ id: "ban", target_level: "variant", target_ref: line.variantId, effect: "prohibit", reason: "legal_prohibition" })]);
    expect(r.items[0]!.decision).toBe("RESTRICTED");
    expect(blockedMessage(r)).toContain("can't be delivered");
  });

  it("age-gated items need review because client age is never trusted", () => {
    const r = run([row({}), row({ id: "age", effect: "prohibit", reason: "age_gated", min_age: 18 })]);
    expect(r.items[0]!.reasons).toContain("age_verification_required");
    expect(r.allowCheckout).toBe(false);
  });

  it("invalid / missing destinations are rejected", () => {
    expect(sanitizeDestination({ country: "Jamaica" })).toBeNull();
    expect(sanitizeDestination({})).toBeNull();
    expect(sanitizeDestination({ country: "us", subdivision: "CA-ON" })).toBeNull();
    expect(sanitizeDestination({ country: "us", subdivision: "us-ca" })).toEqual({ country: "US", subdivision: "US-CA" });
    expect(run([row({})], { destination: null }).reasons).toEqual(["invalid_destination"]);
  });

  it("cart manipulation: only server cart lines count; bad cart ids rejected; missing cart fails closed", () => {
    expect(isCartId("gid://shopify/Cart/abc123?key=xyz")).toBe(true);
    expect(isCartId("javascript:alert(1)")).toBe(false);
    expect(isCartId({ id: 1 })).toBe(false);
    expect(run([row({})], { lines: null }).reasons).toEqual(["cart_unavailable"]);
    expect(run([row({})], { lines: [] }).reasons).toEqual(["empty_cart"]);
  });

  it("rule storage failure fails closed", () => {
    const r = run(null);
    expect(r.reasons).toEqual(["rules_unavailable"]);
    expect(r.allowCheckout).toBe(false);
  });

  it("one disallowed item blocks the whole checkout", () => {
    const other: ServerCartLine = { variantId: "gid://shopify/ProductVariant/2", productId: "gid://shopify/Product/8", title: "Other" };
    const r = run([row({})], { lines: [line, other] });
    expect(r.items.map((i) => i.decision)).toEqual(["ALLOWED", "REVIEW_REQUIRED"]);
    expect(r.allowCheckout).toBe(false);
  });
});
