// Workspace Awareness — Frassy notices how the session is actually going.
//
// Not an interruption: a genuinely helpful operating partner. Awareness is
// derived from real session activity only — never invented.

export type AwarenessSession = {
  /** Project the Builder is working in. */
  projectId: string;
  /** ISO start of the current continuous stretch in this project. */
  startedAt: string;
  /** Last recorded activity in this project. */
  lastActiveAt: string;
  /** Meaningful actions completed in this stretch (messages, approvals). */
  actions: number;
};

export type AwarenessDay = {
  day: string;
  /** Actions completed today, across projects. */
  actions: number;
  /** Minutes worked today (accumulated from active stretches). */
  minutes: number;
};

const SESSION_KEY = "frass.workspace.session";
const DAY_KEY = "frass.workspace.session.day";
const SEEN_KEY = "frass.workspace.awareness.seen";

/** A gap longer than this ends the stretch — you stepped away. */
const IDLE_BREAK_MINUTES = 20;

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function read<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  if (typeof window !== "undefined") window.localStorage.setItem(key, JSON.stringify(value));
}

export function loadSession(): AwarenessSession | null {
  return read<AwarenessSession>(SESSION_KEY);
}

export function loadDay(): AwarenessDay {
  const d = read<AwarenessDay>(DAY_KEY);
  if (!d || d.day !== today()) return { day: today(), actions: 0, minutes: 0 };
  return d;
}

/** Record real work. Called when a turn completes or an approval is made. */
export function recordActivity(projectId: string, actions = 1): AwarenessSession {
  const now = new Date();
  const prev = loadSession();
  const gapMin = prev ? (now.getTime() - new Date(prev.lastActiveAt).getTime()) / 60000 : Infinity;

  const continuing = prev && prev.projectId === projectId && gapMin <= IDLE_BREAK_MINUTES;
  const session: AwarenessSession = continuing
    ? { ...prev, lastActiveAt: now.toISOString(), actions: prev.actions + actions }
    : { projectId, startedAt: now.toISOString(), lastActiveAt: now.toISOString(), actions };
  write(SESSION_KEY, session);

  const day = loadDay();
  write(DAY_KEY, {
    day: today(),
    actions: day.actions + actions,
    minutes: day.minutes + (continuing ? Math.min(gapMin, IDLE_BREAK_MINUTES) : 0),
  });

  return session;
}

export function sessionMinutes(session: AwarenessSession | null): number {
  if (!session) return 0;
  return Math.round((new Date(session.lastActiveAt).getTime() - new Date(session.startedAt).getTime()) / 60000);
}

// ── Nudges ────────────────────────────────────────────────────────────────

export type AwarenessNudge = {
  id: string;
  message: string;
  /** Primary offer — the helpful thing Frassy can do right now. */
  primary: { label: string; kind: "switch" | "ask" | "continue"; payload?: string };
  secondary: { label: string };
};

function hoursWord(min: number): string {
  if (min < 90) return `about ${Math.round(min / 5) * 5} minutes`;
  const h = Math.round((min / 60) * 2) / 2;
  return `about ${h % 1 === 0 ? h : h.toFixed(1)} hours`;
}

/**
 * Honest awareness only: every nudge is grounded in recorded session activity.
 * Returns the single most relevant nudge, or null when there is nothing worth saying.
 */
export function nextNudge(opts: {
  session: AwarenessSession | null;
  day: AwarenessDay;
  projectName: string;
  /** Another project Frassy can suggest switching to. */
  alternateName?: string;
  alternateId?: string;
  /** Local hour, for the end-of-day offer. */
  hour?: number;
}): AwarenessNudge | null {
  const { session, day, projectName, alternateName, alternateId } = opts;
  const hour = opts.hour ?? new Date().getHours();
  const mins = sessionMinutes(session);

  if (day.actions >= 25 && hour >= 17) {
    return {
      id: `queue-${today()}`,
      message: `You completed ${day.actions} items today. Would you like me to prepare tomorrow's queue before you log off?`,
      primary: { label: "Prepare tomorrow's queue", kind: "ask", payload: "Prepare tomorrow's queue based on what I completed today." },
      secondary: { label: "Not tonight" },
    };
  }

  if (mins >= 120) {
    return {
      id: `long-${session?.startedAt}-120`,
      message: `We've been in ${projectName} for ${hoursWord(mins)}.${alternateName ? ` Would you like to pause and switch to ${alternateName}, or continue where we are?` : " Would you like to pause, or continue where we are?"}`,
      primary: alternateName && alternateId
        ? { label: `Switch to ${alternateName}`, kind: "switch", payload: alternateId }
        : { label: "Continue", kind: "continue" },
      secondary: { label: "Keep going" },
    };
  }

  if (mins >= 75) {
    return {
      id: `long-${session?.startedAt}-75`,
      message: `${hoursWord(mins)} in ${projectName} without a break. A short pause usually makes the next hour sharper — shall we keep going?`,
      primary: { label: "Keep going", kind: "continue" },
      secondary: { label: "Pause" },
    };
  }

  if (day.actions >= 40) {
    return {
      id: `milestone-${today()}-${Math.floor(day.actions / 40) * 40}`,
      message: `That's ${day.actions} items today — a strong day's work. Would you like a summary of what changed?`,
      primary: { label: "Summarise today", kind: "ask", payload: "Summarise everything I completed today." },
      secondary: { label: "Later" },
    };
  }

  return null;
}

export function isSeen(id: string): boolean {
  const seen = read<string[]>(SEEN_KEY) ?? [];
  return seen.includes(id);
}

export function markSeen(id: string) {
  const seen = read<string[]>(SEEN_KEY) ?? [];
  write(SEEN_KEY, [id, ...seen].slice(0, 60));
}
