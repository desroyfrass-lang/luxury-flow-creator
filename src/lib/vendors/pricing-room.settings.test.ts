import { beforeEach, describe, expect, it, vi } from "vitest";
import { ILLUSTRATIVE_INPUTS } from "@/lib/commerce/pricing-worksheet";

vi.mock("@/integrations/supabase/auth-middleware", () => ({ requireSupabaseAuth: {} }));
vi.mock("@tanstack/react-start", () => ({ createServerFn: () => {
  let validate = (input: unknown): any => input;
  const chain = { middleware: () => chain, inputValidator: (v: typeof validate) => { validate = v; return chain; }, handler: (...handlers: any[]) => {
    const h = handlers[handlers.length - 1];
    const execute = (arg: any) => h({ ...arg, data: validate(arg.data) });
    return Object.assign(execute, { __executeServer: execute });
  } };
  return chain;
} }));
const { savePricingWorksheet, getPricingWorksheet, approvePricingWorksheet } = await import("./pricing-room.functions");
const productId = "00000000-0000-4000-8000-000000000001";
const rows = new Map<string, any>();
let admin = true;
let founder = false;
const context = { userId: "actor", supabase: {
  rpc: async (_name: string, p: any) => ({ data: p._role === "super_admin" ? founder : admin, error: null }),
  from: (table: string) => {
    const filters: Record<string, any> = {};
    let payload: any;
    let operation = "read";
    const result = () => {
      if (table === "canonical_products") return { data: { id: productId }, error: null };
      if (table === "canonical_product_variants") return { data: [], error: null };
      const old = rows.get(filters.destination);
      if (operation === "read") return { data: old ?? null, error: null };
      if (operation === "update" && old?.revision !== filters.revision) return { data: null, error: null };
      const next = { ...payload, revision: (old?.revision ?? 0) + 1, updated_at: "2026-10-12T12:00:00Z", approval_status: old?.approval_status === "approved" ? "revised_after_approval" : "draft", approved_revision: old?.approved_revision ?? null };
      rows.set(payload.destination ?? filters.destination, next);
      return { data: next, error: null };
    };
    const chain: any = { select: () => chain, eq: (k: string, v: any) => { filters[k] = v; return chain; }, limit: () => chain,
      insert: (p: any) => { payload = p; operation = "insert"; return chain; }, update: (p: any) => { payload = p; operation = "update"; return chain; },
      maybeSingle: async () => result(), single: async () => result(), then: (resolve: any) => Promise.resolve(result()).then(resolve) };
    return chain;
  },
} };
const save = (o: Record<string, unknown> = {}) => (savePricingWorksheet as any)({ context, data: { productId, destination: "US", finalPrice: 30, inputs: ILLUSTRATIVE_INPUTS, summary: { status: "forged", marginPct: 90, approvable: true }, ...o } });
beforeEach(() => { rows.clear(); admin = true; founder = false; });
describe("settings server boundary", () => {
  it("round trips isolated notes and replaces client summary with authoritative blocked math", async () => {
    await save({ inputs: { ...ILLUSTRATIVE_INPUTS, founderNotes: "US only" } });
    await save({ destination: "CA", inputs: { ...ILLUSTRATIVE_INPUTS, founderNotes: "Canada only" } });
    const us = await (getPricingWorksheet as any)({ context, data: { productId, destination: "US" } });
    expect(us.inputs.founderNotes).toBe("US only");
    expect(rows.get("CA").inputs.founderNotes).toBe("Canada only");
    expect(rows.get("US").summary.approvable).toBe(false);
    expect(rows.get("US").summary.status).toBe("blocked");
  });
  it("blocks non-admin settings reads and writes and non-Founder approval", async () => {
    admin = false;
    await expect(save()).rejects.toThrow("Founder access");
    await expect((getPricingWorksheet as any)({ context, data: { productId } })).rejects.toThrow("Founder access");
    admin = true;
    await expect((approvePricingWorksheet as any)({ context, data: { productId, expectedRevision: 1 } })).rejects.toThrow("Only the Founder");
    expect(rows.size).toBe(0);
  });
  it("refuses omitted/stale revisions and preserves the saved inputs", async () => {
    await save();
    await expect(save({ inputs: { ...ILLUSTRATIVE_INPUTS, founderNotes: "overwrite" } })).rejects.toThrow("version is required");
    await expect(save({ expectedRevision: 2 })).rejects.toThrow("changed elsewhere");
    expect(rows.get("US").revision).toBe(1);
  });
  it("rejects forged verified fees and unsupported shipping method preferences before writing", async () => {
    await expect(save({ inputs: { ...ILLUSTRATIVE_INPUTS, packagingCost: { amount: "0.50", state: "verified" } } })).rejects.toThrow("trusted source");
    await expect(save({ inputs: { ...ILLUSTRATIVE_INPUTS, shippingMethod: "Invented" } })).rejects.toThrow("fresh CJ quotes");
    expect(rows.size).toBe(0);
  });
});