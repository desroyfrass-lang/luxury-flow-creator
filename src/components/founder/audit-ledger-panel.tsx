// FRASS-0573 — the Founder Audit Ledger, rendered as one continuous journal.
// Scroll from Card #001 to the newest review without losing a single word.
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { Search, Trash2 } from "lucide-react";
import {
  deleteAuditLedgerEntryLocal,
  formatCardNumber,
  groupLedgerByCard,
  readAuditLedger,
  searchAuditLedger,
  subscribeAuditLedger,
  type AuditLedgerEntry,
} from "@/lib/founder/audit-ledger";
import { deleteAuditLedgerEntry } from "@/lib/founder/audit-ledger.functions";
import { syncAuditLedger } from "@/lib/founder/audit-ledger-commit";

const EMPTY: AuditLedgerEntry[] = [];

function useLedger(): AuditLedgerEntry[] {
  return useSyncExternalStore(
    subscribeAuditLedger,
    () => readAuditLedger(),
    () => EMPTY,
  );
}

export function AuditLedgerPanel() {
  const entries = useLedger();
  const [query, setQuery] = useState("");

  useEffect(() => {
    void syncAuditLedger();
  }, []);

  const groups = useMemo(
    () => groupLedgerByCard(searchAuditLedger(query, entries)),
    [entries, query],
  );

  const remove = (entry: AuditLedgerEntry) => {
    deleteAuditLedgerEntryLocal(entry.id);
    if (/^[0-9a-f-]{36}$/i.test(entry.id)) {
      void deleteAuditLedgerEntry({ data: { id: entry.id } }).catch(() => {});
    }
  };

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h3 className="text-sm uppercase tracking-[0.25em] text-[color:var(--gold)]">
          Founder Audit Ledger
        </h3>
        <p className="text-xs text-muted-foreground">
          Every review Frassy writes is committed here permanently — timestamped and attached to its
          card. Nothing disappears unless you delete it.
        </p>
      </header>

      <div className="flex items-center gap-2 rounded-sm border border-border px-3 py-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search the ledger — a card number, a route, a decision…"
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>

      <p className="text-xs text-muted-foreground">
        {entries.length} recorded {entries.length === 1 ? "message" : "messages"} across{" "}
        {groupLedgerByCard(entries).length} cards.
      </p>

      {!groups.length && (
        <p className="rounded-sm border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
          No audit conversations recorded yet. Open a card from the World Teleporter and talk to
          Frassy — every word she replies lands here.
        </p>
      )}

      <div className="space-y-6">
        {groups.map((g) => (
          <article key={g.cardKey} className="rounded-sm border border-border">
            <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border px-4 py-2">
              <span className="text-xs uppercase tracking-[0.2em] text-[color:var(--gold)]">
                {formatCardNumber(g.cardNumber)} · {g.cardTitle}
              </span>
              <code className="text-[11px] text-muted-foreground">{g.cardPath}</code>
            </header>
            <div className="space-y-3 px-4 py-3">
              {g.entries.map((e) => (
                <div key={e.id} className="group">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      {e.role === "user" ? "Founder" : "Frassy"} ·{" "}
                      {new Date(e.createdAt).toLocaleString()}
                    </span>
                    <button
                      type="button"
                      aria-label="Delete this ledger entry"
                      onClick={() => remove(e)}
                      className="rounded-sm p-1 text-muted-foreground opacity-0 transition group-hover:opacity-100 hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p
                    className={
                      e.role === "user"
                        ? "whitespace-pre-wrap rounded-sm bg-[color:var(--gold)]/10 px-3 py-2 text-sm"
                        : "whitespace-pre-wrap rounded-sm bg-muted px-3 py-2 text-sm"
                    }
                  >
                    {e.content}
                  </p>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
