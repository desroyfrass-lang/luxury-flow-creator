// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0546 — Adaptive Momentum Engine.
//
// "Deadlines are earned — not imposed."
//
// Everyone starts in a pressure-free environment. As a member consistently
// finishes Daily tasks and Money Moves, Frassy may OFFER challenges with real
// completion dates. The member may accept or decline any challenge, always.
// If the pace turns heavy, the engine steps back down on its own.
//
// Plain English: a good coach doesn't hand a beginner a stopwatch. She waits
// until you're running well, then asks if you'd like to time yourself.
// ─────────────────────────────────────────────────────────────────────────────

import { readBalance, type BalanceSignals } from "./human-balance";
import { loadWorkingStyle } from "./working-style";

/* ── Momentum levels ─────────────────────────────────────────────────────── */

export type MomentumLevel = "explorer" | "builder" | "momentum" | "high_performer";

export type MomentumLevelMeta = {
  id: MomentumLevel;
  glyph: string;
  label: string;
  /** What this level feels like to the member. */
  promise: string;
  /** How Frassy behaves here. */
  coaching: string;
  /** Does Frassy offer dated challenges at this level? */
  challengesUnlocked: boolean;
};

export const MOMENTUM_LEVELS: MomentumLevelMeta[] = [
  {
    id: "explorer",
    glyph: "🌱",
    label: "Explorer",
    promise: "No deadlines. Nothing is late. Every small win counts.",
    coaching:
      "No dates, no targets, no pressure. Encourage gently, celebrate every small win, and build confidence first.",
    challengesUnlocked: false,
  },
  {
    id: "builder",
    glyph: "🚀",
    label: "Builder",
    promise: "One weekly goal, a flexible target date, and gentle reminders.",
    coaching:
      "Offer one weekly goal with a flexible target date. Track progress visibly. Reminders stay gentle and are never framed as lateness.",
    challengesUnlocked: false,
  },
  {
    id: "momentum",
    glyph: "🦈",
    label: "Momentum Builder",
    promise: "Optional challenges with real completion dates — accept or decline freely.",
    coaching:
      "Momentum Challenges are unlocked. Offer one at a time, with a clear goal and a real completion date, and make declining completely normal.",
    challengesUnlocked: true,
  },
  {
    id: "high_performer",
    glyph: "👑",
    label: "High Performer",
    promise: "Set your own challenges, or let Frassy raise the bar.",
    coaching:
      "The member may write their own challenges. Recommend increasingly ambitious milestones, and match the reward to the size of the impact.",
    challengesUnlocked: true,
  },
];

export function momentumMeta(level: MomentumLevel): MomentumLevelMeta {
  return MOMENTUM_LEVELS.find((l) => l.id === level) ?? MOMENTUM_LEVELS[0]!;
}

/* ── Achievement styles ──────────────────────────────────────────────────── */
// The engine behaves differently for each; the destination is identical.

export type AchievementStyle = "shark" | "climber" | "sprinter" | "gardener" | "navigator";

export type AchievementStyleMeta = {
  id: AchievementStyle;
  glyph: string;
  label: string;
  memberVoice: string;
  /** How challenges are shaped for this style. */
  shaping: string;
  /** Default challenge window, in days. */
  horizonDays: number;
};

export const ACHIEVEMENT_STYLES: AchievementStyleMeta[] = [
  {
    id: "shark",
    glyph: "🦈",
    label: "Shark",
    memberVoice: "Competitive, ambitious, I love a target.",
    shaping: "Name the target and the date up front. Numbers, streaks and personal bests land well.",
    horizonDays: 7,
  },
  {
    id: "climber",
    glyph: "🏔️",
    label: "Climber",
    memberVoice: "Steady and consistent — one step at a time.",
    shaping: "Break the goal into visible steps and show the ground already covered before the next step.",
    horizonDays: 14,
  },
  {
    id: "sprinter",
    glyph: "🚀",
    label: "Sprinter",
    memberVoice: "Short bursts of intense focus.",
    shaping: "Short, sharp challenges — two or three days, one outcome, then a deliberate rest.",
    horizonDays: 3,
  },
  {
    id: "gardener",
    glyph: "🌳",
    label: "Gardener",
    memberVoice: "Slow, sustainable growth.",
    shaping: "Small repeated actions over a long window. Growth language, never urgency language.",
    horizonDays: 30,
  },
  {
    id: "navigator",
    glyph: "🌊",
    label: "Navigator",
    memberVoice: "Flexible — I adapt to whatever opens up.",
    shaping:
      "Offer a goal with two or three routes to it and let the member pick the route as conditions change.",
    horizonDays: 10,
  },
];

