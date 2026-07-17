import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, unauth, requireAdmin } from "../_helpers";

export default defineTool({
  name: "audit_catalog",
  title: "Audit catalog",
  description:
    "Read-only audit of products and collections: totals, price stats, and lists of products missing images, descriptions, or collection assignments. Use to spot catalog gaps.",
  inputSchema: {
    limit: z.number().int().min(1).max(200).optional().describe("Max rows per issue list. Default 25."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    if (!ctx.isAuthenticated()) return unauth();
    const sb = supabaseForUser(ctx);
    const admin = await requireAdmin(ctx, sb);
    if (!admin.ok) return { content: [{ type: "text", text: admin.err }], isError: true };
    const cap = limit ?? 25;

    const [products, collections, colProducts, images, virals] = await Promise.all([
      sb.from("products").select("id, title, description, price, status, vendor, product_type, handle"),
      sb.from("collections").select("id, handle, title"),
      sb.from("collection_products").select("product_id, collection_id"),
      sb.from("product_images").select("product_id"),
      sb.from("viral_products").select("id, title, price, is_active, image_url"),
    ]);

    const err = [products, collections, colProducts, images, virals].find((r) => r.error)?.error;
    if (err) return { content: [{ type: "text", text: err.message }], isError: true };

    const prods = products.data ?? [];
    const imgSet = new Set((images.data ?? []).map((i) => i.product_id));
    const inCol = new Set((colProducts.data ?? []).map((c) => c.product_id));

    const missingImages = prods.filter((p) => !imgSet.has(p.id)).slice(0, cap);
    const missingDesc = prods.filter((p) => !p.description || p.description.trim().length < 20).slice(0, cap);
    const uncategorized = prods.filter((p) => !inCol.has(p.id)).slice(0, cap);
    const prices = prods.map((p) => Number(p.price)).filter((n) => Number.isFinite(n) && n > 0);
    const viralsData = virals.data ?? [];

    const report = {
      products: {
        total: prods.length,
        active: prods.filter((p) => p.status === "active").length,
        priceStats: prices.length
          ? {
              min: Math.min(...prices),
              max: Math.max(...prices),
              avg: Number((prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2)),
            }
          : null,
      },
      collections: {
        total: collections.data?.length ?? 0,
        assignments: colProducts.data?.length ?? 0,
      },
      viralProducts: {
        total: viralsData.length,
        active: viralsData.filter((v) => v.is_active).length,
        missingImage: viralsData.filter((v) => !v.image_url).length,
      },
      issues: {
        productsMissingImages: { count: missingImages.length, sample: missingImages },
        productsMissingDescription: { count: missingDesc.length, sample: missingDesc },
        productsWithoutCollection: { count: uncategorized.length, sample: uncategorized },
      },
    };

    return {
      content: [{ type: "text", text: JSON.stringify(report, null, 2) }],
      structuredContent: report,
    };
  },
});
