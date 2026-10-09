// Pilot P1 — one CJ product, Founder-only, read-only from CJ.
// Nothing here imports the other 494 items, writes the CJ queue, publishes or
// touches Shopify products. The draft is created only after the Founder
// confirms the final name and category, and CJ data is re-read on the server
// (never trusted from the browser).
import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { validateClassification } from "@/lib/taxonomy/registry";
import { PILOT_CATEGORY, PILOT_CJ_PID, cleanSuggestions, isInMyProducts, mapCjDetail, NAME_STYLES, type PilotDetail } from "./cj-pilot";

async function requireFounderStaff(ctx: { supabase: any; userId: string }) {
  const [a, s] = await Promise.all([
    ctx.supabase.rpc("has_role", { _user_id: ctx.userId, _role: "admin" }),
    ctx.supabase.rpc("has_role", { _user_id: ctx.userId, _role: "super_admin" }),
  ]);
  if (a.error || s.error || !(a.data || s.data)) throw new Error("Founder access only.");
}

async function readPilotFromCj(): Promise<PilotDetail & { inMyProducts: true }> {
  const { cjGet } = await import("@/lib/cj.functions");
  // Ownership check: page through the Founder's own CJ "My Products" (read-only).
  let found = false;
  for (let page = 1; page <= 6 && !found; page++) {
    const res = await cjGet<{ content?: Array<Record<string, unknown>>; totalPages?: number }>(
      "/product/myProduct/query", { pageNumber: page, pageSize: 100 },
    );
    found = isInMyProducts(res.content ?? []);
    if (!res.totalPages || page >= res.totalPages) break;
  }
  if (!found) throw new Error("This product is not in your CJ My Products list. Nothing was created.");
  const raw = await cjGet<Record<string, unknown>>("/product/query", { pid: PILOT_CJ_PID });
  return { ...mapCjDetail(raw), inMyProducts: true };
}

export const getCjPilotDetail = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireFounderStaff(context);
    return readPilotFromCj();
  });

export const suggestPilotNames = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireFounderStaff(context);
    const detail = await readPilotFromCj();
    // Grounding: existing live store product names (real titles, not invented).
    let examples: string[] = [];
    try {
      const { storefrontApiRequest } = await import("@/lib/shopify");
      const r = await storefrontApiRequest<{ products: { edges: Array<{ node: { title: string } }> } }>(
        "query { products(first: 25, sortKey: UPDATED_AT, reverse: true) { edges { node { title } } } }",
      );
      examples = r.products.edges.map((e) => e.node.title).filter(Boolean).slice(0, 25);
    } catch { examples = []; }

    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Naming assistant unavailable right now.");
    const { createLovableAiGatewayProvider } = await import("@/lib/ai-gateway.server");
    const gateway = createLovableAiGatewayProvider(key);
    const { output } = await generateText({
      model: gateway("google/gemini-3.6-flash"),
      output: Output.object({
        schema: z.object({
          suggestions: z.array(z.object({ style: z.enum(NAME_STYLES), name: z.string(), why: z.string() })).length(3),
          recommended: z.enum(NAME_STYLES),
        }),
      }),
      prompt: [
        "You are Frassy, naming a women's work blouse for the Frass Drip store (Women → Work Drip → Work Blouses).",
        "Give exactly three distinct product names, one per style: simple_elegant, playful, caribbean_frass (warm Caribbean / Frass Hill spirit, no stereotypes).",
        "Names: 2–5 words, no supplier jargon, no sizes or colours, never claim materials not listed. The word FRASS is optional, not required. Brand is spelled Frass (two s).",
        "Recommend one style and say why in one short sentence each.",
        `Supplier facts: ${detail.originalName}. CJ category: ${detail.cjCategory ?? "unknown"}. Colours/sizes: ${detail.variants.map((v) => v.label).filter(Boolean).slice(0, 12).join(", ")}.`,
        examples.length ? `Match the tone of these existing store names: ${examples.join(" | ")}` : "No existing store names were available; keep the tone clean and confident.",
      ].join("\n"),
    });
    const suggestions = cleanSuggestions(output.suggestions, detail.originalName);
    return {
      suggestions,
      recommended: suggestions.some((s) => s.style === output.recommended) ? output.recommended : suggestions[0]?.style ?? null,
      groundedOn: examples.length,
    };
  });

export const createPilotDraft = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({
      vendorId: z.string().uuid(),
      finalName: z.string().trim().min(3).max(120),
      primaryStore: z.string(),
      categoryKey: z.string(),
      confirmName: z.literal(true),
      confirmCategory: z.literal(true),
    }).parse(i),
  )
  .handler(async ({ data, context }) => {
    await requireFounderStaff(context);
    // Pilot P1 is pinned to the Founder-approved category.
    if (data.primaryStore !== PILOT_CATEGORY.primaryStore || data.categoryKey !== PILOT_CATEGORY.categoryKey)
      throw new Error("Pilot P1 only allows Frass Drip → Women → Work Drip → Work Blouses.");
    const errs = validateClassification({ primaryStore: data.primaryStore, categoryKey: data.categoryKey });
    if (errs.length) throw new Error(`Category not valid: ${errs.join(", ")}`);

    // The brand must be the caller's own supplier brand. Verification is NOT required
    // and is never granted here — it stays as the Founder set it.
    const { data: vendor, error: vErr } = await context.supabase
      .from("vendor_profiles").select("id, owner_id, vendor_kind").eq("id", data.vendorId).maybeSingle();
    if (vErr || !vendor || vendor.owner_id !== context.userId || vendor.vendor_kind !== "supplier")
      throw new Error("Choose one of your own supplier brands.");

    const d = await readPilotFromCj(); // re-read on the server; browser data is never trusted
    const { data: productId, error } = await context.supabase.rpc("create_classified_product_draft", {
      _vendor_id: data.vendorId,
      _title: data.finalName,
      _description: "",
      _source_type: "cj",
      _source_ref: d.pid,
      _primary_store: data.primaryStore,
      _category_key: data.categoryKey,
      _supplier_original_name: d.originalName,
      _offer: {
        sku: d.sku || null, unit_cost: d.supplierCost, currency: d.currency,
        stock_quantity: null, lead_time_min_days: null, lead_time_max_days: null,
        fulfillment_mode: "dropship", ip_protection_level: "standard",
      },
      _media: d.images.map((url) => ({ url })),
      _variants: d.variants,
    });
    if (error) {
      if (error.code === "23505") throw new Error("This CJ product already has a draft.");
      throw new Error(error.message);
    }
    return { id: productId as string, draft_status: "draft" as const, publication_status: "unpublished" as const };
  });
