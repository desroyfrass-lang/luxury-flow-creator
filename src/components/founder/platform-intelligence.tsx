// FRASS-0518 — Platform Intelligence Engine, Founder view.
//
// The Repair History remembers. This panel makes it useful: what keeps coming
// back, what is calm, what is costing support, which amendments actually ended
// a problem, and what Frassy recommends doing next. The Founder always decides.
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Brain, TrendingDown, TrendingUp, ShieldCheck, Lightbulb, Scale } from "lucide-react";
import { platformIntelligence } from "@/lib/repair/repair.functions";
import type { PlatformIntelligence, RecommendationKind } from "@/lib/repair/intelligence";

const KIND_LABEL: Record<RecommendationKind, string> = {
  product_improvement: "Product improvement",
  ux_improvement: "Make it easier to use",
  documentation: "Explain it better",
  constitutional_amendment: "Constitutional amendment",
  development_review: "Development review",
};

const PRIORITY_TONE: Record<string, string> = {
  high: "border-amber-400/40 text-amber-300",
  medium: "border-sky-400/40 text-sky-300",
  low: "border-white/20 text-white/60",
};

export function usePlatformIntelligence(enabled = true) {
  const fn = useServerFn(platformIntelligence);
  return useQuery<PlatformIntelligence>({
    queryKey: ["platform", "intelligence"],
    queryFn: () => fn(),
    enabled,
    staleTime: 5 * 60_000,
  });
}

export function PlatformIntelligencePanel() {
  const q = usePlatformIntelligence();
  const d = q.data;

  return (
    <section className="rounded-sm border border-white/10 bg-white/[0.02] p-6">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.4em] text-[color:var(--gold)]">FRASS-0518</div>
          <h2 className="mt-1 flex items-center gap-2 text-xl font-semibold tracking-tight">
            <Brain className="h-5 w-5 text-[color:var(--gold)]" /> Platform Intelligence
          </h2>
          <p className="mt-1 max-w-xl text-sm text-white/60">
            The best repair is the one that never becomes necessary. This is what the platform has
            learned from every issue it has ever seen.
          </p>
        </div>
        <div className="text-right text-[11px] uppercase tracking-[0.24em] text-white/40">
          {d ? `${d.windowIncidents} this month · ${d.totalIncidents} all time` : "Reading history…"}
        </div>
      </header>

      {q.isLoading && <p className="py-8 text-sm text-white/50">Frassy is reading the Repair History…</p>}
      {q.isError && <p className="py-8 text-sm text-white/50">Platform Intelligence is unavailable right now.</p>}

      {d && (
        <div className="mt-5 space-y-6">
          <p className="rounded-sm border border-white/10 bg-black/30 p-4 text-sm text-white/80">{d.headline}</p>

          {/* Recommendations first — this is the part that changes the future. */}
          {d.recommendations.length > 0 && (
            <div>
              <h3 className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-white/50">
                <Lightbulb className="h-3.5 w-3.5" /> Recommended next
              </h3>
              <ul className="space-y-2">
                {d.recommendations.map((r) => (
                  <li key={r.id} className="rounded-sm border border-white/10 bg-black/20 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-[0.22em] ${PRIORITY_TONE[r.priority]}`}
                      >
                        {KIND_LABEL[r.kind]}
                      </span>
                      <span className="text-[10px] uppercase tracking-[0.22em] text-white/40">
                        seen {r.occurrences}×{r.area ? ` · ${r.area}` : ""}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-medium text-white/90">{r.title}</p>
                    <p className="mt-1 text-sm text-white/60">{r.why}</p>
                    <p className="mt-1 text-sm text-white/50">{r.proposal}</p>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-[11px] text-white/40">
                Recommendations only. Nothing here changes until you decide it should.
              </p>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-white/50">
                <TrendingUp className="h-3.5 w-3.5" /> Keeps coming back
              </h3>
              {d.topRecurring.length === 0 ? (
                <p className="text-sm text-white/50">Nothing has repeated yet.</p>
              ) : (
                <ul className="space-y-2">
                  {d.topRecurring.map((r) => (
                    <li key={r.signature} className="rounded-sm border border-white/10 bg-black/20 p-3 text-sm">
                      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-white/40">
                        <span>{r.occurrences}×</span>
                        {r.area && <span>· {r.area}</span>}
                        {r.eliminated && <span className="text-emerald-400">· ended by {r.resolvedByAmendment}</span>}
                      </div>
                      <p className="mt-1 text-white/80">{r.label}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h3 className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-white/50">
                <ShieldCheck className="h-3.5 w-3.5" /> Calmest areas
              </h3>
              <ul className="space-y-1 text-sm text-white/70">
                {d.mostStable.map((a) => (
                  <li key={a.area} className="flex items-center justify-between gap-3">
                    <span>{a.area}</span>
                    <span className="text-[11px] uppercase tracking-[0.2em] text-emerald-400/80">
                      {a.stability}% steady
                    </span>
                  </li>
                ))}
                {d.mostStable.length === 0 && <li className="text-white/50">Not enough history yet.</li>}
              </ul>

              {d.supportHeavy.length > 0 && (
                <>
                  <h3 className="mb-2 mt-4 flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-white/50">
                    <TrendingDown className="h-3.5 w-3.5" /> Generating the most support
                  </h3>
                  <ul className="space-y-1 text-sm text-white/70">
                    {d.supportHeavy.map((a) => (
                      <li key={a.area} className="flex items-center justify-between gap-3">
                        <span>{a.area}</span>
                        <span className="text-[11px] uppercase tracking-[0.2em] text-amber-300/80">
                          {a.incidents} report{a.incidents === 1 ? "" : "s"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>

          {d.amendmentsThatWorked.length > 0 && (
            <div>
              <h3 className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-white/50">
                <Scale className="h-3.5 w-3.5" /> Amendments that ended a problem
              </h3>
              <ul className="space-y-1 text-sm text-white/70">
                {d.amendmentsThatWorked.map((a) => (
                  <li key={`${a.ref}-${a.issue}`}>
                    <span className="text-[color:var(--gold)]">{a.ref}</span> — {a.issue}{" "}
                    <span className="text-white/40">
                      ({a.occurrencesBefore}× before, none since)
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {d.trend.length > 1 && (
            <div>
              <h3 className="mb-2 text-[11px] uppercase tracking-[0.3em] text-white/50">Repair trend</h3>
              <div className="flex items-end gap-2">
                {d.trend.map((t) => {
                  const max = Math.max(...d.trend.map((x) => x.incidents), 1);
                  return (
                    <div key={t.week} className="flex-1 text-center">
                      <div
                        className="mx-auto w-full rounded-sm bg-[color:var(--gold)]/50"
                        style={{ height: `${Math.max(4, (t.incidents / max) * 64)}px` }}
                        title={`${t.incidents} reports, ${t.escalations} escalated`}
                      />
                      <div className="mt-1 text-[9px] text-white/40">{t.week.slice(5)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {(d.deploymentPattern || d.clientPattern.length > 0 || d.onboardingFriction.length > 0) && (
            <div className="space-y-2 rounded-sm border border-white/10 bg-black/20 p-4 text-sm text-white/70">
              {d.deploymentPattern && <p>{d.deploymentPattern.note}</p>}
              {d.onboardingFriction.map((s) => (
                <p key={s.step}>
                  {s.members} members struggled with the same first step: <strong>{s.step}</strong>.
                </p>
              ))}
              {d.clientPattern.map((c) => (
                <p key={c.client}>
                  {c.incidents} reports came from {c.client} — the rest of the platform may be fine.
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
