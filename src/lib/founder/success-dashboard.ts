// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0547 — Founder Success Dashboard  ·  FRASS-0548 — Founder Visibility.
//
// "Measure progress. Protect privacy."
//
// The Founder is a principal, not an auditor. This module describes progress —
// momentum, streaks, blueprint completion, legacy work — and deliberately
// refuses to describe money in exact terms. Personal earnings are shown as a
// RANGE and nothing finer, unless the member has explicitly opted into Founder
// Coaching. Bank balances, cards, tax records and personal accounts are never
// available to the Founder at all, under any condition.
//
// Plain English: you can see who is thriving and who needs a hand. You cannot
// see anybody's bank account. Those are two different things on purpose.
// ─────────────────────────────────────────────────────────────────────────────

export const FOUNDER_VISIBILITY_PRINCIPLE =
  "The Founder should have visibility into member progress to better support the community, but never more visibility than is necessary to fulfil that responsibility. Member dignity, privacy and trust always come first.";

export const FOUNDER_CONFIDENTIAL_BANNER =
  "Founder Confidential — Support & Mentorship Only. This information exists to support members, improve the platform and guide the Frass ecosystem. It is never publicly visible and is never shared with other members.";

export const FOUNDER_CONFIDENTIAL_LABEL = "Founder Confidential — Support & Mentorship Only";

/** FRASS-0548 — Founder Responsibility. What this insight may and may never do. */
export const FOUNDER_RESPONSIBILITY = {
  mayBeUsedTo: [
    "Support members",
    "Improve the platform",
    "Celebrate achievements",
    "Offer guidance",
  ],
  mayNeverBeUsedTo: [
    "Rank members publicly",
    "Shame members",
    "Sell member analytics",
    "Create public leaderboards without member consent",
  ],
} as const;

/** Things the Founder may never see about a member, whatever the surface. */
export const NEVER_VISIBLE_TO_FOUNDER = [
  "Bank balances",
  "Credit card balances",
  "Exact personal income",
  "Tax records",
  "Personal financial accounts",
] as const;

/** Things the Founder may see, for mentorship and platform improvement. */
export const FOUNDER_MAY_VIEW = [
  "Overall momentum",
  "Achievement style",
  "Blueprint progress",
  "Business Vault progress",
  "Money Move progress",
  "Daily completion",
  "Digital legacy progress",
  "Project completion",
  "Engagement trends",
  "Milestone progress",
  "Frassy's coaching recommendations",
  "Revenue ranges — never exact personal balances",
] as const;

/* ── Momentum tone ──────────────────────────────────────────────────────── */

export type SuccessTone = "thriving" | "growing" | "encouragement" | "support";

export const TONE_META: Record<SuccessTone, { glyph: string; label: string; plain: string }> = {
  thriving: {
    glyph: "🟢",
    label: "Thriving",
    plain: "Moving well on their own. Celebrate, don't interrupt.",
  },
  growing: {
    glyph: "🟡",
    label: "Growing",
    plain: "Steady progress. A nudge helps; nothing is wrong.",
  },
  encouragement: {
    glyph: "🟠",
    label: "Needs encouragement",
    plain: "Slowing down. A short message from you would land well.",
  },
  support: {
    glyph: "🔴",
    label: "Needs support",
    plain: "Stalled or quiet for a while. Reach out personally.",
  },
};

/* ── Revenue ranges — the only money the Founder ever sees ──────────────── */

export type RevenueBand =
  | "none"
  | "first"
  | "100"
  | "500"
  | "1k"
  | "5k"
  | "10k"
  | "50k";

const BANDS: { id: RevenueBand; min: number; label: string }[] = [
  { id: "none", min: 0, label: "Not yet earning" },
  { id: "first", min: 0.01, label: "First income earned" },
  { id: "100", min: 100, label: "$100+" },
  { id: "500", min: 500, label: "$500+" },
  { id: "1k", min: 1_000, label: "$1,000+" },
  { id: "5k", min: 5_000, label: "$5,000+" },
  { id: "10k", min: 10_000, label: "$10,000+" },
  { id: "50k", min: 50_000, label: "$50,000+" },
];

/**
 * Converts an amount into a range. Deliberately lossy: the exact number never
 * leaves the server, and the Founder never receives it.
 */
export function revenueBand(amount: number | null | undefined): RevenueBand {
  const n = Number(amount ?? 0);
  let band: RevenueBand = "none";
  for (const b of BANDS) if (n >= b.min) band = b.id;
  return band;
}

export function revenueBandLabel(band: RevenueBand): string {
  return BANDS.find((b) => b.id === band)?.label ?? "Not yet earning";
}

/* ── One member, as the Founder sees them ───────────────────────────────── */

