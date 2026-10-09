// FRASS Global Restrictions Engine — Phase R1: shared policy foundation.
//
// Pure, deterministic logic only. Nothing here is wired to browse, cart,
// checkout, payment, Shopify or CJ yet (that is R2+).
//
// Principles:
// - Decisions are ALLOWED, RESTRICTED or REVIEW_REQUIRED. Unknown or
//   unverified rules NEVER produce ALLOWED — they produce REVIEW_REQUIRED.
// - A rule only counts as verified when it is Founder-approved, carries
//   evidence (source + reference), has a verified timestamp and has not
//   expired. No country bans are shipped with this module.
// - Advisory keyword flags from trade-intelligence (e.g. "battery") are
//   reported separately and never change a decision; they are not laws.
// - Taxonomy safety gates (e.g. infant water safety) force REVIEW_REQUIRED
//   until cleared.

import { inspectShipment, type TradeFlag } from "./trade-intelligence";
import { getTaxonomyNode } from "@/lib/taxonomy/registry";

export type RestrictionDecision = "ALLOWED" | "RESTRICTED" | "REVIEW_REQUIRED";

export type RestrictionReason =
  | "legal_prohibition" // verified law of the destination
  | "shipping_unavailable" // this vendor/offer cannot deliver there
  | "age_gated" // buyer must meet a minimum age
  | "needs_review" // flagged for human review
  | "verified_permitted"; // evidence that the item may be sold/shipped there

/** What a rule is attached to. More specific targets win (see SPECIFICITY). */
export type RuleTarget =
  | { level: "variant"; id: string }
  | { level: "offer"; id: string }
  | { level: "listing"; id: string } // canonical product or service listing
  | { level: "category"; key: string } // taxonomy registry key
  | { level: "vendor"; id: string };

export const SPECIFICITY: Record<RuleTarget["level"], number> = {
  variant: 5,
  offer: 4,
  listing: 3,
  category: 2,
  vendor: 1,
};

export interface RuleEvidence {
  source: string; // e.g. "Jamaica Customs Act s.40", "CJ shipping matrix"
  reference: string; // citation, document id or URL
}

export interface RestrictionRule {
  id: string;
  target: RuleTarget;
  /** ISO 3166-1 alpha-2, upper case. */
  country: string;
  /** Optional ISO 3166-2 subdivision, e.g. "US-CA". Narrows the rule. */
  subdivision?: string;
  effect: "allow" | "prohibit";
  reason: RestrictionReason;
  /** Which listing kinds this rule applies to; default both. */
  appliesTo?: "product" | "service" | "both";
  minAge?: number;
  evidence?: RuleEvidence;
  verifiedAt?: string; // ISO date
  expiresAt?: string; // ISO date
  approval: "approved" | "pending" | "rejected";
  approvedBy?: string; // Founder user id (audit provenance)
  approvedAt?: string;
}

export interface RestrictionSubject {
  kind: "product" | "service";
  listingId?: string;
  offerId?: string;
  variantId?: string;
  vendorId?: string;
  categoryKey?: string;
  /** Free-text description used only for advisory keyword flags. */
  goodsDescription?: string;
}

export interface Destination {
  country: string;
  subdivision?: string;
}

export interface EvaluationContext {
  now?: Date;
  buyerAge?: number;
  safetyGateCleared?: string;
}

export interface RestrictionResult {
  decision: RestrictionDecision;
  reasons: string[];
  /** Verified rules that determined the outcome. */
  appliedRuleIds: string[];
  /** Advisory only — never affects `decision`. */
  advisories: TradeFlag[];
}

const ISO2 = /^[A-Z]{2}$/;
const ISO3166_2 = /^[A-Z]{2}-[A-Z0-9]{1,3}$/;

export function ruleShapeErrors(r: RestrictionRule): string[] {
  const e: string[] = [];
  if (!ISO2.test(r.country)) e.push("invalid_country");
  if (r.subdivision && (!ISO3166_2.test(r.subdivision) || !r.subdivision.startsWith(`${r.country}-`)))
    e.push("invalid_subdivision");
  if (r.reason === "age_gated" && !(r.minAge && r.minAge > 0)) e.push("age_rule_needs_min_age");
  if (r.approval === "approved" && !r.approvedBy) e.push("approval_missing_provenance");
  return e;
}

/** Verified = approved + evidence + verified date + not expired + well-formed. */
export function isVerified(r: RestrictionRule, now: Date): boolean {
  if (r.approval !== "approved" || !r.approvedBy) return false;
  if (!r.evidence?.source || !r.evidence?.reference) return false;
  if (!r.verifiedAt || Number.isNaN(Date.parse(r.verifiedAt))) return false;
  if (r.expiresAt && Date.parse(r.expiresAt) <= now.getTime()) return false;
  return ruleShapeErrors(r).length === 0;
}

