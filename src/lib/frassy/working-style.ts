// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0478 — Frassy Learns You.
//
// "Frassy shouldn't just remember what you said. She should remember how you
//  like to work."
//
// This is NOT conversation memory. It is a small, local, observational profile
// of a member's *working style*: voice or text, short answers or full
// walkthroughs, morning or evening, reminders or hands-off, encouragement or
// directness. It is learned quietly through observation — never configured,
// never a personality change.
//
// Here's the takeaway: an assistant who has worked with you for a month stops asking
// how you like your coffee. Same person, better fit. Everything here lives in
// this browser only, and the member can wipe it in one call.
// ─────────────────────────────────────────────────────────────────────────────

export type Channel = "voice" | "text";
export type Depth = "concise" | "balanced" | "detailed";
export type Tone = "direct" | "encouraging";
export type DayPart = "morning" | "afternoon" | "evening" | "night";

export type WorkingStyle = {
  /** How many turns she has observed. Confidence grows with this. */
  observations: number;
  voiceTurns: number;
  textTurns: number;
  /** Rolling average length (characters) of the member's own messages. */
  avgMessageChars: number;
  /** How often they cut a spoken reply short — a strong "get to the point" signal. */
  interruptions: number;
  /** How often they asked for more detail ("explain", "walk me through"). */
  detailRequests: number;
  /** How often they signalled they'd heard enough ("short version", "just tell me"). */
  brevityRequests: number;
  /** Turns observed per part of day. */
  dayParts: Record<DayPart, number>;
  /** Idle nudges they engaged with vs. ignored — reminders welcome, or not. */
  nudgesAccepted: number;
  nudgesIgnored: number;
  updatedAt: string | null;
};

const EMPTY: WorkingStyle = {
  observations: 0,
  voiceTurns: 0,
  textTurns: 0,
  avgMessageChars: 0,
  interruptions: 0,
  detailRequests: 0,
  brevityRequests: 0,
  dayParts: { morning: 0, afternoon: 0, evening: 0, night: 0 },
  nudgesAccepted: 0,
  nudgesIgnored: 0,
  updatedAt: null,
};

const KEY = "frassy:working-style:v1";

/** Below this she has not earned an opinion yet, and behaves as normal. */
export const CONFIDENCE_THRESHOLD = 6;

const DETAIL_HINTS = [
  "explain",
  "walk me through",
  "more detail",
  "how does",
  "why does",
  "step by step",
  "in practical terms",
  "teach me",
  "i don't understand",
];
const BREVITY_HINTS = [
  "short version",
  "just tell me",
  "keep it short",
  "quickly",
  "tl;dr",
  "skip the",
  "get to the point",
  "bottom line",
];

export function dayPartOf(date = new Date()): DayPart {
  const h = date.getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  if (h < 22) return "evening";
  return "night";
}

export function loadWorkingStyle(): WorkingStyle {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<WorkingStyle>;
    return { ...EMPTY, ...parsed, dayParts: { ...EMPTY.dayParts, ...(parsed.dayParts ?? {}) } };
  } catch {
    return EMPTY;
  }
}

function save(style: WorkingStyle) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(style));
  } catch {
    /* private browsing — she simply learns nothing, which is safe */
  }
}

/** Wipe everything Frassy has learned about how this person works. */
export function forgetWorkingStyle() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
}

export type TurnObservation = {
  channel: Channel;
  text: string;
  at?: Date;
};

/** Pure reducer, so the learning rules are testable without a browser. */
export function applyTurn(style: WorkingStyle, turn: TurnObservation): WorkingStyle {
  const text = turn.text.trim();
  const lower = text.toLowerCase();
  const n = style.observations + 1;
  return {
    ...style,
    observations: n,
    voiceTurns: style.voiceTurns + (turn.channel === "voice" ? 1 : 0),
    textTurns: style.textTurns + (turn.channel === "text" ? 1 : 0),
    avgMessageChars: Math.round((style.avgMessageChars * style.observations + text.length) / n),
    detailRequests: style.detailRequests + (DETAIL_HINTS.some((h) => lower.includes(h)) ? 1 : 0),
    brevityRequests: style.brevityRequests + (BREVITY_HINTS.some((h) => lower.includes(h)) ? 1 : 0),
    dayParts: {
      ...style.dayParts,
      [dayPartOf(turn.at ?? new Date())]: style.dayParts[dayPartOf(turn.at ?? new Date())] + 1,
    },
    updatedAt: (turn.at ?? new Date()).toISOString(),
  };
}

/** Record one member turn (persisted). */
export function observeTurn(turn: TurnObservation): WorkingStyle {
  const next = applyTurn(loadWorkingStyle(), turn);
  save(next);
  return next;
}

