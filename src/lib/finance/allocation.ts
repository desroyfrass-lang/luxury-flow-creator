// ─────────────────────────────────────────────────────────────────────────────
// STEP 5 · SLICE 2 — TRANSACTION-TYPE-AWARE ALLOCATION
//
// Different kinds of money are split differently. Before this file, one
// constitutional 90/10 rule was applied to everything, including a Builder's
// own direct Frass Card sale. That is no longer true.
//
// The Founder-approved rule for a Builder's OWN direct Frass Card sale:
//
//   $100 USD gross  =  $90 Builder available
//                    + $3  Builder Protected Vault / Project Fund (still the
//                          Builder's own money, protected for their business)
//                    + $5  Frass Card service / transaction allocation
//                    + $2  Frass Foundation
//                    + $0  Founder personally
//                    + $0  Co-Founder personally
//
// The same percentages apply in whatever currency the customer actually paid:
// 100 GBP = 90/3/5/2 GBP, 100 CAD = 90/3/5/2 CAD, 100 JMD = 90/3/5/2 JMD.
// USD is only Frass's reporting currency; nothing is converted before the split.
//
// This rule applies to ONE transaction type only. Marketplace / Gallery
// commerce, Shopify / Frass Kicks brand commerce, affiliate commission,
// referral bonuses and grants each keep their own economics, untouched here.

//
// IMPORTANT (Slice 1 truth carried forward): nothing in this file posts money.
// Frass has no payment-provider confirmation rail yet, so every figure produced
// here is an EXPECTED allocation — what will happen once a payment is verified.
// ─────────────────────────────────────────────────────────────────────────────

import { BASE_REPORTING_CURRENCY, normalizeCurrency } from "./currency";


export const TRANSACTION_TYPES = [
  "direct-card-sale",
  "marketplace-sale",
  "shopify-brand-sale",
  "affiliate-commission",
  "referral-bonus",
  "grant",
] as const;

export type TransactionType = (typeof TRANSACTION_TYPES)[number];

/** The only allocation table this slice makes authoritative. */
export const DIRECT_CARD_ALLOCATION = {
  /** Builder's own spendable share. */
  builderAvailable: 90,
  /** Builder's own money, protected for their project/business. */
  builderProtectedVault: 3,
  /** Frass Card service / transaction allocation. */
  frassCardService: 5,
  /** Frass Foundation. */
  foundation: 2,
  /** Owners take nothing personally from a Builder's own direct sale. */
  founder: 0,
  coFounder: 0,
} as const;

/** What the Builder keeps in total (spendable + protected). */
export const DIRECT_CARD_BUILDER_TOTAL_PCT =
  DIRECT_CARD_ALLOCATION.builderAvailable + DIRECT_CARD_ALLOCATION.builderProtectedVault;

/** What Frass keeps in total from a direct card sale. */
export const DIRECT_CARD_FRASS_TOTAL_PCT =
  DIRECT_CARD_ALLOCATION.frassCardService + DIRECT_CARD_ALLOCATION.foundation;

export type DirectCardAllocation = {
  gross: number;
  /**
   * The ACTUAL transaction currency (ISO 4217). The percentages below are
   * applied in this currency — nothing is converted before allocation.
   */
  currency: string;
  /** Builder's spendable share (90%) — expected, never available yet. */
  builderAvailable: number;
  /** Builder's protected project fund (3%) — the Builder's own money. */
  builderProtectedVault: number;
  /** Frass Card service allocation (5%). */
  frassCardService: number;
  /** Frass Foundation (2%). */
  foundation: number;
  founder: 0;
  coFounder: 0;
  /** Everything Frass keeps (7%). */
  frassTotal: number;
  /** Everything the Builder keeps (93%). */
  builderTotal: number;
  /**
   * Slice 1 rule: no payment provider has confirmed this money, so these are
   * expected figures only. Never "available", "settled", "earned" or "paid".
   */
  verified: false;
};

const round = (n: number) => Math.round((Number(n) || 0) * 100) / 100;

/**
 * Work out the expected split of a Builder's own direct Frass Card sale, in
 * the currency the customer actually paid in. 100 GBP splits into 90/3/5/2 GBP;
 * 100 JMD into 90/3/5/2 JMD. Calculation only — nothing is written or credited.
 */
export function allocateDirectCardSale(
  gross: number,
  currency: string = BASE_REPORTING_CURRENCY,
): DirectCardAllocation {
  const g = round(Math.max(0, gross));
  const pct = (p: number) => round((g * p) / 100);
  const builderAvailable = pct(DIRECT_CARD_ALLOCATION.builderAvailable);
  const builderProtectedVault = pct(DIRECT_CARD_ALLOCATION.builderProtectedVault);
  const frassCardService = pct(DIRECT_CARD_ALLOCATION.frassCardService);
  const foundation = pct(DIRECT_CARD_ALLOCATION.foundation);
  return {
    gross: g,
    currency: normalizeCurrency(currency) ?? BASE_REPORTING_CURRENCY,
    builderAvailable,
    builderProtectedVault,
    frassCardService,
    foundation,
    founder: 0,
    coFounder: 0,
    frassTotal: round(frassCardService + foundation),
    builderTotal: round(builderAvailable + builderProtectedVault),
    verified: false,
  };
}


/** Is this transaction type governed by the direct Frass Card rule? */
export function usesDirectCardAllocation(type: TransactionType): boolean {
  return type === "direct-card-sale";
}

/** Plain-English statement of the direct-card rule, used everywhere it is shown. */
export const DIRECT_CARD_ALLOCATION_NOTE =
  `On your own Frass Card sale: ${DIRECT_CARD_ALLOCATION.builderAvailable}% yours to use · ` +
  `${DIRECT_CARD_ALLOCATION.builderProtectedVault}% yours, protected in your Project Fund · ` +
  `${DIRECT_CARD_ALLOCATION.frassCardService}% Frass Card service · ` +
  `${DIRECT_CARD_ALLOCATION.foundation}% Frass Foundation. The Founder and Co-Founder take nothing personally.`;

export const EXPECTED_ALLOCATION_LABEL = "Expected allocation (not verified yet)";

export const EXPECTED_ALLOCATION_NOTE =
  "This is how the money will be split once a payment provider confirms it. Nothing has been credited, and none of it counts as available yet.";
