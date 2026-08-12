// Founder Daily Amendment — Partner Progress Center + Legacy Dashboard.
// Lives in the Founder's Daily only. Observation, never editing.

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listPartnerLaunchStates } from "@/lib/business/accelerator.functions";
import { todayISO } from "@/lib/business/launch-program";
import {
  attentionQueue,
  legacyMetrics,
  LEGACY_PROMISE,
  overviewOf,
  pulseFor,
  weeklyReport,
  type PartnerPulse,
} from "@/lib/founder/partner-pulse";

function usePulses() {
  const list = useServerFn(listPartnerLaunchStates);
  const q = useQuery({
    queryKey: ["partner-progress"],
    queryFn: () => list({}),
    staleTime: 120_000,
  });
  const today = todayISO();
  const pulses = useMemo<PartnerPulse[]>(
    () => (q.data ?? []).map((r) => pulseFor(r as never, today)),
    [q.data, today],
  );
  return { pulses, loading: q.isLoading };
}

const DOT: Record<string, string> = { green: "🟢", amber: "🟡", red: "🔴" };

export function PartnerProgressCenter({ onNavigate }: { onNavigate?: (href: string) => void }) {
  const { pulses, loading } = usePulses();
  const overview = overviewOf(pulses);
  const attention = attentionQueue(pulses);
  const weekly = weeklyReport(pulses);

  if (loading) return <p className="ws-meta">Reading partner progress…</p>;

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-white/12 bg-white/[0.03] p-5">
        <p className="font-display text-lg">
          {overview.total} Active Partner{overview.total === 1 ? "" : "s"}
        </p>
        <p className="mt-1 text-sm">
          🟢 {overview.green} progressing well · 🟡 {overview.amber} need encouragement · 🔴 {overview.red} require your attention
        </p>
        <p className="ws-meta mt-2">{overview.sentence}</p>
      </div>

      {pulses.map((p) => (
        <article key={p.userId} className="rounded-3xl border border-white/12 bg-white/[0.03] p-5">
          <header className="flex flex-wrap items-baseline justify-between gap-2">
            <h4 className="font-display text-base">{p.name}</h4>
            <span className="text-sm">
              {DOT[p.tone]} {p.toneLabel} · {p.readiness}% ready
            </span>
          </header>
          <p className="ws-meta mt-1">
            Day {p.day} of 30 · Focus: {p.focus}
          </p>
          <ul className="mt-3 space-y-1 text-sm">
            {p.today.map((t) => (
              <li key={t}>• {t}</li>
            ))}
            <li>🎯 Tomorrow: {p.tomorrow}</li>
          </ul>
        </article>
      ))}

      <div className="rounded-3xl border border-white/12 bg-white/[0.03] p-5">
        <h4 className="font-display text-sm uppercase tracking-[0.18em]">Founder attention queue</h4>
        {attention.length === 0 ? (
          <p className="ws-meta mt-2">Nothing needs you this morning. That is a good morning.</p>
        ) : (
          <ul className="mt-2 space-y-1 text-sm">
            {attention.map((a) => (
              <li key={a.id}>
                {a.icon} {a.text}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-3xl border border-white/12 bg-white/[0.03] p-5">
        <h4 className="font-display text-sm uppercase tracking-[0.18em]">
          Weekly founder report{weekly.ready ? " · today" : " · every Sunday"}
        </h4>
        <dl className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-sm">
          {weekly.lines.map((l) => (
            <div key={l.label}>
              <dt className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{l.label}</dt>
              <dd className="font-display text-xl">{l.value}</dd>
            </div>
          ))}
        </dl>
        <p className="ws-meta mt-3">{weekly.note}</p>
      </div>

      <button type="button" className="daily-link" onClick={() => onNavigate?.("/founder")}>
        Open Partner Progress in the Control Room →
      </button>
    </div>
  );
}

export function LegacyDashboard() {
  const { pulses } = usePulses();
  const metrics = legacyMetrics(pulses);
  return (
    <div>
      <p className="ws-meta">{LEGACY_PROMISE}</p>
      <div className="daily-grid mt-3">
        {metrics.map((m) => (
          <div key={m.id} className="daily-card">
            <span className="daily-emoji">{m.emoji}</span>
            <span className="font-display text-2xl">{m.value}</span>
            <span className="ws-meta">{m.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