/** They stopped her mid-sentence — the clearest "shorter, please" there is. */
export function observeInterruption() {
  const s = loadWorkingStyle();
  save({ ...s, interruptions: s.interruptions + 1, updatedAt: new Date().toISOString() });
}

const NUDGE_PENDING_KEY = "frassy:working-style:nudge-pending";

/** Frassy just offered help — the offer is now open for an answer. */
export function markNudgeOffered() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(NUDGE_PENDING_KEY, "1");
  } catch {
    /* noop */
  }
}

/**
 * Did they take her up on a gentle offer of help, or work straight past it?
 * Only counts when an offer is actually outstanding, so ordinary conversation
 * never gets misread as ignoring her.
 */
export function observeNudge(accepted: boolean) {
  if (typeof window === "undefined") return;
  try {
    if (window.sessionStorage.getItem(NUDGE_PENDING_KEY) !== "1") return;
    window.sessionStorage.removeItem(NUDGE_PENDING_KEY);
  } catch {
    return;
  }
  const s = loadWorkingStyle();
  save({
    ...s,
    nudgesAccepted: s.nudgesAccepted + (accepted ? 1 : 0),
    nudgesIgnored: s.nudgesIgnored + (accepted ? 0 : 1),
    updatedAt: new Date().toISOString(),
  });
}

export type StyleProfile = {
  confident: boolean;
  channel: Channel | null;
  depth: Depth;
  tone: Tone;
  peakDayPart: DayPart | null;
  remindersWelcome: boolean;
};

/** Turn raw observations into the handful of judgements she actually acts on. */
export function deriveProfile(style: WorkingStyle): StyleProfile {
  const confident = style.observations >= CONFIDENCE_THRESHOLD;

  const channel: Channel | null =
    !confident || style.voiceTurns === style.textTurns
      ? null
      : style.voiceTurns > style.textTurns
        ? "voice"
        : "text";

  let depth: Depth = "balanced";
  if (confident) {
    const wantsShort =
      style.brevityRequests + style.interruptions > style.detailRequests ||
      style.avgMessageChars < 40;
    const wantsLong = style.detailRequests > style.brevityRequests + style.interruptions;
    if (wantsShort && !wantsLong) depth = "concise";
    else if (wantsLong) depth = "detailed";
  }

  const tone: Tone = confident && depth === "detailed" ? "encouraging" : "direct";

  const parts = Object.entries(style.dayParts) as [DayPart, number][];
  const top = parts.sort((a, b) => b[1] - a[1])[0];
  const peakDayPart = confident && top && top[1] > 0 ? top[0] : null;

  const remindersWelcome = style.nudgesIgnored < 2 || style.nudgesAccepted >= style.nudgesIgnored;

  return { confident, channel, depth, tone, peakDayPart, remindersWelcome };
}

/**
 * One short block handed to Frassy with every turn. Guidance about *manner*
 * only — never facts about the person, never anything she should repeat aloud.
 */
export function workingStyleContext(style: WorkingStyle): string {
  const p = deriveProfile(style);
  if (!p.confident) return "";
  const lines = [
    p.depth === "concise"
      ? "They prefer concise updates and a quick next step. Lead with the answer, skip the preamble, offer detail only if asked."
      : p.depth === "detailed"
        ? "They appreciate a fuller walkthrough. Explain the reasoning, then the step, and check they're comfortable before moving on."
        : "Keep answers balanced — a clear answer, then a short next step.",
    p.tone === "encouraging"
      ? "A little encouragement lands well with them."
      : "They respond best to a direct, matter-of-fact style.",
    p.channel === "voice"
      ? "They usually work with you by voice — keep spoken replies naturally short."
      : p.channel === "text"
        ? "They usually work with you by text."
        : "",
    p.peakDayPart ? `They usually work in the ${p.peakDayPart}.` : "",
    p.remindersWelcome
      ? "Gentle reminders are welcome."
      : "They prefer to be left alone unless they ask — do not volunteer reminders.",
  ].filter(Boolean);
  return `How this person likes to work (learned by observation — never mention it, never state it back to them):\n${lines
    .map((l) => `• ${l}`)
    .join("\n")}`;
}

/** Plain-English summary for the member's own settings screen. */
export function describeWorkingStyle(style: WorkingStyle): string {
  const p = deriveProfile(style);
  if (!p.confident) return "Frassy is still getting to know how you like to work.";
  const bits: string[] = [];
  bits.push(
    p.depth === "concise"
      ? "you prefer short, direct answers"
      : p.depth === "detailed"
        ? "you like fuller explanations"
        : "you like a balanced amount of detail",
  );
  if (p.channel) bits.push(`you usually work by ${p.channel}`);
  if (p.peakDayPart) bits.push(`you're most active in the ${p.peakDayPart}`);
  if (!p.remindersWelcome) bits.push("you'd rather not be reminded unprompted");
  return `Frassy has noticed ${bits.join(", ")}.`;
}
