// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0479A — Frassy Human Balance Layer (amendment to the Architecture Freeze).
//
// Not a new page. Not a dashboard. Not a second coaching system. This extends
// the frozen Frassy architecture — one Frassy, one personality, one presence
// engine, one working-style engine, one context engine — with a single new
// responsibility:
//
//   "Frassy continuously balances achievement with wellbeing. She is
//    responsible not only for helping members build successful businesses, but
//    for helping them build sustainable lives."
//
// She adjusts her coaching style. She never adjusts the member's freedom.
//
// Plain English: a good coach doesn't shout the same thing at every player on
// every day. Same coach, same plan — different volume depending on how tired
// you look.
// ─────────────────────────────────────────────────────────────────────────────

import { loadWorkingStyle, type WorkingStyle } from "./working-style";

export const BALANCE_PRINCIPLE =
  "Frassy's success is measured not only by how many businesses she helps build, but by how many people she helps build sustainable, fulfilling lives while building those businesses.";

/* ── Observation ──────────────────────────────────────────────────────────── */

export type BalanceSignals = {
  /** Tasks Frassy is holding on today's Daily. */
  openTasks: number;
  /** Tasks that carried over unfinished from previous days. */
  carriedOver: number;
  /** Tasks completed in the last seven days. */
  completedThisWeek: number;
  /** Consecutive days worked without a rest day, when known. */
  daysWithoutRest: number;
  /** Minutes worked today, when known. */
  minutesToday: number;
};

export const NO_SIGNALS: BalanceSignals = {
  openTasks: 0,
  carriedOver: 0,
  completedThisWeek: 0,
  daysWithoutRest: 0,
  minutesToday: 0,
};

export type BalanceState =
  | "settled" // steady, healthy pace
  | "flowing" // consistent progress, confidence rising
  | "stretched" // heavy load building
  | "strained" // heavy load, repeated unfinished tasks
  | "tired"; // long stretch without rest

export type Balance = {
  state: BalanceState;
  /** How many things she should put in front of them today. */
  suggestedFocus: number;
  /** Her coaching adjustment, in her own voice. */
  coaching: string;
  /** What she is noticing, in plain English, if the member asks. */
  plain: string;
  /** Should she hold back opportunity suggestions today? */
  holdOpportunities: boolean;
};

const LATE_HOURS = new Set(["night"]);

export function readBalance(signals: BalanceSignals, style?: WorkingStyle | null): Balance {
  const s = style ?? loadWorkingStyle();
  const unfinishedRatio =
    signals.openTasks > 0 ? signals.carriedOver / Math.max(signals.openTasks, 1) : 0;
  const heavy = signals.openTasks >= 8;
  const veryHeavy = signals.openTasks >= 12;
  const longHours = signals.minutesToday >= 360;
  const noRest = signals.daysWithoutRest >= 7;
  const nightOwl = LATE_HOURS.has(dominantDayPart(s));
  const steady = signals.completedThisWeek >= 5 && unfinishedRatio < 0.3;

  if (noRest || (longHours && nightOwl)) {
    return {
      state: "tired",
      suggestedFocus: 1,
      coaching:
        "You've been at this every day for a while. Pick the one thing that matters most today, and let the rest wait for you — it will.",
      plain:
        "Frassy noticed you haven't taken a day off recently, so she's shortened today's list instead of adding to it.",
      holdOpportunities: true,
    };
  }

  if (veryHeavy || (heavy && unfinishedRatio >= 0.5)) {
    return {
      state: "strained",
      suggestedFocus: 2,
      coaching:
        "You've accomplished a lot this week. Let's focus on the two most important things today and leave the rest where they are.",
      plain:
        "The list grew faster than the week allowed. Frassy is narrowing it rather than calling you behind.",
      holdOpportunities: true,
    };
  }

  if (heavy) {
    return {
      state: "stretched",
      suggestedFocus: 3,
      coaching:
        "There's a lot on the board. Three things today would be a genuinely good day — anything else is a bonus.",
      plain: "A heavy day, so Frassy is trimming rather than piling on.",
      holdOpportunities: true,
    };
  }

  if (steady) {
    return {
      state: "flowing",
      suggestedFocus: 4,
      coaching:
        "You're making steady progress. Let's finish one more step together and keep the rhythm going.",
      plain: "You've been consistent this week, so Frassy is keeping the pace instead of changing it.",
      holdOpportunities: false,
    };
  }

  return {
    state: "settled",
    suggestedFocus: 4,
    coaching: "Good place to work from. Let's take the next honest step.",
    plain: "Nothing unusual in your pace — Frassy is coaching normally today.",
    holdOpportunities: false,
  };
}

