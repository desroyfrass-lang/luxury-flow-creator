// ─────────────────────────────────────────────────────────────────────────────
// UNIVERSAL ALLOCATION LEDGER (server only).
//
// Writes the six permanent ledger entries for a provider-confirmed payment.
// Unreachable from a browser: only the signed webhook path calls this, and the
// table grants no INSERT to any signed-in role.
//
// Idempotency: the database holds UNIQUE (confirmation_id, share). Replaying
// the same Stripe event therefore cannot create a second set of entries.
// ─────────────────────────────────────────────────────────────────────────────

import { allocationLedgerRows, type AllocationLedgerInput } from "./allocation-ledger";
import { checkSaleCurrency } from "./currency";

export type AllocationLedgerResult =
  | { posted: true; inserted: number; duplicate: boolean }
  | { posted: false; reason: string };

export const NO_CONFIRMATION_REASON =
  "No payment provider has confirmed this money, so no allocation was recorded.";

export async function postAllocationLedger(
  input: AllocationLedgerInput,
): Promise<AllocationLedgerResult> {
  if (!input.confirmationId || !input.verifiedAt) {
    return { posted: false, reason: NO_CONFIRMATION_REASON };
  }
  if (!input.earnerId || !input.sourceRef || !input.orderId) {
    return { posted: false, reason: "An allocation needs an order, a source and an earner." };
  }

  const supported = checkSaleCurrency(input.currency);
  if (!supported.ok) return { posted: false, reason: supported.reason };

  const rows = allocationLedgerRows({ ...input, currency: supported.currency });
  if (rows.every((r) => r.amount <= 0)) {
    return { posted: false, reason: "Nothing to allocate on a zero sale." };
  }

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("allocation_ledger_entries")
    .upsert(rows, { onConflict: "confirmation_id,share", ignoreDuplicates: true })
    .select("id");

  if (error) throw error;
  const inserted = data?.length ?? 0;
  return { posted: true, inserted, duplicate: inserted === 0 };
}
