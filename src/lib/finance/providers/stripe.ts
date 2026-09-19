// ─────────────────────────────────────────────────────────────────────────────
// STEP 5 · SLICE 4 — Stripe adapter (pure translation, no secrets, no network).
//
// This file turns ONE genuine Stripe event into the SAME internal confirmation
// shape the existing trusted verification path already understands. It creates
// no second truth system: every event still goes through matchesOrder() and
// recordPaymentConfirmation() exactly as before.
//
// Nothing here can verify anything on its own. Signature checking lives in
// stripe.server.ts and runs first.
// ─────────────────────────────────────────────────────────────────────────────

import type { PaymentConfirmationEvent } from "../payment-verification";
import { normalizeCurrency } from "../currency";

/** The provider name recorded on every confirmation row from Stripe. */
export const STRIPE_PROVIDER = "stripe";

/** Stripe event types Frass treats as "the money went through". */
export const STRIPE_SUCCESS_EVENTS = [
  "checkout.session.completed",
  "payment_intent.succeeded",
  "charge.succeeded",
] as const;

/**
 * Stripe sends amounts in the currency's smallest unit. Most currencies Frass
 * serves have two decimals; these have none. Anything unknown is treated as
 * two decimals, which matches every configured market currency today.
 */
const ZERO_DECIMAL = new Set([
  "BIF", "CLP", "DJF", "GNF", "JPY", "KMF", "KRW", "MGA", "PYG",
  "RWF", "UGX", "VND", "VUV", "XAF", "XOF", "XPF",
]);

/** Smallest-unit integer → real money amount in that same currency. */
export function fromMinorUnits(minor: number, currency: string): number {
  const c = normalizeCurrency(currency) ?? "";
  if (ZERO_DECIMAL.has(c)) return Math.round(minor);
  return Math.round(minor) / 100;
}

/** The metadata keys a Frass checkout must carry so an event can be bound. */
export const ORDER_METADATA_KEY = "frass_order_id";
export const SELLER_METADATA_KEY = "frass_seller_id";

type StripeObject = Record<string, unknown>;

function str(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

export type StripeMapResult =
  | { ok: true; event: PaymentConfirmationEvent }
  | { ok: false; reason: string; ignorable: boolean };

/**
 * Translate a Stripe webhook body into an internal confirmation event.
 *
 * `ignorable: true` means "a real Stripe event we simply do not act on" — it is
 * acknowledged with 200 so Stripe stops retrying. `ignorable: false` means the
 * event looked like a payment but could not be trusted or bound to an order.
 */
export function mapStripeEvent(body: unknown): StripeMapResult {
  const root = (body ?? {}) as StripeObject;
  const type = str(root["type"]);
  const eventId = str(root["id"]);
  if (!type || !eventId) {
    return { ok: false, reason: "Not a Stripe event.", ignorable: false };
  }
  if (!(STRIPE_SUCCESS_EVENTS as readonly string[]).includes(type)) {
    return { ok: false, reason: `Stripe event ${type} is not a payment success.`, ignorable: true };
  }

  const object = ((root["data"] as StripeObject | undefined)?.["object"] ?? {}) as StripeObject;

  // A checkout session only counts when Stripe itself says it was paid.
  if (type === "checkout.session.completed" && str(object["payment_status"]) !== "paid") {
    return { ok: false, reason: "Checkout session is not paid.", ignorable: true };
  }

  const metadata = (object["metadata"] ?? {}) as StripeObject;
  const orderId = str(metadata[ORDER_METADATA_KEY]);
  if (!orderId) {
    return {
      ok: false,
      reason: "This payment carries no Frass order reference.",
      ignorable: false,
    };
  }

  const currency = normalizeCurrency(object["currency"]);
  if (!currency) {
    return { ok: false, reason: "The payment has no currency.", ignorable: false };
  }

  const minor =
    object["amount_total"] ?? object["amount_received"] ?? object["amount_captured"] ?? object["amount"];
  if (typeof minor !== "number" || !Number.isFinite(minor) || minor < 0) {
    return { ok: false, reason: "The payment has no amount.", ignorable: false };
  }

  return {
    ok: true,
    event: {
      provider: STRIPE_PROVIDER,
      event_id: eventId,
      event_type: type,
      order_id: orderId,
      provider_payment_id:
        str(object["payment_intent"]) ?? str(object["id"]) ?? null,
      // The charged amount, in the currency actually charged. Never converted.
      amount: fromMinorUnits(minor, currency),
      currency,
      seller_id: str(metadata[SELLER_METADATA_KEY]),
    },
  };
}