export type MemberProgress = {
  userId: string;
  name: string;
  tone: SuccessTone;
  /** 0–100, blended from the progress signals below. Never money-weighted. */
  progress: number;
  achievementStyle: string | null;
  momentumLevel: string | null;
  dailyStreak: number;
  daysQuiet: number;
  blueprintProgress: number;
  moneyMovesActive: number;
  moneyMovesCompleted: number;
  projectsCompleted: number;
  booksInProgress: number;
  booksPublished: number;
  revenue: RevenueBand;
  coachingOptIn: boolean;
  insight: string;
  /** Why Frassy classified this member's achievement style the way she did. */
  archetypeReason: string;
  /** The single thing the Founder should do about this member today. */
  recommendedAction: string;
};

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

export function toneFor(input: {
  daysQuiet: number;
  progress: number;
  moneyMovesCompleted: number;
}): SuccessTone {
  if (input.daysQuiet >= 14) return "support";
  if (input.daysQuiet >= 7) return "encouragement";
  if (input.progress >= 70 || input.moneyMovesCompleted >= 3) return "thriving";
  if (input.progress >= 35) return "growing";
  return "encouragement";
}

/** A blended progress score. Money is never an input — only work completed. */
export function progressScore(p: {
  blueprintProgress: number;
  moneyMovesCompleted: number;
  projectsCompleted: number;
  booksPublished: number;
  dailyStreak: number;
}): number {
  return clamp(
    p.blueprintProgress * 0.35 +
      Math.min(p.moneyMovesCompleted, 6) * 6 +
      Math.min(p.projectsCompleted, 6) * 4 +
      Math.min(p.booksPublished, 3) * 6 +
      Math.min(p.dailyStreak, 14) * 1.5,
  );
}

/**
 * Frassy's one-line read on a member. Observational and kind — never a verdict
 * on the person, always a description of the work.
 */
export function memberInsight(m: Omit<MemberProgress, "insight" | "tone">, tone: SuccessTone): string {
  if (tone === "support") {
    return m.daysQuiet >= 30
      ? "Quiet for over a month. A personal check-in matters more than another notification."
      : "This member appears to have stalled. Consider reaching out yourself.";
  }
  if (tone === "encouragement") {
    if (m.moneyMovesActive > 0)
      return "Work is started but not finishing. One completed Money Move would restore momentum.";
    return "Progress has slowed. A short encouraging message would likely restart them.";
  }
  if (tone === "thriving") {
    if (m.booksInProgress > 0 && m.booksPublished === 0)
      return "Excellent progress, and a book is close. A nudge to publish could be the milestone.";
    return "Making excellent progress independently. Celebrate rather than intervene.";
  }
  return "Steady and consistent. Nothing needed today beyond recognition.";
}

/* ── Founder Radar — the morning attention list ─────────────────────────── */

export type RadarBucket = {
  id: string;
  glyph: string;
  label: string;
  count: number;
  members: { userId: string; name: string }[];
};

export function buildRadar(members: MemberProgress[]): RadarBucket[] {
  const pick = (f: (m: MemberProgress) => boolean) =>
    members.filter(f).map((m) => ({ userId: m.userId, name: m.name }));

  const encouragement = pick((m) => m.tone === "encouragement" || m.tone === "support");
  const nearMilestone = pick(
    (m) => m.tone !== "support" && m.progress >= 55 && m.progress < 75,
  );
  const launched = pick((m) => m.moneyMovesCompleted > 0 && m.revenue !== "none");
  const published = pick((m) => m.booksPublished > 0);
  const independent = pick((m) => m.revenue === "5k" || m.revenue === "10k" || m.revenue === "50k");

  return [
    { id: "encouragement", glyph: "❤️", label: "members need encouragement", count: encouragement.length, members: encouragement },
    { id: "milestone", glyph: "🔥", label: "members are close to a milestone", count: nearMilestone.length, members: nearMilestone },
    { id: "launched", glyph: "🎉", label: "members launched something that earned", count: launched.length, members: launched },
    { id: "published", glyph: "📚", label: "members published a book", count: published.length, members: published },
    { id: "independent", glyph: "🚀", label: "members reached serious recurring income", count: independent.length, members: independent },
  ].filter((b) => b.count > 0);
}

/** The journey bar: where a member started, and where they are now. */
export const JOURNEY_STAGES = [
  { id: "explorer", glyph: "🌱", label: "Explorer", at: 0 },
  { id: "builder", glyph: "🚀", label: "Builder", at: 35 },
  { id: "momentum", glyph: "🏔️", label: "Momentum", at: 65 },
  { id: "high", glyph: "👑", label: "High performer", at: 85 },
] as const;

export function journeyFill(progress: number, stageAt: number): number {
  const next = JOURNEY_STAGES.find((s) => s.at > stageAt)?.at ?? 100;
  if (progress <= stageAt) return 0;
  if (progress >= next) return 100;
  return Math.round(((progress - stageAt) / (next - stageAt)) * 100);
}
