// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0498 — Opportunity Sequencing.
// One shared band of Now / Next / Later, rendered inside surfaces that already
// exist (The Daily and Money Moves). It creates no new Daily and no new task
// system — it only orders the opportunities Money Moves already produced.
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { Compass } from "lucide-react";
import { getLaunchState } from "@/lib/business/accelerator.functions";
import { getAffiliatePolicy } from "@/lib/affiliate.functions";
import { DEFAULT_POLICY } from "@/lib/affiliate-intelligence";
import { EMPTY_STATE, normalizeState } from "@/lib/business/accelerator";
import { EMPTY_PROGRAM, normalizeProgram } from "@/lib/business/launch-program";
import { EMPTY_MONEY, moneyPlan, normalizeMoney, starsOf } from "@/lib/business/money-moves";
import type { Opportunity } from "@/lib/business/money-moves";
import { loadProfile } from "@/lib/business/partner-profile";
import {
  BAND_META,
  DESTINATION_PLAIN_ENGLISH,
  FIXED_DESTINATION,
  morningQuestion,
  sequenceDay,
  type SequenceBand,
} from "@/lib/business/destination";

function Band({ band, items }: { band: SequenceBand; items: Opportunity[] }) {
  const meta = BAND_META[band];
  return (
    <div className="rounded-3xl border border-white/12 bg-white/[0.03] p-5">
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[color:var(--gold,#d4af37)]">
        {meta.label}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{meta.caption}</p>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">Nothing waiting here today.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {items.slice(0, 4).map((o) => (
            <li key={o.id} className="rounded-2xl bg-black/20 px-3 py-2 text-sm">
              <span className="font-medium">
                {o.streamEmoji} {o.title}
              </span>
              <span className="ml-2 text-xs text-muted-foreground">
                {starsOf(o.score)} · {o.minutes} min
              </span>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 text-xs text-muted-foreground">{meta.plain}</p>
    </div>
  );
}

export function OpportunitySequence({ className = "" }: { className?: string }) {
  const load = useServerFn(getLaunchState);
  const loadPolicy = useServerFn(getAffiliatePolicy);
  const [showDestination, setShowDestination] = useState(false);

  const row = useQuery({ queryKey: ["launch-state"], queryFn: () => load({}) });
  const policy = useQuery({ queryKey: ["affiliate-policy"], queryFn: () => loadPolicy() });

  const profile = useMemo(() => loadProfile(), []);

  const sequence = useMemo(() => {
    const raw = (row.data?.state ?? {}) as Record<string, unknown>;
    const launch = row.data ? normalizeState(raw) : EMPTY_STATE;
    const program = row.data ? normalizeProgram(raw['program']) : EMPTY_PROGRAM;
    const money = row.data ? normalizeMoney(raw['money']) : EMPTY_MONEY;
    const hours = profile.hoursPerDay || Number(row.data?.hours_per_day ?? 1) || 1;
    const plan = moneyPlan(program, launch, money, hours, policy.data ?? DEFAULT_POLICY);
    const all = [plan.highest, ...plan.rest].filter(Boolean) as Opportunity[];
    return sequenceDay(all, { hoursPerDay: hours, circumstance: profile.circumstance ?? null });
  }, [row.data, policy.data, profile]);

  const hours = profile.hoursPerDay || 1;

  return (
    <section className={`rounded-3xl border border-[color:var(--gold,#d4af37)]/30 bg-[color:var(--gold,#d4af37)]/[0.04] p-5 ${className}`}>
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[color:var(--gold,#d4af37)]">
        <Compass className="mr-1.5 inline h-3.5 w-3.5" /> Now · Next · Later
      </p>
      <p className="mt-2 text-sm">{morningQuestion(hours)}</p>
      <p className="mt-1 text-sm text-muted-foreground">{sequence.coach}</p>
      {sequence.circumstanceLine && (
        <p className="mt-2 text-xs text-muted-foreground">{sequence.circumstanceLine}</p>
      )}

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <Band band="now" items={sequence.now} />
        <Band band="next" items={sequence.next} />
        <Band band="later" items={sequence.later} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Link
          to="/money-moves"
          className="rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.2em] hover:bg-white/5"
        >
          Open Money Moves
        </Link>
        <button
          type="button"
          onClick={() => setShowDestination((s) => !s)}
          className="text-xs underline text-muted-foreground"
        >
          {showDestination ? "Hide where this is going" : "Where is this going?"}
        </button>
      </div>

      {showDestination && (
        <div className="mt-3 rounded-2xl bg-black/20 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            The destination never changes
          </p>
          <ul className="mt-2 space-y-1 text-sm">
            {FIXED_DESTINATION.map((d) => (
              <li key={d.label}>
                <span className="font-medium">{d.label}.</span>{" "}
                <span className="text-muted-foreground">{d.plain}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">{DESTINATION_PLAIN_ENGLISH}</p>
        </div>
      )}
    </section>
  );
}
