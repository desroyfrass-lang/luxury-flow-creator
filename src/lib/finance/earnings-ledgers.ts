// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0302 Amendment B — Universal Earnings Ledger
//
//   • Every source of income maintains its own dedicated ledger.
//   • Earnings are NEVER merged. $200 marketplace + $40 affiliate + $15 gifts is
//     three lines, never one "$255". People love knowing how they made money.
//   • Every member — DJ, farmer, seller, affiliate, Founder — opens the exact
//     same Financial Center. Only which ledgers appear changes.
//   • Each ledger shows Available, Pending, Lifetime, withdrawals and history.
// ─────────────────────────────────────────────────────────────────────────────

import type { AppRole } from "@/lib/roles";
import { money, type FinanceViewer, type LedgerId, type TraceableAmount } from "./financial-center";

export type EarningsSourceId =
  | "marketplace"
  | "creator"
  | "gifts"
  | "affiliate"
  | "courses"
  | "services"
  | "podcast"
  | "music"
  | "builder"
  | "farm"
  | "founder-compensation"
  | "cofounder-compensation"
  | "founder-distribution"
  | "cofounder-distribution";

export type EarningsSource = {
  id: EarningsSourceId;
  label: string;
  icon: string;
  ledger: LedgerId;
  /** Technical description of what feeds this ledger. */
  explain: string;
  /** Frassy's "What that means is…" layer. */
  plain: string;
  /** Founder-only ledgers stay hidden for everyone else. */
  founderOnly?: boolean;
  /** Roles that unlock the ledger for ordinary members. */
  roles?: AppRole[];
};

export const EARNINGS_SOURCES: EarningsSource[] = [
  {
    id: "marketplace",
    label: "Marketplace Earnings",
    icon: "🏪",
    ledger: "marketplace",
    explain: "Seller and vendor payouts from marketplace orders, after platform allocation and processing.",
    plain: "Money from things you sold in the marketplace.",
    roles: ["partner", "designer"],
  },
  {
    id: "creator",
    label: "Creator Earnings",
    icon: "🎨",
    ledger: "marketplace",
    explain: "Earnings from creator work published through Frass districts.",
    plain: "Money from what you made and published here.",
    roles: ["designer", "ambassador"],
  },
  {
    id: "gifts",
    label: "Gift Earnings",
    icon: "🎁",
    ledger: "gifts",
    explain: "Community gifts received, after the constitutional gift allocation.",
    plain: "Money people chose to send you because they liked what you're doing.",
  },
  {
    id: "affiliate",
    label: "Affiliate Earnings",
    icon: "🔗",
    ledger: "affiliate",
    explain: "Commission on attributed sales. A completely separate engine from platform allocation.",
    plain: "Money you earned by sending buyers to a product.",
    roles: ["affiliate", "ambassador"],
  },
  {
    id: "courses",
    label: "Course Earnings",
    icon: "🎓",
    ledger: "marketplace",
    explain: "Enrolment revenue from Academy courses you own.",
    plain: "Money from people learning from you.",
    roles: ["designer", "partner"],
  },
  {
    id: "services",
    label: "Service Earnings",
    icon: "🛠️",
    ledger: "marketplace",
    explain: "Bookings and service work delivered through Frass.",
    plain: "Money from work you did for someone.",
    roles: ["partner"],
  },
  {
    id: "podcast",
    label: "Podcast Earnings",
    icon: "🎙️",
    ledger: "marketplace",
    explain: "Sponsorship and listener support attributed to podcast content.",
    plain: "Money your show brought in.",
    roles: ["designer", "ambassador"],
  },
  {
    id: "music",
    label: "Music Earnings",
    icon: "🎵",
    ledger: "marketplace",
    explain: "Releases, sets and licensing revenue attributed to music.",
    plain: "Money your music brought in.",
    roles: ["designer", "ambassador"],
  },
  {
    id: "builder",
    label: "Builder Earnings",
    icon: "🧱",
    ledger: "marketplace",
    explain: "Skilled Builder work commissioned through Builders Village.",
    plain: "Money from jobs you were hired to build.",
    roles: ["partner"],
  },
  {
    id: "farm",
    label: "Farm Earnings",
    icon: "🌾",
    ledger: "marketplace",
    explain: "Produce and Farm District sales attributed to your holding.",
    plain: "Money from what you grew and sold.",
    roles: ["partner"],
  },
  {
    id: "founder-compensation",
    label: "Founder Compensation",
    icon: "👤",
    ledger: "owner-compensation",
    explain:
      "Percentage of clean profit allocated on every completed sale, after every obligation. Percentage-based pay, not a bonus.",
    plain: "Your paycheck. It's set aside on every sale and it's already yours.",
    founderOnly: true,
  },
  {
    id: "cofounder-compensation",
    label: "Co-Founder Compensation",
    icon: "👤",
    ledger: "owner-compensation",
    explain: "The same per-sale compensation engine, held on its own ledger for the Co-Founder.",
    plain: "The same paycheck rules, kept on its own line so you can both see it clearly.",
    founderOnly: true,
  },
  {
    id: "founder-distribution",
    label: "Founder Distribution",
    icon: "📈",
    ledger: "owner-distribution",
    explain:
      "Capped share of end-of-day distributable surplus, offered only when reserve, operating and expansion requirements are satisfied.",
    plain: "Ownership money. Only offered when the business genuinely has spare cash after everything is safe.",
    founderOnly: true,
  },
  {
    id: "cofounder-distribution",
    label: "Co-Founder Distribution",
    icon: "📈",
    ledger: "owner-distribution",
    explain: "The Co-Founder's share of the same end-of-day distributable surplus.",
    plain: "Same ownership money, on its own line.",
    founderOnly: true,
  },
];

