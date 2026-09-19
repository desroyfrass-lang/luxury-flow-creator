// ─────────────────────────────────────────────────────────────────────────────
// STEP 5 · SLICE 3 (correction) — MULTI-CURRENCY COMMERCE
//
// Canonical rule from the Founder:
//   USD is Frass Hill's BASE / REPORTING currency. It is NOT a mandatory
//   checkout currency. A customer buys in the currency of their market, where
//   the connected payment provider supports it.
//
// Two things are therefore kept strictly apart everywhere in the platform:
//   1. TRANSACTION amount + TRANSACTION currency — what was actually charged.
//      Allocation percentages are applied to this, in this currency, with no
//      conversion of any kind.
//   2. A USD REPORTING equivalent — optional, separate, and only ever shown
//      when a real exchange rate with a source and a timestamp is available.
//      No rate is invented or frozen in code. With no trustworthy FX source
//      connected, the USD equivalent is simply unavailable.
// ─────────────────────────────────────────────────────────────────────────────

import { MARKETS } from "@/lib/commerce/global-markets";

/** The base/reporting currency only — never a checkout requirement. */
export const BASE_REPORTING_CURRENCY = "USD";

/** ISO 4217 shape: three letters. */
export function isIsoCurrencyCode(code: unknown): code is string {
  return typeof code === "string" && /^[A-Za-z]{3}$/.test(code.trim());
}

export function normalizeCurrency(code: unknown): string | null {
  return isIsoCurrencyCode(code) ? code.trim().toUpperCase() : null;
}

/**
 * Currencies Frass will accept for a direct Frass Card sale today.
 *
 * This is a MARKET configuration, not a law of the platform: the real list
 * must ultimately come from the connected payment/commerce provider. Until a
 * provider is connected, the configured market currencies stand in, plus the
 * euro area, which Frass serves without a single country market row.
 */
export const CONFIGURED_MARKET_CURRENCIES: string[] = Array.from(
  new Set([...MARKETS.map((m) => m.currency.toUpperCase()), "EUR", "USD"]),
).sort();

export type CurrencySupport =
  | { ok: true; currency: string }
  | { ok: false; currency: string | null; reason: string };

/**
 * Is this currency usable for a sale?
 *
 * `providerCurrencies` is what the connected provider says it supports. When
 * nothing is connected we fall back to the configured market list. An
 * unsupported currency always fails clearly — amounts are never relabelled.
 */
export function checkSaleCurrency(
  code: unknown,
  providerCurrencies?: readonly string[] | null,
): CurrencySupport {
  const currency = normalizeCurrency(code);
  if (!currency) {
    return { ok: false, currency: null, reason: "A three-letter currency code is required." };
  }
  const allowed = (providerCurrencies?.length
    ? providerCurrencies.map((c) => c.toUpperCase())
    : CONFIGURED_MARKET_CURRENCIES);
  if (!allowed.includes(currency)) {
    return {
      ok: false,
      currency,
      reason: `${currency} is not supported for payment in this market yet.`,
    };
  }
  return { ok: true, currency };
}

export function isSupportedSaleCurrency(
  code: unknown,
  providerCurrencies?: readonly string[] | null,
): boolean {
  return checkSaleCurrency(code, providerCurrencies).ok;
}

/* ── Money that always carries its own currency ──────────────────────────── */

export type MoneyAmount = { amount: number; currency: string };

export function formatMoney(amount: number, currency: string): string {
  const c = normalizeCurrency(currency) ?? BASE_REPORTING_CURRENCY;
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: c }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${c}`;
  }
}

/**
 * Totals are kept PER CURRENCY. Different currencies are never added into one
 * number — that would silently invent money.
 */
export function sumByCurrency(
  rows: readonly { amount: number | string | null; currency: string | null }[],
): MoneyAmount[] {
  const buckets = new Map<string, number>();
  for (const r of rows) {
    const c = normalizeCurrency(r.currency) ?? BASE_REPORTING_CURRENCY;
    buckets.set(c, (buckets.get(c) ?? 0) + Number(r.amount || 0));
  }
  return [...buckets.entries()]
    .map(([currency, amount]) => ({ currency, amount: Math.round(amount * 100) / 100 }))
    .sort((a, b) => a.currency.localeCompare(b.currency));
}

/* ── USD reporting equivalent — separate, and honest when missing ────────── */

/** A rate must always arrive with where it came from and when. */
export type FxQuote = {
  from: string;
  to: string;
  rate: number;
  /** Who provided the rate, e.g. the connected payment provider. */
  source: string;
  /** ISO timestamp of the rate. */
  asOf: string;
};

export type UsdEquivalent =
  | {
      available: true;
      amount: number;
      currency: typeof BASE_REPORTING_CURRENCY;
      rate: number;
      source: string;
      asOf: string;
    }
  | { available: false; reason: string };

export const NO_FX_SOURCE_REASON =
  "No exchange-rate source is connected, so a US dollar equivalent is not available.";

/**
 * Convert a transaction amount to the USD reporting currency — ONLY with a
 * quote that names its source and time. Never guesses, never caches a rate.
 */
export function usdEquivalent(
  value: MoneyAmount,
  quote?: FxQuote | null,
): UsdEquivalent {
  const from = normalizeCurrency(value.currency);
  if (!from) return { available: false, reason: "The transaction currency is missing." };
  if (from === BASE_REPORTING_CURRENCY) {
    return {
      available: true,
      amount: Math.round(value.amount * 100) / 100,
      currency: BASE_REPORTING_CURRENCY,
      rate: 1,
      source: "same currency",
      asOf: new Date(0).toISOString(),
    };
  }
  if (
    !quote ||
    normalizeCurrency(quote.from) !== from ||
    normalizeCurrency(quote.to) !== BASE_REPORTING_CURRENCY ||
    !(quote.rate > 0) ||
    !quote.source ||
    !quote.asOf
  ) {
    return { available: false, reason: NO_FX_SOURCE_REASON };
  }
  return {
    available: true,
    amount: Math.round(value.amount * quote.rate * 100) / 100,
    currency: BASE_REPORTING_CURRENCY,
    rate: quote.rate,
    source: quote.source,
    asOf: quote.asOf,
  };
}

export const REPORTING_CURRENCY_NOTE =
  "Frass reports in US dollars, but you sell in your own currency. The amount your customer pays is never converted before your split is worked out.";