export function styleMeta(style: AchievementStyle): AchievementStyleMeta {
  return ACHIEVEMENT_STYLES.find((s) => s.id === style) ?? ACHIEVEMENT_STYLES[1]!;
}

/* ── Earned progress (local, member-owned) ───────────────────────────────── */

export type MomentumRecord = {
  /** Challenges the member accepted and finished. */
  completed: number;
  /** Challenges offered and declined — declining is free and never penalised. */
  declined: number;
  /** Weeks in a row with real progress. */
  consistentWeeks: number;
  /** Chosen achievement style, when the member has picked one. */
  style: AchievementStyle | null;
  /** The member may switch challenges off entirely, forever. */
  challengesOptOut: boolean;
  updatedAt: string | null;
};

export const EMPTY_MOMENTUM: MomentumRecord = {
  completed: 0,
  declined: 0,
  consistentWeeks: 0,
  style: null,
  challengesOptOut: false,
  updatedAt: null,
};

const KEY = "frassy:momentum:v1";

export function loadMomentum(): MomentumRecord {
  if (typeof window === "undefined") return EMPTY_MOMENTUM;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY_MOMENTUM;
    return { ...EMPTY_MOMENTUM, ...(JSON.parse(raw) as Partial<MomentumRecord>) };
  } catch {
    return EMPTY_MOMENTUM;
  }
}

export function saveMomentum(record: MomentumRecord) {
  if (typeof window === "undefined") return;
  const next = { ...record, updatedAt: new Date().toISOString() };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("frassy:momentum", { detail: next }));
  } catch {
    /* the member simply stays where they are */
  }
}

/* ── The engine ──────────────────────────────────────────────────────────── */

export type Momentum = {
  level: MomentumLevel;
  meta: MomentumLevelMeta;
  style: AchievementStyleMeta | null;
  /** May Frassy offer a dated challenge right now? */
  mayChallenge: boolean;
  /** True when the engine stepped back down to protect the member. */
  easedOff: boolean;
  /** What the member sees, in plain English. */
  plain: string;
  /** What unlocks the next level, if anything. */
  nextUnlock: string | null;
};

/**
 * Earned, never imposed. Levels rise on demonstrated consistency and fall the
 * moment the pace reads strained or tired.
 */
export function readMomentum(
  signals: BalanceSignals,
  record: MomentumRecord = EMPTY_MOMENTUM,
): Momentum {
  const balance = readBalance(signals, typeof window === "undefined" ? null : loadWorkingStyle());
  const overwhelmed = balance.state === "strained" || balance.state === "tired";

  let level: MomentumLevel = "explorer";
  if (record.completed >= 6 && record.consistentWeeks >= 6 && signals.completedThisWeek >= 8) {
    level = "high_performer";
  } else if (record.completed >= 2 && record.consistentWeeks >= 3 && signals.completedThisWeek >= 5) {
    level = "momentum";
  } else if (record.consistentWeeks >= 1 || signals.completedThisWeek >= 3) {
    level = "builder";
  }

  let easedOff = false;
  if (overwhelmed && level !== "explorer") {
    level = level === "high_performer" ? "momentum" : "explorer";
    if (balance.state === "tired") level = "explorer";
    easedOff = true;
  }

  const meta = momentumMeta(level);
  const style = record.style ? styleMeta(record.style) : null;
  const mayChallenge = meta.challengesUnlocked && !record.challengesOptOut && !overwhelmed;

  const plain = easedOff
    ? "This week has been heavy, so Frassy has taken the pressure off. Your progress is safe — challenges come back when the pace settles."
    : level === "explorer"
      ? "Nothing here has a deadline. Frassy is building confidence with you first."
      : level === "builder"
        ? "You're consistent enough for one weekly goal with a flexible target date."
        : level === "momentum"
          ? "You've earned Momentum Challenges — dated goals you can accept or decline, always."
          : "You set the bar now. Frassy will keep raising it as long as you want her to.";

  const nextUnlock =
    level === "explorer"
      ? "Finish three tasks in a week and Frassy will offer one weekly goal."
      : level === "builder"
        ? "Two finished goals across three consistent weeks unlocks Momentum Challenges."
        : level === "momentum"
          ? "Six completed challenges across six consistent weeks unlocks writing your own."
          : null;

  return { level, meta, style, mayChallenge, easedOff, plain, nextUnlock };
}

