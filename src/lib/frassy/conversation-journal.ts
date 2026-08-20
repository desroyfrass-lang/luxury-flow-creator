// ─────────────────────────────────────────────────────────────────────────────
// Frassy Conversation Journal — append-only, never destructive.
//
// Every message the Founder sends and every reply Frassy gives is written here
// the instant it exists, before the network is trusted with it. Nothing is ever
// removed from this journal: a message's *status* changes (pending → synced, or
// pending → failed), but the words themselves stay for good.
//
// Plain English: this is the notebook kept on your own device. The database is
// the filing cabinet. We never tear a page out of the notebook just because we
// assume something got filed.
//
// Matching is done by id — a client-generated uuid, plus the server row id once
// the save is confirmed. Never by text, because two messages can legitimately
// say exactly the same thing.
// ─────────────────────────────────────────────────────────────────────────────

export type JournalStatus = "pending" | "synced" | "failed";

export type JournalEntry = {
  /** Generated on this device the moment the message exists. Never changes. */
  clientId: string;
  /** The database row id, once persistence has actually been proven. */
  serverId: string | null;
  role: "user" | "assistant";
  content: string;
  /** ISO timestamp of when the message appeared. */
  at: string;
  status: JournalStatus;
  /** Why a save failed, when we know. Shown to the Founder, never swallowed. */
  error?: string;
};

const PREFIX = "frass.conversation.journal";
/** Long enough to hold a full commissioning session, short enough to stay fast. */
const MAX_ENTRIES = 500;

function key(scope: string): string {
  return `${PREFIX}.${scope}`;
}

export function newClientId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `c-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function loadJournal(scope: string): JournalEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key(scope));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as JournalEntry[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e) => e && typeof e.clientId === "string" && typeof e.content === "string",
    );
  } catch {
    return [];
  }
}

function persist(scope: string, entries: JournalEntry[]): JournalEntry[] {
  const trimmed = entries.slice(-MAX_ENTRIES);
  if (typeof window === "undefined") return trimmed;
  try {
    window.localStorage.setItem(key(scope), JSON.stringify(trimmed));
  } catch {
    /* storage full or private mode — the in-memory copy still shows on screen */
  }
  return trimmed;
}

/** Append-only: a new message is added, nothing existing is touched. */
export function appendEntry(
  scope: string,
  entry: Omit<JournalEntry, "at" | "status"> & Partial<Pick<JournalEntry, "at" | "status">>,
): JournalEntry[] {
  const full: JournalEntry = {
    at: new Date().toISOString(),
    status: "pending",
    ...entry,
  };
  return persist(scope, [...loadJournal(scope), full]);
}

/** Status and server id may change. Words and identity never do. */
export function updateEntry(
  scope: string,
  clientId: string,
  patch: Partial<Pick<JournalEntry, "serverId" | "status" | "error">>,
): JournalEntry[] {
  const next = loadJournal(scope).map((e) =>
    e.clientId === clientId ? { ...e, ...patch } : e,
  );
  return persist(scope, next);
}
