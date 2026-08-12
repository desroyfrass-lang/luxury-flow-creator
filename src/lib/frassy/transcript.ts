// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0476B — One Frassy, one conversation history.
//
// Walking into a different room never restarts the conversation. This is the
// single shared transcript every Frassy surface reads from and writes to, so a
// refresh or a change of district picks up exactly where the member left off.
//
// Plain English: it's Frassy's short-term memory of *this visit*, kept in one
// place instead of one copy per page.
// ─────────────────────────────────────────────────────────────────────────────

export type FrassyTurn = { role: "user" | "assistant"; content: string };

const KEY = "frass.frassy.transcript";
/** Enough context to feel continuous, small enough to stay fast. */
const MAX_TURNS = 40;

export function loadTranscript(): FrassyTurn[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as FrassyTurn[];
    return Array.isArray(parsed) ? parsed.slice(-MAX_TURNS) : [];
  } catch {
    return [];
  }
}

export function saveTranscript(turns: FrassyTurn[]) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(turns.slice(-MAX_TURNS)));
  } catch {
    /* private browsing — she simply starts fresh */
  }
}

/** Append turns from any Frassy surface into the one shared history. */
export function appendTranscript(...turns: FrassyTurn[]) {
  if (!turns.length) return;
  saveTranscript([...loadTranscript(), ...turns]);
}

export function clearTranscript() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    /* nothing to clear */
  }
}
