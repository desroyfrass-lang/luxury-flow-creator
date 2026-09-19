import { describe, expect, it } from "vitest";
import { createHmac } from "crypto";
import {
  DIRECT_SALE_CURRENCY,
  VERIFIED_LABEL,
  economicState,
  isSettled,
  matchesOrder,
} from "@/lib/finance/payment-verification";
import { verifySignature } from "@/lib/finance/payment-verification.server";
import { postProtectedFundEntry } from "@/lib/finance/protected-fund.server";
import { saleStatus } from "@/lib/daily/money-move-link";
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
    expect(DIRECT_SALE_CURRENCY).toBe("USD");
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
    };
    expect((await postProtectedFundEntry(base)).posted).toBe(false);
    // A faked verification date alone is not enough.
    expect((await postProtectedFundEntry({ ...base, verifiedAt: "2026-01-01" })).posted).toBe(false);
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
