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
// What that means in practical terms: Frass is the market stall and the receipt
// book, not the cashier's till. The money goes straight into the seller's own
// account, the same way a market vendor keeps their own cash box.
// ─────────────────────────────────────────────────────────────────────────────

import { DIRECT_CARD_ALLOCATION_NOTE, allocateDirectCardSale } from "./finance/allocation";
import { BASE_REPORTING_CURRENCY, formatMoney } from "./finance/currency";


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
  /** The actual transaction currency (ISO 4217) — never assumed to be USD. */
  currency: string;
  /** Everything Frass keeps on a direct card sale (service + Foundation). */
  platformFee: number;
  /** 5% Frass Card service / transaction allocation. */
  frassCardService: number;
  /** 2% Frass Foundation. */
  foundation: number;
  /** 3% — the Builder's OWN money, protected for their project. */
  protectedVault: number;
  processingFeeEstimate: number;
  /** The Builder's spendable 90% share, less their provider's estimated fee. */
  netToSeller: number;
};

/**
 * STEP 5 · SLICE 2 — a Builder's own direct Frass Card sale uses the
 * direct-card allocation only (90 / 3 protected / 5 service / 2 Foundation /
 * 0 Founder / 0 Co-Founder). The old shared 90/3/3/2/1/1 constitutional split
 * is no longer executable on this path.
 *
 * The split is worked out in the currency the customer actually pays in.
 * Calculation only: nothing here is credited, and none of it is verified money.
 */
export function settle(
  unitPrice: number,
  quantity: number,
  provider?: string | null,
  currency: string = BASE_REPORTING_CURRENCY,
): CardSettlement {
  const round = (n: number) => Math.round(n * 100) / 100;
  const gross = round(Math.max(0, unitPrice) * Math.max(1, quantity));
  const a = allocateDirectCardSale(gross, currency);
  const processingFeeEstimate = gross > 0 ? estimateProcessingFee(gross, provider) : 0;
  return {
    gross,
    currency: a.currency,
    platformFee: a.frassTotal,
    frassCardService: a.frassCardService,
    foundation: a.foundation,
    protectedVault: a.builderProtectedVault,
    processingFeeEstimate,
    netToSeller: round(a.builderAvailable - processingFeeEstimate),
  };
}


export const ALLOCATION_NOTE = DIRECT_CARD_ALLOCATION_NOTE;


/** Formats in the currency given; USD is only the fallback for legacy callers. */
export function money(amount: number, currency = BASE_REPORTING_CURRENCY): string {
  return formatMoney(amount, currency);
}


export function remaining(quantity: number | null, sold: number): number | null {
  if (quantity == null) return null;
  return Math.max(0, quantity - sold);
}
