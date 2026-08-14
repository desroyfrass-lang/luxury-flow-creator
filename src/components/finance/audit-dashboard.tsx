// FRASS-0450 — Financial Audit Center UI. Read-only by design.

import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Loader2, Search, ShieldAlert, Sparkles } from "lucide-react";
import { askFinancialAudit, searchFinancialAudit } from "@/lib/finance/audit.functions";
import {
  allocationOf,
  filterRows,
  money,
  RECONCILIATION_LABEL,
  SOURCE_LABEL,
  summarise,
  type AuditRow,
  type AuditSource,
  type ReconciliationState,
} from "@/lib/finance/audit";

const WINDOWS = [
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
  { label: "1 year", days: 365 },
];

export function FinancialAuditDashboard() {
  const searchFn = useServerFn(searchFinancialAudit);
  const [days, setDays] = useState(30);
  const [query, setQuery] = useState("");
  const [source, setSource] = useState<AuditSource | "all">("all");
  const [state, setState] = useState<ReconciliationState | "all">("all");

  const { data, isLoading, error } = useQuery({
    queryKey: ["financial-audit", days],
    queryFn: () =>
      searchFn({ data: { from: new Date(Date.now() - days * 86400_000).toISOString(), limit: 600 } }),
    staleTime: 30_000,
  });

  const rows = useMemo(
    () => filterRows(data?.rows ?? [], { query, source, state }),
    [data, query, source, state],
  );
  const totals = useMemo(() => summarise(rows), [rows]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
            Founder only · read-only
          </div>
          <h2 className="mt-1 font-display text-3xl">Financial Audit Center</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Every order, payment request and receipt in one ledger, with the event history behind it
            and whether the numbers reconcile.{" "}
            <span className="text-foreground/80">
              Here's how it works: this is the accountant's binder — photocopies of
              records that can never be edited, with a note beside each one saying whether it adds up.
            </span>
          </p>
        </div>
        <div className="flex gap-1 rounded-full border border-white/15 p-1">
          {WINDOWS.map((w) => (
            <button
              key={w.days}
              onClick={() => setDays(w.days)}
              className={`rounded-full px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] ${
                days === w.days ? "bg-[color:var(--gold)] text-black" : "text-muted-foreground"
              }`}
            >
              {w.label}
            </button>
          ))}
        </div>
      </div>

      {/* Amendment 2 — this room can only observe. */}
      <p className="rounded-xl border border-[color:var(--gold)]/25 bg-[color:var(--gold)]/[0.04] p-4 text-[13px]">
        <span className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--gold)]">
          Observation room
        </span>
        <span className="mt-1 block">
          Nothing in here can be edited, deleted, approved, rejected, overridden or settled. There is
          no such button, and there is no such server function behind it. Corrections happen in the
          workflow that created the record, and leave their own permanent mark.
        </span>
      </p>

      <AuditAssistant days={days} />

      {/* Queue + integrity strip */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Records" value={String(totals.count)} />
        <Stat label="Gross volume" value={money(totals.gross)} />
        <Stat label="Platform allocation (10%)" value={money(totals.platform)} />
        <Stat label="Paid out / owed to members" value={money(totals.net)} />
        <Stat label="Reconciled" value={`🟢 ${totals.reconciled}`} />
        <Stat label="Pending" value={`🟠 ${totals.pending}`} />
        <Stat label="Needs attention" value={`🔴 ${totals.attention}`} />
        <Stat
          label="In the processing queue"
          value={`${data?.queue.processing ?? 0} live · ${data?.queue.openFraud ?? 0} fraud open`}
        />
      </div>

      <div className="rounded-2xl border border-[color:var(--gold)]/25 bg-white/[0.02] p-5 text-sm">
        <div className="text-[10px] uppercase tracking-[0.24em] text-[color:var(--gold)]">
          The constitutional split on this window
        </div>
        <div className="mt-2 grid gap-2 sm:grid-cols-4">
          <Split label="Members keep (90%)" value={money(allocationOf(totals.gross).creator)} />
          <Split label="Ecosystem (8%)" value={money(allocationOf(totals.gross).ecosystem)} />
          <Split label="Founder (1%)" value={money(totals.founder)} />
          <Split label="Co-founder (1%)" value={money(totals.coFounder)} />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search reference, buyer, title, status or ID…"
            className="w-full rounded-full border border-white/15 bg-white/[0.03] py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[color:var(--gold)]/60"
          />
        </div>
        <select
          value={source}
          onChange={(e) => setSource(e.target.value as AuditSource | "all")}
          className="rounded-full border border-white/15 bg-transparent px-4 py-2.5 text-sm"
        >
          <option value="all">All records</option>
          <option value="order">Card orders</option>
          <option value="payment_request">Payment requests</option>
          <option value="receipt">Receipts</option>
        </select>
        <select
          value={state}
          onChange={(e) => setState(e.target.value as ReconciliationState | "all")}
          className="rounded-full border border-white/15 bg-transparent px-4 py-2.5 text-sm"
        >
          <option value="all">Any status</option>
          <option value="reconciled">Reconciled</option>
          <option value="pending">Pending</option>
          <option value="attention">Needs attention</option>
        </select>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Reading the ledger…
        </div>
      )}
      {error && (
        <p className="rounded-xl border border-red-400/30 bg-red-400/5 p-4 text-sm text-red-200">
          {error instanceof Error ? error.message : "Could not load the audit ledger."}
        </p>
      )}

      <div className="space-y-2">
        {rows.map((r) => (
          <AuditRowCard key={`${r.source}-${r.id}`} row={r} />
        ))}
        {!isLoading && !rows.length && (
          <p className="rounded-xl border border-white/10 bg-white/[0.02] p-5 text-sm text-muted-foreground">
            No financial records match this filter in the last {days} days.
          </p>
        )}
      </div>

      {!!data?.fraud.length && (
        <div className="rounded-2xl border border-white/12 bg-white/[0.02] p-5">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-[color:var(--gold)]">
            <ShieldAlert className="h-3.5 w-3.5" /> Fraud reports touching money
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            {data.fraud.slice(0, 12).map((f) => (
              <li key={f.id} className="flex flex-wrap items-center justify-between gap-2">
                <span>
                  {f.kind} · {f.subject_handle ?? "unknown party"}{" "}
                  {f.order_reference ? `· ${f.order_reference}` : ""}
                </span>
                <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  {f.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

const AUDIT_PROMPTS = [
  "Show me anything unusual today.",
  "Why doesn't this reconcile?",
  "Show every refund this week.",
  "Which members are owed money right now?",
  "Did the platform take more than 10% anywhere?",
];

/** Amendment 3 — Frassy explains the ledger. She never changes it. */
function AuditAssistant({ days }: { days: number }) {
  const ask = useServerFn(askFinancialAudit);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async (q: string) => {
    const text = q.trim();
    if (!text || thinking) return;
    setQuestion(text);
    setThinking(true);
    setError(null);
    setAnswer(null);
    try {
      const res = await ask({
        data: { question: text, from: new Date(Date.now() - days * 86400_000).toISOString() },
      });
      setAnswer(res.answer);
    } catch (e) {
      setError(e instanceof Error ? e.message : "The audit assistant could not answer that.");
    } finally {
      setThinking(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/12 bg-white/[0.02] p-5">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-[color:var(--gold)]">
        <Sparkles className="h-3.5 w-3.5" /> AI Audit Assistant · answers only, never actions
      </div>

      <form
        className="mt-3 flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void send(question);
        }}
      >
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={`Ask about the last ${days} days of money…`}
          className="min-w-[240px] flex-1 rounded-full border border-white/15 bg-white/[0.03] px-4 py-2.5 text-sm outline-none focus:border-[color:var(--gold)]/60"
        />
        <button
          type="submit"
          disabled={thinking}
          className="rounded-full bg-[color:var(--gold)] px-5 py-2.5 text-[11px] uppercase tracking-[0.2em] text-black disabled:opacity-50"
        >
          {thinking ? "Reading…" : "Ask"}
        </button>
      </form>

      <div className="mt-3 flex flex-wrap gap-2">
        {AUDIT_PROMPTS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => void send(p)}
            className="rounded-full border border-white/15 px-3 py-1.5 text-[11px] text-muted-foreground hover:border-[color:var(--gold)]/50"
          >
            {p}
          </button>
        ))}
      </div>

      {thinking && (
        <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Reading every record in this window…
        </p>
      )}
      {error && <p className="mt-4 text-sm text-red-200">{error}</p>}
      {answer && (
        <div className="mt-4 whitespace-pre-wrap rounded-xl border border-[color:var(--gold)]/25 bg-[color:var(--gold)]/[0.04] p-4 text-[13px] leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
}


function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/12 bg-white/[0.02] p-4">
      <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-xl tabular-nums">{value}</div>
    </div>
  );
}

function Split({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className="mt-0.5 tabular-nums">{value}</div>
    </div>
  );
}

function AuditRowCard({ row }: { row: AuditRow }) {
  const [open, setOpen] = useState(false);
  const rec = RECONCILIATION_LABEL[row.reconciliation];

  return (
    <div className="rounded-xl border border-white/12 bg-white/[0.02]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 p-4 text-left"
      >
        <span className="text-lg leading-none">{rec.dot}</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm">{row.title}</span>
          <span className="mt-0.5 block text-[11px] text-muted-foreground">
            {SOURCE_LABEL[row.source]} · {row.status} ·{" "}
            {new Date(row.occurredAt).toLocaleString()}
            {row.reference ? ` · ${row.reference}` : ""}
            {row.counterparty ? ` · ${row.counterparty}` : ""}
          </span>
        </span>
        <span className="shrink-0 text-right">
          <span className="block font-display tabular-nums">{money(row.gross, row.currency)}</span>
          <span className="block text-[11px] text-muted-foreground">
            net {money(row.net, row.currency)}
          </span>
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="space-y-4 border-t border-white/10 p-4 text-sm">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Every dollar explained
            </div>
            <ul className="mt-1.5 space-y-1">
              <Line label="Gross" value={money(row.gross, row.currency)} />
              <Line
                label="Platform allocation (10%)"
                value={`− ${money(row.platformAllocation, row.currency)}`}
              />
              <Line label="Processing fee" value={`− ${money(row.processingFee, row.currency)}`} />
              {row.otherDeductions > 0 && (
                <Line label="Other deductions" value={`− ${money(row.otherDeductions, row.currency)}`} />
              )}
              <Line label="Net" value={money(row.net, row.currency)} gold />
            </ul>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Immutable event history
            </div>
            <ol className="mt-1.5 space-y-1.5 border-l border-white/12 pl-4">
              {row.events.map((e, i) => (
                <li key={i} className="relative text-[13px]">
                  <span className="absolute -left-[21px] top-1.5 h-1.5 w-1.5 rounded-full bg-[color:var(--gold)]" />
                  {e.label}
                  {e.detail ? <span className="text-muted-foreground"> — {e.detail}</span> : null}
                  <span className="block text-[11px] text-muted-foreground">
                    {new Date(e.at).toLocaleString()}
                  </span>
                </li>
              ))}
              {!row.events.length && (
                <li className="text-[13px] text-muted-foreground">No timestamps recorded.</li>
              )}
            </ol>
          </div>

          <p
            className={`rounded-lg border p-3 text-[13px] ${
              row.reconciliation === "attention"
                ? "border-red-400/30 bg-red-400/5 text-red-200"
                : "border-[color:var(--gold)]/25 bg-[color:var(--gold)]/5"
            }`}
          >
            <span className="uppercase tracking-[0.18em] text-[10px]">{rec.label}</span>
            <span className="mt-1 block">{row.reconciliationNote}</span>
            <span className="mt-1 block text-muted-foreground">{rec.plain}</span>
          </p>

          <p className="text-[11px] text-muted-foreground">
            Record ID {row.id} · owner {row.partyId ?? "—"} · this view cannot change any value.
          </p>
        </div>
      )}
    </div>
  );
}

function Line({ label, value, gold }: { label: string; value: string; gold?: boolean }) {
  return (
    <li className="flex items-center justify-between gap-3 text-[13px]">
      <span className={gold ? "text-[color:var(--gold)]" : "text-muted-foreground"}>{label}</span>
      <span className="tabular-nums">{value}</span>
    </li>
  );
}
