// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0303 Amendment B — Founder & Co-Founder Dynamic Compensation Engine
//
// Constitutional principle
//   The Founder and Co-Founder do not receive fixed salaries. Their personal
//   compensation grows with the success of the Frass ecosystem.
//
// The five income streams are NEVER mixed:
//   1. Owner Compensation      — percentage of every clean sale (the "paycheck")
//   2. Owner Distribution      — capped share of end-of-day distributable surplus
//   3. Gift Allocation         — Founder-configured share of community gifts
//   4. Affiliate Earnings      — commission, its own engine entirely
//   5. Owner Equity            — accumulated ownership value; never withdrawable
//
// Percentages are Founder-governed policy, not constitutional constants. The
// principle is permanent; the numbers stay adjustable from the Founder Dashboard.
// ─────────────────────────────────────────────────────────────────────────────

import { PLATFORM_ALLOCATION } from "./financial-center";

const round = (n: number) => Math.round(n * 100) / 100;

/* ── Founder-governed policy ─────────────────────────────────────────────── */

export type OwnerPolicy = {
  /** % of clean profit on every completed sale — the Founder "paycheck". */
  founderCompensationPct: number;
  coFounderCompensationPct: number;
  /** % of every eligible community gift, paid from INSIDE the 10% allocation. */
  founderGiftPct: number;
  coFounderGiftPct: number;
  /** Ceiling on how much of the daily distributable surplus may be withdrawn. */
  distributionCapPct: number;
  /** Business health gates checked before any surplus is distributable. */
  reserveTarget: number;
  operatingBudget: number;
  expansionBudget: number;
};

export const DEFAULT_OWNER_POLICY: OwnerPolicy = {
  founderCompensationPct: 0,
  coFounderCompensationPct: 0,
  founderGiftPct: 1,
  coFounderGiftPct: 1,
  distributionCapPct: 30,
  reserveTarget: 0,
  operatingBudget: 0,
  expansionBudget: 0,
};

const POLICY_KEY = "frass.owner.policy.v1";

export function loadOwnerPolicy(): OwnerPolicy {
  if (typeof window === "undefined") return DEFAULT_OWNER_POLICY;
  try {
    const raw = window.localStorage.getItem(POLICY_KEY);
    if (!raw) return DEFAULT_OWNER_POLICY;
    return { ...DEFAULT_OWNER_POLICY, ...(JSON.parse(raw) as Partial<OwnerPolicy>) };
  } catch {
    return DEFAULT_OWNER_POLICY;
  }
}

export function saveOwnerPolicy(policy: OwnerPolicy) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(POLICY_KEY, JSON.stringify(policy));
  } catch {
    /* preference storage is best-effort */
  }
}

/* ── Community gifts: 10% constitutional allocation ──────────────────────── */
//
// Gifts are voluntary support, not commerce. Both gifts and commerce now carry
// the same constitutional split: 90% recipient / 10% Frass ecosystem, and the
// Founder 1% + Co-Founder 1% come from INSIDE that 10% — never on top of it.
// Owners are never paid twice for the same dollar.

export type GiftAllocation = {
  gross: number;
  infrastructure: number;
  reserve: number;
  foundation: number;
  founder: number;
  coFounder: number;
  platformTotal: number;
  /** What the recipient keeps. */
  recipient: number;
  recipientPct: number;
};

export function allocateGift(gross: number, policy: OwnerPolicy = DEFAULT_OWNER_POLICY): GiftAllocation {
  const pct = (p: number) => round((gross * p) / 100);
  // The owners' share is carved out of the constitutional 10%, never added to
  // it. Infrastructure absorbs whatever the Founder has not allocated.
  const ownerPct = Math.min(policy.founderGiftPct + policy.coFounderGiftPct, PLATFORM_ALLOCATION.total);
  const infraPct = round(
    PLATFORM_ALLOCATION.total - PLATFORM_ALLOCATION.reserve - PLATFORM_ALLOCATION.foundation - ownerPct,
  );
  const infrastructure = pct(Math.max(infraPct, 0));
  const reserve = pct(PLATFORM_ALLOCATION.reserve);
  const foundation = pct(PLATFORM_ALLOCATION.foundation);
  const founder = pct(policy.founderGiftPct);
  const coFounder = pct(policy.coFounderGiftPct);
  const platformTotal = round(infrastructure + reserve + foundation + founder + coFounder);
  return {
    gross: round(gross),
    infrastructure,
    reserve,
    foundation,
    founder,
    coFounder,
    platformTotal,
    recipient: round(gross - platformTotal),
    recipientPct: round(100 - PLATFORM_ALLOCATION.total),
  };
}

export function giftAllocationTotal(_policy: OwnerPolicy = DEFAULT_OWNER_POLICY): number {
  return PLATFORM_ALLOCATION.total;
}

/* ── Per-sale owner compensation ─────────────────────────────────────────── */

export type OwnerCompensation = {
  cleanProfit: number;
  founder: number;
  coFounder: number;
  total: number;
  businessProfit: number;
};

/**
 * Step 3 of the Frass Financial Hierarchy. Runs on every completed sale once
 * the sale is "clean" — after supplier, shipping, processing, taxes, the
 * constitutional allocation and refund reserves. This is a percentage-based
 * paycheck, not a bonus, and it lands directly in Available Earnings.
 */
