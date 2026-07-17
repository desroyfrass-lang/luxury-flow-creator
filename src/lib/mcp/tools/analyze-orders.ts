import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, unauth, requireAdmin } from "../_helpers";

export default defineTool({
  name: "analyze_orders",
  title: "Analyze orders & sales",
  description:
    "Read-only sales analysis: revenue totals, order counts, best-selling items, and recent orders over a lookback window.",
  inputSchema: {
    days: z.number().int().min(1).max(365).optional().describe("Lookback window in days. Default 30."),
    topN: z.number().int().min(1).max(50).optional().describe("Top N best-sellers to return. Default 10."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ days, topN }, ctx) => {
    if (!ctx.isAuthenticated()) return unauth();
    const sb = supabaseForUser(ctx);
    const admin = await requireAdmin(ctx, sb);
    if (!admin.ok) return { content: [{ type: "text", text: admin.err }], isError: true };

    const windowDays = days ?? 30;
    const top = topN ?? 10;
    const since = new Date(Date.now() - windowDays * 86400_000).toISOString();

    const [orders, items] = await Promise.all([
      sb.from("orders").select("id, total, status, created_at, currency").gte("created_at", since),
      sb.from("order_items").select("order_id, product_title, variant_title, quantity, price, created_at").gte("created_at", since),
    ]);

    if (orders.error) return { content: [{ type: "text", text: orders.error.message }], isError: true };
    if (items.error) return { content: [{ type: "text", text: items.error.message }], isError: true };

    const ords = orders.data ?? [];
    const its = items.data ?? [];

    const revenue = ords.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const byStatus: Record<string, number> = {};
    for (const o of ords) byStatus[o.status ?? "unknown"] = (byStatus[o.status ?? "unknown"] ?? 0) + 1;

    const productAgg = new Map<string, { title: string; units: number; revenue: number }>();
    for (const it of its) {
      const key = it.product_title ?? "Unknown";
      const cur = productAgg.get(key) ?? { title: key, units: 0, revenue: 0 };
      cur.units += Number(it.quantity) || 0;
      cur.revenue += (Number(it.price) || 0) * (Number(it.quantity) || 0);
      productAgg.set(key, cur);
    }
    const bestSellers = [...productAgg.values()]
      .sort((a, b) => b.units - a.units)
      .slice(0, top)
      .map((r) => ({ ...r, revenue: Number(r.revenue.toFixed(2)) }));

    const recent = [...ords]
      .sort((a, b) => (b.created_at > a.created_at ? 1 : -1))
      .slice(0, 10);

    const report = {
      windowDays,
      since,
      totals: {
        orders: ords.length,
        revenue: Number(revenue.toFixed(2)),
        avgOrderValue: ords.length ? Number((revenue / ords.length).toFixed(2)) : 0,
      },
      byStatus,
      bestSellers,
      recentOrders: recent,
    };

    return {
      content: [{ type: "text", text: JSON.stringify(report, null, 2) }],
      structuredContent: report,
    };
  },
});
