// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0435 — Customer-Controlled Payment Flow
// FRASS-0436 — Instant Payment Request System
//
// Constitutional principle:
//   "The customer always completes payment on their own trusted device."
//
// The seller creates the sale. The customer authorises the payment. Payment
// credentials are never entered into another member's device, and the seller
// never sees a card number, a bank number, an expiry date or a security code.
//
// What this means in plain English: instead of handing over your phone or
// typing your card into someone else's tablet, the seller taps "Request
// payment" and a clean request lands on your own phone. You look at it, you
// approve it with the payment method you already trust, and you are done —
// like approving a bill on your phone rather than queuing at a till.
// ─────────────────────────────────────────────────────────────────────────────

export const CUSTOMER_CONTROL_PRINCIPLE =
  "The customer always completes payment on their own trusted device. The seller creates the sale; the customer authorises the payment.";

export const PAYMENT_REQUEST_PRINCIPLE =
  "A Frass Payment Request behaves like an invoice, but it is immediate. The customer reviews it, chooses how they want to pay, approves it, and the transaction is complete.";

/** Shown on the customer's secure screen. Reassurance, in plain words. */
export const SECURE_CHECKOUT_ASSURANCES = [
  "PCI-compliant payment processing",
  "Encrypted transaction",
  "Payment processed securely by the payment provider",
  "The seller never receives your banking or card information",
] as const;

/** What a seller can never see. Stated out loud, deliberately. */
export const SELLER_NEVER_SEES = [
  "Card number",
  "Bank account number",
  "Expiry date",
  "CVV",
  "Digital wallet credentials",
  "Security codes",
] as const;

/** What a seller does see. Everything they need, nothing they don't. */
export const SELLER_SEES = [
  "Payment successful",
  "Order number",
  "Customer name (when appropriate)",
  "Fulfilment information (when required)",
] as const;

/* ── Kinds of request ────────────────────────────────────────────────────── */

export const REQUEST_KINDS = [
  { id: "sale", label: "Sale", plain: "Something you are handing over." },
  { id: "service", label: "Service", plain: "Work you are doing for them." },
  { id: "booking", label: "Booking", plain: "A time slot you are holding." },
  { id: "ticket", label: "Ticket", plain: "Entry to something." },
  { id: "gift", label: "Gift", plain: "Sent with a note." },
  { id: "tip", label: "Tip", plain: "A thank-you for your work." },
  { id: "donation", label: "Donation", plain: "Support with nothing in return." },
  { id: "partnership", label: "Brand partnership", plain: "A partner invoice." },
  { id: "other", label: "Other", plain: "Anything else you are owed." },
] as const;

export type RequestKindId = (typeof REQUEST_KINDS)[number]["id"];
export const REQUEST_KIND_IDS = REQUEST_KINDS.map((k) => k.id) as [RequestKindId, ...RequestKindId[]];

export function requestKindLabel(id: string): string {
  return REQUEST_KINDS.find((k) => k.id === id)?.label ?? "Payment";
}

/* ── How the request reaches the customer ────────────────────────────────── */
// The delivery method changes. The experience never does.

export const DELIVERY_METHODS = [
  { id: "qr", label: "QR code", plain: "They scan it with their own camera." },
  { id: "link", label: "Payment link", plain: "Send it however you already talk." },
  { id: "sms", label: "Text message", plain: "Straight to their phone." },
  { id: "email", label: "Email", plain: "Useful when there is paperwork." },
  { id: "message", label: "Frass Messages", plain: "Inside Frass, member to member." },
  { id: "push", label: "Push notification", plain: "Future — when they have the Frass app." },
] as const;

export type DeliveryId = (typeof DELIVERY_METHODS)[number]["id"];
export const DELIVERY_IDS = DELIVERY_METHODS.map((d) => d.id) as [DeliveryId, ...DeliveryId[]];

export function deliveryLabel(id: string): string {
  return DELIVERY_METHODS.find((d) => d.id === id)?.label ?? "Payment link";
}

/* ── Status ──────────────────────────────────────────────────────────────── */

export type RequestStatus = "pending" | "paid" | "declined" | "cancelled" | "expired";

export const REQUEST_STATUS: Record<RequestStatus, { label: string; plain: string }> = {
  pending: { label: "Awaiting the customer", plain: "Sent. Not approved yet." },
  paid: { label: "Paid", plain: "Approved and recorded." },
  declined: { label: "Declined", plain: "The customer said no. Nothing was charged." },
  cancelled: { label: "Cancelled", plain: "You pulled it back." },
  expired: { label: "Expired", plain: "It ran out of time before it was approved." },
};

/* ── The link the customer opens ─────────────────────────────────────────── */

export function paymentRequestPath(token: string): string {
  return `/pay/${token}`;
}

export function paymentRequestUrl(token: string, origin?: string): string {
  const base =
    origin ?? (typeof window !== "undefined" ? window.location.origin : "https://frasskicks.com");
  return `${base}${paymentRequestPath(token)}`;
}

/** Short, unambiguous, no lookalike characters — it gets read out loud. */
export function newRequestToken(): string {
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  const bytes = new Uint8Array(14);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

export function isExpired(expires_at: string | null): boolean {
  return Boolean(expires_at && new Date(expires_at).getTime() < Date.now());
}

/** The one-line summary a customer sees before anything else. */
export function requestHeadline(sellerName: string, amount: number, title: string, currency = "USD"): string {
  const value = new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
  return `${sellerName} is requesting ${value} for ${title}.`;
}
