import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * A Builder's own Protected Project Fund — the 3% held back from their own
 * direct Frass Card sales. Read-only and owner-scoped: the browser can never
 * write one of these rows.
 */
export const listMyProtectedFund = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("builder_protected_fund_entries")
      .select("*")
      .eq("owner_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw error;
    const rows = data ?? [];
    const posted = rows.filter((r) => r.state === "posted");
    return {
      entries: rows,
      postedTotal: Math.round(posted.reduce((s, r) => s + Number(r.amount || 0), 0) * 100) / 100,
      currency: rows[0]?.currency ?? "USD",
    };
  });
