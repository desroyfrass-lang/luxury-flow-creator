import { describe, expect, it } from "vitest";
import {
  STRIPE_NOT_CONNECTED,
  checkoutIdempotencyKey,
  checkoutPayable,
  checkoutSessionForm,
  isTestSecretKey,
  reusableSession,
  type OrderForCheckout,
} from "./stripe-checkout";
import { ORDER_METADATA_KEY, SELLER_METADATA_KEY, mapStripeEvent, toMinorUnits } from "./stripe";
import { matchesOrder } from "../payment-verification";
import { allocateEarning } from "../allocation";

const ORDER = "11111111-1111-1111-1111-111111111111";
const SELLER = "22222222-2222-2222-2222-222222222222";

const baseOrder: OrderForCheckout = {
  id: ORDER,
  seller_id: SELLER,
  subtotal: 100,
  currency: "GBP",
  status: "pending",
  verified_at: null,
};

describe("Stripe test-mode checkout bridge — Slice 5", () => {
  it("takes amount, currency and seller from the order, never the browser", () => {
    const d = checkoutPayable({ ...baseOrder, subtotal: "49.99", currency: "cad" });
    expect(d).toEqual({ ok: true, amount: 49.99, currency: "CAD" });

    const form = checkoutSessionForm({
      orderId: ORDER,
      sellerId: SELLER,
      amount: 49.99,
      currency: "CAD",
      productName: "Hand-made tote",
      successUrl: "https://x.test/pay/result?outcome=returned",
      cancelUrl: "https://x.test/pay/result?outcome=cancelled",
    });
    expect(form.get("line_items[0][price_data][currency]")).toBe("cad");
    expect(form.get("line_items[0][price_data][unit_amount]")).toBe("4999");
    expect(form.get(`metadata[${ORDER_METADATA_KEY}]`)).toBe(ORDER);
    expect(form.get(`metadata[${SELLER_METADATA_KEY}]`)).toBe(SELLER);
    expect(form.get(`payment_intent_data[metadata][${ORDER_METADATA_KEY}]`)).toBe(ORDER);
    expect(form.get("mode")).toBe("payment");
    expect(form.get("client_reference_id")).toBe(ORDER);
  });

  it("refuses an order that is not open and payable", () => {
    expect(checkoutPayable(null).ok).toBe(false);
    for (const status of ["paid", "verified", "cancelled", "refunded", "draft"]) {
      expect(checkoutPayable({ ...baseOrder, status }).ok).toBe(false);
    }
    // A verified order can never open a fresh payable checkout.
    expect(checkoutPayable({ ...baseOrder, verified_at: new Date().toISOString() }).ok).toBe(false);
    expect(checkoutPayable({ ...baseOrder, subtotal: 0 }).ok).toBe(false);
    expect(checkoutPayable({ ...baseOrder, currency: "pounds" }).ok).toBe(false);
  });

  it("reuses one live payment page per order and drops an expired one", () => {
    const now = Date.parse("2026-01-01T12:00:00Z");
    const live: OrderForCheckout = {
      ...baseOrder,
      stripe_session_id: "cs_test_1",
      stripe_session_url: "https://checkout.stripe.com/c/pay/cs_test_1",
      stripe_session_expires_at: "2026-01-01T13:00:00Z",
    };
    expect(reusableSession(live, now)?.sessionId).toBe("cs_test_1");
    expect(reusableSession({ ...live, stripe_session_expires_at: "2026-01-01T11:00:00Z" }, now)).toBeNull();
    expect(reusableSession(baseOrder, now)).toBeNull();
    expect(checkoutIdempotencyKey(ORDER)).toBe(`frass-card-order-${ORDER}`);
  });

  it("accepts a Stripe TEST key only, and names the honest state without one", () => {
    expect(isTestSecretKey("sk_test_51AbcdEfghIjklmnop")).toBe(true);
    expect(isTestSecretKey("sk_live_51AbcdEfghIjklmnop")).toBe(false);
    expect(isTestSecretKey("")).toBe(false);
    expect(isTestSecretKey(null)).toBe(false);
    expect(STRIPE_NOT_CONNECTED).toMatch(/not connected yet/i);
  });

  it("produces a session the existing webhook can bind to the same order", () => {
    const amount = 125.5;
    const currency = "CAD";
    const order = { ...baseOrder, subtotal: amount, currency };
    const form = checkoutSessionForm({
      orderId: ORDER,
      sellerId: SELLER,
      amount,
      currency,
      productName: "Order",
      successUrl: "https://x.test/s",
      cancelUrl: "https://x.test/c",
    });

    // Stripe echoes exactly what the session carried.
    const event = mapStripeEvent({
      id: "evt_1",
      type: "checkout.session.completed",
      data: {
        object: {
          id: form.get("client_reference_id"),
          payment_status: "paid",
          amount_total: Number(form.get("line_items[0][price_data][unit_amount]")),
          currency: form.get("line_items[0][price_data][currency]"),
          metadata: {
            [ORDER_METADATA_KEY]: form.get(`metadata[${ORDER_METADATA_KEY}]`),
            [SELLER_METADATA_KEY]: form.get(`metadata[${SELLER_METADATA_KEY}]`),
          },
        },
      },
    });
    expect(event.ok).toBe(true);
    if (!event.ok) return;
    expect(matchesOrder(order, event.event).ok).toBe(true);

    // Only after that trusted match does the universal split apply, in CAD.
    const split = allocateEarning(amount, currency);
    expect(split.currency).toBe("CAD");
  });

  it("still refuses a payment whose amount, currency or seller was altered", () => {
    const order = { ...baseOrder };
    const good = {
      provider: "stripe",
      event_id: "evt_2",
      order_id: ORDER,
      amount: 100,
      currency: "GBP",
      seller_id: SELLER,
    };
    expect(matchesOrder(order, good).ok).toBe(true);
    expect(matchesOrder(order, { ...good, amount: 1 }).ok).toBe(false);
    expect(matchesOrder(order, { ...good, currency: "USD" }).ok).toBe(false);
    expect(matchesOrder(order, { ...good, seller_id: ORDER }).ok).toBe(false);
    expect(matchesOrder(order, { ...good, order_id: SELLER }).ok).toBe(false);
  });

  it("converts to Stripe's smallest unit without changing the currency", () => {
    expect(toMinorUnits(49.99, "usd")).toBe(4999);
    expect(toMinorUnits(2500, "JMD")).toBe(250000);
    expect(toMinorUnits(5000, "jpy")).toBe(5000);
  });
});
