import { describe, expect, it } from "vitest";
import { evaluateRestrictions, isVerified, ruleShapeErrors, type RestrictionRule } from "./restriction-policy";
import { inspectShipment } from "./trade-intelligence";

const now = new Date("2026-10-09T00:00:00Z");
const base = {
  approval: "approved" as const,
  approvedBy: "founder-1",
  evidence: { source: "Test source", reference: "doc-1" },
  verifiedAt: "2026-09-01",
};
const rule = (r: Partial<RestrictionRule> & Pick<RestrictionRule, "id" | "target" | "effect" | "reason">): RestrictionRule =>
  ({ country: "JM", ...base, ...r }) as RestrictionRule;

const subj = { kind: "product" as const, listingId: "p1", offerId: "o1", variantId: "v1", vendorId: "vend1", categoryKey: "drip/mens-work-drip-dress-shirts" };
const JM = { country: "JM" };
const ev = (rules: RestrictionRule[], s = subj, d: { country: string; subdivision?: string } = JM, ctx = {}) =>
  evaluateRestrictions(s, d, rules, { now, ...ctx });
const allowListing = rule({ id: "a", target: { level: "listing", id: "p1" }, effect: "allow", reason: "needs_review" });
const allow = { ...allowListing, reason: "legal_prohibition" as const }; // verified allow

