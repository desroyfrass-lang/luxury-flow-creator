// FRASS-0570 — World Teleporter (Founder inspection only).
// FRASS-0570A — Audit progress: permanent card numbers, review status, notes,
// resume banner and filters. Inspection tracking only: it never renames, wires
// or removes anything in the world.
import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  WORLD_ROUTES,
  WORLD_DISTRICTS,
  STATUS_META,
  type WorldStatus,
} from "@/lib/founder/world-teleporter";
import { beginTeleport } from "@/lib/founder/teleport-session";
import {
  AUDIT_STATUS_META,
  AUDIT_STATUS_ORDER,
  TOTAL_CARDS,
  cardKey,
  cardNumber,
  formatCardNumber,
  type AuditStatus,
} from "@/lib/founder/teleporter-audit";
import {
  listTeleporterAudit,
  saveTeleporterAudit,
  type TeleporterAuditRow,
} from "@/lib/founder/teleporter-audit.functions";

const GROUPS: { status: WorldStatus; heading: string }[] = [
  { status: "live", heading: "🟢 Live & Linked" },
  { status: "built", heading: "🟡 Built but Unlinked" },
  { status: "legacy", heading: "🔴 Legacy / Duplicate Candidates" },
];

type Filter = "all" | AuditStatus;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "not_reviewed", label: "⚪ Not Reviewed" },
  { id: "in_progress", label: "🟡 In Progress" },
  { id: "reviewed", label: "🟢 Reviewed" },
  { id: "consolidated", label: "🔄 Needs Merge" },
  { id: "retired", label: "🔴 Retired" },
];

const CARDS = WORLD_ROUTES.map((r) => ({ ...r, key: cardKey(r), num: cardNumber(r) }));

function domId(key: string) {
  return `teleport-card-${key.replace(/[^a-zA-Z0-9]/g, "-")}`;
}

