/**
 * FRASS-0474 — Financial Trust Boundary.
 *
 * Every money rule in Frass has exactly one written-down limit, and it lives
 * here. Server code clamps against these numbers; the browser is never asked
 * what a percentage or a charge should be.
 *
 * In plain English: the price list is nailed to the wall behind the counter.
 * A customer can point at it, but they can't rewrite it on the way to the till.
 */

import { PLATFORM_ALLOCATION } from "./financial-center";

export type MoneyRule = {
  /** Stable id — also the value stored on a security alert. */
  rule: string;
  label: string;
  min: number;
  max: number;
  /** What a Founder reading the alert needs to understand instantly. */
  plainEnglish: string;
};

export const MONEY_RULES = {
  platformAllocationPct: {
    rule: "platform_allocation_pct",
    label: "Platform allocation",
    min: PLATFORM_ALLOCATION.total,
    max: PLATFORM_ALLOCATION.total,
    plainEnglish:
      "The constitutional split is fixed: the creator keeps 90% and the Frass ecosystem keeps 10%. Nothing sent from a browser may change it.",
  },
  affiliateCommissionPct: {
    rule: "affiliate_commission_pct",
    label: "Affiliate commission rate",
    min: 10,
    max: 20,
    plainEnglish:
      "Affiliate commission lives between 10% and 20%. Anything outside that is either a mistake or someone trying to pay themselves more.",
  },
  couponDiscountPct: {
    rule: "coupon_discount_pct",
    label: "Welcome coupon discount",
    min: 0,
    max: 40,
    plainEnglish:
      "The Welcome Journey tops out at 40% off. A larger discount would sell stock below the floor Frass agreed to.",
  },
  listingPrice: {
    rule: "listing_price",
    label: "Listing price",
    min: 1,
    max: 1_000_000,
    plainEnglish:
      "A listing must carry a real price of at least $1. A zero or negative price would hand stock away and still write a receipt.",
  },
  paymentRequestAmount: {
    rule: "payment_request_amount",
    label: "Payment request amount",
    min: 0.5,
    max: 1_000_000,
    plainEnglish:
      "A payment request must ask for a real, sane amount — never nothing, never a fortune typed by accident.",
  },
  creditCharge: {
    rule: "credit_charge",
    label: "AI credit charge",
    min: 1,
    max: 250_000,
    plainEnglish:
      "AI work is charged from the official rate card on the server. A browser telling Frass the job costs zero credits is asking for free production.",
  },
  withdrawalAmount: {
    rule: "withdrawal_amount",
    label: "Withdrawal amount",
    min: 1,
    max: 25_000,
    plainEnglish:
      "A single withdrawal is capped so a compromised session cannot drain a member's earnings in one move.",
  },
} as const satisfies Record<string, MoneyRule>;

export type MoneyRuleKey = keyof typeof MONEY_RULES;

export type ClampResult = {
  /** The value the server will actually use. */
  value: number;
  /** True when the submitted value had to be corrected. */
  violated: boolean;
  submitted: number;
  rule: MoneyRule;
};

/** Pure clamp — safe to use on the client for live form feedback. */
export function clampToRule(key: MoneyRuleKey, submitted: unknown): ClampResult {
  const rule = MONEY_RULES[key];
  const n = Number(submitted);
  const safe = Number.isFinite(n) ? n : rule.min;
  const value = Math.min(Math.max(safe, rule.min), rule.max);
  return { value, violated: value !== n, submitted: safe, rule };
}

export function ruleRangeLabel(key: MoneyRuleKey): string {
  const r = MONEY_RULES[key];
  return r.min === r.max ? `${r.min}` : `${r.min} – ${r.max}`;
}
