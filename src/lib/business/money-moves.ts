// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0461 — Money Moves Engine · Personalized Income Operating System
//
// This is NOT another task system. It is the intelligence layer that sits
// ABOVE the systems we already built and orchestrates them:
//   Daily · Business Builder (accelerator.ts) · First 30 Days (launch-program.ts)
//   Affiliate Dashboard · Brand Partnerships · FV Studios · Frass Card ·
//   Wallet · Financial Center · Frass Link · Marketplace · Business Vaults
//
// It never invents revenue. Every figure here comes from work the partner
// actually completed or money they actually logged.
// ─────────────────────────────────────────────────────────────────────────────

import {
  LAUNCH_BUSINESSES,
  allMoves,
  businessById,
  todaysMoves,
  type LaunchState,
  type ResolvedMove,
} from "./accelerator";
import { foundationComplete, todayISO, type ProgramState } from "./launch-program";
import type { AffiliatePolicy } from "@/lib/affiliate-intelligence";

// ── Constitutional objectives ───────────────────────────────────────────────
// Every Money Move must satisfy at least one of these, or it doesn't belong
// on today's Daily.

export const OBJECTIVES = [
  { id: "earn-today", label: "Generate income today", emoji: "💵" },
  { id: "earn-future", label: "Increase future income", emoji: "📈" },
  { id: "discover", label: "Improve discoverability", emoji: "🔍" },
  { id: "convert", label: "Improve conversion", emoji: "🎯" },
  { id: "credibility", label: "Build credibility", emoji: "🛡" },
  { id: "audience", label: "Grow audience", emoji: "👥" },
  { id: "milestone", label: "Complete a launch milestone", emoji: "🏁" },
] as const;

export type ObjectiveId = (typeof OBJECTIVES)[number]["id"];

export function objectiveLabel(id: ObjectiveId): string {
  return OBJECTIVES.find((o) => o.id === id)?.label ?? id;
}

/**
 * Which objectives a move serves. Derived from the stage it belongs to and
 * whether it is a major move — so every existing move in Business Builder
 * automatically qualifies without duplicating the catalogue.
 */
export function objectivesFor(move: ResolvedMove): ObjectiveId[] {
  const out = new Set<ObjectiveId>();
  const stage = move.stageId;
  if (/sell|sale|drop|publish|launch|offer/.test(stage)) out.add("earn-today");
  if (/grow|optimis|optimiz|scale/.test(stage)) out.add("earn-future");
  if (/publish|content|listing|seo|link/.test(stage + move.id)) out.add("discover");
  if (/offer|price|photo|listing|checkout|convert/.test(stage + move.id)) out.add("convert");
  if (/story|review|about|brand|trust|episode/.test(stage + move.id)) out.add("credibility");
  if (/audience|social|reel|post|community|episode/.test(stage + move.id)) out.add("audience");
  if (move.major) out.add("milestone");
  if (out.size === 0) out.add("earn-future");
  return [...out];
}

// ── The income ecosystem ────────────────────────────────────────────────────
// Streams are not islands. Each one names what it feeds and what feeds it.

export type IncomeStream = {
  id: string;
  emoji: string;
  label: string;
  objectives: string[];
  /** Other stream ids this one strengthens. */
  reinforces: string[];
  /** Where the work actually happens inside Frass. */
  surfaces: { label: string; href: string }[];
};