describe("restriction policy (R1)", () => {
  it("no rules → REVIEW_REQUIRED, never ALLOWED", () => {
    const r = ev([]);
    expect(r.decision).toBe("REVIEW_REQUIRED");
    expect(r.reasons).toContain("no_verified_rule");
  });

  it("verified allow → ALLOWED", () => {
    expect(ev([allow]).decision).toBe("ALLOWED");
  });

  it("missing evidence, unapproved, or expired rules are not verified", () => {
    expect(isVerified({ ...allow, evidence: undefined }, now)).toBe(false);
    expect(isVerified({ ...allow, approval: "pending" }, now)).toBe(false);
    expect(isVerified({ ...allow, expiresAt: "2026-01-01" }, now)).toBe(false);
    expect(isVerified({ ...allow, verifiedAt: undefined }, now)).toBe(false);
    expect(ev([{ ...allow, evidence: undefined }]).decision).toBe("REVIEW_REQUIRED");
    expect(ev([{ ...allow, expiresAt: "2026-01-01" }]).decision).toBe("REVIEW_REQUIRED");
  });

  it("unverified prohibition blocks ALLOWED but does not RESTRICT", () => {
    const p = rule({ id: "p", target: { level: "category", key: subj.categoryKey }, effect: "prohibit", reason: "legal_prohibition", approval: "pending" });
    const r = ev([allow, p]);
    expect(r.decision).toBe("REVIEW_REQUIRED");
    expect(r.reasons).toContain("unverified_rule");
  });

  it("verified legal prohibition beats a more specific allow", () => {
    const law = rule({ id: "law", target: { level: "category", key: subj.categoryKey }, effect: "prohibit", reason: "legal_prohibition" });
    const vAllow = { ...allow, id: "va", target: { level: "variant" as const, id: "v1" } };
    const r = ev([law, vAllow]);
    expect(r.decision).toBe("RESTRICTED");
    expect(r.appliedRuleIds).toEqual(["law"]);
  });

  it("vendor shipping unavailability is distinct from a legal ban", () => {
    const ship = rule({ id: "s", target: { level: "offer", id: "o1" }, effect: "prohibit", reason: "shipping_unavailable" });
    const r = ev([allow, ship]);
    expect(r.decision).toBe("RESTRICTED");
    expect(r.reasons).toEqual(["shipping_unavailable"]);
    // A different offer of the same listing is unaffected.
    expect(ev([allow, ship], { ...subj, offerId: "o2" }).decision).toBe("ALLOWED");
  });

  it("subdivision rules apply only in that subdivision", () => {
    const usAllow = { ...allow, country: "US" };
    const caBan = rule({ id: "ca", country: "US", subdivision: "US-CA", target: { level: "listing", id: "p1" }, effect: "prohibit", reason: "legal_prohibition" });
    expect(ev([usAllow, caBan], subj, { country: "US", subdivision: "US-CA" }).decision).toBe("RESTRICTED");
    expect(ev([usAllow, caBan], subj, { country: "US", subdivision: "US-NY" }).decision).toBe("ALLOWED");
  });

  it("rules for one country never affect another", () => {
    const law = rule({ id: "law", target: { level: "listing", id: "p1" }, effect: "prohibit", reason: "legal_prohibition", country: "IN" });
    expect(ev([allow, law]).decision).toBe("ALLOWED");
  });

  it("variant scope only affects that variant", () => {
    const vBan = rule({ id: "vb", target: { level: "variant", id: "v1" }, effect: "prohibit", reason: "shipping_unavailable" });
    expect(ev([allow, vBan]).decision).toBe("RESTRICTED");
    expect(ev([allow, vBan], { ...subj, variantId: "v2" }).decision).toBe("ALLOWED");
  });

  it("conflicting verified rules at the same specificity → REVIEW_REQUIRED", () => {
    const rev = rule({ id: "r", target: { level: "listing", id: "p1" }, effect: "prohibit", reason: "needs_review" });
    expect(ev([allow, rev]).decision).toBe("REVIEW_REQUIRED");
  });

  it("service applicability: product-only rules do not apply to services", () => {
    const prodLaw = rule({ id: "pl", target: { level: "listing", id: "p1" }, effect: "prohibit", reason: "legal_prohibition", appliesTo: "product" });
    const svc = { ...subj, kind: "service" as const, categoryKey: undefined };
    expect(ev([allow, prodLaw], svc).decision).toBe("ALLOWED");
    expect(ev([allow, prodLaw]).decision).toBe("RESTRICTED");
  });

  it("age gates: unknown age → review, under age → restricted, of age → allowed", () => {
    const age = rule({ id: "ag", target: { level: "listing", id: "p1" }, effect: "prohibit", reason: "age_gated", minAge: 18 });
    expect(ev([allow, age]).decision).toBe("REVIEW_REQUIRED");
    expect(ev([allow, age], subj, JM, { buyerAge: 16 }).decision).toBe("RESTRICTED");
    expect(ev([allow, age], subj, JM, { buyerAge: 21 }).decision).toBe("ALLOWED");
    expect(ruleShapeErrors({ ...age, minAge: undefined })).toContain("age_rule_needs_min_age");
  });

  it("taxonomy safety gate forces review until cleared", () => {
    const key = "marketplace/baby-kids/swimming-water-play";
    const a = { ...allow, target: { level: "category" as const, key } };
    const s = { ...subj, categoryKey: key };
    expect(ev([a], s).reasons).toContain("safety_gate:infant-water-safety");
    expect(ev([a], s, JM, { safetyGateCleared: "infant-water-safety" }).decision).toBe("ALLOWED");
  });

  it("advisory keyword flags never change the decision", () => {
    const r = ev([allow], { ...subj, goodsDescription: "Lithium battery power bank" });
    expect(r.decision).toBe("ALLOWED");
    expect(r.advisories.length).toBeGreaterThan(0);
  });

  it("existing trade advice behaviour is preserved", () => {
    const flags = inspectShipment({ goods: "battery" });
    expect(flags.some((f) => f.id === "destination" && f.severity === "blocking")).toBe(true);
    expect(flags.some((f) => f.id.startsWith("regulated:"))).toBe(true);
  });

  it("approved rules need Founder provenance and valid country codes", () => {
    expect(ruleShapeErrors({ ...allow, approvedBy: undefined })).toContain("approval_missing_provenance");
    expect(ruleShapeErrors({ ...allow, country: "Jamaica" })).toContain("invalid_country");
    expect(ruleShapeErrors({ ...allow, country: "US", subdivision: "CA-ON" })).toContain("invalid_subdivision");
  });
});
