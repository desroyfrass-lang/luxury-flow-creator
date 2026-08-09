// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0427 — Frass Card Commerce
//
// Constitutional principle:
//   "Every Frass Card is capable of becoming a secure point of sale."
//
// Money flow (deliberate, and never the other way around):
//   Customer → the member's own payment account → the member's Frass Wallet
//   record. Frass never takes custody of the money for a Frass Card sale; it
//   records the sale, the constitutional allocation and the tax position.
//
// What that means in plain English: Frass is the market stall and the receipt
// book, not the cashier's till. The money goes straight into the seller's own
// account, the same way a market vendor keeps their own cash box.
// ─────────────────────────────────────────────────────────────────────────────

import { PLATFORM_ALLOCATION, allocate } from "./finance/financial-center";

export const CARD_COMMERCE_PRINCIPLE =
  "The Frass Card is both a digital identity and a mobile commerce platform. Payments are processed through the member's own connected payment account; every transaction still appears in the Financial Center, Wallet, statements, taxes and reports.";

/* ── What a member may sell ──────────────────────────────────────────────── */

export const LISTING_KINDS = [
  { id: "product", label: "Physical product", plain: "Something you hand over." },
  { id: "digital", label: "Digital download", plain: "A file they get after paying." },
  { id: "service", label: "Service", plain: "Work you do for them." },
  { id: "ticket", label: "Event ticket", plain: "Entry to something." },
  { id: "donation", label: "Donation", plain: "Support with no goods in return." },
  { id: "tip", label: "Tip", plain: "A thank-you for your work." },
  { id: "membership", label: "Membership", plain: "Ongoing access." },
  { id: "booking", label: "Booking", plain: "A held time slot." },
  { id: "consultation", label: "Consultation", plain: "A paid conversation." },
  { id: "music", label: "Music", plain: "A track, album or show." },
  { id: "course", label: "Course", plain: "Something you teach." },
  { id: "artwork", label: "Artwork", plain: "An original piece." },
] as const;

export type ListingKind = (typeof LISTING_KINDS)[number]["id"];
export const LISTING_KIND_IDS = LISTING_KINDS.map((k) => k.id) as [ListingKind, ...ListingKind[]];

export function kindLabel(kind: string): string {
  return LISTING_KINDS.find((k) => k.id === kind)?.label ?? "Item";
}

/** Kinds where quantity is meaningless — you can always accept another one. */
export const UNLIMITED_KINDS: ListingKind[] = ["donation", "tip", "digital", "membership"];

export type ListingStatus = "live" | "sold_out" | "archived";

/* ── Payout providers ────────────────────────────────────────────────────── */
// Never hard-coded to one company. The member connects their own account and
// Frass simply sends the buyer to it.

export const PAYOUT_PROVIDERS = [
  { id: "stripe", label: "Stripe", hint: "Paste your Stripe Payment Link or checkout URL.", feeNote: "≈2.9% + 30¢ on domestic cards." },
  { id: "paypal", label: "PayPal", hint: "Your PayPal.me link or invoice URL.", feeNote: "≈3.49% + fixed fee." },
  { id: "square", label: "Square", hint: "Your Square checkout link.", feeNote: "≈2.9% + 30¢ online." },
  { id: "other", label: "Other", hint: "Any secure payment page you control.", feeNote: "Fees set by your provider." },
] as const;

export type PayoutProviderId = (typeof PAYOUT_PROVIDERS)[number]["id"];

export function providerLabel(id?: string | null): string {
  return PAYOUT_PROVIDERS.find((p) => p.id === id)?.label ?? "Your payment account";
}

/** Rough, clearly-labelled estimate. Never presented as the final number. */
export function estimateProcessingFee(gross: number, provider?: string | null): number {
  const rate = provider === "paypal" ? 0.0349 : 0.029;
  const fixed = 0.3;
  return Math.round((gross * rate + fixed) * 100) / 100;
}

/* ── Settlement preview ──────────────────────────────────────────────────── */

export type CardSettlement = {
  gross: number;
  platformFee: number;
  infrastructure: number;
  reserve: number;
  foundation: number;
  processingFeeEstimate: number;
  netToSeller: number;
};

export function settle(unitPrice: number, quantity: number, provider?: string | null): CardSettlement {
  const round = (n: number) => Math.round(n * 100) / 100;
  const gross = round(Math.max(0, unitPrice) * Math.max(1, quantity));
  const a = allocate(gross);
  const processingFeeEstimate = gross > 0 ? estimateProcessingFee(gross, provider) : 0;
  return {
    gross,
    platformFee: a.platformTotal,
    infrastructure: a.infrastructure,
    reserve: a.reserve,
    foundation: a.foundation,
    processingFeeEstimate,
    netToSeller: round(a.net - processingFeeEstimate),
  };
}

export const ALLOCATION_NOTE = `${PLATFORM_ALLOCATION.infrastructure}% infrastructure · ${PLATFORM_ALLOCATION.reserve}% reserve · ${PLATFORM_ALLOCATION.foundation}% Foundation — the same ${PLATFORM_ALLOCATION.total}% constitutional allocation as every other Frass sale.`;

export function money(amount: number, currency = "USD"): string {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
  } catch {
    return `$${amount.toFixed(2)}`;
  }
}

export function remaining(quantity: number | null, sold: number): number | null {
  if (quantity == null) return null;
  return Math.max(0, quantity - sold);
}
