import { beforeEach, describe, expect, it, vi } from "vitest";
import { mapQueueRow, stationPricing, SUGGESTED_NAMES } from "./cj-station";

vi.mock("@/integrations/supabase/auth-middleware", () => ({ requireSupabaseAuth: {} }));
vi.mock("@tanstack/react-start", () => ({ createServerFn: () => {
  let validate = (input: unknown): any => input;
  const chain = { middleware: () => chain, inputValidator: (v: typeof validate) => { validate = v; return chain; }, handler: (...hs: any[]) => { const h = hs[hs.length - 1];
    const execute = (arg: any) => h({ ...arg, data: validate(arg.data) });
    return Object.assign(execute, { __executeServer: execute });
  } };
  return chain;
} }));
const { listCjStation, saveCjStationDraft, reopenCjStationItem } = await import("./cj-station.functions");

const uuid = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
// Shapes copied from real stored queue rows.
const seed = () => [
  { id: uuid(1), cj_pid: "2607170938071630700", title: "Lace Long Dress Women", image_url: "https://cf.cjdropshipping.com/quick/product/63490e39.jpg", source_price: 20.05, status: "pending", created_at: "1",
    cj_data: { pid: "2607170938071630700", productNameEn: "Lace Long Dress Women", productSku: "CJLY1", sellPrice: "20.05", categoryName: "Dresses", productWeight: 300, productImage: "https://cf.cjdropshipping.com/quick/product/63490e39.jpg" } },
  { id: uuid(2), cj_pid: "2607170943591639200", title: "Shoulder Bag", image_url: "https://cf.cjdropshipping.com/quick/product/d3e501b3.jpg", source_price: 7.63, status: "pending", created_at: "2",
    cj_data: { pid: "2607170943591639200", productNameEn: "Shoulder Bag", productSku: "CJBG2", sellPrice: "7.63", categoryName: "Bags", productImage: "[\"https://cf.cjdropshipping.com/a.jpg\",\"https://cf.cjdropshipping.com/b.jpg\"]" } },
  { id: uuid(3), cj_pid: "2607171059411638500", title: "Unpriced Item", image_url: "https://cf.cjdropshipping.com/quick/product/e430bb27.jpg", source_price: null, status: "pending", created_at: "3",
    cj_data: { pid: "2607171059411638500", productNameEn: "Unpriced Item" } },
];
let queue: any[]; let sources: any[]; let admin: boolean; let rpcFail: any; let rpcCalls: number; let queueUpdateFail: boolean;
const owner = "founder";
const vendorId = uuid(99);
const context = { userId: owner, supabase: {
  rpc: async (name: string, p: any) => {
    if (name === "has_role") return { data: admin && p._role === "admin", error: null };
    rpcCalls++;
    if (rpcFail) return { data: null, error: rpcFail };
    const id = uuid(500 + rpcCalls);
    sources.push({ product_id: id, source_type: p._source_type, source_ref: p._source_ref, payload: p });
    return { data: id, error: null };
  },
  from: (table: string) => {
    const f: Array<[string, string, any]> = []; let op = "read"; let payload: any;
    const match = (r: any) => f.every(([k, kind, v]) => kind === "in" ? v.includes(r[k]) : r[k] === v);
    const rows = () => table === "cj_import_queue" ? queue : table === "product_sources" ? sources : [{ id: vendorId, owner_id: owner, vendor_kind: "supplier" }];
    const run = () => {
      if (op === "update") {
        if (queueUpdateFail) return { data: null, error: { message: "boom" } };
        const hit = queue.filter(match); hit.forEach((r) => Object.assign(r, payload));
        return { data: hit, error: null };
      }
      return { data: rows().filter(match), error: null };
    };
    const c: any = { select: () => c, order: () => c, limit: () => c,
      eq: (k: string, v: any) => { f.push([k, "eq", v]); return c; }, in: (k: string, v: any) => { f.push([k, "in", v]); return c; },
      update: (p: any) => { op = "update"; payload = p; return c; },
      maybeSingle: async () => { const r = run(); return { data: r.data?.[0] ?? null, error: r.error }; },
      then: (res: any) => Promise.resolve(run()).then(res) };
    return c;
  },
} };
const list = () => (listCjStation as any)({ context });
const save = (queueId: string, o: Record<string, unknown> = {}) => (saveCjStationDraft as any)({ context, data: { queueId, vendorId, finalName: "The Empress Lace Maxi", primaryStore: "drip", categoryKey: "drip/womens-work-drip-work-blouses", ...o } });

