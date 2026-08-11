// FRASS-0463 — The Launch Dashboard.
// One card that answers three questions at a glance: how long until launch,
// how ready you are, and what today's promise is.

import { Link } from "@tanstack/react-router";
import { useLaunchMode } from "@/components/launch-mode-banner";
import { daysUntilLaunch } from "@/lib/launch-mode";
import { promiseForDay, weekPromiseKept } from "@/lib/partner-journal";

function Meter({ label, pct }: { label: string; pct: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span>{Math.round(pct)}%</span>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-[color:var(--gold,#d4af37)] transition-[width] duration-500"
          style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
        />
      </div>
    </div>
  );
}

export function LaunchDashboard({
  partnerReady,
  foundationPct,
  programDay,
  keptPromiseDays = [],
  todayMission,
  className = "",
}: {
  /** Overall business readiness — 0-100, built from real progress. */
  partnerReady: number;
  foundationPct: number;
  programDay: number;
  keptPromiseDays?: number[];
  todayMission?: string | null;
  className?: string;
}) {
  const mode = useLaunchMode();
  const days = daysUntilLaunch(mode);
  const promise = promiseForDay(programDay);
  const kept = weekPromiseKept(programDay, keptPromiseDays);

  return (
    <section
      className={`rounded-3xl border border-white/12 bg-white/[0.04] p-6 ${className}`}
      aria-label="Launch dashboard"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Launch Dashboard</p>
          <h2 className="mt-1 font-display text-2xl uppercase tracking-[0.05em]">
            {mode.paymentsLive
              ? "We're live"
              : days === null
                ? "Pre-Launch"
                : days === 0
                  ? "Launch day"
                  : `${days} day${days === 1 ? "" : "s"} to launch`}
          </h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Day {Math.min(Math.max(programDay, 1), 30)} of your first 30 days
        </p>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <Meter label="You're ready" pct={partnerReady} />
        <Meter label="Foundation set up" pct={foundationPct} />
        <Meter label="First Week Promise kept" pct={kept} />
      </div>

      {promise && (
        <div className="mt-5 rounded-2xl border border-[color:var(--gold,#d4af37)]/30 bg-[color:var(--gold,#d4af37)]/[0.06] px-5 py-4">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[color:var(--gold,#d4af37)]">
            The First Week Promise · Day {promise.day}
          </p>
          <p className="mt-1 text-sm">{promise.promise}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            What this means in plain English: {promise.plain}
          </p>
        </div>
      )}

      {todayMission && (
        <p className="mt-4 text-sm">
          <span className="text-muted-foreground">Today: </span>
          {todayMission}
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-3 text-sm">
        <Link to="/money-moves" className="rounded-full border border-white/15 px-4 py-2 hover:bg-white/[0.06]">
          Today's money moves
        </Link>
        <Link to="/first-30-days" className="rounded-full border border-white/15 px-4 py-2 hover:bg-white/[0.06]">
          First 30 Days
        </Link>
        <Link to="/journal" className="rounded-full border border-white/15 px-4 py-2 hover:bg-white/[0.06]">
          Partner Journal
        </Link>
      </div>
    </section>
  );
}
