// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0502 — Daily ROI · Energy Management · Momentum Protection
// and the Golden Rule: Every Daily Ends Better Than It Began.
//
// Constitutional · P0 · platform-wide.
//
// "Every interaction inside Frass must leave the member measurably better off
//  than before they opened the platform — financially, professionally,
//  personally, or emotionally."
//
// This is a measurement and sequencing layer over the Daily we already have.
// It creates no new tasks (FRASS-0494) and never adds pressure (FRASS-0500).
// ─────────────────────────────────────────────────────────────────────────────

// ── 1. Daily ROI — Return on Time ───────────────────────────────────────────
// Frassy does not maximise output. She maximises the value of whatever time a
// member actually has. 2 hours, 4 hours or 30 minutes — same respect.

export type TimedMove = {
  id: string;
  label: string;
  minutes: number;
  /** 1–5. How strongly this move improves the member's financial position. */
  impact: number;
  layer?: string;
};

export type RoiPlan = {
  availableMinutes: number;
  chosen: TimedMove[];
  usedMinutes: number;
  leftoverMinutes: number;
  /** Value produced per hour of the member's life spent. Higher is better. */
  returnPerHour: number;
  /** Plain English so the member understands the shape of the day. */
  explanation: string;
};

/**
 * "If this member only has today's available time, what combination of Money
 * Moves produces the highest return?" Greedy by impact-per-minute, which is
 * the honest answer for the small numbers a real Daily deals with.
 */
export function planByReturnOnTime(moves: TimedMove[], availableMinutes: number): RoiPlan {
  const budget = Math.max(0, Math.round(availableMinutes));
  const ranked = [...moves]
    .filter((m) => m.minutes > 0)
    .sort((a, b) => b.impact / b.minutes - a.impact / a.minutes);

  const chosen: TimedMove[] = [];
  let used = 0;
  for (const m of ranked) {
    if (used + m.minutes <= budget) {
      chosen.push(m);
      used += m.minutes;
    }
  }
  const value = chosen.reduce((sum, m) => sum + m.impact, 0);
  const returnPerHour = used ? Math.round((value / (used / 60)) * 10) / 10 : 0;

  const explanation = !budget
    ? "Tell me how long you have today and I'll shape the day around it."
    : chosen.length === 0
      ? "Nothing fits in that window today, so let's do one small thing instead of a long one."
      : `${chosen.length} thing${chosen.length === 1 ? "" : "s"} in ${used} minutes — chosen because they return the most for the time you actually have.`;

  return {
    availableMinutes: budget,
    chosen,
    usedMinutes: used,
    leftoverMinutes: Math.max(0, budget - used),
    returnPerHour,
    explanation,
  };
}

// ── 2. Energy Management ────────────────────────────────────────────────────
// Not every task should happen when someone is tired. Frassy quietly learns
// when a member thinks best, and puts the right kind of work in that window.

export type EnergyWindow = "morning" | "afternoon" | "evening";

export type EnergyProfile = {
  window: EnergyWindow;
  label: string;
  /** The kind of work that belongs in this window. */
  bestFor: string[];
  /** What Frassy avoids scheduling here. */
  avoid: string[];
  plain: string;
};

export const ENERGY_WINDOWS: EnergyProfile[] = [
  {
    window: "morning",
    label: "Morning",
    bestFor: ["Writing", "Strategy", "Building businesses"],
    avoid: ["Admin busywork"],
    plain: "This is when your thinking is sharpest. Deep work belongs here.",
  },
  {
    window: "afternoon",
    label: "Afternoon",
    bestFor: ["Administrative work"],
    avoid: ["Anything that needs fresh creative energy"],
    plain: "Good for tidy-up work: listings, pricing, replies, orders.",
  },
  {
    window: "evening",
    label: "Evening",
    bestFor: ["Learning", "Reflection", "Planning tomorrow"],
    avoid: ["Starting something big"],
    plain: "Wind-down work. Nothing here should feel like a new mountain.",
  },
];