export function WorldTeleporterPanel() {
  const [query, setQuery] = useState("");
  const [district, setDistrict] = useState<string>("All");
  const [filter, setFilter] = useState<Filter>("all");
  const [highlight, setHighlight] = useState<string | null>(null);
  const noteTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const qc = useQueryClient();
  const listFn = useServerFn(listTeleporterAudit);
  const saveFn = useServerFn(saveTeleporterAudit);

  const { data: audit = [] } = useQuery({
    queryKey: ["teleporter-audit"],
    queryFn: () => listFn(),
    staleTime: 30_000,
  });

  const byKey = useMemo(() => {
    const m = new Map<string, TeleporterAuditRow>();
    for (const row of audit) m.set(row.card_key, row);
    return m;
  }, [audit]);

  const save = useMutation({
    mutationFn: (input: {
      cardKey: string;
      cardNumber: number;
      status: AuditStatus;
      note: string;
    }) => saveFn({ data: input }),
    onSuccess: (row) => {
      qc.setQueryData<TeleporterAuditRow[]>(["teleporter-audit"], (prev = []) => [
        row,
        ...prev.filter((r) => r.card_key !== row.card_key),
      ]);
    },
  });

  const statusOf = (key: string): AuditStatus =>
    (byKey.get(key)?.status as AuditStatus) ?? "not_reviewed";

  const reviewedCount = audit.filter((r) => r.status === "reviewed").length;
  const percent = TOTAL_CARDS ? Math.round((reviewedCount / TOTAL_CARDS) * 1000) / 10 : 0;

  // Where the Founder last left off.
  const lastReviewed = audit.find((r) => r.status === "reviewed" || r.status === "in_progress");
  const lastCard = lastReviewed ? CARDS.find((c) => c.key === lastReviewed.card_key) : undefined;
  const nextUnreviewed = useMemo(
    () => [...CARDS].sort((a, b) => a.num - b.num).find((c) => statusOf(c.key) === "not_reviewed"),
    [audit],
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CARDS.filter((r) => {
      if (district !== "All" && r.district !== district) return false;
      if (filter !== "all" && statusOf(r.key) !== filter) return false;
      if (!q) return true;
      return (
        r.path.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.component.toLowerCase().includes(q) ||
        r.file.toLowerCase().includes(q) ||
        formatCardNumber(r.num).includes(q)
      );
    });
  }, [query, district, filter, audit]);

  function jumpTo(key: string) {
    setFilter("all");
    setDistrict("All");
    setQuery("");
    setHighlight(key);
  }

  useEffect(() => {
    if (!highlight) return;
    const el = document.getElementById(domId(highlight));
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlight, rows]);

  function setStatus(key: string, num: number, status: AuditStatus) {
    save.mutate({ cardKey: key, cardNumber: num, status, note: byKey.get(key)?.note ?? "" });
  }

  function setNote(key: string, num: number, note: string) {
    // Optimistic local echo so typing feels instant, then a debounced save.
    qc.setQueryData<TeleporterAuditRow[]>(["teleporter-audit"], (prev = []) => {
      const existing = prev.find((r) => r.card_key === key);
      const updated: TeleporterAuditRow = {
        card_key: key,
        card_number: num,
        status: existing?.status ?? "not_reviewed",
        note,
        updated_at: existing?.updated_at ?? new Date().toISOString(),
      };
      return [updated, ...prev.filter((r) => r.card_key !== key)];
    });
    clearTimeout(noteTimers.current[key]);
    noteTimers.current[key] = setTimeout(() => {
      save.mutate({ cardKey: key, cardNumber: num, status: statusOf(key), note });
    }, 700);
  }

  return (
    <section>
      <h2 className="font-display text-2xl">🗺️ World Teleporter</h2>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Every page that exists in Frass, grouped by whether people can actually reach it. This is a
        looking glass only — nothing here changes, renames, deletes or connects anything. Tap any
        page to visit it, then use the floating chip to come straight back here.
      </p>

      {/* Progress counter */}
      <div className="mt-5 rounded-2xl border border-border/70 p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-sm font-bold uppercase tracking-wide">
            World Teleporter Audit
          </span>
          <span className="text-sm text-muted-foreground">
            {reviewedCount} / {TOTAL_CARDS} cards reviewed · {percent}% complete
          </span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-border/60">
          <div
            className="h-full rounded-full bg-[color:var(--gold)] transition-all"
            style={{ width: `${TOTAL_CARDS ? (reviewedCount / TOTAL_CARDS) * 100 : 0}%` }}
          />
        </div>

        {/* Resume banner */}
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
          {lastCard ? (
            <span className="text-muted-foreground">
              Welcome back. Last touched:{" "}
              <span className="font-semibold text-foreground">
                {formatCardNumber(lastCard.num)} {lastCard.title || lastCard.component || lastCard.path}
              </span>
            </span>
          ) : (
            <span className="text-muted-foreground">
              Nothing reviewed yet — start anywhere, the clipboard remembers for you.
            </span>
          )}
          {lastCard ? (
            <button
              type="button"
              onClick={() => jumpTo(lastCard.key)}
              className="rounded-full border border-border px-3 py-1 text-xs uppercase tracking-wide hover:border-[color:var(--gold)]"
            >
              Continue →
            </button>
          ) : null}
          {nextUnreviewed ? (
            <button
              type="button"
              onClick={() => jumpTo(nextUnreviewed.key)}
              className="rounded-full border border-[color:var(--gold)] px-3 py-1 text-xs uppercase tracking-wide text-[color:var(--gold)]"
            >
              ▶ Resume audit — {formatCardNumber(nextUnreviewed.num)}
            </button>
          ) : (
            <span className="text-xs text-[color:var(--gold)]">Every card reviewed. 🎉</span>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search route, title, component or #number…"
          className="w-64 rounded-full border border-border bg-transparent px-4 py-1.5 text-sm outline-none focus:border-[color:var(--gold)]"
        />
        <select
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          className="rounded-full border border-border bg-transparent px-3 py-1.5 text-xs uppercase tracking-wide"
        >
          {["All", ...WORLD_DISTRICTS].map((d) => (
            <option key={d} value={d} className="bg-background">
              {d}
            </option>
          ))}
        </select>
        <span className="text-xs text-muted-foreground">
          {rows.length} of {WORLD_ROUTES.length} pages
        </span>
      </div>

      {/* Quick filters */}
      <div className="mt-3 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`rounded-full border px-3 py-1 text-xs uppercase tracking-wide transition ${
              filter === f.id
                ? "border-[color:var(--gold)] text-[color:var(--gold)]"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-8 space-y-10">
        {GROUPS.map(({ status, heading }) => {
          const group = rows.filter((r) => r.status === status);
          if (!group.length) return null;
          return (
            <div key={status}>
              <h3 className="text-sm font-bold uppercase tracking-wide">
                {heading} <span className="text-muted-foreground">({group.length})</span>
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">{STATUS_META[status].plain}</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {group.map((r) => {
                  const s = statusOf(r.key);
                  const note = byKey.get(r.key)?.note ?? "";
                  return (
                    <div
                      key={r.key}
                      id={domId(r.key)}
                      className={`rounded-xl border p-3 transition ${
                        highlight === r.key
                          ? "border-[color:var(--gold)] ring-1 ring-[color:var(--gold)]"
                          : "border-border/70"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-mono text-xs text-muted-foreground">
                          {formatCardNumber(r.num)}
                        </span>
                        <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                          {AUDIT_STATUS_META[s].icon} {AUDIT_STATUS_META[s].label}
                        </span>
                      </div>

                      <button
                        type="button"
                         onClick={async () => {
                           // FRASS-0579 — the server opens and locks the audit
                           // session before we move. Identity is decided there.
                           try {
                             await openAuditSessionFn({ data: { path: r.path } });
                           } catch {
                             /* navigation still proceeds; the audit stays closed */
                           }
                           beginTeleport({
                             key: r.key,
                             number: r.num,
                             title: r.title || r.component || r.path,
                             path: r.path,
                             component: r.component,
                             file: r.file,
                             district: r.district,
                           });
                         }}
                        className="mt-1 block w-full text-left"
                      >

                        <span className="flex items-center gap-2">
                          <span aria-hidden>{STATUS_META[r.status].icon}</span>
                          <span className="text-sm font-semibold">
                            {r.title || r.component || r.path}
                          </span>
                        </span>
                        <span className="mt-1 block font-mono text-xs text-[color:var(--gold)]">
                          {r.path}
                          {r.path.includes("$") ? " (needs a real value)" : ""}
                        </span>
                        <span className="mt-1 block text-xs text-muted-foreground">
                          {r.component || "—"} · {r.district}
                          {r.redirect ? " · redirects elsewhere" : ""}
                        </span>
                      </button>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setStatus(r.key, r.num, s === "reviewed" ? "not_reviewed" : "reviewed")
                          }
                          className={`rounded-full border px-3 py-1 text-xs transition ${
                            s === "reviewed"
                              ? "border-[color:var(--gold)] text-[color:var(--gold)]"
                              : "border-border text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {s === "reviewed" ? "✅ Reviewed" : "☐ Mark as Reviewed"}
                        </button>
                        <select
                          value={s}
                          onChange={(e) => setStatus(r.key, r.num, e.target.value as AuditStatus)}
                          className="rounded-full border border-border bg-transparent px-2 py-1 text-xs"
                        >
                          {AUDIT_STATUS_ORDER.map((opt) => (
                            <option key={opt} value={opt} className="bg-background">
                              {AUDIT_STATUS_META[opt].icon} {AUDIT_STATUS_META[opt].label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <input
                        value={note}
                        onChange={(e) => setNote(r.key, r.num, e.target.value)}
                        placeholder="Private note — e.g. merge with Founder Hall"
                        maxLength={500}
                        className="mt-2 w-full rounded-lg border border-border/70 bg-transparent px-2 py-1 text-xs outline-none focus:border-[color:var(--gold)]"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
