import { describe, expect, it } from "vitest";
import {
  ALLOCATION_SHARES,
  allocationLedgerRows,
  ledgerTotal,
  type AllocationLedgerInput,
} from "./allocation-ledger";

const base: AllocationLedgerInput = {
  confirmationId: "c-1",
  orderId: "o-1",
  sourceKind: "card-order",
  sourceRef: "o-1",
  earnerId: "seller-1",
  gross: 1,
  currency: "USD",
  verifiedAt: "2026-09-19T20:13:32.000Z",
};

describe("universal allocation ledger rows", () => {
  it("produces exactly six shares", () => {
    const rows = allocationLedgerRows(base);
    expect(rows).toHaveLength(6);
    expect(rows.map((r) => r.share)).toEqual([...ALLOCATION_SHARES]);
  });

  it("splits $1.00 into 0.90/0.03/0.03/0.02/0.01/0.01 and adds back to the gross", () => {
    const rows = allocationLedgerRows(base);
    const by = Object.fromEntries(rows.map((r) => [r.share, r.amount]));
    expect(by["earner"]).toBe(0.9);
    expect(by["infrastructure"]).toBe(0.03);
    expect(by["reserve"]).toBe(0.03);
    expect(by["foundation"]).toBe(0.02);
    expect(by["founder"]).toBe(0.01);
    expect(by["cofounder"]).toBe(0.01);
    expect(ledgerTotal(rows)).toBe(1);
  });

  it("splits $100 exactly and totals the gross", () => {
    const rows = allocationLedgerRows({ ...base, gross: 100 });
    expect(rows.map((r) => r.amount)).toEqual([90, 3, 3, 2, 1, 1]);
    expect(ledgerTotal(rows)).toBe(100);
  });

  it("only the 90% share belongs to the Builder; Frass shares have no owner", () => {
    const rows = allocationLedgerRows(base);
    expect(rows.filter((r) => r.beneficiary_id !== null)).toHaveLength(1);
    expect(rows.find((r) => r.share === "earner")?.beneficiary_id).toBe("seller-1");
  });

  it("keeps the currency the customer actually paid, never converting", () => {
    const rows = allocationLedgerRows({ ...base, gross: 100, currency: "GBP" });
    expect(new Set(rows.map((r) => r.currency))).toEqual(new Set(["GBP"]));
    expect(rows.find((r) => r.share === "earner")?.amount).toBe(90);
  });

  it("binds every row to the same confirmation, so replays collide on the unique key", () => {
    const rows = allocationLedgerRows(base);
    expect(new Set(rows.map((r) => r.confirmation_id))).toEqual(new Set(["c-1"]));
    const keys = rows.map((r) => `${r.confirmation_id}:${r.share}`);
    expect(new Set(keys).size).toBe(6);
  });

  it("never records a share as settled or available", () => {
    for (const row of allocationLedgerRows(base)) {
      expect(row.state).toBe("recorded");
      expect(row.note.toLowerCase()).not.toContain("available");
    }
  });
});
