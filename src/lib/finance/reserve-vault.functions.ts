import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * The 3% Reserve Vault allocations recorded against this Builder's own
 * verified sales. This money is held by FRASS as part of the universal 10%
 * ecosystem allocation — it is not the Builder's money. Read-only and
 * owner-scoped: the browser can never write one of these rows.
 *
 * Totals are reported PER CURRENCY. Money earned in different currencies is
 * never added into one number, and no US dollar equivalent is produced unless
 * a real exchange rate with a source and a time is available.
 */
export const listMyReserveVaultEntries = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { sumByCurrency, NO_FX_SOURCE_REASON } = await import("@/lib/finance/currency");
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
      /** One total per transaction currency — never combined. */
      postedTotals: sumByCurrency(posted),
      /** Reporting equivalent stays separate, and honest when unavailable. */
      usdEquivalent: { available: false as const, reason: NO_FX_SOURCE_REASON },
      ownedByFrass: true as const,
    };
  });
