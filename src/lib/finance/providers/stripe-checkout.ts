// ─────────────────────────────────────────────────────────────────────────────
// STEP 5 · SLICE 5 — Stripe Checkout bridge (pure decisions, no secrets, no
// network). Everything here can be tested without Stripe and without money.
//
// This file decides ONLY two things:
//   1. May this order open a payable checkout at all?
//   2. What exact fields must the Stripe session carry so the EXISTING signed
//      webhook can bind the payment to this one order?
//
// It cannot verify anything. A returning customer, a success page and a
// redirect are never proof. Only the signed webhook may verify.
// ─────────────────────────────────────────────────────────────────────────────

import { normalizeCurrency } from "../currency";
import { ORDER_METADATA_KEY, SELLER_METADATA_KEY, toMinorUnits } from "./stripe";

/** Shown whenever no Stripe test key has been saved for this project. */
export const STRIPE_NOT_CONNECTED =
  "Stripe test payments are not connected yet.";

/**
 * A live key must never be used by this bridge. Test mode only, for now.
 * Accepts a standard test secret key (`sk_test_`) or a restricted test key
 * (`rk_test_`), both of which Stripe only ever issues in test mode. Live keys
 * (`sk_live_`, `rk_live_`) and every other format are refused.
 */
export function isTestSecretKey(key: string | null | undefined): boolean {
  return (
    typeof key === "string" &&
    /^(?:sk|rk)_test_[A-Za-z0-9_]{10,}$/.test(key.trim())
  );
}

export type OrderForCheckout = {
  id: string;
  seller_id: string;
  subtotal: number | string;
  currency: string;
  status: string;
  verified_at?: string | null;
  stripe_session_id?: string | null;
  stripe_session_url?: string | null;
  stripe_session_expires_at?: string | null;
};

export type PayableDecision =
  | { ok: true; amount: number; currency: string }
  | { ok: false; reason: string };

/**
 * May this order be paid right now?
 *
 * The amount and the currency come back from the ORDER, never from the
 * browser. A paid, verified, cancelled or refunded order can never open a
 * fresh payable checkout — that is how an order would be charged twice.
 */
export function checkoutPayable(order: OrderForCheckout | null | undefined): PayableDecision {
  if (!order) return { ok: false, reason: "No such order." };
  if (order.verified_at || order.status === "verified") {
    return { ok: false, reason: "This order is already paid and verified." };
  }
  if (order.status === "paid") {
    return { ok: false, reason: "This order is already marked paid and is awaiting verification." };
  }
  if (order.status === "cancelled" || order.status === "refunded") {
    return { ok: false, reason: "This order is no longer open." };
  }
  if (order.status !== "pending") {
    return { ok: false, reason: "This order cannot be paid." };
  }
  const currency = normalizeCurrency(order.currency);
  if (!currency) return { ok: false, reason: "A three-letter currency code is required." };
  const amount = Number(order.subtotal);
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, reason: "This order has no payable amount." };
  }
  return { ok: true, amount, currency };
}

/**
 * Can the customer be sent back to a checkout page Frass already opened for
 * this exact order? Reusing one session is what stops a shopper generating a
 * pile of payable links for the same order.
 */
export function reusableSession(
  order: OrderForCheckout,
  nowMs: number = Date.now(),
): { url: string; sessionId: string } | null {
  const url = order.stripe_session_url;
  const id = order.stripe_session_id;
  if (!url || !id) return null;
  const expires = order.stripe_session_expires_at
    ? Date.parse(order.stripe_session_expires_at)
    : NaN;
  if (Number.isFinite(expires) && expires - 60_000 <= nowMs) return null;
  return { url, sessionId: id };
}

/**
 * The exact Stripe Checkout Session form fields.
 *
 * The binding metadata is placed on BOTH the session and the payment intent,
 * because the existing webhook accepts `checkout.session.completed` and
 * `payment_intent.succeeded` and binds either one by the same order reference.
 */
export function checkoutSessionForm(input: {
  orderId: string;
  sellerId: string;
  amount: number;
  currency: string;
  productName: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string | null;
}): URLSearchParams {
  const currency = (normalizeCurrency(input.currency) ?? "").toLowerCase();
  const form = new URLSearchParams();
  form.set("mode", "payment");
  form.set("success_url", input.successUrl);
  form.set("cancel_url", input.cancelUrl);
  form.set("client_reference_id", input.orderId);
  form.set("line_items[0][quantity]", "1");
  form.set("line_items[0][price_data][currency]", currency);
  form.set("line_items[0][price_data][unit_amount]", String(toMinorUnits(input.amount, currency)));
  form.set("line_items[0][price_data][product_data][name]", input.productName.slice(0, 250));
  form.set(`metadata[${ORDER_METADATA_KEY}]`, input.orderId);
  form.set(`metadata[${SELLER_METADATA_KEY}]`, input.sellerId);
  form.set(`payment_intent_data[metadata][${ORDER_METADATA_KEY}]`, input.orderId);
  form.set(`payment_intent_data[metadata][${SELLER_METADATA_KEY}]`, input.sellerId);
  if (input.customerEmail) form.set("customer_email", input.customerEmail);
  return form;
}

/** One idempotency key per order, so a double click cannot open two sessions. */
export function checkoutIdempotencyKey(orderId: string): string {
  return `frass-card-order-${orderId}`;
}