export const INCOME_STREAMS: IncomeStream[] = [
  {
    id: "wellness",
    emoji: "🌿",
    label: "Wellness Brand",
    objectives: [
      "Launch products",
      "Build trust",
      "Grow authority",
      "Create educational content",
      "Generate sales",
      "Affiliate naturally",
    ],
    reinforces: ["affiliate", "podcast", "faceless"],
    surfaces: [
      { label: "Marketplace", href: "/marketplace" },
      { label: "Frass Card", href: "/workspace/card" },
      { label: "Wallet", href: "/workspace/wallet" },
    ],
  },
  {
    id: "coco-vintage",
    emoji: "👗",
    label: "Coco Vintage",
    objectives: [
      "Organize inventory",
      "Launch collections",
      "Photograph products",
      "Create storytelling",
      "Sell consistently",
    ],
    reinforces: ["faceless", "affiliate"],
    surfaces: [
      { label: "Collection Builder", href: "/collection" },
      { label: "Marketplace", href: "/marketplace" },
      { label: "FV Studios", href: "/studio" },
      { label: "Wallet", href: "/workspace/wallet" },
    ],
  },
  {
    id: "faceless",
    emoji: "📸",
    label: "Faceless Content",
    objectives: [
      "Daily publishing",
      "Trend monitoring",
      "Repurpose content",
      "Traffic generation",
      "Affiliate support",
    ],
    reinforces: ["affiliate", "coco-vintage", "wellness", "podcast"],
    surfaces: [
      { label: "FV Studios", href: "/studio" },
      { label: "Frass Link", href: "/workspace/link" },
    ],
  },
  {
    id: "affiliate",
    emoji: "🤝",
    label: "Affiliate Marketing",
    objectives: [
      "Choose products",
      "Generate content",
      "Track clicks",
      "Optimize conversions",
      "Grow recurring income",
    ],
    reinforces: ["faceless", "wellness"],
    surfaces: [
      { label: "Affiliate Dashboard", href: "/affiliate" },
      { label: "Frass Link", href: "/workspace/link" },
      { label: "Financial Center", href: "/financial-center" },
    ],
  },
  {
    id: "podcast",
    emoji: "🎙",
    label: "Podcast",
    objectives: ["Authority", "Trust", "Audience", "Community", "Future sponsorships"],
    reinforces: ["wellness", "faceless"],
    surfaces: [
      { label: "Frass Radio", href: "/frass-radio" },
      { label: "FV Studios", href: "/studio" },
      { label: "Brand Partnerships", href: "/brand-partnerships" },
    ],
  },
];

export function streamById(id: string): IncomeStream | undefined {
  return INCOME_STREAMS.find((s) => s.id === id);
}

/** Plain-English reason a move helps more than one business at once. */
export function crossBenefit(streamId: string): string | null {
  const s = streamById(streamId);
  if (!s || !s.reinforces.length) return null;
  const others = s.reinforces
    .map((r) => streamById(r)?.label)
    .filter(Boolean)
    .slice(0, 3) as string[];
  if (!others.length) return null;
  return `Work here also feeds ${others.join(", ")} — the same effort earns in more than one place.`;
}

// ── State (stored inside partner_launch_state.state.money) ──────────────────

export type MoneyEntry = {
  date: string;
  amount: number;
  streamId: string;
  note: string;
};

export type MoneyState = {
  /** Real money logged by the partner, per stream. Never simulated. */
  log: MoneyEntry[];
  /** Move keys accepted onto a day: ISO date → keys. */
  assigned: Record<string, string[]>;
  /** Move keys deliberately skipped: ISO date → keys. */
  skipped: Record<string, string[]>;
  /** Monthly income goal for the Money Moves forecast. */
  monthlyGoal: number;
  /** FRASS-0462 — completed launch preparation task ids (pre-launch mode). */
  launchPrep: string[];
};

export const EMPTY_MONEY: MoneyState = { log: [], assigned: {}, skipped: {}, monthlyGoal: 0, launchPrep: [] };

export function normalizeMoney(raw: unknown): MoneyState {
  const m = (raw ?? {}) as Partial<MoneyState>;
  return {
    log: Array.isArray(m.log) ? (m.log as MoneyEntry[]) : [],
    assigned: (m.assigned as Record<string, string[]>) ?? {},
    skipped: (m.skipped as Record<string, string[]>) ?? {},
    monthlyGoal: typeof m.monthlyGoal === "number" ? m.monthlyGoal : 0,
    launchPrep: Array.isArray(m.launchPrep) ? m.launchPrep : [],
  };
}

function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

// ── Revenue forecast ────────────────────────────────────────────────────────

