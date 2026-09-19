// ─────────────────────────────────────────────────────────────────────────────
// STEP 5 · SLICE 2 — Builder Protected Project Fund (server-only rules).
//
// The 3% protected share is the BUILDER'S OWN money, held back from their own
// direct Frass Card sales for their project/business. It is never Frass
// revenue and never a Frass reserve.
//
// Two hard rules, enforced here and in the database:
//   1. Nothing may be posted while no payment provider has confirmed the money.
//      Slice 1 established that Frass has no confirmation rail yet, so every
//      call below refuses to post and says why.
//   2. A browser can never write a row. The table grants SELECT to signed-in
//      Builders and nothing else; only trusted server code (service role) can
//      insert, and only through this module.
// ─────────────────────────────────────────────────────────────────────────────

import { allocateDirectCardSale } from "./allocation";
import { PROVIDER_VERIFICATION_AVAILABLE } from "./money-truth";

export type ProtectedFundPosting = {
  ownerId: string;
  vaultId?: string | null;
  /** Where the money came from — used as the idempotency key with sourceRef. */
  sourceKind: "card-order" | "card-payment";
  sourceRef: string;
  gross: number;
  currency?: string;
  /** Proof from a payment provider. Without it, nothing is posted. */
  verifiedAt?: string | null;
};

export type ProtectedFundResult =
  | { posted: true; id: string }
  | { posted: false; reason: string };

export const NO_VERIFICATION_REASON =
  "No payment provider has confirmed this money, so nothing was credited to the Project Fund.";

/**
 * Post a verified 3% protected-fund entry. Idempotent on
 * (owner, source kind, source reference) so a repeated confirmation can never
 * credit the same sale twice.
 *
 * Today this always refuses: verification does not exist yet (Slice 3).
 */
export async function postProtectedFundEntry(
  posting: ProtectedFundPosting,
): Promise<ProtectedFundResult> {
  if (!PROVIDER_VERIFICATION_AVAILABLE || !posting.verifiedAt) {
    return { posted: false, reason: NO_VERIFICATION_REASON };
  }
  if (!posting.ownerId || !posting.sourceRef) {
    return { posted: false, reason: "A protected-fund entry needs an owner and a source." };
  }

  const split = allocateDirectCardSale(posting.gross);
  if (split.builderProtectedVault <= 0) {
    return { posted: false, reason: "Nothing to protect on a zero sale." };
  }

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("builder_protected_fund_entries")
    .upsert(
      {
        owner_id: posting.ownerId,
        vault_id: posting.vaultId ?? null,
        source_kind: posting.sourceKind,
        source_ref: posting.sourceRef,
        transaction_type: "direct-card-sale",
        gross: split.gross,
        amount: split.builderProtectedVault,
        currency: (posting.currency ?? "USD").toUpperCase(),
        state: "posted",
        verified_at: posting.verifiedAt,
      },
      { onConflict: "owner_id,source_kind,source_ref", ignoreDuplicates: true },
    )
    .select("id")
    .maybeSingle();

  if (error) throw error;
  return data?.id
    ? { posted: true, id: data.id }
    : { posted: false, reason: "This sale is already recorded in the Project Fund." };
}