function dominantDayPart(style: WorkingStyle): string {
  const entries = Object.entries(style.dayParts ?? {});
  if (entries.length === 0) return "afternoon";
  return entries.sort((a, b) => b[1] - a[1])[0]![0];
}

/** Never say "you're behind". Frassy rewrites pressure into progress. */
export function rephrasePressure(line: string): string {
  return line
    .replace(/you(?:'| a)?re behind(?: schedule)?/gi, "you're making steady progress")
    .replace(/you failed to/gi, "you haven't yet")
    .replace(/overdue/gi, "still waiting for you");
}

/* ── Celebration ──────────────────────────────────────────────────────────── */
// Moments that matter. Never every tiny action — that is how celebration
// becomes noise and stops meaning anything.

export type Milestone = {
  id: string;
  label: string;
  line: string;
  /** Big enough for the Daily to open on it. */
  headline: boolean;
};

export const MILESTONES: Milestone[] = [
  { id: "first_money_move", label: "First Money Move completed", line: "You finished your first Money Move. That's the hardest one there is.", headline: true },
  { id: "first_customer", label: "First customer", line: "Someone chose you. That's a real business now.", headline: true },
  { id: "first_sale", label: "First sale", line: "First money earned on Frass. Everything after this is repetition.", headline: true },
  { id: "first_business_launched", label: "First business launched", line: "Your business is open. Today is the day you'll point back to.", headline: true },
  { id: "first_partner", label: "First partner recruited", line: "You brought someone with you. That's how a hill becomes a town.", headline: true },
  { id: "first_gallery", label: "First gallery opened", line: "Your gallery is live and your work has a room of its own.", headline: true },
  { id: "goal_achieved", label: "Major personal goal achieved", line: "You set that goal yourself, and you reached it.", headline: true },
  { id: "first_product", label: "First product published", line: "First product live. It exists because you made it.", headline: false },
  { id: "first_payout", label: "First payout received", line: "Money landed in your account. Earned, not given.", headline: false },
];

export function milestone(id: string): Milestone | undefined {
  return MILESTONES.find((m) => m.id === id);
}

const CELEBRATED_KEY = "frassy:celebrated:v1";

function celebrated(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(CELEBRATED_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

/** True once, ever. A milestone celebrated twice is not a milestone. */
export function shouldCelebrate(id: string): boolean {
  return MILESTONES.some((m) => m.id === id) && !celebrated().includes(id);
}

export function markCelebrated(id: string) {
  if (typeof window === "undefined") return;
  const list = celebrated();
  if (list.includes(id)) return;
  try {
    window.localStorage.setItem(CELEBRATED_KEY, JSON.stringify([...list, id]));
  } catch {
    /* it will simply be celebrated again next time */
  }
}

export function pendingCelebrations(reached: string[]): Milestone[] {
  return reached
    .filter((id) => shouldCelebrate(id))
    .map((id) => milestone(id))
    .filter((m): m is Milestone => Boolean(m));
}

/* ── What Frassy is told ──────────────────────────────────────────────────── */
// Folded into the existing Frassy context — no new prompt system.

export function balanceBriefing(balance: Balance, celebrations: Milestone[]): string {
  const lines = [
    `HUMAN BALANCE (FRASS-0479A): the member's pace reads "${balance.state}".`,
    `Coaching adjustment: ${balance.coaching}`,
    `Offer at most ${balance.suggestedFocus} priorities today. Never say "you're behind" — say "steady progress".`,
    balance.holdOpportunities
      ? "Hold new opportunities today unless they ask. Simplify, encourage, support — never overwhelm."
      : "Normal coaching pace is appropriate today.",
  ];
  if (celebrations.length > 0) {
    lines.push(
      `CELEBRATE FIRST: ${celebrations.map((c) => `${c.label} — "${c.line}"`).join(" · ")}`,
    );
  }
  lines.push("Personal growth must never become another checklist.");
  return lines.join("\n");
}
