// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0573 — Persistent Founder Conversation Log (the Audit Ledger).
//
// Constitutional rule: every message Frassy generates during a Teleporter review
// becomes a PERMANENT conversation message. Streaming stays for responsiveness,
// but the completed reply is committed here — timestamped, attached to its card,
// searchable, and never replaced by a later turn.
//
// Plain English: this is the Founder's audit journal. Once Frassy says something
// about a card, it stays written down forever until the Founder deletes it.
//
// Two layers:
//   • local mirror  — instant, survives refresh and browser close (localStorage)
//   • database      — the permanent record (public.founder_audit_ledger)
// ─────────────────────────────────────────────────────────────────────────────

export type AuditLedgerEntry = {
  id: string;
  cardKey: string;
  cardNumber: number;
  cardTitle: string;
  cardPath: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

const KEY = "frass.founder.audit-ledger.v1";
/** Deep enough to hold a full world audit; nothing is trimmed inside a card. */
const MAX_ENTRIES = 4000;

// FRASS-0576 §1 — one stable in-memory snapshot so useSyncExternalStore
// never sees a fresh array on every render (the cause of the Maximum update
// depth loop). The snapshot is replaced only when data is appended, merged,
// deleted, cleared, or synchronized — never on a plain read.
let snapshot: AuditLedgerEntry[] | null = null;

function read(): AuditLedgerEntry[] {
  if (snapshot) return snapshot;
  if (typeof window === "undefined") return (snapshot = []);
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as AuditLedgerEntry[]) : [];
    snapshot = Array.isArray(parsed) ? parsed : [];
  } catch {
    snapshot = [];
  }
  return snapshot;
}

function write(entries: AuditLedgerEntry[]) {
  const trimmed = entries.slice(-MAX_ENTRIES);
  snapshot = trimmed;
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(trimmed));
  } catch {
    /* storage full or private mode — the database copy is still authoritative */
  }
}

/** Oldest first: Card #001 at the top, the newest review at the bottom.
 *  Returns the stable cached snapshot so React's useSyncExternalStore does
 *  not loop. */
export function readAuditLedger(): AuditLedgerEntry[] {
  return read();
}

export function appendAuditLedgerLocal(
  entry: Omit<AuditLedgerEntry, "id" | "createdAt"> & { id?: string; createdAt?: string },
): AuditLedgerEntry {
  const full: AuditLedgerEntry = {
    id: entry.id ?? `led-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: entry.createdAt ?? new Date().toISOString(),
    cardKey: entry.cardKey,
    cardNumber: entry.cardNumber,
    cardTitle: entry.cardTitle,
    cardPath: entry.cardPath,
    role: entry.role,
    content: entry.content,
  };
  const next = [...read(), full];
  write(next);
  notify();
  return full;
}

/** Merge the database record in without creating duplicates. */
export function mergeAuditLedger(remote: AuditLedgerEntry[]) {
  const seen = new Set<string>();
  const key = (e: AuditLedgerEntry) => `${e.cardKey}|${e.role}|${e.createdAt}|${e.content}`;
  const merged: AuditLedgerEntry[] = [];
  for (const e of [...read(), ...remote]) {
    const k = key(e);
    if (seen.has(k)) continue;
    seen.add(k);
    merged.push(e);
  }
  merged.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  write(merged);
  notify();
}

/** Explicit Founder deletion — the only way anything ever leaves the ledger. */
export function deleteAuditLedgerEntryLocal(id: string) {
  write(read().filter((e) => e.id !== id));
  notify();
}

export function clearAuditLedgerLocal() {
  write([]);
  notify();
}

export function searchAuditLedger(query: string, entries = read()): AuditLedgerEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return entries;
  return entries.filter(
    (e) =>
      e.content.toLowerCase().includes(q) ||
      e.cardTitle.toLowerCase().includes(q) ||
      e.cardPath.toLowerCase().includes(q) ||
      `card #${String(e.cardNumber).padStart(3, "0")}`.includes(q),
  );
}

export type LedgerCardGroup = {
  cardKey: string;
  cardNumber: number;
  cardTitle: string;
  cardPath: string;
  entries: AuditLedgerEntry[];
};

/** One continuous journal: Card #001 → Card #025, in card order. */
export function groupLedgerByCard(entries = read()): LedgerCardGroup[] {
  const map = new Map<string, LedgerCardGroup>();
  for (const e of entries) {
    const g = map.get(e.cardKey);
    if (g) g.entries.push(e);
    else
      map.set(e.cardKey, {
        cardKey: e.cardKey,
        cardNumber: e.cardNumber,
        cardTitle: e.cardTitle,
        cardPath: e.cardPath,
        entries: [e],
      });
  }
  return [...map.values()].sort((a, b) => a.cardNumber - b.cardNumber);
}

export function formatCardNumber(n: number): string {
  return `Card #${String(n).padStart(3, "0")}`;
}

// Live updates for any panel showing the ledger.
const listeners = new Set<() => void>();
function notify() {
  for (const fn of listeners) fn();
}
export function subscribeAuditLedger(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
