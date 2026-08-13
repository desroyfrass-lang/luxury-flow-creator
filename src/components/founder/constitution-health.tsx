// FRASS-0518-A — Constitution Health.
// The Constitution stops being a document here. Every amendment is measured
// against what actually happened on the platform: did it reduce the problem,
// did it cause a new one, should it be kept, expanded, revised or retired.
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { constitutionHealth } from "@/lib/constitution/constitution.functions";
import type { AmendmentEffectiveness } from "@/lib/constitution/effectiveness";

const VERDICT = {
  effective: { label: "Working", cls: "border-emerald-500/40 text-emerald-500" },
  holding: { label: "Holding", cls: "border-emerald-500/30 text-emerald-500/90" },
  under_review: { label: "Under review", cls: "border-amber-500/40 text-amber-500" },
  recurring_issues: { label: "Recurring issues", cls: "border-red-500/40 text-red-500" },
  not_implemented: { label: "Not built yet", cls: "border-red-500/40 text-red-500" },
  insufficient_evidence: { label: "Too early", cls: "border-border text-muted-foreground" },
} as const;

const ACTION_LABEL: Record<string, string> = {
  keep: "Keep as is",
  expand: "Expand it",
  revise: "Revise it",
  retire: "Retire it",
  implement: "Build it",
  observe: "Keep watching",
};

export function ConstitutionHealthPanel({ compact = false }: { compact?: boolean }) {
  const load = useServerFn(constitutionHealth);
  const { data, isLoading, error } = useQuery({
    queryKey: ["constitution-health"],
    queryFn: () => load(),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Reviewing the Constitution…</p>;
  if (error || !data)
    return (
      <p className="text-sm text-muted-foreground">
        Constitution health is unavailable right now.
      </p>
    );

  if (compact) {
    return (
      <div className="rounded-xl border border-border/70 p-4">
        <div className="flex items-baseline justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider">Constitution Health</h3>
          <span className="text-2xl font-black">{data.healthScore}</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{data.headline}</p>
        <p className="mt-2 text-[11px] text-muted-foreground">
          {data.implemented} of {data.totalAmendments} amendments live · {data.measured} measurable
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--gold)]">FRASS-0518-A</p>
        <h2 className="text-2xl font-black uppercase tracking-tight">Constitution Health</h2>
        <p className="text-sm text-muted-foreground">{data.headline}</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Health score" value={`${data.healthScore}`} />
        <Stat label="Amendments" value={`${data.totalAmendments}`} />
        <Stat label="Actually built" value={`${data.implemented}`} />
        <Stat label="Measurable" value={`${data.measured}`} />
      </div>

      <Group title="Most effective" items={data.mostEffective} empty="Nothing proven yet." />
      <Group title="Under review" items={data.underReview} empty="Nothing sitting in limbo." />
      <Group
        title="Recurring issues"
        items={data.recurringIssues}
        empty="No amendment is making things worse."
      />
      <Group
        title="Written but not built"
        items={data.notImplemented}
        empty="Every amendment exists in the platform."
      />

      {data.recommendations.length ? (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider">
            Recommendations for future constitutional updates
          </h3>
          {data.recommendations.map((r) => (
            <div key={`${r.ref}-${r.action}`} className="rounded-xl border border-border/70 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-sm">{r.title}</span>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] uppercase ${
                    r.priority === "high"
                      ? "border-red-500/40 text-red-500"
                      : "border-amber-500/40 text-amber-500"
                  }`}
                >
                  {ACTION_LABEL[r.action] ?? r.action}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{r.why}</p>
            </div>
          ))}
        </div>
      ) : null}

      <details className="rounded-xl border border-border/60 p-4">
        <summary className="cursor-pointer text-sm font-semibold">Every amendment</summary>
        <div className="mt-3 space-y-3">
          {data.all.map((a) => (
            <AmendmentCard key={a.ref} a={a} />
          ))}
        </div>
      </details>
    </section>
  );
}

function Group({
  title,
  items,
  empty,
}: {
  title: string;
  items: AmendmentEffectiveness[];
  empty: string;
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wider">{title}</h3>
      {items.length ? (
        items.map((a) => <AmendmentCard key={a.ref} a={a} />)
      ) : (
        <p className="text-xs text-muted-foreground">{empty}</p>
      )}
    </div>
  );
}

function AmendmentCard({ a }: { a: AmendmentEffectiveness }) {
  const v = VERDICT[a.verdict];
  return (
    <div className="rounded-xl border border-border/70 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-[color:var(--gold)]">{a.ref}</span>
        <span className="text-sm font-semibold">{a.title}</span>
        <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase ${v.cls}`}>
          {v.label}
        </span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{a.intent}</p>
      <p className="mt-2 text-xs">{a.plain}</p>

      <dl className="mt-3 grid gap-x-4 gap-y-1 text-[11px] text-muted-foreground sm:grid-cols-2">
        <Fact term="Was it implemented?" value={a.implemented ? `Yes — ${a.implementedAt}` : "No"} />
        <Fact
          term="Incidents before"
          value={`${a.incidentsBefore}${a.ratePerMonthBefore != null ? ` (${a.ratePerMonthBefore}/month)` : ""}`}
        />
        <Fact
          term="Incidents after"
          value={`${a.incidentsAfter}${a.ratePerMonthAfter != null ? ` (${a.ratePerMonthAfter}/month)` : ""}`}
        />
        <Fact
          term="Change"
          value={a.changePct == null ? "Not measurable yet" : `${a.changePct > 0 ? "+" : ""}${a.changePct}%`}
        />
        <Fact
          term="Unintended consequences"
          value={
            a.unintended.length
              ? a.unintended.map((u) => `${u.label} (${u.occurrences}×)`).join("; ")
              : "None detected"
          }
        />
        <Fact term="Recommendation" value={`${ACTION_LABEL[a.recommendation.action]} — ${a.recommendation.why}`} />
      </dl>
    </div>
  );
}

function Fact({ term, value }: { term: string; value: string }) {
  return (
    <div>
      <dt className="font-medium text-foreground/80">{term}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/70 p-4">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
}
