import { describe, expect, it } from "vitest";
import { canRefreshDetail, mapCjQueueDetail, mapQueueRow, DETAIL_REFRESH_MIN_MS } from "./cj-station";

const raw = {
  pid: "P1", productNameEn: "Lace Maxi", productSku: "SKU1", sellPrice: 20.05, productKeyEn: "Color-Size",
  productImageSet: ["https://cf.cjdropshipping.com/a.jpg", "https://cf.cjdropshipping.com/b.jpg", "http://insecure/x.jpg"],
  description: "<p>Lace</p>",
  variants: [
    { vid: "V1", variantSku: "S1", variantKey: "Apricot-S", variantSellPrice: 20.05, variantWeight: 520, variantImage: "https://cf.cjdropshipping.com/v1.jpg" },
    { vid: "V2", variantSku: "S2", variantKey: "Apricot-M", variantSellPrice: 21.1, variantWeight: 540, variantImage: "https://cf.cjdropshipping.com/a.jpg" },
  ],
};

describe("CJ supplier detail foundation", () => {
  it("keeps only genuine https images, deduplicated, with no invented dimensions", () => {
    const d = mapCjQueueDetail(raw, "P1", "2026-10-12T00:00:00Z");
    expect(d.images.map((i) => i.url)).toEqual(["https://cf.cjdropshipping.com/a.jpg", "https://cf.cjdropshipping.com/b.jpg", "https://cf.cjdropshipping.com/v1.jpg"]);
    expect(d.images.every((i) => i.width === null && i.height === null)).toBe(true);
  });
  it("keeps each variant's own cost, colour and size", () => {
    const d = mapCjQueueDetail(raw, "P1", "t");
    expect(d.variants.map((v) => [v.colour, v.size, v.cost])).toEqual([["Apricot", "S", 20.05], ["Apricot", "M", 21.1]]);
    expect(d.colours).toEqual(["Apricot"]); expect(d.sizes).toEqual(["S", "M"]);
  });
  it("never invents stock and refuses a different product", () => {
    expect(mapCjQueueDetail(raw, "P1", "t").inventory.status).toBe("not_fetched");
    expect(() => mapCjQueueDetail(raw, "OTHER", "t")).toThrow();
  });
  it("returns no variants when CJ lists none", () => {
    expect(mapCjQueueDetail({ pid: "P1" }, "P1", "t").variants).toEqual([]);
  });
  it("rate-limits refreshes to once per 10 minutes", () => {
    const now = Date.parse("2026-10-12T01:00:00Z");
    expect(canRefreshDetail(null, now)).toBe(true);
    expect(canRefreshDetail(new Date(now - DETAIL_REFRESH_MIN_MS + 1000).toISOString(), now)).toBe(false);
    expect(canRefreshDetail(new Date(now - DETAIL_REFRESH_MIN_MS).toISOString(), now)).toBe(true);
  });
  it("station item shows cached detail and flags unfetched records", () => {
    const base = { id: "q", cj_pid: "P1", cj_data: {}, title: null, image_url: null, source_price: null, status: "pending" };
    expect(mapQueueRow(base).detail).toBeNull();
    expect(mapQueueRow(base).missing.join(" ")).toMatch(/not fetched/);
    const d = mapCjQueueDetail(raw, "P1", "t");
    expect(mapQueueRow({ ...base, cj_detail: d, cj_detail_fetched_at: "t" }).detail?.variants.length).toBe(2);
  });
});
