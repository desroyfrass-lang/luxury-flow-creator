// FRASS-0540 — Founder AI Operations Dashboard.
// FRASS-0541 — Founder Platform Analytics (member success + business impact).
//
// One honest read of what Frass's intelligence is doing, costing, and producing.
// Every number comes from the platform's own records. Nothing is estimated
// unless it is labelled as an estimate.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { AiOperationsReport } from "./ai-operations";
import { buildAiOperationsReport } from "./ai-operations";

async function assertFounder(context: { supabase: any; userId: string }) {
  const role = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (role.data !== true) throw new Error("Founder access only.");
}

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();

export const aiOperationsSnapshot = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AiOperationsReport> => {
    await assertFounder(context);
    const sb = context.supabase;
    const count = { count: "exact" as const, head: true };

    const [ledger, wallets, publications, products, opportunities, orders, journeys, blueprints] =
      await Promise.all([
        sb
          .from("ai_credit_ledger")
          .select("amount, direction, label, processing_ms, created_at, metadata, user_id")
          .gte("created_at", daysAgo(30))
          .order("created_at", { ascending: false })
          .limit(5000),
        sb.from("ai_credit_wallets").select("balance, lifetime_used"),
        sb.from("legacy_publications").select("status", { count: "exact" }).limit(1000),
        sb.from("builder_products").select("id", count).gte("created_at", daysAgo(30)),
        sb.from("builder_opportunities").select("stage, potential_value").gte("updated_at", daysAgo(30)),
        sb.from("orders").select("subtotal, created_at").gte("created_at", daysAgo(30)),
        sb.from("builder_journeys").select("id", count).gte("created_at", daysAgo(30)),
        sb.from("member_success_blueprints").select("id", count),
      ]);

    return buildAiOperationsReport({
      ledger: ledger.data ?? [],
      wallets: wallets.data ?? [],
      publications: publications.data ?? [],
      productsLast30: products.count ?? 0,
      opportunities: opportunities.data ?? [],
      orders: orders.data ?? [],
      journeysLast30: journeys.count ?? 0,
      blueprints: blueprints.count ?? 0,
    });
  });
