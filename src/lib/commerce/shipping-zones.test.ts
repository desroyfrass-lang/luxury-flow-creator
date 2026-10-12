import { describe, expect, it } from "vitest";
import { SHIPPING_ZONES, standardQuote } from "./shipping-zones";

const now = new Date("2026-10-11T10:00:00Z");
const q = (price: number, exp: string, method = "A") => ({ method, price, currency: "USD", fetched_at: "2026-10-11T09:00:00Z", expires_at: exp });

describe("Standard Shipping Included zones", () => {
  it("no zone is live for shoppers yet", () => expect(SHIPPING_ZONES.every((z) => !z.liveForShoppers)).toBe(true));
  it("unsupported destination needs an exception", () => expect(standardQuote("FR", [], now).status).toBe("unsupported"));
  it("oversized needs an individual quote", () => expect(standardQuote("US", [q(5, "2026-10-12T00:00:00Z")], now, "oversized").status).toBe("quote_required"));
  it("missing quote fails closed", () => expect(standardQuote("US", [], now).status).toBe("missing"));
  it("stale quote fails closed", () => expect(standardQuote("US", [q(5, "2026-10-11T09:59:00Z")], now).status).toBe("stale"));
  it("picks the cheapest fresh option", () => {
    const r = standardQuote("US", [q(9, "2026-10-12T00:00:00Z", "B"), q(7.23, "2026-10-12T00:00:00Z", "A"), q(3, "2026-10-11T09:00:00Z", "C")], now);
    expect(r.status === "ok" && r.quote.price).toBe(7.23);
  });
  it("newer readings supersede older cheaper quotes for a method", () => {
    const old = q(5, "2026-10-12T00:00:00Z");
    const newer = { ...old, price: 9, fetched_at: "2026-10-11T09:30:00Z" };
    const r = standardQuote("US", [old, newer], now);
    expect(r.status === "ok" && r.quote.price).toBe(9);
  });
  it("future, wrong-currency and over-72-hour quotes cannot price a sale", () => {
    const future = { ...q(5, "2026-10-12T00:00:00Z"), fetched_at: "2026-10-11T11:00:00Z" };
    expect(standardQuote("US", [future], now).status).not.toBe("ok");
    expect(standardQuote("US", [{ ...future, currency: "CAD" }], now).status).toBe("missing");
    const tooOld = { ...q(5, "2026-10-12T00:00:00Z"), fetched_at: "2026-10-08T09:59:00Z" };
    expect(standardQuote("US", [tooOld], now).status).toBe("stale");
  });
});
