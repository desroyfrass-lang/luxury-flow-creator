// FRASS-0523 — Founder Financial Dashboard.
// What Frass costs to run, what members are charged (almost always nothing),
// who pays for the rest, and whether the sums still work at a million members.
import { useMemo, useState } from "react";
import {
  COST_IMPACT_QUESTIONS,
  FREE_FOREVER,
  FUNDING_MODELS,
  NO_SURPRISE_BILLING,
  SCALE_TIERS,
  auditPlatform,
  costByDriver,
  formatMoney,
  type ScaleTier,
} from "@/lib/finance/sustainability";

const VERDICT_META = {
  sustainable: { label: "Sustainable", cls: "text-emerald-500 border-emerald-500/40" },
  watch: { label: "Watch", cls: "text-amber-500 border-amber-500/40" },
  unsustainable: { label: "Critical", cls: "text-red-500 border-red-500/40" },
} as const;

export function FinancialSustainabilityPanel() {
  const [tier, setTier] = useState<ScaleTier>(10_000);
  const platform = useMemo(() => auditPlatform(), []);
  const drivers = useMemo(() => costByDriver(tier), [tier]);
  const projection = platform.projections.find((p) => p.members === tier)!;

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--gold)]">FRASS-0523</p>
        <h2 className="text-2xl font-black uppercase tracking-tight">
          Financial Sustainability
        </h2>
        <p className="text-sm text-muted-foreground">
          Free to build. Sustainable to operate. Every figure here is a planning estimate for you —
          never a bill for a member.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {SCALE_TIERS.map((t) => (
          <button
            key={t}
            onClick={() => setTier(t)}
            className={`rounded-full border px-3 py-1 text-xs transition ${
              tier === t
                ? "border-[color:var(--gold)] text-[color:var(--gold)]"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.toLocaleString()} members
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat
          label="Monthly operating cost"
          value={formatMoney(projection.monthly)}
          plain={`Everything it takes to run Frass for ${tier.toLocaleString()} members.`}
        />
        <Stat
          label="Cost per member"
          value={formatMoney(projection.perMember)}
          plain="What one member costs us each month, all in."
        />
        <Stat
          label="Absorbed by Frass"
          value={`${Math.round((platform.split.absorbed / platform.split.total) * 100)}%`}
          plain="The share we pay for on purpose so building stays free."
        />
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider">Where the money goes</h3>
        <div className="space-y-2">
          {drivers.map((d) => {
            const pct = (d.monthly / projection.monthly) * 100;
            return (
              <div key={d.driver} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>{d.label}</span>
                  <span className="text-muted-foreground">
                    {formatMoney(d.monthly)} · {pct.toFixed(0)}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-muted">
                  <div
                    className="h-1.5 rounded-full bg-[color:var(--gold)]"
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {platform.critical.length ? (
        <div className="rounded-xl border border-red-500/40 bg-red-500/5 p-4">
          <p className="text-sm font-semibold text-red-500">Critical Trust Issue</p>
          <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
            {platform.critical.flatMap((a) =>
              a.warnings.map((w) => <li key={`${a.statement.id}-${w}`}>{a.statement.feature}: {w}</li>),
            )}
          </ul>
        </div>
      ) : null}

      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider">
          Cost Impact Statements
        </h3>
        <p className="text-xs text-muted-foreground">
          Every feature answers the same four questions before it ships.
        </p>
        <div className="space-y-3">
          {platform.audits.map((a) => {
            const meta = VERDICT_META[a.verdict];
            return (
              <details
                key={a.statement.id}
                className="rounded-xl border border-border/70 p-4 text-sm"
              >
                <summary className="flex cursor-pointer flex-wrap items-center gap-3">
                  <span className="font-semibold">{a.statement.feature}</span>
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase ${meta.cls}`}>
                    {meta.label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {a.statement.memberCost === "free"
                      ? "Free to the member"
                      : a.statement.memberCost === "credits"
                        ? `${a.statement.creditsPerUse} credit${a.statement.creditsPerUse === 1 ? "" : "s"}`
                        : "Optional paid"}
                  </span>
                </summary>
                <dl className="mt-3 space-y-2 text-xs">
                  <Row term="What does it cost Frass?" value={a.answers.costsFrass} />
                  <Row term="What does it cost the member?" value={a.answers.costsMember} />
                  <Row term="How is it sustained?" value={a.answers.sustainedBy} />
                  <Row term="Can it scale?" value={a.answers.scales} />
                  <Row term="If credits run out" value={a.statement.degradesTo} />
                  <Row term="Funding model" value={FUNDING_MODELS[a.statement.funding].label} />
                </dl>
                {a.warnings.length ? (
                  <ul className="mt-3 space-y-1 text-xs text-amber-500">
                    {a.warnings.map((w) => (
                      <li key={w}>⚠ {w}</li>
                    ))}
                  </ul>
                ) : null}
              </details>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
          <h3 className="text-sm font-semibold">Free means free</h3>
          <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
            {FREE_FOREVER.map((f) => (
              <li key={f}>✅ {f}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
          <h3 className="text-sm font-semibold">No surprise billing</h3>
          <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
            {NO_SURPRISE_BILLING.map((f) => (
              <li key={f}>• {f}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-xl border border-[color:var(--gold)]/30 bg-[color:var(--gold)]/5 p-4">
        <h3 className="text-sm font-semibold">Cost Impact Statement — required before any new AI feature</h3>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-xs text-muted-foreground">
          {COST_IMPACT_QUESTIONS.map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Stat({ label, value, plain }: { label: string; value: string; plain: string }) {
  return (
    <div className="rounded-xl border border-border/70 p-4">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{plain}</p>
    </div>
  );
}

function Row({ term, value }: { term: string; value: string }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[200px_1fr]">
      <dt className="font-medium text-foreground">{term}</dt>
      <dd className="text-muted-foreground">{value}</dd>
    </div>
  );
}
