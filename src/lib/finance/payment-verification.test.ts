import { describe, expect, it } from "vitest";
import { createHmac } from "crypto";
import {
  VERIFIED_LABEL,
  economicState,
  isSettled,
  matchesOrder,
} from "@/lib/finance/payment-verification";
import { verifySignature } from "@/lib/finance/payment-verification.server";
import { postProtectedFundEntry } from "@/lib/finance/protected-fund.server";
import { saleStatus } from "@/lib/daily/money-move-link";
import {
  BASE_REPORTING_CURRENCY,
  CONFIGURED_MARKET_CURRENCIES,
  sumByCurrency,
  usdEquivalent,
} from "@/lib/finance/currency";
import { DIRECT_CARD_ALLOCATION, allocateDirectCardSale } from "@/lib/finance/allocation";

const SECRET = "test-secret-at-least-16-chars";
const order = {
  id: "11111111-1111-1111-1111-111111111111",
  seller_id: "22222222-2222-2222-2222-222222222222",
  subtotal: 100,
  currency: "USD",
  status: "pending",
  verified_at: null as string | null,
};
const event = {
  provider: "stripe",
  event_id: "evt_1",
  order_id: order.id,
  amount: 100,
  currency: "USD",
  seller_id: order.seller_id,
};

function sign(body: string, t = Math.floor(Date.now() / 1000)) {
  return `t=${t},v1=${createHmac("sha256", SECRET).update(`${t}.${body}`).digest("hex")}`;
}

