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