export function visibleEarningsSources(v: FinanceViewer): EarningsSource[] {
  return EARNINGS_SOURCES.filter((s) => {
    if (s.founderOnly) return v.founder;
    if (v.founder) return true;
    if (!s.roles) return true;
    return s.roles.some((r) => v.roles.includes(r));
  });
}

/** One ledger, three honest balances, never merged with any other source. */
export type EarningsLedger = {
  source: EarningsSource;
  available: TraceableAmount;
  pending: TraceableAmount;
  lifetime: TraceableAmount;
};

function balance(
  source: EarningsSource,
  kind: "available" | "pending" | "lifetime",
): TraceableAmount {
  const label =
    kind === "available" ? "Available now" : kind === "pending" ? "Pending" : "Lifetime";
  return {
    id: `${source.id}-${kind}`,
    label: `${source.label} · ${label}`,
    amount: 0,
    ledger: source.ledger,
    explain:
      kind === "available"
        ? `${source.explain} Settled, unheld, withdrawable immediately.`
        : kind === "pending"
          ? `${source.explain} Still clearing: processor settlement, refund window or verification.`
          : `${source.explain} Historical gross for this source. Withdrawals never reduce it.`,
    plain:
      kind === "available"
        ? `${source.plain} This part you can take out right now.`
        : kind === "pending"
          ? `${source.plain} This part hasn't finished clearing yet — it moves itself to Available.`
          : `${source.plain} This is everything this source has ever earned you.`,
    breakdown: [{ label: "No transactions recorded yet", value: money(0), kind: "note" }],
    records: [],
    settlement: kind === "pending" ? "pending" : kind === "available" ? "immediate" : undefined,
    actions: kind === "available" ? ["withdraw", "export"] : kind === "pending" ? ["investigate"] : ["export"],
  };
}

export function earningsLedgers(v: FinanceViewer): EarningsLedger[] {
  return visibleEarningsSources(v).map((source) => ({
    source,
    available: balance(source, "available"),
    pending: balance(source, "pending"),
    lifetime: balance(source, "lifetime"),
  }));
}

export const EARNINGS_LEDGER_RULES = [
  "Every income source keeps its own ledger — nothing is ever merged into a single balance.",
  "Each ledger shows Available, Pending, Lifetime, withdrawal history and transaction history.",
  "Available means withdrawable today. Settlement language belongs to Pending alone.",
  "Everyone opens the same Financial Center; only the modules that apply to you appear.",
  "Seeing which source is growing is the point — it teaches you how you actually earn.",
];