describe("payment verification — Slice 3", () => {
  it("accepts only a correctly signed, fresh event", () => {
    const body = JSON.stringify(event);
    expect(verifySignature(body, sign(body), SECRET).ok).toBe(true);
    expect(verifySignature(body, null, SECRET).ok).toBe(false);
    expect(verifySignature(body, "garbage", SECRET).ok).toBe(false);
    // Tampered body, original signature — refused.
    expect(verifySignature(`${body} `, sign(body), SECRET).ok).toBe(false);
    // Wrong secret — refused.
    const t = Math.floor(Date.now() / 1000);
    const wrong = `t=${t},v1=${createHmac("sha256", "another-secret-16chars").update(`${t}.${body}`).digest("hex")}`;
    expect(verifySignature(body, wrong, SECRET).ok).toBe(false);
    // Replay of an old event — refused.
    const old = Math.floor(Date.now() / 1000) - 3600;
    expect(verifySignature(body, sign(body, old), SECRET).ok).toBe(false);
  });

  it("rejects mismatched amount, currency, order and seller", () => {
    expect(matchesOrder(order, event).ok).toBe(true);
    expect(matchesOrder(order, { ...event, amount: 99.99 }).ok).toBe(false);
    expect(matchesOrder(order, { ...event, currency: "GBP" }).ok).toBe(false);
    expect(matchesOrder(order, { ...event, order_id: "33333333-3333-3333-3333-333333333333" }).ok).toBe(false);
    expect(matchesOrder(order, { ...event, seller_id: "44444444-4444-4444-4444-444444444444" }).ok).toBe(false);
    expect(matchesOrder(null, event).ok).toBe(false);
    expect(matchesOrder({ ...order, status: "refunded" }, event).ok).toBe(false);
    expect(BASE_REPORTING_CURRENCY).toBe("USD");
  });

  it("treats seller declaration and redirect as unverified", () => {
    expect(economicState({ status: "pending" })).toBe("awaiting-verification");
    expect(economicState({ status: "paid" })).toBe("seller-declared");
    expect(economicState({ status: "verified", verified_at: "2026-01-01" })).toBe("verified");
  });

  it("never treats verified as settled or paid out", () => {
    expect(isSettled("verified")).toBe(false);
    expect(VERIFIED_LABEL.toLowerCase()).not.toMatch(/settled|paid out|withdraw|earned/);
  });

  it("shows a truthful verified state in Daily and Workshop", () => {
    const s = saleStatus("L1", [{ listing_id: "L1", status: "verified", verified_at: "2026-01-01" }]);
    expect(s.state).toBe("verified");
    expect(s.label).toBe(VERIFIED_LABEL);
    expect(`${s.label} ${s.note}`.toLowerCase()).not.toMatch(/settled|cleared|earned|withdrawn/);
  });

  it("cannot post the protected 3% without a recorded provider confirmation", async () => {
    const base = {
      ownerId: order.seller_id,
      sourceKind: "card-order" as const,
      sourceRef: order.id,
      gross: 100,
      currency: "USD",
    };
    expect((await postProtectedFundEntry(base)).posted).toBe(false);
    // A faked verification date alone is not enough.
    expect((await postProtectedFundEntry({ ...base, verifiedAt: "2026-01-01" })).posted).toBe(false);
  });

  it("verifies a sale in its own supported currency, not only USD", () => {
    for (const currency of ["USD", "GBP", "CAD", "EUR", "JMD"]) {
      expect(CONFIGURED_MARKET_CURRENCIES).toContain(currency);
      const o = { ...order, currency };
      const e = { ...event, currency };
      expect(matchesOrder(o, e).ok).toBe(true);
      // Same amount, wrong currency — always refused.
      expect(matchesOrder(o, { ...e, currency: currency === "USD" ? "GBP" : "USD" }).ok).toBe(false);
      // Right currency, wrong amount — still refused.
      expect(matchesOrder(o, { ...e, amount: 99.99 }).ok).toBe(false);
    }
    // A currency no market supports fails clearly instead of being relabelled.
    expect(matchesOrder({ ...order, currency: "XYZ" }, { ...event, currency: "XYZ" }).ok).toBe(false);
    expect(matchesOrder({ ...order, currency: "" }, { ...event, currency: "" }).ok).toBe(false);
  });

  it("applies 90/3/5/2/0 in the original currency, never converted", () => {
    for (const currency of ["USD", "GBP", "CAD", "EUR", "JMD"]) {
      const a = allocateDirectCardSale(100, currency);
      expect(a.currency).toBe(currency);
      expect([a.builderAvailable, a.builderProtectedVault, a.frassCardService, a.foundation]).toEqual([
        90, 3, 5, 2,
      ]);
      expect(a.founder).toBe(0);
      expect(a.coFounder).toBe(0);
    }
  });

  it("never sums different currencies into one number", () => {
    const totals = sumByCurrency([
      { amount: 3, currency: "GBP" },
      { amount: 3, currency: "USD" },
      { amount: 1.5, currency: "GBP" },
    ]);
    expect(totals).toEqual([
      { currency: "GBP", amount: 4.5 },
      { currency: "USD", amount: 3 },
    ]);
  });

  it("keeps the USD reporting equivalent separate and unavailable without FX provenance", () => {
    expect(BASE_REPORTING_CURRENCY).toBe("USD");
    expect(usdEquivalent({ amount: 90, currency: "GBP" })).toMatchObject({ available: false });
    // A rate with no source or time is not trustworthy either.
    expect(
      usdEquivalent({ amount: 90, currency: "GBP" }, {
        from: "GBP",
        to: "USD",
        rate: 1.25,
        source: "",
        asOf: "",
      }),
    ).toMatchObject({ available: false });
    const withProvenance = usdEquivalent({ amount: 90, currency: "GBP" }, {
      from: "GBP",
      to: "USD",
      rate: 1.25,
      source: "connected provider",
      asOf: "2026-09-19T00:00:00.000Z",
    });
    expect(withProvenance).toMatchObject({
      available: true,
      amount: 112.5,
      currency: "USD",
      source: "connected provider",
    });
  });

  it("cannot post a protected-fund entry in an unsupported currency", async () => {
    const posted = await postProtectedFundEntry({
      ownerId: order.seller_id,
      sourceKind: "card-order",
      sourceRef: order.id,
      gross: 100,
      currency: "XYZ",
      verifiedAt: "2026-01-01",
      confirmationId: "c1",
    });
    expect(posted.posted).toBe(false);
  });

  it("keeps the Slice 2 USD allocation unchanged", () => {
    const a = allocateDirectCardSale(100);
    expect(a.builderAvailable).toBe(90);
    expect(a.builderProtectedVault).toBe(3);
    expect(a.frassCardService).toBe(5);
    expect(a.foundation).toBe(2);
    expect(DIRECT_CARD_ALLOCATION.founder).toBe(0);
    expect(DIRECT_CARD_ALLOCATION.coFounder).toBe(0);
  });
});
