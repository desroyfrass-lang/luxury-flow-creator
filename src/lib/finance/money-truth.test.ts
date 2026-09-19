import { describe, expect, it } from "vitest";
import {
  PROVIDER_VERIFICATION_AVAILABLE,
  isProviderVerified,
  receiptStatusForOrder,
  unverifiedReceiptNote,
  SELLER_DECLARED_NOTE,
} from "@/lib/finance/money-truth";
import { saleStatus } from "@/lib/daily/money-move-link";

describe("money truth — Slice 1", () => {
  it("has no provider verification rail yet", () => {
    expect(PROVIDER_VERIFICATION_AVAILABLE).toBe(false);
    expect(isProviderVerified("card-order")).toBe(false);
    expect(isProviderVerified("payment-request")).toBe(false);
  });

  it("never turns a seller-declared paid order into a settled receipt", () => {
    expect(receiptStatusForOrder("paid")).toBe("pending");
    expect(receiptStatusForOrder("pending")).toBe("pending");
  });

  it("keeps refunds and cancellations truthful", () => {
    expect(receiptStatusForOrder("refunded")).toBe("refunded");
    expect(receiptStatusForOrder("cancelled")).toBe("cancelled");
  });

  it("marks seller-declared receipts as unverified in plain English", () => {
    expect(unverifiedReceiptNote("paid", null)).toBe(SELLER_DECLARED_NOTE);
    expect(unverifiedReceiptNote("pending", "2 × 10")).toBe("2 × 10");
  });

  it("shows awaiting verification for an open order and never says earned", () => {
    const s = saleStatus("L1", [{ listing_id: "L1", status: "pending" }]);
    expect(s.state).toBe("awaiting");
    expect(s.label.toLowerCase()).toContain("verification");
    expect(`${s.label} ${s.note}`.toLowerCase()).not.toMatch(/earned|settled|cleared/);
  });

  it("reports a seller-declared sale as not verified", () => {
    const s = saleStatus("L1", [{ listing_id: "L1", status: "paid" }]);
    expect(s.state).toBe("seller-declared");
    expect(s.label.toLowerCase()).toContain("not verified");
    expect(s.label.toLowerCase()).not.toContain("complete");
  });
});

/* STEP 5 · SLICE 4 — verified money reads as verified, but never as settled. */
import {
  VERIFICATION_RAIL_EXISTS,
  isSettledVerification,
  receiptVerification,
} from "./money-truth";
import { receiptBreakdown, type Receipt } from "./receipts";

const base: Receipt = {
  id: "order:1",
  kind: "quick_sell",
  direction: "in",
  source: "frass-card",
  title: "One pair",
  gross: 100,
  platformAllocation: 10,
  processingFee: 0,
  otherDeductions: 0,
  net: 90,
  currency: "USD",
  status: "pending",
  occurredAt: new Date().toISOString(),
  derived: true,
};

describe("slice 4 · verification wording", () => {
  it("the signed provider door exists", () => {
    expect(VERIFICATION_RAIL_EXISTS).toBe(true);
  });

  it("an open order is awaiting verification", () => {
    expect(receiptVerification("pending", null).state).toBe("awaiting-verification");
  });

  it("a seller ticking paid is never verified", () => {
    const v = receiptVerification("paid", null);
    expect(v.state).toBe("seller-declared");
    expect(v.label.toLowerCase()).toContain("not verified");
  });

  it("only a provider confirmation reads as verified", () => {
    const v = receiptVerification("verified", new Date().toISOString());
    expect(v.state).toBe("verified");
    expect(v.note).toContain("not settled");
  });

  it("verified is never settled, available or paid out", () => {
    const v = receiptVerification("verified", new Date().toISOString());
    expect(isSettledVerification(v)).toBe(false);
    const r: Receipt = { ...base, verification: v };
    const status = receiptBreakdown(r).find((l) => l.label === "Status");
    expect(status?.value).toBe("Pending");
  });

  it("a receipt with no payment rail shows no verification line", () => {
    expect(receiptBreakdown(base).some((l) => l.label === "Payment check")).toBe(false);
  });
});