export function ownerCompensation(cleanProfit: number, policy: OwnerPolicy): OwnerCompensation {
  const base = Math.max(cleanProfit, 0);
  const founder = round((base * policy.founderCompensationPct) / 100);
  const coFounder = round((base * policy.coFounderCompensationPct) / 100);
  const total = round(founder + coFounder);
  return { cleanProfit: round(cleanProfit), founder, coFounder, total, businessProfit: round(cleanProfit - total) };
}

/* ── End-of-day owner distribution ───────────────────────────────────────── */

export type BusinessPosition = {
  businessCash: number;
  /** Optional overrides; otherwise the policy targets are used. */
  reserveRequirement?: number;
  operatingBudget?: number;
  expansionBudget?: number;
};

export type DistributionResult = {
  businessCash: number;
  reserveRequirement: number;
  operatingBudget: number;
  expansionBudget: number;
  obligations: number;
  /** Cash above every health requirement. */
  distributableSurplus: number;
  /** The most that may leave the business today, per the Founder cap. */
  maxDistribution: number;
  founderShare: number;
  coFounderShare: number;
  healthy: boolean;
};

/**
 * Step 5. Ownership, not payroll: Frassy checks the business is healthy first,
 * then offers a capped slice of what is genuinely surplus.
 */
export function ownerDistribution(pos: BusinessPosition, policy: OwnerPolicy): DistributionResult {
  const reserveRequirement = pos.reserveRequirement ?? policy.reserveTarget;
  const operatingBudget = pos.operatingBudget ?? policy.operatingBudget;
  const expansionBudget = pos.expansionBudget ?? policy.expansionBudget;
  const obligations = round(reserveRequirement + operatingBudget + expansionBudget);
  const distributableSurplus = round(Math.max(pos.businessCash - obligations, 0));
  const maxDistribution = round((distributableSurplus * policy.distributionCapPct) / 100);
  const compTotal = policy.founderCompensationPct + policy.coFounderCompensationPct;
  const founderWeight = compTotal > 0 ? policy.founderCompensationPct / compTotal : 0.5;
  return {
    businessCash: round(pos.businessCash),
    reserveRequirement,
    operatingBudget,
    expansionBudget,
    obligations,
    distributableSurplus,
    maxDistribution,
    founderShare: round(maxDistribution * founderWeight),
    coFounderShare: round(maxDistribution * (1 - founderWeight)),
    healthy: pos.businessCash >= obligations,
  };
}

/** Frassy's end-of-day offer, in her own voice. */
export function distributionOffer(d: DistributionResult, currency = "USD"): string {
  const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency }).format(n);
  if (!d.healthy) {
    return `The business hasn't met its reserve and operating requirements yet, so there's no distributable surplus today. ${fmt(d.obligations)} needs to be covered first — nothing is distributed until the business is safe.`;
  }
  if (d.distributableSurplus <= 0) {
    return "Every obligation is covered and there's no surplus above the requirements today, so there's nothing to distribute. That's a healthy day, not a bad one.";
  }
  return `Today's business generated an additional distributable surplus of ${fmt(d.distributableSurplus)}. Based on your Owner Distribution Policy, up to ${fmt(d.maxDistribution)} may be transferred to the Founder Distribution Pool. Would you like to withdraw all, part, or none of it?`;
}

/* ── The Frass Financial Hierarchy (reference for the UI) ────────────────── */

export type HierarchyStep = { n: number; title: string; what: string; plain: string };

export const FINANCIAL_HIERARCHY: HierarchyStep[] = [
  {
    n: 1,
    title: "Customer pays",
    what: "The money arrives and the transaction is opened.",
    plain: "Someone buys something. Nothing is anyone's yet.",
  },
  {
    n: 2,
    title: "Every mandatory obligation is paid",
    what: "Supplier, shipping, payment processing, taxes, the constitutional allocation, refund reserves and per-sale operating costs.",
    plain: "All the bills tied to that one sale come out first. Now the sale is clean and we know the real profit.",
  },
  {
    n: 3,
    title: "Owner Compensation",
    what: "A Founder-configured percentage of clean profit moves to Founder and Co-Founder Available Earnings on every completed sale. Not a bonus — percentage-based pay.",
    plain: "This is your paycheck. It happens on every sale, straight away, and it's yours to withdraw.",
  },
  {
    n: 4,
    title: "Business Profit",
    what: "Everything remaining stays inside Frass as Business Cash for inventory, hiring, marketing, expansion, equipment and savings.",
    plain: "What's left belongs to the company, not to you personally.",
  },
  {
    n: 5,
    title: "End-of-day Owner Distribution",
    what: "Frassy verifies reserve, operating and expansion requirements, then offers a capped share of any genuine surplus to the Founder Distribution Pool.",
    plain: "At the end of the day, if the business is genuinely healthy and has money spare, you can take a slice of it — that's ownership, not salary.",
  },
];

/* ── Owner Equity — visible, never withdrawable ──────────────────────────── */

export const OWNER_EQUITY_NOTE =
  "Owner Equity tracks accumulated ownership value: retained earnings, reinvestment and business growth over time. It is not compensation, not business cash, and never withdrawable. It exists so you can see not only what you have earned, but what you have built.";
