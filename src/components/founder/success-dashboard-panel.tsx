// FRASS-0547 — Founder Success Dashboard. Measure progress. Protect privacy.
// FRASS-0548 — Founder Visibility: this panel is Founder-only, never public.
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { founderSuccessOverview } from "@/lib/founder/success.functions";
import {
  FOUNDER_CONFIDENTIAL_BANNER,
  FOUNDER_MAY_VIEW,
  FOUNDER_VISIBILITY_PRINCIPLE,
  JOURNEY_STAGES,
  NEVER_VISIBLE_TO_FOUNDER,
  TONE_META,
  journeyFill,
  revenueBandLabel,
  type MemberProgress,
} from "@/lib/founder/success-dashboard";

function Journey({ progress }: { progress: number }) {
  return (
    <div className="mt-3 grid gap-1.5">
      {JOURNEY_STAGES.map((s) => (
        <div key={s.id} className="flex items-center gap-2">
          <span className="w-32 shrink-0 text-[11px] text-muted-foreground">
            {s.glyph} {s.label}
          </span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-[color:var(--gold)]"
              style={{ width: `${journeyFill(progress, s.at)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function MemberRow({ m }: { m: MemberProgress }) {
  const [open, setOpen] = useState(false);
  const tone = TONE_META[m.tone];
  return (
    <li className="rounded-xl border border-border/70 p-3">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-start justify-between gap-3 text-left">
        <span>
          <span className="text-sm font-semibold">
            {tone.glyph} {m.name}
          </span>
          <span className="mt-0.5 block text-xs text-muted-foreground">{m.insight}</span>
        </span>
        <span className="shrink-0 text-[11px] text-muted-foreground">{m.progress}%</span>
      </button>

      {open ? (
        <div className="mt-3 space-y-3">
          <Journey progress={m.progress} />
          <dl className="grid gap-x-4 gap-y-1 text-xs sm:grid-cols-2">
            <Line label="Momentum" value={tone.label} />
            <Line label="Achievement style" value={m.achievementStyle ?? "Not chosen yet"} />
            <Line label="Blueprint progress" value={`${m.blueprintProgress}%`} />
            <Line label="Daily streak" value={`${m.dailyStreak} day(s)`} />
            <Line
              label="Money Moves"
              value={`${m.moneyMovesCompleted} completed · ${m.moneyMovesActive} in progress`}
            />
            <Line label="Projects completed" value={String(m.projectsCompleted)} />
            <Line
              label="Digital legacy"
              value={`${m.booksPublished} published · ${m.booksInProgress} in progress`}
            />
            <Line label="Last active" value={m.daysQuiet >= 99 ? "Unknown" : `${m.daysQuiet} day(s) ago`} />
            <Line label="Revenue range" value={revenueBandLabel(m.revenue)} />
          </dl>
          <p className="text-[11px] text-muted-foreground">
            {m.coachingOptIn
              ? "This member opted into Founder Coaching — they invited your support."
              : "Range only. Exact earnings, balances and accounts belong to this member alone."}
          </p>
        </div>
      ) : null}
    </li>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}

export function FounderSuccessPanel() {
  const load = useServerFn(founderSuccessOverview);
  const { data, isLoading, error } = useQuery({
    queryKey: ["founder-success-overview"],
    queryFn: () => load(),
  });
  const [showAll, setShowAll] = useState(false);

  return (
    <section className="space-y-5">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--gold)]">
          FRASS-0547 · FRASS-0548
        </p>
        <h2 className="mt-2 text-2xl font-black uppercase tracking-tight">Founder Success Dashboard</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Measure progress. Protect privacy. You see how members are doing — never their bank
          accounts.
        </p>
      </header>

      <div className="rounded-2xl border border-[color:var(--gold)]/50 bg-[color:var(--gold)]/5 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-[color:var(--gold)]">
          Founder Confidential
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{FOUNDER_CONFIDENTIAL_BANNER}</p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Reading how everyone is progressing…</p>
      ) : error || !data ? (
        <p className="text-sm text-muted-foreground">The success overview is unavailable.</p>
      ) : (
        <>
          <div className="rounded-2xl border border-border/70 p-5">
            <h3 className="text-sm font-bold uppercase tracking-wide">Founder Radar</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Today's attention list — where your time has the biggest impact.
            </p>
            <p className="mt-3 text-sm">{data.sentence}</p>
            <ul className="mt-3 space-y-1 text-sm">
              {data.radar.length ? (
                data.radar.map((b) => (
                  <li key={b.id} className="text-muted-foreground">
                    {b.glyph} <span className="font-semibold text-foreground">{b.count}</span>{" "}
                    {b.label}
                  </li>
                ))
              ) : (
                <li className="text-muted-foreground">
                  Nothing needs your attention this morning. That is a good morning.
                </li>
              )}
            </ul>
          </div>

          <div className="grid gap-3 sm:grid-cols-4">
            {(["thriving", "growing", "encouragement", "support"] as const).map((t) => (
              <div key={t} className="rounded-xl border border-border/70 p-3">
                <p className="text-lg font-black">{data.totals[t]}</p>
                <p className="text-[11px] text-muted-foreground">
                  {TONE_META[t].glyph} {TONE_META[t].label}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-border/70 p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-bold uppercase tracking-wide">
                Members ({data.totals.members})
              </h3>
              {data.members.length > 8 ? (
                <button
                  onClick={() => setShowAll((s) => !s)}
                  className="rounded-full border border-border px-3 py-1 text-[11px] hover:border-[color:var(--gold)]"
                >
                  {showAll ? "Show fewer" : "Show all"}
                </button>
              ) : null}
            </div>
            <ul className="mt-3 space-y-2">
              {(showAll ? data.members : data.members.slice(0, 8)).map((m) => (
                <MemberRow key={m.userId} m={m} />
              ))}
              {!data.members.length ? (
                <li className="text-xs text-muted-foreground">No members are recorded yet.</li>
              ) : null}
            </ul>
          </div>
        </>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-border/70 p-4">
          <p className="text-xs font-bold uppercase tracking-wide">What you may see</p>
          <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
            {FOUNDER_MAY_VIEW.map((v) => (
              <li key={v}>• {v}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-border/70 p-4">
          <p className="text-xs font-bold uppercase tracking-wide">What is never visible to you</p>
          <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
            {NEVER_VISIBLE_TO_FOUNDER.map((v) => (
              <li key={v}>• {v}</li>
            ))}
          </ul>
        </div>
      </div>

      <p className="text-xs italic text-muted-foreground">{FOUNDER_VISIBILITY_PRINCIPLE}</p>
    </section>
  );
}
