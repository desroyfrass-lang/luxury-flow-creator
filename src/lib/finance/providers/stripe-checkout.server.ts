// ─────────────────────────────────────────────────────────────────────────────
// STEP 5 · SLICE 5 (server only) — talking to Stripe.
//
// The secret key is read here and nowhere else. It never reaches a browser,
// never appears in a response, and is never logged. Test mode only.
// ─────────────────────────────────────────────────────────────────────────────

import {
  STRIPE_NOT_CONNECTED,
  checkoutIdempotencyKey,
  isTestSecretKey,
} from "./stripe-checkout";

const STRIPE_SESSIONS_URL = "https://api.stripe.com/v1/checkout/sessions";

/** The saved Stripe TEST secret key, if the Founder has added one. */
export function stripeSecretKey(): string | null {
  const key = process.env["STRIPE_SECRET_KEY"];
  return key && key.trim() ? key.trim() : null;
}

/** Is a usable Stripe test key present? A live key is deliberately refused. */
export function stripeCheckoutReady(): boolean {
  return isTestSecretKey(stripeSecretKey());
}

export type CreatedSession =
  | { ok: true; sessionId: string; url: string; expiresAt: string | null }
  | { ok: false; reason: string };

/**
 * Create one Stripe Checkout Session in test mode. No SDK: a plain signed
 * HTTPS form post, which is all the Worker runtime needs.
 */
export async function createStripeCheckoutSession(
  form: URLSearchParams,
  orderId: string,
): Promise<CreatedSession> {
  const key = stripeSecretKey();
  if (!key) return { ok: false, reason: STRIPE_NOT_CONNECTED };
  if (!isTestSecretKey(key)) {
    return {
      ok: false,
      reason: "Only a Stripe TEST key may be used for now. No live charge is allowed.",
    };
  }

  let res: Response;
  try {
    res = await fetch(STRIPE_SESSIONS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/x-www-form-urlencoded",
        // Same order, same key: a double click cannot open two payable pages.
        "Idempotency-Key": checkoutIdempotencyKey(orderId),
      },
      body: form.toString(),
    });
  } catch {
    return { ok: false, reason: "Stripe could not be reached. Try again in a moment." };
  }

  const body = (await res.json().catch(() => null)) as
    | { id?: string; url?: string; expires_at?: number; error?: { message?: string } }
    | null;

  if (!res.ok || !body?.id || !body.url) {
    // Stripe's own message is safe to show; the key never appears in it.
    return { ok: false, reason: body?.error?.message ?? "Stripe refused this checkout." };
  }

  return {
    ok: true,
    sessionId: body.id,
    url: body.url,
    expiresAt: body.expires_at ? new Date(body.expires_at * 1000).toISOString() : null,
  };
}
