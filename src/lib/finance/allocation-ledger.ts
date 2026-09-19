// ─────────────────────────────────────────────────────────────────────────────
// UNIVERSAL ALLOCATION LEDGER (pure calculation — nothing is written here).
//
// After a payment provider has genuinely confirmed a payment, every one of the
// six universal shares is recorded as its own permanent ledger entry:
//
//   90% earner · 3% infrastructure · 3% Reserve Vault ·
//    2% Foundation · 1% Founder · 1% Co-Founder
//
// A recorded entry is an ACCOUNTING FACT, not money in hand. Recorded never
// means settled, available, withdrawn or paid out. No payout rail exists.
// ─────────────────────────────────────────────────────────────────────────────

import { UNIVERSAL_ALLOCATION, allocateEarning } from "./allocation";

export const ALLOCATION_SHARES = [
  "earner",
  "infrastructure",
  "reserve",
  "foundation",
  "founder",
  "cofounder",
] as const;

export type AllocationShare = (typeof ALLOCATION_SHARES)[number];

export type AllocationLedgerInput = {
  /** The trusted provider confirmation that justifies every entry. */
  confirmationId: string;
  orderId: string;
  sourceKind: "card-order" | "card-payment";
  sourceRef: string;
  /** The seller whose sale produced the allocation — the 90% earner. */
  earnerId: string;
  gross: number;
  /** The ACTUAL currency the customer paid. Never converted. */
  currency: string;
  verifiedAt: string;
  transactionType?: string;
};

export type AllocationLedgerRow = {
  confirmation_id: string;
  order_id: string;
  source_kind: string;
  source_ref: string;
  transaction_type: string;
  share: AllocationShare;
  beneficiary_kind: string;
  beneficiary_id: string | null;
  gross: number;
  rate_pct: number;
  amount: number;
  currency: string;
  state: "recorded";
  verified_at: string;
  note: string;
};

const SHARE_META: Record<
  AllocationShare,
  { pct: number; beneficiaryKind: string; note: string }
> = {
  earner: {
    pct: UNIVERSAL_ALLOCATION.earner,
    beneficiaryKind: "builder",
    note: "The Builder's 90% share of a provider-confirmed sale. Recorded, not settled or available.",
  },
  infrastructure: {
    pct: UNIVERSAL_ALLOCATION.infrastructure,
    beneficiaryKind: "frass-infrastructure",
    note: "Frass infrastructure share (3%).",
  },
  reserve: {
    pct: UNIVERSAL_ALLOCATION.reserve,
    beneficiaryKind: "frass-reserve-vault",
    note: "Reserve Vault (3%) — held by Frass, never the Builder's money.",
  },
  foundation: {
    pct: UNIVERSAL_ALLOCATION.foundation,
    beneficiaryKind: "frass-foundation",
    note: "Frass Foundation share (2%).",
  },
  founder: {
    pct: UNIVERSAL_ALLOCATION.founder,
    beneficiaryKind: "founder",
    note: "Founder share (1%).",
  },
  cofounder: {
    pct: UNIVERSAL_ALLOCATION.coFounder,
    beneficiaryKind: "co-founder",
    note: "Co-Founder share (1%).",
  },
};

/**
 * Build all six ledger rows for one confirmed payment, in the currency paid.
 * Pure: no database, no side effects. The caller is responsible for only ever
 * calling this with a genuine provider confirmation.
 */
export function allocationLedgerRows(input: AllocationLedgerInput): AllocationLedgerRow[] {
  const split = allocateEarning(input.gross, input.currency);
  const amountFor: Record<AllocationShare, number> = {
    earner: split.earner,
    infrastructure: split.infrastructure,
    reserve: split.reserve,
    foundation: split.foundation,
    founder: split.founder,
    cofounder: split.coFounder,
  };

  return ALLOCATION_SHARES.map((share) => {
    const meta = SHARE_META[share];
    return {
      confirmation_id: input.confirmationId,
      order_id: input.orderId,
      source_kind: input.sourceKind,
      source_ref: input.sourceRef,
      transaction_type: input.transactionType ?? "direct-card-sale",
      share,
      beneficiary_kind: meta.beneficiaryKind,
      beneficiary_id: share === "earner" ? input.earnerId : null,
      gross: split.gross,
      rate_pct: meta.pct,
      amount: amountFor[share],
      currency: split.currency,
      state: "recorded" as const,
      verified_at: input.verifiedAt,
      note: meta.note,
    };
  });
}

/** The six amounts must add back up to the gross, to the penny. */
export function ledgerTotal(rows: AllocationLedgerRow[]): number {
  return Math.round(rows.reduce((t, r) => t + r.amount, 0) * 100) / 100;
}

export const RECORDED_ALLOCATION_LABEL = "Recorded allocation (verified payment)";

export const RECORDED_ALLOCATION_NOTE =
  "Every share of this confirmed payment is permanently recorded. Recorded is an accounting record only — it is not settled, available or paid out.";
