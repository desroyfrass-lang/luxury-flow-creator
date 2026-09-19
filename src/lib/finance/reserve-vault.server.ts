// ─────────────────────────────────────────────────────────────────────────────
// RESERVE VAULT (server-only rules).
//
// The 3% Reserve Vault is part of the universal 10% Frass ecosystem allocation.
// It is HELD BY FRASS — it is not the Builder's own money, and it must never be
// presented as a Builder-owned "Project Fund". The Builder's share is the 90%.
//
// Entries are recorded against the sale they came from (owner_id = the seller
// whose transaction produced the allocation) purely for traceability.
//
// Two hard rules, enforced here and in the database:
//   1. Nothing may be posted until a payment provider has confirmed the money
//      through the signed server confirmation path.
//   2. A browser can never write a row — only trusted server code, via this
//      module.
//
// Storage note: rows live in the existing `builder_protected_fund_entries`
// table. The table name predates this correction; no data is migrated or
// deleted. Every row written here is labelled `reserve-vault` so the ecosystem
// reserve is never mistaken for Builder-owned money.
// ─────────────────────────────────────────────────────────────────────────────

import { UNIVERSAL_ALLOCATION, allocateEarning } from "./allocation";
import { checkSaleCurrency } from "./currency";

export type ReserveVaultPosting = {
  /** The seller whose transaction produced this allocation (traceability). */
  ownerId: string;
  vaultId?: string | null;
  /** Where the money came from — the idempotency key with sourceRef. */
  sourceKind: "card-order" | "card-payment";
  sourceRef: string;
  gross: number;
  /**
   * The ACTUAL transaction currency of the sale (ISO 4217). Required — the
   * reserve is kept in the money the customer really paid, never relabelled
   * or converted.
   */
  currency: string;
  /** Proof from a payment provider. Without it, nothing is posted. */
  verifiedAt?: string | null;
  /**
   * The recorded provider confirmation that justifies this posting. Only the
   * trusted webhook path can supply one, so no browser request can post money.
   */
  confirmationId?: string | null;
};

export type ReserveVaultResult =
  | { posted: true; id: string }
  | { posted: false; reason: string };

export const NO_VERIFICATION_REASON =
  "No payment provider has confirmed this money, so nothing was recorded in the Reserve Vault.";

export const RESERVE_VAULT_NOTE =
  "The 3% Reserve Vault is part of the 10% Frass ecosystem allocation. It is held by Frass, not by you — your share is the 90%.";

/**
 * Record the verified 3% ecosystem Reserve Vault allocation. Idempotent on
 * (owner, source kind, source reference) so a repeated confirmation can never
 * record the same sale twice.
 */
export async function postReserveVaultEntry(
  posting: ReserveVaultPosting,
): Promise<ReserveVaultResult> {
  if (!posting.confirmationId || !posting.verifiedAt) {
    return { posted: false, reason: NO_VERIFICATION_REASON };
  }
  if (!posting.ownerId || !posting.sourceRef) {
    return { posted: false, reason: "A Reserve Vault entry needs an owner and a source." };
  }

  const supported = checkSaleCurrency(posting.currency);
  if (!supported.ok) return { posted: false, reason: supported.reason };

  const split = allocateEarning(posting.gross, supported.currency);
  if (split.reserve <= 0) {
    return { posted: false, reason: "Nothing to reserve on a zero sale." };
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
        amount: split.reserve,
        rate_pct: UNIVERSAL_ALLOCATION.reserve,
        // The reserve is kept in the currency the sale was actually paid in.
        currency: split.currency,
        note: "reserve-vault · Frass ecosystem allocation, not Builder-owned",
        state: "posted",
        verified_at: posting.verifiedAt,
        confirmation_id: posting.confirmationId,
      },
      { onConflict: "owner_id,source_kind,source_ref", ignoreDuplicates: true },
    )
    .select("id")
    .maybeSingle();

  if (error) throw error;
  return data?.id
    ? { posted: true, id: data.id }
    : { posted: false, reason: "This sale is already recorded in the Reserve Vault." };
}
