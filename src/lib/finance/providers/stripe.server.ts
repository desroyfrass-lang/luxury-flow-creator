// ─────────────────────────────────────────────────────────────────────────────
// STEP 5 · SLICE 4 (server only) — Stripe signature checking.
//
// Stripe signs every webhook with the endpoint's signing secret using exactly
// the scheme Frass already enforces: `t=<unix>,v1=<hex hmac-sha256 of t.body>`,
// with a freshness window so a captured event cannot be replayed.
//
// Until the Founder connects Stripe and saves STRIPE_WEBHOOK_SECRET, this door
// answers "not configured" and verifies nothing.
// ─────────────────────────────────────────────────────────────────────────────

import { verifySignature } from "../payment-verification.server";

/** The Stripe endpoint signing secret (whsec_…), if one has been saved. */
export function stripeWebhookSecret(): string | null {
  const s = process.env["STRIPE_WEBHOOK_SECRET"];
  return s && s.length >= 16 ? s : null;
}

/** Is a real Stripe webhook connection configured for this environment? */
export function stripeConfigured(): boolean {
  return stripeWebhookSecret() !== null;
}

/**
 * Verify a Stripe-Signature header against the raw request body.
 * Reuses the one signature routine the platform already trusts.
 */
export function verifyStripeSignature(
  rawBody: string,
  header: string | null,
  secret: string,
): { ok: true } | { ok: false; reason: string } {
  return verifySignature(rawBody, header, secret);
}
