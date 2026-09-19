// ─────────────────────────────────────────────────────────────────────────────
// UNIVERSAL FRASS ALLOCATION — the one canonical split.
//
// Founder-approved economic correction: the universal 90/10 rule applies to
// every applicable Frass earning transaction. There is no special
// direct-personal-sale exception any more.
//
//   $100 USD gross  =  $90 Builder / Creator / earner
//                    + $3  Frass infrastructure / platform
//                    + $3  Reserve Vault (ecosystem-held, NOT the Builder's)
//                    + $2  Frass Foundation
//                    + $1  Founder / Owner
//                    + $1  Co-Founder
//
// MULTI-CURRENCY: the percentages are applied in the currency the customer
// actually paid. 100 GBP splits into 90/3/3/2/1/1 GBP; 100 JMD into
// 90/3/3/2/1/1 JMD. USD is Frass's reporting/base currency only — nothing is
// converted before the split.
//
// IMPORTANT: nothing in this file posts money. Every figure is an EXPECTED
// allocation until a payment provider confirms the payment.
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

/** The canonical universal allocation table. */
export const UNIVERSAL_ALLOCATION = {
  /** The Builder / Creator / earner's share. */
  earner: 90,
  /** Frass infrastructure / platform. */
  infrastructure: 3,
  /** Reserve Vault — ecosystem-held, never the Builder's own money. */
  reserve: 3,
  /** Frass Foundation. */
  foundation: 2,
  /** Founder / Owner. */
  founder: 1,
  /** Co-Founder. */
  coFounder: 1,
} as const;

/** Everything the Frass ecosystem keeps. */
export const ECOSYSTEM_TOTAL_PCT =
  UNIVERSAL_ALLOCATION.infrastructure +
  UNIVERSAL_ALLOCATION.reserve +
  UNIVERSAL_ALLOCATION.foundation +
  UNIVERSAL_ALLOCATION.founder +
  UNIVERSAL_ALLOCATION.coFounder;

/** What the earner keeps. */
export const EARNER_TOTAL_PCT = UNIVERSAL_ALLOCATION.earner;

export type UniversalAllocation = {
  gross: number;
  /** The ACTUAL transaction currency (ISO 4217); nothing is converted. */
  currency: string;
  /** The Builder / Creator / earner's 90% — expected, not verified money. */
  earner: number;
  infrastructure: number;
  /** Ecosystem Reserve Vault (3%) — Frass-held, not the Builder's money. */
  reserve: number;
  foundation: number;
  founder: number;
  coFounder: number;
  /** Everything Frass keeps (10%). */
  ecosystemTotal: number;
  /**
   * No payment provider has confirmed this money at calculation time, so these
   * are expected figures. Never "available", "settled", "earned" or "paid".
   */
  verified: false;
};

const round = (n: number) => Math.round((Number(n) || 0) * 100) / 100;

/**
 * Work out the expected universal split of an earning transaction, in the
 * currency the customer actually paid. Calculation only — nothing is written
 * or credited here.
 */
export function allocateEarning(
  gross: number,
  currency: string = BASE_REPORTING_CURRENCY,
): UniversalAllocation {
  const g = round(Math.max(0, gross));
  const pct = (p: number) => round((g * p) / 100);
  const infrastructure = pct(UNIVERSAL_ALLOCATION.infrastructure);
  const reserve = pct(UNIVERSAL_ALLOCATION.reserve);
  const foundation = pct(UNIVERSAL_ALLOCATION.foundation);
  const founder = pct(UNIVERSAL_ALLOCATION.founder);
  const coFounder = pct(UNIVERSAL_ALLOCATION.coFounder);
  return {
    gross: g,
    currency: normalizeCurrency(currency) ?? BASE_REPORTING_CURRENCY,
    earner: pct(UNIVERSAL_ALLOCATION.earner),
    infrastructure,
    reserve,
    foundation,
    founder,
    coFounder,
    ecosystemTotal: round(infrastructure + reserve + foundation + founder + coFounder),
    verified: false,
  };
}

/** The universal rule applies to every listed transaction type. */
export function usesUniversalAllocation(type: TransactionType): boolean {
  return TRANSACTION_TYPES.includes(type);
}

/** Plain-English statement of the universal rule, used everywhere it is shown. */
export const UNIVERSAL_ALLOCATION_NOTE =
  `On every Frass earning: ${UNIVERSAL_ALLOCATION.earner}% yours · ` +
  `${UNIVERSAL_ALLOCATION.infrastructure}% Frass infrastructure · ` +
  `${UNIVERSAL_ALLOCATION.reserve}% Reserve Vault (held by Frass, not your money) · ` +
  `${UNIVERSAL_ALLOCATION.foundation}% Frass Foundation · ` +
  `${UNIVERSAL_ALLOCATION.founder}% Founder · ${UNIVERSAL_ALLOCATION.coFounder}% Co-Founder.`;

export const EXPECTED_ALLOCATION_LABEL = "Expected allocation (not verified yet)";

export const EXPECTED_ALLOCATION_NOTE =
  "This is how the money will be split once a payment provider confirms it. Nothing has been credited, and none of it counts as available yet.";
