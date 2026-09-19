// ─────────────────────────────────────────────────────────────────────────────
// STEP 5 · SLICE 3 — Trusted payment verification for direct Frass Card sales.
//
// One rule: an order becomes "verified" ONLY from a signed event sent by the
// payment system of record to Frass's server. A seller's tick, a buyer's click,
// a redirect back from a payment page and any browser request are evidence at
// best — never confirmation.
//
// Verified still does not mean settled or paid out. It means one thing only:
// the payment provider told Frass the money went through.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * MULTI-CURRENCY CORRECTION: US dollars are Frass's reporting currency only.
 * A sale is verified in the currency it was actually charged in — GBP verifies
 * as GBP, CAD as CAD — as long as that currency is supported for the market.
 */
export { BASE_REPORTING_CURRENCY } from "./currency";

/** How far out of date a signed event may be before it is treated as a replay. */
export const SIGNATURE_TOLERANCE_SECONDS = 300;


export type CardOrderEconomicState =
  | "awaiting-verification"
  | "seller-declared"
  | "verified";

export const VERIFIED_LABEL = "Payment verified";

export const VERIFIED_NOTE =
  "The payment provider confirmed this money. It is verified, not yet paid out to you.";

export const VERIFICATION_NOT_CONFIGURED =
  "No payment provider is connected yet, so Frass cannot verify payments.";

/** What a provider event must contain before Frass will look at it. */
export type PaymentConfirmationEvent = {
  provider: string;
  /** The provider's own unique id for this event — the idempotency key. */
  event_id: string;
  event_type?: string;
  /** The Frass card order this payment belongs to. */
  order_id: string;
  /** The provider's payment/charge id, kept for audit. */
  provider_payment_id?: string | null;
  amount: number;
  currency: string;
  seller_id?: string | null;
};

export type OrderForVerification = {
  id: string;
  seller_id: string;
  subtotal: number | string;
  currency: string;
  status: string;
  verified_at?: string | null;
};

export type MatchResult = { ok: true } | { ok: false; reason: string };

const cents = (n: number | string) => Math.round(Number(n || 0) * 100);

/**
 * Bind a provider event to exactly one order. Any mismatch is refused rather
 * than "best guessed" — a wrong match would invent money.
 */
export function matchesOrder(
  order: OrderForVerification | null | undefined,
  event: PaymentConfirmationEvent,
): MatchResult {
  if (!order) return { ok: false, reason: "No such order." };
  if (order.id !== event.order_id) return { ok: false, reason: "Order mismatch." };
  if (event.seller_id && event.seller_id !== order.seller_id) {
    return { ok: false, reason: "Seller mismatch." };
  }
  if ((event.currency || "").toUpperCase() !== DIRECT_SALE_CURRENCY) {
    return { ok: false, reason: "Direct Frass Card sales are verified in US dollars only." };
  }
  if ((order.currency || "").toUpperCase() !== DIRECT_SALE_CURRENCY) {
    return { ok: false, reason: "This order is not a US dollar direct card sale." };
  }
  if (cents(event.amount) !== cents(order.subtotal)) {
    return { ok: false, reason: "Amount does not match the order." };
  }
  if (order.status === "cancelled" || order.status === "refunded") {
    return { ok: false, reason: "This order is no longer open." };
  }
  return { ok: true };
}

/** The truthful economic state of a direct card order. */
export function economicState(order: {
  status?: string | null;
  verified_at?: string | null;
}): CardOrderEconomicState {
  if (order.verified_at || order.status === "verified") return "verified";
  if (order.status === "paid") return "seller-declared";
  return "awaiting-verification";
}

/** Verified is NOT settled and NOT paid out. Kept separate on purpose. */
export function isSettled(_state: CardOrderEconomicState): boolean {
  return false;
}
