import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { SiteShell } from "@/components/site-shell";
import { PageFeedback } from "@/components/page-feedback";
import {
  OPPORTUNITY_KINDS,
  OPPORTUNITY_STAGES,
  EFFORT_LEVELS,
  FINANCE_CATEGORIES,
  kindLabel,
  stageLabel,
  money,
} from "@/lib/opportunity";
import {
  listOpportunities,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  listFinanceEntries,
  createFinanceEntry,
  deleteFinanceEntry,
  type Opportunity,
  type FinanceEntry,
} from "@/lib/opportunity.functions";

export const Route = createFileRoute("/_authenticated/opportunity")({
  head: () => ({
    meta: [
      { title: "Opportunity Center — Frass Operating System" },
      {
        name: "description",
        content:
          "Track the opportunities you're building, see what money is coming in and going out, and know your next step.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: OpportunityPage,
});

const inputClass =
  "w-full rounded-sm border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:border-[color:var(--gold)]";
const goldButton =
  "lux-press rounded-sm border border-[color:var(--gold)] bg-[color:var(--gold)] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.3em] text-[color:var(--ink)] disabled:opacity-60";

type Tab = "opportunities" | "money";

function OpportunityPage() {
  const loadOpps = useServerFn(listOpportunities);
  const loadMoney = useServerFn(listFinanceEntries);
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("opportunities");

  const opps = useQuery({ queryKey: ["opportunities"], queryFn: () => loadOpps() });
  const entries = useQuery({ queryKey: ["finance"], queryFn: () => loadMoney() });

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["opportunities"] });
    void qc.invalidateQueries({ queryKey: ["finance"] });
  };

  const list = opps.data ?? [];
  const rows = entries.data ?? [];

  const totals = useMemo(() => {
    const income = rows
      .filter((r) => r.entry_type === "income")
      .reduce((s, r) => s + Number(r.amount || 0), 0);
    const expense = rows
      .filter((r) => r.entry_type === "expense")
      .reduce((s, r) => s + Number(r.amount || 0), 0);
    const open = list.filter((o) => !["won", "parked"].includes(o.stage));
    const pipeline = open.reduce((s, o) => s + Number(o.potential_value || 0), 0);
    return { income, expense, net: income - expense, pipeline, openCount: open.length };
  }, [rows, list]);

  return (
    <SiteShell>
      <div className="mx-auto max-w-5xl px-6 py-16">
        <header className="text-center">
          <div className="text-[11px] uppercase tracking-[0.4em] text-[color:var(--gold)]">
            Opportunity Center
          </div>
          <h1 className="mt-4 font-display text-4xl leading-tight md:text-5xl">
            Where the work turns into money.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">
            Keep every opportunity in one place, know the next step on each one, and watch what's
            actually coming in and going out. Private to you.
          </p>
        </header>

        <section className="mt-10 grid gap-4 sm:grid-cols-4">
          <Stat label="Open opportunities" value={String(totals.openCount)} />
          <Stat label="Potential value" value={money(totals.pipeline)} />
          <Stat label="Money in" value={money(totals.income)} />
          <Stat label="Net" value={money(totals.net)} />
        </section>

        <div className="mt-10 flex justify-center gap-3">
          {(["opportunities", "money"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-sm border px-5 py-2 text-[10px] uppercase tracking-[0.25em] transition ${
                tab === t
                  ? "border-[color:var(--gold)] text-[color:var(--gold)]"
                  : "border-border text-muted-foreground hover:border-[color:var(--gold)]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "opportunities" && (
          <OpportunitiesTab
            list={list}
            isLoading={opps.isLoading}
            onChange={invalidate}
          />
        )}
        {tab === "money" && (
          <MoneyTab rows={rows} isLoading={entries.isLoading} onChange={invalidate} />
        )}

        <div className="mt-16 text-center">
          <Link
            to="/welcome-hall"
            className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground transition hover:text-[color:var(--gold)]"
          >
            ← Back to Welcome Hall
          </Link>
        </div>

        <PageFeedback pageTitle="Opportunity Center" />
      </div>
    </SiteShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background/60 p-5 text-center backdrop-blur">
      <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{label}</div>
      <div className="mt-2 font-display text-2xl text-[color:var(--gold)]">{value}</div>
    </div>
  );
}

function OpportunitiesTab({
  list,
  isLoading,
  onChange,
}: {
  list: Opportunity[];
  isLoading: boolean;
  onChange: () => void;
}) {
  const create = useServerFn(createOpportunity);
  const update = useServerFn(updateOpportunity);
  const remove = useServerFn(deleteOpportunity);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [kind, setKind] = useState("idea");
  const [value, setValue] = useState("");
  const [effort, setEffort] = useState("medium");
  const [targetDate, setTargetDate] = useState("");
  const [nextStep, setNextStep] = useState("");
  const [stageFilter, setStageFilter] = useState("all");

  const add = useMutation({
    mutationFn: () =>
      create({
        data: {
          title,
          description,
          kind,
          potential_value: value,
          effort,
          target_date: targetDate || null,
          next_step: nextStep,
        },
      }),
    onSuccess: () => {
      setTitle("");
      setDescription("");
      setValue("");
      setTargetDate("");
      setNextStep("");
      toast.success("Opportunity added.");
      onChange();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const patch = useMutation({
    mutationFn: (vars: { id: string; stage?: string; next_step?: string | null }) =>
      update({ data: vars }),
    onSuccess: onChange,
    onError: (e: Error) => toast.error(e.message),
  });

  const drop = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success("Opportunity removed.");
      onChange();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = list.filter((o) => stageFilter === "all" || o.stage === stageFilter);

  return (
    <>
      <section className="mt-10 rounded-2xl border border-[color:var(--gold)]/40 bg-background/70 p-8 backdrop-blur">
        <div className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
          Add an opportunity
        </div>
        <form
          className="mt-5 grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            add.mutate();
          }}
        >
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What is it? (e.g. Summer capsule with a local shop)"
            className={inputClass}
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A little more detail (optional)"
            rows={2}
            className={inputClass}
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <select value={kind} onChange={(e) => setKind(e.target.value)} className={inputClass}>
              {OPPORTUNITY_KINDS.map((k) => (
                <option key={k.value} value={k.value}>
                  {k.label}
                </option>
              ))}
            </select>
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Potential value (e.g. 2500)"
              className={inputClass}
            />
            <select
              value={effort}
              onChange={(e) => setEffort(e.target.value)}
              className={inputClass}
            >
              {EFFORT_LEVELS.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className={inputClass}
            />
            <input
              value={nextStep}
              onChange={(e) => setNextStep(e.target.value)}
              placeholder="Your next step"
              className={inputClass}
            />
          </div>
          <button type="submit" disabled={add.isPending} className={goldButton}>
            {add.isPending ? "Adding…" : "Add opportunity"}
          </button>
        </form>
      </section>

      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {["all", ...OPPORTUNITY_STAGES.map((s) => s.value)].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStageFilter(s)}
            className={`rounded-full border px-4 py-1.5 text-[10px] uppercase tracking-[0.2em] transition ${
              stageFilter === s
                ? "border-[color:var(--gold)] text-[color:var(--gold)]"
                : "border-border text-muted-foreground hover:border-[color:var(--gold)]"
            }`}
          >
            {s === "all" ? "All" : stageLabel(s)}
          </button>
        ))}
      </div>

      {isLoading && (
        <p className="mt-10 text-center text-sm text-muted-foreground">Loading your board…</p>
      )}

      {!isLoading && filtered.length === 0 && (
        <p className="mt-10 text-center text-sm text-muted-foreground">
          Nothing here yet. Add the first opportunity you're chasing.
        </p>
      )}

      <div className="mt-8 grid gap-4">
        {filtered.map((o) => (
          <article
            key={o.id}
            className="rounded-2xl border border-border bg-background/60 p-6 backdrop-blur"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  {kindLabel(o.kind)}
                  {o.target_date ? ` · by ${o.target_date}` : ""}
                </div>
                <h3 className="mt-1 font-display text-xl">{o.title}</h3>
                {o.description && (
                  <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{o.description}</p>
                )}
              </div>
              <div className="text-right">
                <div className="font-display text-lg text-[color:var(--gold)]">
                  {o.potential_value ? money(Number(o.potential_value), o.currency) : "—"}
                </div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  {EFFORT_LEVELS.find((l) => l.value === o.effort)?.label}
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-sm border border-border/60 bg-background/40 p-3 text-sm">
              <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                Next step ·{" "}
              </span>
              {o.next_step || "Not decided yet."}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <select
                value={o.stage}
                onChange={(e) => patch.mutate({ id: o.id, stage: e.target.value })}
                className="rounded-sm border border-border bg-background/60 px-3 py-2 text-xs outline-none focus:border-[color:var(--gold)]"
              >
                {OPPORTUNITY_STAGES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  const step = window.prompt("What's the next step?", o.next_step ?? "");
                  if (step !== null) patch.mutate({ id: o.id, next_step: step.trim() || null });
                }}
                className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground transition hover:text-[color:var(--gold)]"
              >
                Set next step
              </button>
              <button
                type="button"
                onClick={() => drop.mutate(o.id)}
                className="ml-auto text-[10px] uppercase tracking-[0.25em] text-muted-foreground transition hover:text-destructive"
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function MoneyTab({
  rows,
  isLoading,
  onChange,
}: {
  rows: FinanceEntry[];
  isLoading: boolean;
  onChange: () => void;
}) {
  const create = useServerFn(createFinanceEntry);
  const remove = useServerFn(deleteFinanceEntry);

  const [label, setLabel] = useState("");
  const [entryType, setEntryType] = useState("income");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Sales");
  const [occurredOn, setOccurredOn] = useState(new Date().toISOString().slice(0, 10));

  const add = useMutation({
    mutationFn: () =>
      create({
        data: { label, entry_type: entryType, amount, category, occurred_on: occurredOn },
      }),
    onSuccess: () => {
      setLabel("");
      setAmount("");
      toast.success("Logged.");
      onChange();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const drop = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success("Entry removed.");
      onChange();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <>
      <section className="mt-10 rounded-2xl border border-[color:var(--gold)]/40 bg-background/70 p-8 backdrop-blur">
        <div className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
          Log money in or out
        </div>
        <form
          className="mt-5 grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            add.mutate();
          }}
        >
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="What was it? (e.g. Drop 1 sales, blank tees order)"
            className={inputClass}
          />
          <div className="grid gap-4 sm:grid-cols-4">
            <select
              value={entryType}
              onChange={(e) => setEntryType(e.target.value)}
              className={inputClass}
            >
              <option value="income">Money in</option>
              <option value="expense">Money out</option>
            </select>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount"
              className={inputClass}
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputClass}
            >
              {FINANCE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={occurredOn}
              onChange={(e) => setOccurredOn(e.target.value)}
              className={inputClass}
            />
          </div>
          <button type="submit" disabled={add.isPending} className={goldButton}>
            {add.isPending ? "Saving…" : "Log entry"}
          </button>
        </form>
      </section>

      {isLoading && (
        <p className="mt-10 text-center text-sm text-muted-foreground">Loading your ledger…</p>
      )}

      {!isLoading && rows.length === 0 && (
        <p className="mt-10 text-center text-sm text-muted-foreground">
          No entries yet. Log your first sale or expense.
        </p>
      )}

      <div className="mt-8 grid gap-3">
        {rows.map((r) => (
          <div
            key={r.id}
            className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-background/60 p-4 backdrop-blur"
          >
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm">{r.label}</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                {r.occurred_on}
                {r.category ? ` · ${r.category}` : ""}
              </div>
            </div>
            <div
              className={`font-display text-lg ${
                r.entry_type === "income" ? "text-[color:var(--gold)]" : "text-muted-foreground"
              }`}
            >
              {r.entry_type === "income" ? "+" : "−"}
              {money(Number(r.amount), r.currency)}
            </div>
            <button
              type="button"
              onClick={() => drop.mutate(r.id)}
              className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground transition hover:text-destructive"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
