// FRASS Global Restrictions Engine — Phase R2: cart/checkout preflight (pure).
//
// The server function (restriction-preflight.functions.ts) loads the cart
// lines from Shopify and the approved rules from the database, then calls
// `evaluateCart`. Nothing here trusts the browser for cart contents, prices,
// buyer age or approval state.
//
// Staged rollout: enforcement is OFF on production hosts unless the Founder
// sets RESTRICTIONS_ENFORCEMENT_PRODUCTION=enforce; preview hosts default to
// "shadow" (evaluate + log, never block) unless set to "enforce".

import { evaluateRestrictions, type Destination, type RestrictionRule, type RestrictionDecision } from "./restriction-policy";

export type EnforcementMode = "off" | "shadow" | "enforce";

export const PRODUCTION_HOSTS = ["frasskicks.com", "www.frasskicks.com", "luxury-flow-creator.lovable.app"];

export function isProductionHost(host: string | null | undefined): boolean {
  const h = (host ?? "").toLowerCase().split(":")[0] ?? "";
  return PRODUCTION_HOSTS.includes(h);
}

function parseMode(v: string | undefined): EnforcementMode | null {
  return v === "off" || v === "shadow" || v === "enforce" ? v : null;
}

/** Production defaults to off; preview defaults to shadow. Invalid values fall back to the default. */
export function resolveEnforcementMode(
  host: string | null | undefined,
  env: { production?: string; preview?: string },
): EnforcementMode {
  return isProductionHost(host) ? (parseMode(env.production) ?? "off") : (parseMode(env.preview) ?? "shadow");
}

export function sanitizeDestination(input: unknown): Destination | null {
  if (!input || typeof input !== "object") return null;
  const o = input as Record<string, unknown>;
  const country = typeof o.country === "string" ? o.country.trim().toUpperCase() : "";
  if (!/^[A-Z]{2}$/.test(country)) return null;
  const sub = typeof o.subdivision === "string" ? o.subdivision.trim().toUpperCase() : undefined;
  if (sub && !(/^[A-Z]{2}-[A-Z0-9]{1,3}$/.test(sub) && sub.startsWith(`${country}-`))) return null;
  return sub ? { country, subdivision: sub } : { country };
}

export function isCartId(v: unknown): v is string {
  return typeof v === "string" && v.length < 300 && /^gid:\/\/shopify\/Cart\/[A-Za-z0-9_\-?=&]+$/.test(v);
}

/** A database row from public.restriction_rules. */
export interface RestrictionRuleRow {
  id: string;
  target_level: string;
  target_ref: string;
  country: string;
  subdivision: string | null;
  effect: string;
  reason: string;
  applies_to: string;
  min_age: number | null;
  evidence_source: string | null;
  evidence_reference: string | null;
  verified_at: string | null;
  expires_at: string | null;
  approval: string;
  approved_by: string | null;
  approved_at: string | null;
}

export function rowToRule(r: RestrictionRuleRow): RestrictionRule {
  const target =
    r.target_level === "category"
      ? { level: "category" as const, key: r.target_ref }
      : { level: r.target_level as "variant" | "offer" | "listing" | "vendor", id: r.target_ref };
  return {
    id: r.id,
    target,
    country: r.country,
    subdivision: r.subdivision ?? undefined,
    effect: r.effect as RestrictionRule["effect"],
    reason: r.reason as RestrictionRule["reason"],
    appliesTo: r.applies_to as RestrictionRule["appliesTo"],
    minAge: r.min_age ?? undefined,
    evidence: r.evidence_source && r.evidence_reference ? { source: r.evidence_source, reference: r.evidence_reference } : undefined,
    verifiedAt: r.verified_at ?? undefined,
    expiresAt: r.expires_at ?? undefined,
    approval: r.approval as RestrictionRule["approval"],
    approvedBy: r.approved_by ?? undefined,
    approvedAt: r.approved_at ?? undefined,
  };
}

/** Cart line as returned by Shopify to the SERVER — never from the browser. */
export interface ServerCartLine {
  variantId: string;
  productId: string;
  title: string;
}

export interface PreflightItem {
  variantId: string;
  title: string;
  decision: RestrictionDecision;
  reasons: string[];
}

export interface PreflightResult {
  mode: EnforcementMode;
  allowCheckout: boolean;
  blocked: boolean;
  reasons: string[];
  items: PreflightItem[];
}

export function evaluateCart(args: {
  mode: EnforcementMode;
  destination: Destination | null;
  lines: ServerCartLine[] | null;
  rules: RestrictionRule[] | null;
  now?: Date;
}): PreflightResult {
  const { mode } = args;
  const finish = (blocked: boolean, reasons: string[], items: PreflightItem[] = []): PreflightResult => ({
    mode, blocked, reasons, items, allowCheckout: mode !== "enforce" || !blocked,
  });
  if (!args.destination) return finish(true, ["invalid_destination"]);
  if (!args.lines) return finish(true, ["cart_unavailable"]);
  if (!args.lines.length) return finish(true, ["empty_cart"]);
  if (!args.rules) return finish(true, ["rules_unavailable"]);

  const items = args.lines.map((l) => {
    // Buyer age is never accepted from the client — age-gated items need review.
    const r = evaluateRestrictions(
      { kind: "product", variantId: l.variantId, listingId: l.productId },
      args.destination!,
      args.rules!,
      { now: args.now },
    );
    return { variantId: l.variantId, title: l.title, decision: r.decision, reasons: r.reasons };
  });
  const blocked = items.some((i) => i.decision !== "ALLOWED");
  return finish(blocked, blocked ? ["items_not_allowed"] : [], items);
}

/** Plain-English message for a blocked checkout. */
export function blockedMessage(r: PreflightResult): string {
  if (r.reasons.includes("invalid_destination")) return "Please choose a valid delivery country before checkout.";
  if (r.reasons.includes("cart_unavailable") || r.reasons.includes("rules_unavailable"))
    return "We couldn't confirm delivery eligibility right now, so checkout is paused. Please try again shortly.";
  if (r.reasons.includes("empty_cart")) return "Your cart is empty.";
  const first = r.items.find((i) => i.decision !== "ALLOWED");
  if (!first) return "Checkout is paused.";
  return first.decision === "RESTRICTED"
    ? `“${first.title}” can't be delivered to your selected country.`
    : `“${first.title}” needs a delivery-eligibility review for your selected country before it can be sold there.`;
}
