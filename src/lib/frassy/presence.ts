// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0477 — Frassy Presence Constitution.
//
// "One Frassy. Always present. Never intrusive."
//
// This is the pure, testable brain of *when* Frassy speaks. It never creates a
// second Frassy: the single shared chat component asks this module what the
// moment calls for, and the answer is always one of four states.
//
//   arrival   — first time in this room this session → the full welcome, once.
//   returning — they've been here already → "Welcome back.", never the speech.
//   working   — they're mid-task → she stays quiet and available.
//   idle      — nothing for a few minutes → one gentle offer of help, once.
//
// Focus Mode narrows her to task, progress, completion and emergencies only.
//
// Plain English: it's the difference between a good assistant and a talkative
// one. She's always in the room; she just knows when to speak.
// ─────────────────────────────────────────────────────────────────────────────

export type PresenceState = "arrival" | "returning" | "working" | "idle";

/** How long without a single interaction before she may gently offer help. */
export const IDLE_NUDGE_MS = 4 * 60 * 1000;

/** Short lines for a return visit — never the full welcome again. */
export const RETURN_LINES = ["Welcome back.", "Ready to continue where we left off?"] as const;

/** The one idle offer. She makes it once per room, then waits. */
export const IDLE_LINE = "Need a hand with the next step?";

const VISIT_PREFIX = "frassy-presence:visit:";
const NUDGE_PREFIX = "frassy-presence:nudge:";

function readFlag(key: string): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.sessionStorage.getItem(key) === "1";
  } catch {
    return true;
  }
}

function writeFlag(key: string) {
  try {
    window.sessionStorage.setItem(key, "1");
  } catch {
    /* private browsing — greeting once more is harmless */
  }
}

/** Has this member already been welcomed to this room during this session? */
export function hasVisited(roomId: string): boolean {
  return readFlag(VISIT_PREFIX + roomId);
}

export function markVisited(roomId: string) {
  writeFlag(VISIT_PREFIX + roomId);
}

export function hasNudged(roomId: string): boolean {
  return readFlag(NUDGE_PREFIX + roomId);
}

export function markNudged(roomId: string) {
  writeFlag(NUDGE_PREFIX + roomId);
}

export type PresenceInput = {
  /** Have they been welcomed to this room already this session? */
  visited: boolean;
  /** Focus Mode: only task, progress, completion and emergencies. */
  focusMode: boolean;
  /** Has the member interacted since arriving (typing, clicking, speaking)? */
  interacted: boolean;
  /** Milliseconds since their last interaction. */
  idleMs: number;
  /** Has the single idle offer already been made in this room? */
  nudged: boolean;
};

export type PresenceDecision = {
  state: PresenceState;
  /** What she should say, or null when the right thing is to stay quiet. */
  line: string | null;
  /** May this line be spoken aloud, or only shown? */
  speak: boolean;
};

/**
 * The whole of Frassy's speaking etiquette, in one function.
 * Every Frassy surface goes through this — there is no page-local variant.
 */
export function decidePresence(input: PresenceInput, roomWelcome: string): PresenceDecision {
  if (!input.visited) {
    // Focus Mode still gets a greeting — presence is never absence — but it is
    // the short one, so the member is not pulled out of their work.
    if (input.focusMode) return { state: "arrival", line: RETURN_LINES[0], speak: false };
    return { state: "arrival", line: roomWelcome, speak: true };
  }

  if (!input.interacted && input.idleMs < IDLE_NUDGE_MS) {
    return {
      state: "returning",
      line: input.focusMode ? null : RETURN_LINES[0],
      speak: !input.focusMode,
    };
  }

  if (input.idleMs >= IDLE_NUDGE_MS && !input.nudged && !input.focusMode) {
    return { state: "idle", line: IDLE_LINE, speak: false };
  }

  // Actively working, or already nudged: she stays quietly available.
  return { state: "working", line: null, speak: false };
}
