// FRASS-0433 — Financial Timeline & Receipt detail.
// Every movement, in order, with an explanation attached to each one.

import { useMemo, useState } from "react";
import { money } from "@/lib/finance/financial-center";
import {
  explainReceipt,
  filterReceipts,
  groupByMonth,
  receiptBreakdown,
  receiptKind,
  receiptsCsv,
  reconcile,
  reconciliationStatement,
  RECEIPT_KINDS,
  RECEIPT_STATUS,
  TIMELINE_FILTERS,
  TIMELINE_RANGES,
  type Receipt,
  type TimelineFilterId,
  type TimelineRangeId,
} from "@/lib/finance/receipts";

const toneClass: Record<string, string> = {
  amber: "border-amber-400/40 text-amber-300",
  emerald: "border-emerald-400/40 text-emerald-300",
  rose: "border-rose-400/40 text-rose-300",
  sky: "border-sky-400/40 text-sky-300",
  zinc: "border-white/20 text-muted-foreground",
};

export function ReceiptDetail({ receipt }: { receipt: Receipt }) {
  const kind = receiptKind(receipt.kind);
  const lines = receiptBreakdown(receipt);
  return (
    <div className="rounded-xl border border-border/60 bg-background/70 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
        <span aria-hidden className="mr-2">
          {kind.icon}
        </span>
        {kind.label}
      </p>
      <p className="mt-1 text-sm font-semibold">{receipt.title}</p>
      {receipt.counterparty && <p className="text-xs text-muted-foreground">With {receipt.counterparty}</p>}

      <dl className="mt-3 space-y-1.5 text-sm">
        {lines.map((l) => (
          <div
            key={l.label}
            className={`flex items-baseline justify-between gap-6 ${
              l.kind === "net" ? "border-t border-border/60 pt-1.5 font-semibold" : ""
            } ${l.kind === "deduction" ? "text-muted-foreground" : ""}`}
          >
            <dt>{l.label}</dt>
            <dd className="tabular-nums">{l.value}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        <strong>Here's the practical version:</strong> {explainReceipt(receipt)}
      </p>
      <p className="mt-2 text-[11px] text-muted-foreground/80">
        Receipt {receipt.id} · {new Date(receipt.occurredAt).toLocaleString()} ·{" "}
        {receipt.status === "settled" || receipt.status === "refunded" || receipt.status === "withdrawn"
          ? "Settled records are permanent — corrections are recorded as separate adjustments."
          : "Still open — this record can still change until it settles."}
      </p>
    </div>
  );
}

/** Frassy's financial answers, drawn straight from the receipts on screen. */
function answer(question: string, receipts: Receipt[]): string {
  const q = question.trim().toLowerCase();
  if (!q) return "";
  const t = reconcile(receipts);

  const monthly = receipts.filter(
    (r) => new Date(r.occurredAt).getMonth() === new Date().getMonth() && new Date(r.occurredAt).getFullYear() === new Date().getFullYear(),
  );

  if (q.includes("pending")) {
    const p = receipts.filter((r) => r.status === "pending");
    return p.length
      ? `You have ${p.length} pending receipt${p.length === 1 ? "" : "s"} worth ${money(t.pending, t.currency)}. ${RECEIPT_STATUS.pending.plain}`
      : "Nothing is pending right now — everything on your account has settled.";
  }
  if (q.includes("gift")) {
    const g = monthly.filter((r) => r.kind === "gift_received");
    const sum = g.reduce((s, r) => s + r.net, 0);
    return `${g.length} gift${g.length === 1 ? "" : "s"} this month, ${money(sum, t.currency)} after the constitutional allocation.`;
  }
  if (q.includes("quick sell") || q.includes("quicksell")) {
    const s = receipts.filter((r) => r.kind === "quick_sell");
    return `Quick Sell has brought in ${money(
      s.reduce((a, r) => a + r.net, 0),
      t.currency,
    )} across ${s.length} sale${s.length === 1 ? "" : "s"}.`;
  }
  if (q.includes("withdraw")) {
    const w = receipts.filter((r) => r.kind === "withdrawal");
    return w.length
      ? `${w.length} withdrawal${w.length === 1 ? "" : "s"} totalling ${money(t.withdrawn, t.currency)}. A withdrawal moves money you already own out to your own bank — it is not a fee.`
      : "You haven't withdrawn anything yet. Withdrawals move available money to your own bank account.";
  }
  if (q.includes("affiliate") || q.includes("commission")) {
    const c = receipts.filter((r) => r.kind === "affiliate_commission");
    return `Affiliate commission so far: ${money(
      c.reduce((a, r) => a + r.net, 0),
      t.currency,
    )} across ${c.length} attributed order${c.length === 1 ? "" : "s"}.`;
  }
  if (q.includes("balance") || q.includes("where") || q.includes("came from") || q.includes("explain")) {
    const latest = receipts[0];
    return latest
      ? `${reconciliationStatement(t)} Your most recent movement: ${explainReceipt(latest)}`
      : reconciliationStatement(t);
  }
  return `${reconciliationStatement(t)} Ask me about gifts, Quick Sell, affiliate commission, pending money or withdrawals and I'll break it down.`;
}

export function FinancialTimeline({ receipts }: { receipts: Receipt[] }) {
  const [filter, setFilter] = useState<TimelineFilterId>("all");
  const [range, setRange] = useState<TimelineRangeId>("90");
  const [kind, setKind] = useState<string>("");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [reply, setReply] = useState("");

  const rows = useMemo(
    () => filterReceipts(receipts, { filter, range, kind: kind || null, query }),
    [receipts, filter, range, kind, query],
  );
  const totals = reconcile(rows);
  const months = groupByMonth(rows);
  const kindsPresent = useMemo(
    () => RECEIPT_KINDS.filter((k) => receipts.some((r) => r.kind === k.id)),
    [receipts],
  );

  const exportCsv = () => {
    const blob = new Blob([receiptsCsv(rows)], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `frass-receipts-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          { label: "Available", value: totals.available, note: "Yours to withdraw now." },
          { label: "Pending", value: totals.pending, note: "Still clearing." },
          { label: "Money in", value: totals.lifetimeIn, note: "Net received." },
          { label: "Money out", value: totals.lifetimeOut, note: "Sent, refunded or withdrawn." },
        ].map((c) => (
          <div key={c.label} className="rounded-xl border border-border/60 bg-background/60 p-4">
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{c.label}</p>
            <p className="mt-1 text-xl font-black tabular-nums">{money(c.value, totals.currency)}</p>
            <p className="text-[11px] text-muted-foreground">{c.note}</p>
          </div>
        ))}
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">
        <strong>Reconciliation:</strong> {reconciliationStatement(totals)}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        {TIMELINE_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.16em] transition ${
              filter === f.id ? "border-foreground bg-foreground text-background" : "border-border/60 hover:bg-muted/40"
            }`}
          >
            {f.label}
          </button>
        ))}
        <select
          value={range}
          onChange={(e) => setRange(e.target.value as TimelineRangeId)}
          aria-label="Date range"
          className="rounded-full border border-border/60 bg-background px-3 py-1 text-[11px]"
        >
          {TIMELINE_RANGES.map((r) => (
            <option key={r.id} value={r.id}>
              {r.label}
            </option>
          ))}
        </select>
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value)}
          aria-label="Source"
          className="rounded-full border border-border/60 bg-background px-3 py-1 text-[11px]"
        >
          <option value="">All sources</option>
          {kindsPresent.map((k) => (
            <option key={k.id} value={k.id}>
              {k.label}
            </option>
          ))}
        </select>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search receipts"
          aria-label="Search receipts"
          className="min-w-[10rem] flex-1 rounded-full border border-border/60 bg-background px-3 py-1 text-[12px]"
        />
        <button
          type="button"
          onClick={exportCsv}
          className="rounded-full border border-border/60 px-3 py-1 text-[11px] uppercase tracking-[0.16em] hover:bg-muted/40"
        >
          Export
        </button>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setReply(answer(question, receipts));
        }}
        className="rounded-xl border border-border/60 bg-background/60 p-4"
      >
        <label htmlFor="frassy-money" className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Ask Frassy about your money
        </label>
        <div className="mt-2 flex gap-2">
          <input
            id="frassy-money"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Why is this pending? Show me all gifts this month."
            className="flex-1 rounded-full border border-border/60 bg-background px-3 py-1.5 text-sm"
          />
          <button
            type="submit"
            className="rounded-full border border-border/60 px-4 py-1.5 text-[11px] uppercase tracking-[0.16em] hover:bg-muted/40"
          >
            Ask
          </button>
        </div>
        {reply && <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{reply}</p>}
      </form>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
          No receipts in this view yet. Every sale, gift, tip, commission, bonus, refund and withdrawal will appear here
          the moment it happens.
        </p>
      ) : (
        <div className="space-y-6">
          {months.map((m) => (
            <section key={m.month}>
              <header className="flex items-baseline justify-between border-b border-border/60 pb-1">
                <h3 className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{m.month}</h3>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {m.net >= 0 ? "+" : "−"}
                  {money(Math.abs(m.net), totals.currency)}
                </span>
              </header>
              <ul className="divide-y divide-border/50">
                {m.items.map((r) => {
                  const k = receiptKind(r.kind);
                  const st = RECEIPT_STATUS[r.status];
                  const isOpen = open === r.id;
                  return (
                    <li key={r.id} className="py-2.5">
                      <button
                        type="button"
                        onClick={() => setOpen(isOpen ? null : r.id)}
                        aria-expanded={isOpen}
                        className="flex w-full items-center gap-3 text-left"
                      >
                        <span aria-hidden className="text-lg">
                          {k.icon}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">{r.title}</span>
                          <span className="block text-[11px] text-muted-foreground">
                            {k.label}
                            {r.counterparty ? ` · ${r.counterparty}` : ""} ·{" "}
                            {new Date(r.occurredAt).toLocaleDateString()}
                          </span>
                        </span>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] ${
                            toneClass[st.tone] ?? toneClass.zinc
                          }`}
                        >
                          {st.label}
                        </span>
                        <span
                          className={`w-24 text-right text-sm font-semibold tabular-nums ${
                            r.direction === "in" ? "" : "text-muted-foreground"
                          }`}
                        >
                          {r.direction === "in" ? "+" : "−"}
                          {money(r.direction === "in" ? r.net : r.gross, r.currency)}
                        </span>
                      </button>
                      {isOpen && (
                        <div className="mt-3">
                          <ReceiptDetail receipt={r} />
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
