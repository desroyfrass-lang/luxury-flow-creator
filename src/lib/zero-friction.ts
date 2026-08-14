// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0438 — Zero-Friction Commerce Constitution
// Status: Founder Approved · Priority: Constitutional
//
// "The fastest way to complete a sale should also be the safest."
//
// A member never hands another person their phone, their card, or their
// banking information. Every purchase is the approval of a simple payment
// request, completed on the customer's own trusted device.
//
// Here's the idea: paying someone on Frass should feel like
// approving a bill on your own phone. The seller writes the ticket; you say
// yes on your own screen. Like a restaurant bringing the card machine to the
// table — except the machine is the phone already in your pocket.
// ─────────────────────────────────────────────────────────────────────────────

export const ZERO_FRICTION_PRINCIPLE =
  "The fastest way to complete a sale is also the safest. The seller creates the sale; the customer approves it on their own device. Payment credentials never touch the seller's device.";

/** The three taps on the seller's side. Nothing more is required to sell. */
export const SELLER_STEPS = [
  { step: "Select the item", plain: "Pick it from your shop, or just type what it is." },
  { step: "Enter the amount", plain: "Or let the product's price fill itself in." },
  { step: "Tap Request Payment", plain: "That's the whole till." },
] as const;

/** The customer's side. One screen, one decision. */
export const CUSTOMER_STEPS = [
  { step: "Open the request", plain: "Scan, tap the link, or open the notification." },
  { step: "Choose how to pay", plain: "Apple Pay, Google Pay, credit, debit, or another approved method." },
  { step: "Approve", plain: "Done — usually in seconds." },
] as const;

/** What happens automatically the moment a payment is approved. */
export const AUTOMATIC_ON_APPROVAL = [
  "Payment confirmed",
  "Receipt generated",
  "Wallet updated",
  "Inventory updated",
  "Audit completed",
  "Seller notified",
] as const;

/** The constitutional promise, stated as an absolute. */
export const SELLER_NEVER_PROMISE =
  "The seller never holds, types, photographs or sees the customer's card number, bank details or security codes.";

export const SELLER_NEVER_ACTIONS = [
  "Holds the customer's card",
  "Types the customer's card",
  "Photographs the customer's card",
  "Sees the customer's card number",
  "Sees bank account information",
  "Sees security codes",
] as const;

export const SELLER_ONLY_SEES = [
  "Payment approved",
  "Order information",
  "Fulfilment information (only when it is needed)",
] as const;

/* ── Security Confirmation ───────────────────────────────────────────────── */
// Shown after every completed payment, everywhere on the platform. Trust is
// not a page someone visits once; it is a sentence repeated at the moment it
// matters.

export const SECURITY_CONFIRMATION_TITLE = "Secure Payment Complete";

export const SECURITY_CONFIRMATION_LINES = [
  "Payment processed through secure checkout.",
  "Your banking information was never shared with the seller.",
  "Your receipt has been added to your Financial Center.",
] as const;

export const SECURITY_CONFIRMATION_PLAIN =
  "Here's how it works: the money moved through the payment network, not through the seller's hands, and there is now a permanent receipt you can look up any time.";