export type Forecast = {
  currentMonth: number;
  lastMonth: number;
  goal: number;
  progressPct: number;
  /** Honest projection: this month's pace carried to month end. Null if no data. */
  expectedMonth: number | null;
  perStream: { stream: IncomeStream; amount: number; sharePct: number }[];
  note: string;
};

export function forecast(money: MoneyState, fallbackGoal: number): Forecast {
  const now = todayISO();
  const thisMonth = monthKey(now);
  const prev = new Date(Date.parse(now));
  prev.setUTCMonth(prev.getUTCMonth() - 1);
  const lastKey = prev.toISOString().slice(0, 7);

  const inMonth = money.log.filter((e) => monthKey(e.date) === thisMonth);
  const currentMonth = inMonth.reduce((n, e) => n + e.amount, 0);
  const lastMonth = money.log
    .filter((e) => monthKey(e.date) === lastKey)
    .reduce((n, e) => n + e.amount, 0);

  const goal = money.monthlyGoal > 0 ? money.monthlyGoal : fallbackGoal;
  const dayOfMonth = Number(now.slice(8, 10));
  const daysInMonth = new Date(Date.UTC(Number(now.slice(0, 4)), Number(now.slice(5, 7)), 0)).getUTCDate();
  const expectedMonth =
    currentMonth > 0 ? Math.round((currentMonth / dayOfMonth) * daysInMonth) : lastMonth > 0 ? lastMonth : null;

  const perStream = INCOME_STREAMS.map((stream) => {
    const amount = inMonth.filter((e) => e.streamId === stream.id).reduce((n, e) => n + e.amount, 0);
    return { stream, amount, sharePct: currentMonth > 0 ? Math.round((amount / currentMonth) * 100) : 0 };
  })
    .filter((r) => r.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  return {
    currentMonth,
    lastMonth,
    goal,
    progressPct: goal > 0 ? Math.min(100, Math.round((currentMonth / goal) * 100)) : 0,
    expectedMonth,
    perStream,
    note:
      money.log.length === 0
        ? "No income has been logged yet, so every figure reads zero. Nothing here is simulated."
        : "Every figure comes from income you logged yourself.",
  };
}

// ── Momentum — the engine gets smarter ──────────────────────────────────────

export type Momentum = {
  leading: IncomeStream | null;
  quiet: IncomeStream[];
  /** Stream id → weight applied to opportunity scoring. */
  weights: Record<string, number>;
  line: string;
};

export function momentum(state: LaunchState, money: MoneyState): Momentum {
  const weights: Record<string, number> = {};
  const earnedBy: Record<string, number> = {};
  for (const e of money.log) earnedBy[e.streamId] = (earnedBy[e.streamId] ?? 0) + e.amount;

  const doneBy: Record<string, number> = {};
  for (const mv of allMoves(state)) if (mv.done) doneBy[mv.businessId] = (doneBy[mv.businessId] ?? 0) + 1;

  let leading: IncomeStream | null = null;
  let best = 0;
  for (const s of INCOME_STREAMS) {
    const earned = earnedBy[s.id] ?? 0;
    const worked = doneBy[s.id] ?? 0;
    const score = earned * 1 + worked * 5;
    weights[s.id] = 1 + (earned > 0 ? 0.6 : 0) + Math.min(0.3, worked * 0.05);
    if (earned > 0 && score > best) {
      best = score;
      leading = s;
    }
  }

  const quiet = INCOME_STREAMS.filter(
    (s) => state.businesses.includes(s.id) && !(doneBy[s.id] ?? 0) && !(earnedBy[s.id] ?? 0),
  );

  const line = leading
    ? `${leading.emoji} ${leading.label} is the one actually earning, so today leans harder there — that's where effort is already converting.`
    : money.log.length
      ? "Income has started but no single stream is clearly ahead yet, so today stays balanced across your businesses."
      : "Nothing has earned yet, so today prioritises the moves most likely to produce a first sale.";

  return { leading, quiet, weights, line };
}

// ── Opportunities & the 5-star score ────────────────────────────────────────

export type Opportunity = {
  id: string;
  streamId: string;
  streamLabel: string;
  streamEmoji: string;
  title: string;
  /** Frassy's strategy — never a bare task. */
  strategy: string;
  minutes: number;
  objectives: ObjectiveId[];
  score: 1 | 2 | 3 | 4 | 5;
  scoreParts: { label: string; value: number }[];
  href?: string;
  move?: ResolvedMove;
};

export type AffiliateReadiness = Pick<
  AffiliatePolicy,
  | "marketplace_launched"
  | "approved_products_available"
  | "approved_brand_partners_available"
  | "internal_campaigns_ready"
  | "affiliate_marketing_activated"
>;

export function affiliateIsReady(readiness: AffiliateReadiness): boolean {
  return (
    readiness.marketplace_launched &&
    readiness.approved_products_available &&
    readiness.approved_brand_partners_available &&
    readiness.internal_campaigns_ready &&
    readiness.affiliate_marketing_activated
  );
}

export function affiliatePreparationLine(readiness: AffiliateReadiness): string {
  if (affiliateIsReady(readiness)) {
    return "Great news. The Frass Marketplace is live, approved products and Brand Partners are ready, and the Founder has activated Affiliate Marketing. Let's begin building your affiliate income.";
  }
  return "Affiliate Marketing is in Preparation Mode. Frassy is quietly watching the Marketplace; until every Frass-first requirement is ready and the Founder activates it, your time stays on work that can earn at launch.";
}

function clamp5(n: number): 1 | 2 | 3 | 4 | 5 {
  return Math.min(5, Math.max(1, Math.round(n))) as 1 | 2 | 3 | 4 | 5;
}

export function starsOf(score: number): string {
  return "⭐".repeat(Math.max(1, Math.min(5, Math.round(score))));
}

/**
 * Opportunity Score. Time required, expected return, current audience,
 * business relevance, confidence — all real inputs, all shown to the partner.
 */
function scoreOpportunity(
  move: ResolvedMove,
  mom: Momentum,
  state: LaunchState,
): { score: 1 | 2 | 3 | 4 | 5; parts: { label: string; value: number }[] } {
  const time = move.minutes <= 20 ? 5 : move.minutes <= 45 ? 4 : move.minutes <= 90 ? 3 : 2;
  const ret = move.potential + 1; // 2..5
  const audience = Math.min(5, 1 + Math.floor(state.activeDays.length / 5));
  const relevance = clamp5((mom.weights[move.businessId] ?? 1) * 3);
  const confidence = move.major ? 4 : 3;
  const weighted = ret * 0.35 + relevance * 0.25 + time * 0.15 + audience * 0.15 + confidence * 0.1;
  return {
    score: clamp5(weighted),
    parts: [
      { label: "Expected return", value: ret },
      { label: "Business relevance", value: relevance },
      { label: "Time required", value: time },
      { label: "Current audience", value: audience },
      { label: "Confidence", value: confidence },
    ],
  };
}

function strategyFor(move: ResolvedMove, mom: Momentum): string {
  const cross = crossBenefit(move.businessId);
  const b = businessById(move.businessId);
  const lead = mom.leading && mom.leading.id === move.businessId ? " It also compounds the stream already earning." : "";
  return `${move.why} This supports ${b?.label ?? "your business"} and moves it closer to income.${lead}${cross ? ` ${cross}` : ""}`;
}

/**
 * The morning scan. Frassy reviews every open move across every active
 * business, keeps only the ones that serve a constitutional objective, and
 * ranks them by opportunity score.
 */
export function scanOpportunities(state: LaunchState, money: MoneyState, hoursPerDay: number): Opportunity[] {
  const mom = momentum(state, money);
  const pool = todaysMoves(state, Math.max(hoursPerDay, 3)); // scan wider than one day, then trim
  return pool
    .map((move) => {
      const objectives = objectivesFor(move);
      const { score, parts } = scoreOpportunity(move, mom, state);
      const opp: Opportunity = {
        id: move.key,
        streamId: move.businessId,
        streamLabel: move.businessLabel,
        streamEmoji: move.businessEmoji,
        title: move.label,
        strategy: strategyFor(move, mom),
        minutes: move.minutes,
        objectives,
        score,
        scoreParts: parts,
        move,
      };
      if (move.href) opp.href = move.href;
      return opp;
    })
    .filter((o) => o.objectives.length > 0)
    .sort((a, b) => b.score - a.score || a.minutes - b.minutes);
}

// ── Today's plan ────────────────────────────────────────────────────────────

export type MoneyPlan = {
  /** ⭐ Today's Highest Value Move — always first, always explained. */
  highest: Opportunity | null;
  rest: Opportunity[];
  totalMinutes: number;
  momentum: Momentum;
  /** Why today looks the way it does. */
  coach: string;
  /** Set when the foundation isn't finished — income work waits. */
  blocked: string | null;
};

export function moneyPlan(
  program: ProgramState,
  state: LaunchState,
  money: MoneyState,
  hoursPerDay: number,
  affiliateReadiness?: AffiliateReadiness,
): MoneyPlan {
  const mom = momentum(state, money);
  const opportunities = scanOpportunities(state, money, hoursPerDay).filter(
    (opportunity) =>
      opportunity.streamId !== "affiliate" ||
      (affiliateReadiness ? affiliateIsReady(affiliateReadiness) : false),
  );
  const skippedToday = new Set(money.skipped[todayISO()] ?? []);
  const live = opportunities.filter((o) => !skippedToday.has(o.id));

  const budget = Math.max(30, hoursPerDay * 60);
  const picked: Opportunity[] = [];
  let minutes = 0;
  for (const o of live) {
    if (minutes + o.minutes > budget && picked.length >= 1) continue;
    picked.push(o);
    minutes += o.minutes;
    if (picked.length >= 5) break;
  }

  const highest = picked[0] ?? null;
  const blocked = foundationComplete(program)
    ? null
    : "Your Foundation Day isn't finished yet. Income moves land far harder once your Card, Link and Wallet are live — finish those first.";

  const coach = highest
    ? `If you only have ${hoursPerDay} hour${hoursPerDay === 1 ? "" : "s"} today, ${highest.title.toLowerCase()} is the work most likely to increase your income. ${mom.line}`
    : "Everything I planned for you today is done. Rest is part of the plan.";

  return { highest, rest: picked.slice(1), totalMinutes: minutes, momentum: mom, coach, blocked };
}

// ── Founder visibility — mentoring, not monitoring ──────────────────────────

export type MoneyOversight = {
  assignedToday: number;
  completedToday: number;
  skippedToday: number;
  revenueThisMonth: number;
  revenueAllTime: number;
  leadingStream: string | null;
  quietStreams: string[];
};

export function moneyOversight(state: LaunchState, money: MoneyState): MoneyOversight {
  const d = todayISO();
  const mom = momentum(state, money);
  const assigned = money.assigned[d] ?? [];
  return {
    assignedToday: assigned.length,
    completedToday: assigned.filter((k) => state.done.includes(k)).length,
    skippedToday: (money.skipped[d] ?? []).length,
    revenueThisMonth: money.log
      .filter((e) => monthKey(e.date) === monthKey(d))
      .reduce((n, e) => n + e.amount, 0),
    revenueAllTime: money.log.reduce((n, e) => n + e.amount, 0),
    leadingStream: mom.leading ? `${mom.leading.emoji} ${mom.leading.label}` : null,
    quietStreams: mom.quiet.map((s) => `${s.emoji} ${s.label}`),
  };
}

/** Streams the partner has switched on, in ecosystem order. */
export function activeStreams(state: LaunchState): IncomeStream[] {
  const ids = new Set(state.businesses.length ? state.businesses : LAUNCH_BUSINESSES.map((b) => b.id));
  return INCOME_STREAMS.filter((s) => ids.has(s.id));
}