/* ── Challenges ──────────────────────────────────────────────────────────── */

export type Challenge = {
  id: string;
  title: string;
  /** Why this challenge moves them toward financial freedom. */
  why: string;
  /** Days from today. */
  days: number;
  /** What completing it may unlock. */
  reward: string;
};

const CHALLENGE_LIBRARY: Challenge[] = [
  {
    id: "next_100",
    title: "Earn your next $100",
    why: "Real money in, from work you already know how to do.",
    days: 7,
    reward: "Frass Credits and a Blueprint achievement",
  },
  {
    id: "first_product",
    title: "Publish your first product",
    why: "A product keeps earning after the day you made it.",
    days: 5,
    reward: "Marketplace promotion for your first listing",
  },
  {
    id: "first_ebook",
    title: "Finish your first e-book",
    why: "Your knowledge becomes an asset you own forever.",
    days: 30,
    reward: "Author Vault achievement and a featured member slot",
  },
  {
    id: "three_moves",
    title: "Complete three Money Moves",
    why: "Three finished moves is the point momentum stops needing you to push.",
    days: 5,
    reward: "Frass Credits and a new Business Vault capability",
  },
  {
    id: "first_customer",
    title: "Serve your first customer",
    why: "One customer turns an idea into a business.",
    days: 14,
    reward: "Community recognition, at your chosen privacy level",
  },
];

/** Shapes a challenge to the member's achievement style; never auto-accepts it. */
export function offerChallenge(
  momentum: Momentum,
  record: MomentumRecord = EMPTY_MOMENTUM,
  seed = 0,
): (Challenge & { dueLabel: string }) | null {
  if (!momentum.mayChallenge) return null;
  const base = CHALLENGE_LIBRARY[(record.completed + seed) % CHALLENGE_LIBRARY.length]!;
  const horizon = momentum.style?.horizonDays ?? base.days;
  const days = Math.max(2, Math.round((base.days + horizon) / 2));
  const due = new Date();
  due.setDate(due.getDate() + days);
  return {
    ...base,
    days,
    dueLabel: due.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" }),
  };
}

/* ── What Frassy is told ─────────────────────────────────────────────────── */

export const MOMENTUM_ENGINE = `━━━ FRASS-0546 — ADAPTIVE MOMENTUM ENGINE ━━━
CONSTITUTIONAL PRINCIPLE: growth is encouraged, never forced. Deadlines are EARNED, not imposed.
Members begin pressure-free. Only after consistent completed work may you offer dated challenges,
and the member may accept or decline any challenge without consequence or comment.
${MOMENTUM_LEVELS.map((l) => `${l.glyph} ${l.label} — ${l.coaching}`).join("\n")}

Achievement styles (the member chooses; the destination is the same for all of them):
${ACHIEVEMENT_STYLES.map((s) => `${s.glyph} ${s.label} — ${s.shaping}`).join("\n")}

Never call a member late, behind or overdue. If completion rate drops, stress or burnout signals
appear, or the pace reads strained, reduce pressure immediately and say so plainly — returning to a
supportive pace is a decision Frassy makes for the member's long-term success, never a demotion.
The greatest reward remains the member's own financial progress; credits, badges, promotion and
recognition are secondary and always respect the member's privacy settings.`;

/** The per-conversation line describing where this member actually is. */
export function momentumContext(momentum: Momentum): string {
  const bits = [
    `Momentum level: ${momentum.meta.glyph} ${momentum.meta.label}. ${momentum.meta.coaching}`,
    momentum.style
      ? `Achievement style: ${momentum.style.glyph} ${momentum.style.label}. ${momentum.style.shaping}`
      : "No achievement style chosen yet — you may offer the choice once, then leave it alone.",
    momentum.mayChallenge
      ? "You may offer ONE dated challenge if it fits the conversation. Make declining feel completely normal."
      : "Do NOT offer dated challenges or deadlines right now.",
    momentum.easedOff
      ? "Pressure has been reduced automatically this week. Reassure, simplify, and do not mention any lost level."
      : "",
  ].filter(Boolean);
  return bits.join("\n");
}
