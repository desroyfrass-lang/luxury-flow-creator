import { describe, expect, it } from "vitest";
import {
  DIRECT_CARD_ALLOCATION,
  DIRECT_CARD_BUILDER_TOTAL_PCT,
  DIRECT_CARD_FRASS_TOTAL_PCT,
  allocateDirectCardSale,
  usesDirectCardAllocation,
} from "./allocation";
import { settle } from "@/lib/card-commerce";
import { NO_VERIFICATION_REASON, postProtectedFundEntry } from "./protected-fund.server";

describe("direct Frass Card allocation", () => {
  it("totals exactly 100%", () => {
    const total = Object.values<number>(DIRECT_CARD_ALLOCATION).reduce((a, b) => a + b, 0);
    expect(total).toBe(100);
    expect(DIRECT_CARD_BUILDER_TOTAL_PCT).toBe(93);
    expect(DIRECT_CARD_FRASS_TOTAL_PCT).toBe(7);
  });

  it("pays the Founder and Co-Founder nothing personally", () => {
    expect(DIRECT_CARD_ALLOCATION.founder).toBe(0);
    expect(DIRECT_CARD_ALLOCATION.coFounder).toBe(0);
    const a = allocateDirectCardSale(100);
    expect(a.founder).toBe(0);
    expect(a.coFounder).toBe(0);
  });

  it("splits $100 USD as 90 / 3 / 5 / 2", () => {
    const a = allocateDirectCardSale(100);
    expect(a.builderAvailable).toBe(90);
    expect(a.builderProtectedVault).toBe(3);
    expect(a.frassCardService).toBe(5);
    expect(a.foundation).toBe(2);
    expect(a.builderTotal).toBe(93);
    expect(a.frassTotal).toBe(7);
  });

  it("never claims to be verified money", () => {
    expect(allocateDirectCardSale(100).verified).toBe(false);
  });

  it("applies only to a Builder's own direct card sale", () => {
    expect(usesDirectCardAllocation("direct-card-sale")).toBe(true);
    for (const t of ["marketplace-sale", "shopify-brand-sale", "affiliate-commission", "referral-bonus", "grant"] as const) {
      expect(usesDirectCardAllocation(t)).toBe(false);
    }
  });
});

describe("card settlement preview", () => {
  it("keeps 7% for Frass and shows the Builder's protected 3% separately", () => {
    const s = settle(100, 1, "stripe");
    expect(s.gross).toBe(100);
    expect(s.platformFee).toBe(7);
    expect(s.frassCardService).toBe(5);
    expect(s.foundation).toBe(2);
    expect(s.protectedVault).toBe(3);
    // 90% less the seller's own provider fee estimate.
    expect(s.netToSeller).toBeCloseTo(90 - s.processingFeeEstimate, 2);
  });
});

describe("protected fund posting", () => {
  it("refuses to credit anything while no payment is verified", async () => {
    const r = await postProtectedFundEntry({
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
    const r = await postProtectedFundEntry({
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
