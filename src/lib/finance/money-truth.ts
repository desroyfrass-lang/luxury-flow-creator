// ─────────────────────────────────────────────────────────────────────────────
// STEP 5 · SLICE 1 — MONEY TRUTH SAFETY
//
// One rule, in one place: Frass only calls money settled, verified, cleared or
// available when a trusted payment provider has confirmed it.
//
// Today Frass has NO provider confirmation rail. A customer approving a payment
// request is only handed over to the seller's own payment link, and a seller
// ticking "paid" is the seller's own word. Both are real events worth recording
// — neither is proof that money arrived.
//
// Plain English: "the seller says it's paid" is not the same as "the money is
// confirmed". Until Frass can check with the payment provider, every one of
// these stays "awaiting verification".
// ─────────────────────────────────────────────────────────────────────────────

import type { ReceiptStatus } from "@/lib/finance/receipts";

/** No provider confirmation rail exists yet. Slice 1 never pretends otherwise. */
export const PROVIDER_VERIFICATION_AVAILABLE = false;

export const AWAITING_VERIFICATION_LABEL = "Awaiting payment verification";
export const SELLER_DECLARED_LABEL = "Seller marked paid — not verified";

export const SELLER_DECLARED_NOTE =
  "The seller marked this paid. Frass has not verified it with a payment provider, so it is not counted as cleared or available money.";

export const HANDOFF_NOTE =
  "The customer approved and was sent to the seller's own payment page. That is a handoff, not proof of payment.";

export const AWAITING_VERIFICATION_NOTE =
  "This is recorded, but no payment provider has confirmed the money yet.";

/**
 * Could this record ever be treated as money that has cleared?
 * Always false in Slice 1 — a card order's status is seller-declared.
 */
export function isProviderVerified(_source: "card-order" | "payment-request"): boolean {
  return PROVIDER_VERIFICATION_AVAILABLE;
}

/**
 * Receipt status for a Frass Card order. A seller-declared "paid" produces a
 * PENDING receipt, never a settled one, so no balance can call it available.
 *
 * STEP 5 · SLICE 3 — a provider-verified order is still PENDING here: verified
 * means the provider confirmed the money, not that it is settled or paid out.
 */
export function receiptStatusForOrder(orderStatus: string): ReceiptStatus {
  switch (orderStatus) {
    case "refunded":
      return "refunded";
    case "cancelled":
      return "cancelled";
    // "paid" is the seller's own declaration — awaiting verification.
    // "verified" is provider-confirmed, but not settled or withdrawn.
    case "verified":
    case "paid":
    default:
      return "pending";
  }
}


/** Extra plain-English line attached to receipts that came from a seller declaration. */
export function unverifiedReceiptNote(orderStatus: string, existing: string | null): string | null {
  if (orderStatus !== "paid") return existing;
  return existing ? `${existing} · ${SELLER_DECLARED_NOTE}` : SELLER_DECLARED_NOTE;
}