function targetMatches(t: RuleTarget, s: RestrictionSubject): boolean {
  switch (t.level) {
    case "variant": return t.id === s.variantId;
    case "offer": return t.id === s.offerId;
    case "listing": return t.id === s.listingId;
    case "category": return t.key === s.categoryKey;
    case "vendor": return t.id === s.vendorId;
  }
}

function applies(r: RestrictionRule, s: RestrictionSubject, d: Destination): boolean {
  if (r.approval === "rejected") return false;
  if (r.country !== d.country) return false;
  if (r.subdivision && r.subdivision !== d.subdivision) return false;
  const kinds = r.appliesTo ?? "both";
  if (kinds !== "both" && kinds !== s.kind) return false;
  return targetMatches(r.target, s);
}

/** Higher = more specific: target level first, then subdivision over country. */
const rank = (r: RestrictionRule) => SPECIFICITY[r.target.level] * 10 + (r.subdivision ? 1 : 0);

function advisoriesFor(s: RestrictionSubject, d: Destination): TradeFlag[] {
  if (!s.goodsDescription) return [];
  return inspectShipment({
    goods: s.goodsDescription,
    destination: d.country,
    hasDeclaration: true,
    hasPackingList: true,
  }).filter((f) => f.id.startsWith("regulated:"));
}

export function evaluateRestrictions(
  subject: RestrictionSubject,
  destination: Destination,
  rules: readonly RestrictionRule[],
  ctx: EvaluationContext = {},
): RestrictionResult {
  const now = ctx.now ?? new Date();
  const advisories = advisoriesFor(subject, destination);
  const reasons: string[] = [];
  const done = (decision: RestrictionDecision, applied: RestrictionRule[] = []): RestrictionResult => ({
    decision, reasons, appliedRuleIds: applied.map((r) => r.id), advisories,
  });

  if (!ISO2.test(destination.country)) {
    reasons.push("invalid_destination");
    return done("REVIEW_REQUIRED");
  }

  const relevant = rules.filter((r) => applies(r, subject, destination));
  const verified = relevant.filter((r) => isVerified(r, now));
  const unverified = relevant.filter((r) => !isVerified(r, now));

  // 1. Verified legal prohibitions win at every level — a more specific
  //    "allow" can never override a law.
  const legal = verified.filter((r) => r.effect === "prohibit" && r.reason === "legal_prohibition");
  if (legal.length) {
    reasons.push("legal_prohibition");
    return done("RESTRICTED", legal);
  }

  // 2. Verified shipping unavailability (vendor/offer cannot deliver).
  const shipping = verified.filter((r) => r.effect === "prohibit" && r.reason === "shipping_unavailable");
  if (shipping.length) {
    reasons.push("shipping_unavailable");
    return done("RESTRICTED", shipping);
  }

  // 3. Age gates.
  const ages = verified.filter((r) => r.reason === "age_gated");
  if (ages.length) {
    const minAge = Math.max(...ages.map((r) => r.minAge ?? 0));
    if (ctx.buyerAge === undefined) {
      reasons.push("age_verification_required");
      return done("REVIEW_REQUIRED", ages);
    }
    if (ctx.buyerAge < minAge) {
      reasons.push("age_gated");
      return done("RESTRICTED", ages);
    }
  }

  // 4. Taxonomy safety gate.
  const gate = subject.categoryKey ? getTaxonomyNode(subject.categoryKey)?.safetyGate : undefined;
  if (gate && ctx.safetyGateCleared !== gate) {
    reasons.push(`safety_gate:${gate}`);
    return done("REVIEW_REQUIRED");
  }

  // 5. Anything flagged for review, or any unverified prohibition, blocks ALLOWED.
  const review = verified.filter((r) => r.reason === "needs_review");
  if (review.length) reasons.push("needs_review");
  if (unverified.some((r) => r.effect === "prohibit")) reasons.push("unverified_rule");
  if (reasons.length) return done("REVIEW_REQUIRED", review);

  // 6. Allow requires a verified allow at the most specific level present;
  //    an equally specific verified prohibit of another kind is a conflict.
  const allows = verified.filter((r) => r.effect === "allow");
  if (!allows.length) {
    reasons.push(relevant.length ? "unverified_rule" : "no_verified_rule");
    return done("REVIEW_REQUIRED");
  }
  const top = Math.max(...verified.map(rank));
  const topRules = verified.filter((r) => rank(r) === top);
  if (topRules.some((r) => r.effect === "prohibit")) {
    reasons.push("conflicting_rules");
    return done("REVIEW_REQUIRED", topRules);
  }
  return done("ALLOWED", topRules.filter((r) => r.effect === "allow"));
}