export function currentWindow(now: Date = new Date()): EnergyWindow {
  const h = now.getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

export function energyProfile(w: EnergyWindow = currentWindow()): EnergyProfile {
  return ENERGY_WINDOWS.find((e) => e.window === w) ?? (ENERGY_WINDOWS[0] as EnergyProfile);
}

const ENERGY_KEY = "frass.energy.observations";

type EnergyObservation = Record<EnergyWindow, number>;

function readObservations(): EnergyObservation {
  const empty: EnergyObservation = { morning: 0, afternoon: 0, evening: 0 };
  try {
    const raw = localStorage.getItem(ENERGY_KEY);
    if (!raw) return empty;
    return { ...empty, ...(JSON.parse(raw) as Partial<EnergyObservation>) };
  } catch {
    return empty;
  }
}

/** Called quietly whenever a member completes something. Never surfaced as a score. */
export function observeCompletion(now: Date = new Date()) {
  try {
    const obs = readObservations();
    const w = currentWindow(now);
    obs[w] = (obs[w] ?? 0) + 1;
    localStorage.setItem(ENERGY_KEY, JSON.stringify(obs));
  } catch {
    /* private browsing — Frassy simply learns nothing today */
  }
}

/** The window this member actually gets things done in, once there's evidence. */
export function learnedBestWindow(): EnergyWindow | null {
  const obs = readObservations();
  const entries = Object.entries(obs) as [EnergyWindow, number][];
  const total = entries.reduce((s, [, n]) => s + n, 0);
  if (total < 5) return null; // not enough evidence to claim anything
  const top = entries.sort((a, b) => b[1] - a[1])[0];
  return top && top[1] > 0 ? top[0] : null;
}

// ── 3. Momentum Protection ──────────────────────────────────────────────────
// Never punish someone for falling behind. Always help them restart.

export type Restart = {
  daysAway: number;
  /** Frassy's opening line. Never a backlog count. */
  greeting: string;
  /** Exactly one thing to do, chosen to be winnable. */
  oneMove: string;
  /** Reassurance about what happened to the missed days. */
  reassurance: string;
};

export function protectMomentum(daysAway: number, nextMoveLabel?: string): Restart {
  const move = nextMoveLabel ?? "One important Money Move";
  if (daysAway <= 0) {
    return {
      daysAway: 0,
      greeting: "Good to see you.",
      oneMove: move,
      reassurance: "Right where you left off.",
    };
  }
  if (daysAway === 1) {
    return {
      daysAway,
      greeting: "Welcome back.",
      oneMove: move,
      reassurance: "Yesterday is closed out. Nothing is waiting to scold you.",
    };
  }
  return {
    daysAway,
    greeting: "Welcome back. Let's restart with one important Money Move.",
    oneMove: move,
    reassurance:
      "The days you missed were cleared, not stacked. There is no backlog here — we start again from one thing.",
  };
}

/** Anything that would produce a guilt list is forbidden by this rule. */
export const MOMENTUM_RULE =
  "Frassy never returns with overdue counts, streak losses or backlog lists. She returns with one winnable move.";

// ── 4. The Golden Rule ──────────────────────────────────────────────────────
// Every Daily Ends Better Than It Began.

export const IMPROVEMENTS = [
  { id: "money", emoji: "💵", label: "Money earned" },
  { id: "business", emoji: "🏗", label: "Business built" },
  { id: "knowledge", emoji: "📚", label: "Knowledge captured" },
  { id: "freedom", emoji: "🕊", label: "Financial freedom advanced" },
  { id: "system", emoji: "⚙️", label: "System completed" },
  { id: "family", emoji: "👨‍👩‍👧", label: "Family supported" },
  { id: "confidence", emoji: "❤️", label: "Confidence increased" },
] as const;

export type ImprovementId = (typeof IMPROVEMENTS)[number]["id"];

export type DayVerdict = {
  improved: ImprovementId[];
  successful: boolean;
  /** What Frassy says at the close of the day. Never shaming. */
  closing: string;
};

/**
 * The Daily is successful when at least ONE of the seven improved.
 * Not "did you complete your tasks" — "did your life move forward today".
 */
export function judgeDay(improved: ImprovementId[]): DayVerdict {
  const list = [...new Set(improved)];
  if (list.length > 0) {
    const names = list
      .map((id) => IMPROVEMENTS.find((i) => i.id === id)?.label ?? id)
      .join(", ");
    return {
      improved: list,
      successful: true,
      closing: `Today moved you forward: ${names}. You're closing the day in a better position than you opened it.`,
    };
  }
  return {
    improved: [],
    successful: false,
    closing:
      "Nothing moved today, and that's allowed. Tomorrow we do one small thing — that's all it takes to make the day count.",
  };
}

/** The sentence every future feature is measured against. */
export const FRASS_STANDARD =
  "Every interaction inside Frass must leave the member measurably better off than before they opened the platform — financially, professionally, personally, or emotionally.";

/** The question asked before anything new is built. */
export const QUALITY_FILTER = "Does this make someone's life measurably better? If no, it doesn't belong.";
