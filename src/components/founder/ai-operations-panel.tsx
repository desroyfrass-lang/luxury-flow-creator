// FRASS-0540 / FRASS-0541 — Founder AI Operations.
// What Frass's intelligence is doing, what it costs, and what members built with it.
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { aiOperationsSnapshot } from "@/lib/founder/ai-operations.functions";
import { approvalPolicy } from "@/lib/founder/ai-approval";
import { ROUTER_SUMMARY, ROUTING_TABLE, type TaskKind } from "@/lib/ai/intelligence-router";
import { AI_PROVIDERS, PROVIDER_INDEPENDENCE_SUMMARY, type AiCapability } from "@/lib/ai/providers";

function Panel({ title, plain, children }: { title: string; plain: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border/70 p-5">
      <h3 className="text-sm font-bold uppercase tracking-wide">{title}</h3>
      <p className="mt-1 text-xs text-muted-foreground">{plain}</p>
      <div className="mt-4 space-y-2 text-sm">{children}</div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-base font-bold">{value}</span>
    </div>
  );
}

export function AiOperationsPanel() {
  const load = useServerFn(aiOperationsSnapshot);
  const { data, isLoading, error } = useQuery({
    queryKey: ["founder-ai-operations"],
    queryFn: () => load(),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Reading AI activity…</p>;
  if (error || !data) return <p className="text-sm text-muted-foreground">AI operations are unavailable right now.</p>;

  const ms = (n: number | null) => (n === null ? "—" : `${(n / 1000).toFixed(1)}s`);
  const maxReq = Math.max(1, ...data.trends.daily.map((d) => d.requests));

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-[color:var(--gold)]/40 bg-[color:var(--gold)]/5 p-5">
        <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--gold)]">FRASS-0540 · FRASS-0541</p>
        <h2 className="mt-2 text-2xl font-black uppercase tracking-tight">AI Operations</h2>
        <p className="mt-2 text-sm text-muted-foreground">{data.roi.plain}</p>
      </header>

      {/* Alerts first — nothing should surprise the Founder. */}
      <section className="space-y-2">
        {data.alerts.map((a, i) => (
          <div
            key={i}
            className={`rounded-xl border p-3 text-xs ${
              a.level === "critical"
                ? "border-red-500/50 bg-red-500/5 text-red-400"
                : a.level === "warn"
                  ? "border-amber-500/50 bg-amber-500/5 text-amber-400"
                  : "border-border/70 text-muted-foreground"
            }`}
          >
            {a.level === "critical" ? "🚨 " : a.level === "warn" ? "⚠️ " : "✅ "}
            {a.message}
          </div>
        ))}
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <Panel title="Credits" plain="What's left, what you've spent, and how long it lasts.">
          <Stat label="Balance" value={data.credits.balance.toLocaleString()} />
          <Stat label="Used today" value={data.credits.usedToday.toLocaleString()} />
          <Stat label="Used this month" value={data.credits.usedThisMonth.toLocaleString()} />
          <Stat label="Used all-time" value={data.credits.lifetimeUsed.toLocaleString()} />
          <Stat
            label="Estimated days remaining"
            value={data.credits.daysRemaining === null ? "—" : `${data.credits.daysRemaining} days`}
          />
        </Panel>

        <Panel title="AI requests" plain="How often Frass is thinking, and for whom.">
          <Stat label="Today" value={data.requests.today} />
          <Stat label="This week" value={data.requests.thisWeek} />
          <Stat label="This month" value={data.requests.thisMonth} />
        </Panel>

        <Panel title="Reliability" plain="How often the answer actually arrived.">
          <Stat label="Success rate" value={`${data.reliability.successRate}%`} />
          <Stat label="Failed / retried" value={data.reliability.failed} />
          <Stat label="Total operations" value={data.reliability.total} />
        </Panel>

        <Panel title="Performance" plain="How long members wait for Frassy.">
          <Stat label="Average response" value={ms(data.performance.averageMs)} />
          <Stat label="Fastest" value={ms(data.performance.fastestMs)} />
          <Stat label="Slowest" value={ms(data.performance.slowestMs)} />
          <Stat
            label="Busiest hour"
            value={data.performance.peakHour === null ? "—" : `${String(data.performance.peakHour).padStart(2, "0")}:00 UTC`}
          />
        </Panel>
      </div>

      <Panel
        title="Cost telemetry"
        plain="What Frass's intelligence actually costs, per conversation, per member, per day."
      >
        <Stat label="Cost per conversation" value={`${data.telemetry.costPerConversation} credits`} />
        <Stat label="Cost per active member (30 days)" value={`${data.telemetry.costPerActiveMember} credits`} />
        <Stat label="Total compute spend today" value={`${data.telemetry.dailyComputeSpendToday} credits`} />
        <Stat label="Average daily compute spend" value={`${data.telemetry.dailyComputeSpendAverage} credits`} />
        <Stat label="Conversations (30 days)" value={data.telemetry.conversationsThisMonth} />
        <Stat label="Active members (30 days)" value={data.telemetry.activeMembersThisMonth} />
        <p className="pt-2 text-xs text-muted-foreground">{data.telemetry.plain}</p>
      </Panel>

      <Panel
        title="Provider independence"
        plain="Frass is never locked to one AI company. Each capability names a first choice and its backups."
      >
        {(Object.keys(AI_PROVIDERS) as AiCapability[]).map((cap) => {
          const spec = AI_PROVIDERS[cap];
          return (
            <div key={cap} className="rounded-xl border border-border/70 p-3">
              <p className="text-xs font-bold uppercase tracking-wide">{spec.label}</p>
              <p className="text-[11px] text-muted-foreground">{spec.plain}</p>
              <ul className="mt-2 space-y-1 text-xs">
                {spec.chain.map((opt, i) => (
                  <li key={opt.model} className="flex justify-between gap-3">
                    <span>
                      {i === 0 ? "First choice" : `Backup ${i}`} · {opt.vendor}
                    </span>
                    <span className="text-muted-foreground">{opt.cost} cost</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
        <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
          {PROVIDER_INDEPENDENCE_SUMMARY.map((line) => (
            <li key={line}>• {line}</li>
          ))}
        </ul>
      </Panel>

      <Panel title="Cost by feature" plain="Where the money actually goes, feature by feature.">
        {data.requests.byFeature.length ? (
          <ul className="space-y-2">
            {data.requests.byFeature.map((f) => (
              <li key={f.feature}>
                <div className="flex items-baseline justify-between gap-3 text-xs">
                  <span>{f.feature}</span>
                  <span className="text-muted-foreground">
                    {f.requests} requests · {f.credits.toLocaleString()} credits · {f.share}%
                  </span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-border/60">
                  <div
                    className="h-1.5 rounded-full bg-[color:var(--gold)]"
                    style={{ width: `${Math.min(100, f.share)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground">No AI activity recorded in the last 30 days.</p>
        )}
      </Panel>

      <Panel title="Trend" plain="The last fourteen days of AI activity.">
        <div className="flex items-end gap-1">
          {data.trends.daily.map((d) => (
            <div key={d.date} className="flex-1" title={`${d.date}: ${d.requests} requests`}>
              <div
                className="rounded-t bg-[color:var(--gold)]/70"
                style={{ height: `${Math.max(2, (d.requests / maxReq) * 80)}px` }}
              />
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          {data.trends.growthPct === null
            ? "Not enough history yet to describe growth."
            : `Usage in the last 7 days is ${data.trends.growthPct >= 0 ? "up" : "down"} ${Math.abs(
                data.trends.growthPct,
              )}% versus the week before.`}
        </p>
      </Panel>

      <Panel title="Return on intelligence" plain="Not what AI cost — what members built with it.">
        <Stat label="Credits spent this month" value={data.roi.creditsSpentThisMonth.toLocaleString()} />
        <Stat label="Member revenue influenced" value={`$${data.roi.memberRevenueInfluenced.toLocaleString()}`} />
        <Stat label="Businesses started (30 days)" value={data.roi.businessesStarted} />
        <Stat label="Books published" value={data.roi.booksPublished} />
        <Stat label="Books in progress" value={data.roi.booksInProgress} />
        <Stat label="Products created (30 days)" value={data.roi.productsCreated} />
        <Stat label="Money Moves completed" value={data.roi.moneyMovesCompleted} />
        <Stat label="Member blueprints active" value={data.roi.blueprintsActive} />
      </Panel>

      <Panel title="What Frassy recommends" plain="Where the same result could cost less.">
        <ul className="space-y-1 text-xs text-muted-foreground">
          {data.suggestions.map((s) => (
            <li key={s}>• {s}</li>
          ))}
        </ul>
      </Panel>

      <Panel title="FRASS-0539 — AI Approval Rule" plain="What Frassy may do on her own, and what always waits for you.">
        <ul className="space-y-2 text-xs text-muted-foreground">
          {(["read", "write", "delete"] as const).map((k) => {
            const p = approvalPolicy(k);
            return (
              <li key={k}>
                <span className="font-semibold uppercase text-foreground">{k}</span> — {p.plain}
              </li>
            );
          })}
        </ul>
      </Panel>

      {/* FRASS-0556 — one Frassy, many brains. */}
      <Panel
        title="FRASS-0556 — AI Intelligence Router"
        plain="Members meet one Frassy. Behind her, each request goes to the cheapest brain that can do it well."
      >
        <ul className="mb-3 space-y-1 text-xs text-muted-foreground">
          {ROUTER_SUMMARY.map((line) => (
            <li key={line}>• {line}</li>
          ))}
        </ul>
        <ul className="space-y-2 text-xs">
          {(Object.keys(ROUTING_TABLE) as TaskKind[]).map((task) => {
            const r = ROUTING_TABLE[task];
            return (
              <li key={task} className="rounded-lg border border-border/60 p-3">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-semibold uppercase tracking-wide">{task}</span>
                  <span className="text-muted-foreground">
                    {r.chain.length ? r.chain.join(" → ") : "No AI · answered by Frass itself"}
                  </span>
                </div>
                <p className="mt-1 text-muted-foreground">{r.why}</p>
              </li>
            );
          })}
        </ul>
      </Panel>
    </div>
  );
}