beforeEach(() => { queue = seed(); sources = []; admin = true; rpcFail = null; rpcCalls = 0; queueUpdateFail = false; });

describe("source → station values for three distinct records", () => {
  it("maps each record's own photo, name, ID, cost — nothing carried over", async () => {
    const { items, counts } = await list();
    expect(counts).toEqual({ pending: 3, drafted: 0 });
    expect(items.map((i: any) => [i.cjPid, i.supplierTitle, i.supplierCost])).toEqual([
      ["2607170938071630700", "Lace Long Dress Women", 20.05], ["2607170943591639200", "Shoulder Bag", 7.63], ["2607171059411638500", "Unpriced Item", null]]);
    expect(items[0].images[0]).toBe("https://cf.cjdropshipping.com/quick/product/63490e39.jpg");
    expect(items[1].images).toHaveLength(3);
    expect(items[0].suggestedName).toBe("The Empress Lace Maxi");
    expect(items[0].workingName).toBeNull();
    expect(items[2].missing).toContain("Supplier cost");
    expect(items[2].sourceSku).toBeNull();
    for (const i of items) { expect(stationPricing(i).margin).toBeNull(); expect(stationPricing(i).shipping).toBeNull(); }
  });
  it("carries the five Founder working names as suggestions only", () => {
    expect(Object.keys(SUGGESTED_NAMES)).toHaveLength(5);
    expect(mapQueueRow(seed()[1] as any).suggestedName).toBe("Rebel Chic Shoulder Bag");
  });
});

describe("saving drafts", () => {
  it("saves a private draft from the stored record, marks drafted, keeps CJ snapshot, reloads", async () => {
    const r = await save(uuid(1));
    expect(r).toMatchObject({ reused: false, queueStatus: "drafted", published: false });
    expect(sources[0].payload._supplier_original_name).toBe("Lace Long Dress Women");
    expect(sources[0].payload._offer.unit_cost).toBe(20.05);
    expect(queue[0].cj_data.productNameEn).toBe("Lace Long Dress Women");
    const after = await list();
    expect(after.counts).toEqual({ pending: 2, drafted: 1 });
    expect(after.items[0]).toMatchObject({ status: "drafted", workingName: "The Empress Lace Maxi", draftProductId: r.productId });
  });
  it("is idempotent across retries and duplicate-key races", async () => {
    const a = await save(uuid(2), { finalName: "Rebel Chic Shoulder Bag", categoryKey: "drip/womens-work-drip-work-blouses" });
    const b = await save(uuid(2), { finalName: "Rebel Chic Shoulder Bag" });
    expect(b.productId).toBe(a.productId); expect(b.reused).toBe(true); expect(rpcCalls).toBe(1);
  });
  it("on failure keeps the record pending and reports an error", async () => {
    rpcFail = { message: "db down" };
    await expect(save(uuid(3), { finalName: "Test Name" })).rejects.toThrow("Draft not saved");
    expect(queue[2].status).toBe("pending");
    rpcFail = null; queueUpdateFail = true;
    await expect(save(uuid(3), { finalName: "Test Name" })).rejects.toThrow("Saving again is safe");
    queueUpdateFail = false;
    const retry = await save(uuid(3), { finalName: "Test Name" });
    expect(retry.reused).toBe(true); expect(rpcCalls).toBe(2); expect(sources).toHaveLength(1);
  });
  it("reopen reverses drafted to pending without deleting the draft", async () => {
    await save(uuid(1));
    await (reopenCjStationItem as any)({ context, data: { queueId: uuid(1) } });
    expect(queue[0].status).toBe("pending"); expect(sources).toHaveLength(1);
  });
  it("denies non-Founder accounts everything", async () => {
    admin = false;
    await expect(list()).rejects.toThrow("Founder access only");
    await expect(save(uuid(1))).rejects.toThrow("Founder access only");
    expect(rpcCalls).toBe(0); expect(queue[0].status).toBe("pending");
  });
  it("never publishes or touches Shopify/CJ", async () => {
    const { readFileSync } = await import("node:fs");
    const src = readFileSync("src/lib/vendors/cj-station.functions.ts", "utf8").split("\n").filter((l) => !l.trim().startsWith("//")).join("\n");
    expect(src).not.toMatch(/shopify|cjGet|publication_status|publish\(/i);
  });
});
