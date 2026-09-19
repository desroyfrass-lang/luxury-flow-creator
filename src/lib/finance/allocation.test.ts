import { describe, expect, it } from "vitest";
import {
  EARNER_TOTAL_PCT,
  ECOSYSTEM_TOTAL_PCT,
  UNIVERSAL_ALLOCATION,
  allocateEarning,
  usesUniversalAllocation,
} from "./allocation";
import { settle } from "@/lib/card-commerce";
import { NO_VERIFICATION_REASON, postReserveVaultEntry } from "./reserve-vault.server";

describe("universal Frass allocation", () => {
  it("totals exactly 100%", () => {
    const total = Object.values<number>(UNIVERSAL_ALLOCATION).reduce((a, b) => a + b, 0);
    expect(total).toBe(100);
    expect(EARNER_TOTAL_PCT).toBe(90);
    expect(ECOSYSTEM_TOTAL_PCT).toBe(10);
  });

  it("splits $100 USD as 90 / 3 / 3 / 2 / 1 / 1", () => {
    const a = allocateEarning(100);
    expect(a.earner).toBe(90);
    expect(a.infrastructure).toBe(3);
    expect(a.reserve).toBe(3);
    expect(a.foundation).toBe(2);
    expect(a.founder).toBe(1);
    expect(a.coFounder).toBe(1);
    expect(a.ecosystemTotal).toBe(10);
  });

  it("applies the percentages in the transaction's own currency", () => {
    for (const c of ["USD", "GBP", "CAD", "EUR", "JMD"]) {
      const a = allocateEarning(100, c);
      expect(a.currency).toBe(c);
      expect(a.earner).toBe(90);
      expect(a.reserve).toBe(3);
      expect(a.founder).toBe(1);
    }
  });

  it("never claims to be verified money", () => {
    expect(allocateEarning(100).verified).toBe(false);
  });

  it("applies to every earning transaction type", () => {
    for (const t of [
      "direct-card-sale",
      "marketplace-sale",
      "shopify-brand-sale",
      "affiliate-commission",
      "referral-bonus",
      "grant",
    ] as const) {
      expect(usesUniversalAllocation(t)).toBe(true);
    }
  });
});

describe("card settlement preview", () => {
  it("keeps 10% for the Frass ecosystem and names every share", () => {
    const s = settle(100, 1, "stripe");
    expect(s.gross).toBe(100);
    expect(s.platformFee).toBe(10);
    expect(s.infrastructure).toBe(3);
    expect(s.reserve).toBe(3);
    expect(s.foundation).toBe(2);
    expect(s.founder).toBe(1);
    expect(s.coFounder).toBe(1);
    // 90% less the seller's own provider fee estimate.
    expect(s.netToSeller).toBeCloseTo(90 - s.processingFeeEstimate, 2);
  });
});

describe("reserve vault posting", () => {
  it("refuses to record anything while no payment is verified", async () => {
    const r = await postReserveVaultEntry({
      ownerId: "00000000-0000-0000-0000-000000000001",
      sourceKind: "card-order",
      sourceRef: "order-1",
      gross: 100,
      currency: "USD",
    });
    expect(r.posted).toBe(false);
    expect(r).toMatchObject({ reason: NO_VERIFICATION_REASON });
  });

  it("still refuses when a caller fakes a confirmation timestamp", async () => {
    const r = await postReserveVaultEntry({
      ownerId: "00000000-0000-0000-0000-000000000001",
      sourceKind: "card-order",
      sourceRef: "order-1",
      gross: 100,
      currency: "USD",
      verifiedAt: new Date().toISOString(),
    });
    expect(r.posted).toBe(false);
  });
});
