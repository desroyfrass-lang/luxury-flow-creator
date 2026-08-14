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
// Here's the takeaway: instead of handing over your phone or
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

/* ── Status — FRASS-0439 ─────────────────────────────────────────────────── */
// Constitutional principle: every payment has one — and only one — final
// outcome. A payment can never be both successful and pending, and it can
// never be duplicated because someone tapped twice.
//
// These eight states are the whole vocabulary. Nothing else is allowed, in the
// database or in the interface.

export type RequestStatus =
  | "preparing"
  | "awaiting_approval"
  | "processing"
  | "successful"
  | "declined"
  | "cancelled"
  | "expired"
  | "refunded";

export const REQUEST_STATUS: Record<RequestStatus, { label: string; plain: string; tone: "open" | "good" | "closed" }> = {
  preparing: { label: "Preparing", plain: "The seller is still putting this together.", tone: "open" },
  awaiting_approval: { label: "Awaiting customer approval", plain: "Sent. Not approved yet — nothing has been charged.", tone: "open" },
  processing: { label: "Processing", plain: "Approved. The payment provider is finishing it right now.", tone: "open" },
  successful: { label: "Successful", plain: "Paid, recorded, and receipted.", tone: "good" },
  declined: { label: "Declined", plain: "The customer said no, or the provider refused it. Nothing was charged.", tone: "closed" },
  cancelled: { label: "Cancelled", plain: "The seller pulled it back before it was paid.", tone: "closed" },
  expired: { label: "Expired", plain: "It ran out of time before it was approved. Nothing was charged.", tone: "closed" },
  refunded: { label: "Refunded", plain: "It was paid, then returned in full.", tone: "closed" },
};

export const PAYMENT_STATES = Object.keys(REQUEST_STATUS) as RequestStatus[];

/** Open states can still change. Terminal states never change again. */
export const OPEN_STATES: RequestStatus[] = ["preparing", "awaiting_approval", "processing"];

export function isTerminal(status: string): boolean {
  return !OPEN_STATES.includes(status as RequestStatus);
}

export function statusLabel(status: string): string {
  return REQUEST_STATUS[status as RequestStatus]?.label ?? status;
}

export function statusPlain(status: string): string {
  return REQUEST_STATUS[status as RequestStatus]?.plain ?? "This request is closed.";
}

/* ── Duplicate protection ────────────────────────────────────────────────── */
// If a customer taps Pay twice, Frass recognises it is the same request: the
// second tap is ignored, and only one transaction, one receipt and one
// inventory adjustment ever exist.

export const DUPLICATE_PROTECTION_PROMISE =
  "One payment request can only ever produce one transaction, one receipt and one inventory adjustment. Tapping Pay twice does not charge you twice.";

/** A seller-side key so a double tap on "Request payment" makes one request. */
export function newIdempotencyKey(): string {
  return crypto.randomUUID();
}

/* ── Lost connection recovery ────────────────────────────────────────────── */
// If the internet drops mid-payment, the customer never has to guess. When
// they come back, Frass re-checks the one true state and tells them plainly.

export const RECOVERY_PROMISE =
  "If your connection drops, Frass re-checks this payment the moment you are back online and tells you exactly what happened — completed, declined, or nothing processed at all.";

export function recoveryMessage(status: string): string {
  switch (status as RequestStatus) {
    case "successful":
      return "Good news — your payment went through. Your receipt is in your Financial Center.";
    case "refunded":
      return "This payment went through and has since been refunded in full.";
    case "declined":
      return "This payment was declined. You were not charged.";
    case "cancelled":
      return "The seller cancelled this request. You were not charged.";
    case "expired":
      return "This request expired before it was approved. You were not charged.";
    case "processing":
      return "Your approval is still being finished by the payment provider. Stay on this screen — nothing will be charged twice.";
    default:
      return "Nothing was processed. This request is still waiting for your approval.";
  }
}

/* ── Expiry ──────────────────────────────────────────────────────────────── */
// Payment requests should not live forever. If a request is not completed
// inside the window, it expires by itself and the seller can send a new one.

export const DEFAULT_EXPIRY_MINUTES = 30;

export const EXPIRY_OPTIONS = [
  { minutes: 15, label: "15 minutes" },
  { minutes: 30, label: "30 minutes" },
  { minutes: 60, label: "1 hour" },
  { minutes: 1440, label: "24 hours" },
  { minutes: 10080, label: "7 days" },
] as const;

/* ── Customer reassurance ────────────────────────────────────────────────── */
// Shown after every successful payment. Trust, reinforced every single time.

export const PAYMENT_SUCCESS_REASSURANCE = [
  "Payment successful.",
  "Receipt available in your Financial Center.",
  "Inventory updated.",
  "Seller notified.",
  "Your banking information remained private.",
] as const;


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
