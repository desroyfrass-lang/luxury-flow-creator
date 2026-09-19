import { describe, expect, it } from "vitest";
import { createHmac } from "crypto";
import { mapStripeEvent, fromMinorUnits, STRIPE_PROVIDER } from "./stripe";
import { verifyStripeSignature } from "./stripe.server";
import { matchesOrder } from "../payment-verification";
import { allocateEarning } from "../allocation";

const SECRET = "whsec_test_secret_at_least_16";
const ORDER = "11111111-1111-1111-1111-111111111111";
const SELLER = "22222222-2222-2222-2222-222222222222";

function stripeEvent(over: Record<string, unknown> = {}, obj: Record<string, unknown> = {}) {
  return {
    id: "evt_test_1",
    type: "checkout.session.completed",
    data: {
      object: {
        id: "cs_test_1",
        payment_intent: "pi_test_1",
        payment_status: "paid",
        amount_total: 10000,
        currency: "gbp",
        metadata: { frass_order_id: ORDER, frass_seller_id: SELLER },
        ...obj,
      },
    },
    ...over,
  };
}

function sign(body: string, t = Math.floor(Date.now() / 1000), secret = SECRET) {
  return `t=${t},v1=${createHmac("sha256", secret).update(`${t}.${body}`).digest("hex")}`;
}

describe("Stripe provider door — Slice 4", () => {
  it("accepts only a correctly signed, fresh Stripe event", () => {
    const body = JSON.stringify(stripeEvent());
    expect(verifyStripeSignature(body, sign(body), SECRET).ok).toBe(true);
    expect(verifyStripeSignature(body, null, SECRET).ok).toBe(false);
    expect(verifyStripeSignature(body, "t=1,v1=deadbeef", SECRET).ok).toBe(false);
    // Tampered body with the original signature — refused.
    expect(verifyStripeSignature(`${body} `, sign(body), SECRET).ok).toBe(false);
    // Wrong signing secret — refused.
    expect(verifyStripeSignature(body, sign(body, undefined, "whsec_other_secret_16+"), SECRET).ok).toBe(false);
    // Replay of an old event — refused.
    expect(verifyStripeSignature(body, sign(body, Math.floor(Date.now() / 1000) - 3600), SECRET).ok).toBe(false);
  });

  it("translates a paid checkout into the one internal confirmation shape", () => {
    const r = mapStripeEvent(stripeEvent());
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.event).toMatchObject({
      provider: STRIPE_PROVIDER,
      event_id: "evt_test_1",
      order_id: ORDER,
      seller_id: SELLER,
      amount: 100,
      currency: "GBP",
      provider_payment_id: "pi_test_1",
    });
  });

  it("keeps the charged currency and never converts it", () => {
    for (const [code, minor, expected] of [
      ["usd", 4999, 49.99],
      ["cad", 12550, 125.5],
      ["eur", 100, 1],
      ["jmd", 250000, 2500],
      ["jpy", 5000, 5000],
    ] as const) {
      expect(fromMinorUnits(minor, code)).toBe(expected);
      const r = mapStripeEvent(stripeEvent({}, { currency: code, amount_total: minor }));
      expect(r.ok).toBe(true);
      if (r.ok) {
        expect(r.event.currency).toBe(code.toUpperCase());
        expect(r.event.amount).toBe(expected);
      }
    }
  });

  it("refuses events it cannot bind, and ignores ones it must not act on", () => {
    // Unpaid checkout session — acknowledged, never acted on.
    expect(mapStripeEvent(stripeEvent({}, { payment_status: "unpaid" }))).toMatchObject({
      ok: false,
      ignorable: true,
    });
    // An unrelated Stripe event.
    expect(mapStripeEvent(stripeEvent({ type: "customer.created" }))).toMatchObject({
      ok: false,
      ignorable: true,
    });
    // A payment with no Frass order reference — refused, not guessed.
    expect(mapStripeEvent(stripeEvent({}, { metadata: {} }))).toMatchObject({
      ok: false,
      ignorable: false,
    });
    expect(mapStripeEvent(stripeEvent({}, { currency: undefined }))).toMatchObject({ ok: false });
    expect(mapStripeEvent(stripeEvent({}, { amount_total: undefined }))).toMatchObject({ ok: false });
    expect(mapStripeEvent({ hello: "world" })).toMatchObject({ ok: false });
  });

  it("still enforces exact order, seller, amount and currency binding", () => {
    const order = {
      id: ORDER,
      seller_id: SELLER,
      subtotal: 100,
      currency: "GBP",
      status: "pending",
      verified_at: null as string | null,
    };
    const r = mapStripeEvent(stripeEvent());
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(matchesOrder(order, r.event).ok).toBe(true);
    expect(matchesOrder({ ...order, subtotal: 99 }, r.event).ok).toBe(false);
    expect(matchesOrder({ ...order, currency: "USD" }, r.event).ok).toBe(false);
    expect(matchesOrder({ ...order, seller_id: "33333333-3333-3333-3333-333333333333" }, r.event).ok).toBe(false);
    expect(matchesOrder(null, r.event).ok).toBe(false);
  });

  it("allocates a Stripe-confirmed sale under the universal 90/3/3/2/1/1 rule", () => {
    const r = mapStripeEvent(stripeEvent());
    if (!r.ok) throw new Error("expected a mapped event");
    const a = allocateEarning(r.event.amount, r.event.currency);
    expect(a.currency).toBe("GBP");
    expect([a.earner, a.infrastructure, a.reserve, a.foundation, a.founder, a.coFounder]).toEqual([
      90, 3, 3, 2, 1, 1,
    ]);
  });
});
