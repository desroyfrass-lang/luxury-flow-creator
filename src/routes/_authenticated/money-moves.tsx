// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0461 — Money Moves · Personalized Income Operating System
// Not a task list. Frassy's daily income strategy, with the reasoning shown.
// ─────────────────────────────────────────────────────────────────────────────

import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Check, Clock, SkipForward, Sparkles } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { getMyProfile } from "@/lib/profiles.functions";
import { getLaunchState, saveLaunchState } from "@/lib/business/accelerator.functions";
import { EMPTY_STATE, normalizeState, type LaunchState } from "@/lib/business/accelerator";
import { EMPTY_PROGRAM, normalizeProgram, todayISO, type ProgramState } from "@/lib/business/launch-program";
import { LaunchModeBanner, useLaunchMode } from "@/components/launch-mode-banner";
import {
  LAUNCH_PREP,
  allStreamReadiness,
  launchGreeting,
  launchPrepPct,
  normalizeCoaching,
  overallReadiness,
  type CoachingNote,
} from "@/lib/launch-mode";
import {
  EMPTY_MONEY,
  INCOME_STREAMS,
  activeStreams,
  crossBenefit,
  forecast,
  moneyPlan,
  normalizeMoney,
  objectiveLabel,
  starsOf,
  streamById,
  type MoneyState,
  type Opportunity,
} from "@/lib/business/money-moves";

export const Route = createFileRoute("/_authenticated/money-moves")({
  head: () => ({
    meta: [
      { title: "Money Moves — Your Personal Income Operating System" },
      {
        name: "description",
        content:
          "Frassy reviews every business you run and tells you the one action most likely to increase your income today — and exactly why.",
      },
      { property: "og:title", content: "Money Moves — Frass Income Operating System" },
      {
        property: "og:description",
        content: "Highest value first. Real revenue, honest forecast, no busywork.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: MoneyMovesPage,
});

function Bar({ pct }: { pct: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
      <div
        className="h-full rounded-full bg-[color:var(--gold,#d4af37)] transition-[width] duration-500"
        style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
      />
    </div>
  );
}

function MoneyMovesPage() {
  const profileFn = useServerFn(getMyProfile);
  const load = useServerFn(getLaunchState);
  const save = useServerFn(saveLaunchState);

  const profile = useQuery({ queryKey: ["my-profile"], queryFn: () => profileFn({}) });
  const row = useQuery({ queryKey: ["launch-state"], queryFn: () => load({}) });

  const [launch, setLaunch] = useState<LaunchState>(EMPTY_STATE);
  const [program, setProgram] = useState<ProgramState>(EMPTY_PROGRAM);
  const [money, setMoney] = useState<MoneyState>(EMPTY_MONEY);
  const [hours, setHours] = useState(2);
  const [goalInput, setGoalInput] = useState("");
  const [logAmount, setLogAmount] = useState("");
  const [logStream, setLogStream] = useState("affiliate");
  const [logNote, setLogNote] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [coaching, setCoaching] = useState<CoachingNote[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    if (!row.isSuccess || hydrated) return;
    const raw = (row.data?.state ?? {}) as Record<string, unknown>;
    setLaunch(normalizeState(raw));
    setProgram(normalizeProgram(raw['program']));
    const m = normalizeMoney(raw['money']);
    setMoney(m);
    setGoalInput(String(m.monthlyGoal || row.data?.income_goal || ""));
    setCoaching(normalizeCoaching(raw['coaching']));
    setHours(Number(row.data?.hours_per_day ?? 2));
    setHydrated(true);
  }, [row.isSuccess, row.data, hydrated]);

  const name = (profile.data?.display_name as string | undefined)?.split(" ")[0] || "Builder";

  function persist(nextMoney: MoneyState, nextLaunch: LaunchState = launch) {
    setMoney(nextMoney);
    setLaunch(nextLaunch);
    void save({
      data: { state: { ...nextLaunch, program, money: nextMoney, coaching } as unknown as Record<string, any> },
    }).catch(() => setNote("I couldn't save that just now — it's still on screen, try again in a moment."));
  }

  const plan = useMemo(() => moneyPlan(program, launch, money, hours), [program, launch, money, hours]);
  const fc = useMemo(
    () => forecast(money, Number(row.data?.income_goal ?? 0)),
    [money, row.data?.income_goal],
  );
  const streams = useMemo(() => activeStreams(launch), [launch]);
  const mode = useLaunchMode();
  const readiness = useMemo(() => allStreamReadiness(launch, program, money), [launch, program, money]);
  const overall = overallReadiness(readiness);
  const prepPct = launchPrepPct(money);

  function togglePrep(id: string) {
    const list = money.launchPrep.includes(id)
      ? money.launchPrep.filter((x) => x !== id)
      : [...money.launchPrep, id];
    persist({ ...money, launchPrep: list });
  }

  function completeMove(o: Opportunity) {
    const d = todayISO();
    const done = launch.done.includes(o.id) ? launch.done : [...launch.done, o.id];
    const activeDays = launch.activeDays.includes(d) ? launch.activeDays : [...launch.activeDays, d];
    const assigned = { ...money.assigned, [d]: [...new Set([...(money.assigned[d] ?? []), o.id])] };
    persist({ ...money, assigned }, { ...launch, done, activeDays });
    setNote(`Done. ${o.streamEmoji} ${o.streamLabel} just moved forward — that's real progress, not activity.`);
  }

  function skipMove(o: Opportunity) {
    const d = todayISO();
    const skipped = { ...money.skipped, [d]: [...new Set([...(money.skipped[d] ?? []), o.id])] };
    persist({ ...money, skipped });
    setNote("Skipped for today. I'll bring it back when it makes sense — no guilt attached.");
  }

  function saveGoal() {
    const v = Math.max(0, Number(goalInput) || 0);
    persist({ ...money, monthlyGoal: v });
    void save({ data: { incomeGoal: v } }).catch(() => {});
    setNote(v > 0 ? `Goal set at $${v.toLocaleString()} a month. Every move now gets measured against it.` : null);
  }

  function logIncome() {
    const amount = Math.max(0, Number(logAmount) || 0);
    if (!amount) return;
    persist({
      ...money,
      log: [
        ...money.log,
        { date: todayISO(), amount, streamId: logStream, note: logNote.trim().slice(0, 200) },
      ],
    });
    setLogAmount("");
    setLogNote("");
    setNote(`$${amount.toLocaleString()} recorded. This is real money, so it now shapes tomorrow's plan.`);
  }

  return (
    <SiteShell>
      <div className="mx-auto w-full max-w-5xl px-4 py-10 md:py-14">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Frass Income Operating System</p>
        <h1 className="mt-2 font-display text-3xl uppercase tracking-[0.06em] md:text-4xl">Money Moves</h1>
        <p className="mt-2 max-w-2xl text-sm">{launchGreeting(name, mode)}</p>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          If you only have {hours} hour{hours === 1 ? "" : "s"} today, this is the work most likely to
          increase your income. Highest value first — and I always tell you why.
        </p>

        <LaunchModeBanner className="mt-5" />

        {coaching.length > 0 && (
          <section className="mt-5 space-y-2">
            {[...coaching].reverse().slice(0, 3).map((c) => (
              <article key={c.id} className="rounded-3xl border border-white/12 bg-white/[0.04] px-5 py-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  A note from the Founder · {c.about}
                </p>
                <p className="mt-1 text-sm">{c.text}</p>
              </article>
            ))}
          </section>
        )}

        {note && <p className="mt-4 rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3 text-sm">{note}</p>}

        {plan.blocked && (
          <p className="mt-6 rounded-3xl border border-amber-400/30 bg-amber-400/[0.07] px-5 py-4 text-sm text-amber-100">
            {plan.blocked}{" "}
            <Link to="/first-30-days" className="underline">
              Open your Foundation Day
            </Link>
          </p>
        )}

        {/* Today's highest value move */}
        <section className="mt-6 rounded-3xl border border-[color:var(--gold,#d4af37)]/40 bg-[color:var(--gold,#d4af37)]/[0.06] p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--gold,#d4af37)]">
            <Sparkles className="mr-1 inline h-3.5 w-3.5" /> Today's highest value move
          </p>
          {plan.highest ? (
            <>
              <h2 className="mt-2 font-display text-2xl uppercase tracking-[0.05em]">
                {plan.highest.streamEmoji} {plan.highest.title}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {plan.highest.streamLabel} · {plan.highest.minutes} min · {starsOf(plan.highest.score)} opportunity
                score
              </p>
              <p className="mt-3 text-sm">{plan.highest.strategy}</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {plan.highest.objectives.map((o) => (
                  <li key={o} className="rounded-full bg-black/25 px-3 py-1 text-[11px] text-muted-foreground">
                    {objectiveLabel(o)}
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => completeMove(plan.highest!)}
                  className="rounded-full bg-[color:var(--gold,#d4af37)] px-5 py-2 text-sm font-semibold text-black"
                >
                  <Check className="mr-1 inline h-4 w-4" /> I did this
                </button>
                {plan.highest.href && (
                  <Link
                    to={plan.highest.href}
                    className="rounded-full border border-white/20 px-5 py-2 text-sm hover:bg-white/5"
                  >
                    Open the tool <ArrowRight className="ml-1 inline h-4 w-4" />
                  </Link>
                )}
                <button
                  onClick={() => skipMove(plan.highest!)}
                  className="rounded-full border border-white/12 px-4 py-2 text-sm text-muted-foreground hover:bg-white/5"
                >
                  <SkipForward className="mr-1 inline h-4 w-4" /> Not today
                </button>
              </div>
            </>
          ) : (
            <p className="mt-2 text-sm">{plan.coach}</p>
          )}
        </section>

        {/* Coaching line */}
        <p className="mt-4 rounded-3xl border border-white/12 bg-white/[0.03] px-5 py-4 text-sm text-muted-foreground">
          {plan.momentum.line}
        </p>

        {/* Rest of the plan */}
        {plan.rest.length > 0 && (
          <section className="mt-6">
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-lg uppercase tracking-[0.06em]">Then, if time allows</h2>
              <p className="text-xs text-muted-foreground">
                <Clock className="mr-1 inline h-3.5 w-3.5" />
                {plan.totalMinutes} min planned today
              </p>
            </div>
            <div className="mt-3 space-y-3">
              {plan.rest.map((o) => (
                <article key={o.id} className="rounded-3xl border border-white/12 bg-white/[0.03] p-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-display text-base uppercase tracking-[0.05em]">
                      {o.streamEmoji} {o.title}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {starsOf(o.score)} · {o.minutes} min
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{o.strategy}</p>
                  <button
                    onClick={() => setOpen(open === o.id ? null : o.id)}
                    className="mt-2 text-xs underline text-muted-foreground"
                  >
                    {open === o.id ? "Hide the score" : "Why this score?"}
                  </button>
                  {open === o.id && (
                    <ul className="mt-2 grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
                      {o.scoreParts.map((p) => (
                        <li key={p.label} className="rounded-2xl bg-black/20 px-3 py-2">
                          {p.label}: {starsOf(p.value)}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => completeMove(o)}
                      className="rounded-full border border-white/20 px-4 py-2 text-sm hover:bg-white/5"
                    >
                      <Check className="mr-1 inline h-4 w-4" /> I did this
                    </button>
                    <button
                      onClick={() => skipMove(o)}
                      className="rounded-full border border-white/12 px-4 py-2 text-sm text-muted-foreground hover:bg-white/5"
                    >
                      Not today
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Revenue forecast */}
        <section className="mt-8 rounded-3xl border border-white/12 bg-white/[0.03] p-6">
          <h2 className="font-display text-lg uppercase tracking-[0.06em]">Revenue forecast</h2>
          <p className="mt-1 text-xs text-muted-foreground">{fc.note}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            <Cell label="This month" value={`$${fc.currentMonth.toLocaleString()}`} />
            <Cell label="Last month" value={`$${fc.lastMonth.toLocaleString()}`} />
            <Cell label="Monthly goal" value={fc.goal ? `$${fc.goal.toLocaleString()}` : "Not set"} />
            <Cell
              label="On this pace"
              value={fc.expectedMonth === null ? "—" : `$${fc.expectedMonth.toLocaleString()}`}
            />
          </div>
          {fc.goal > 0 && (
            <div className="mt-4">
              <Bar pct={fc.progressPct} />
              <p className="mt-2 text-xs text-muted-foreground">
                {fc.progressPct}% of your monthly goal, based only on income you logged.
              </p>
            </div>
          )}
          {fc.perStream.length > 0 && (
            <ul className="mt-4 space-y-2 text-sm">
              {fc.perStream.map((r) => (
                <li key={r.stream.id} className="flex justify-between rounded-2xl bg-black/20 px-3 py-2">
                  <span>
                    {r.stream.emoji} {r.stream.label}
                  </span>
                  <span className="text-muted-foreground">
                    ${r.amount.toLocaleString()} · {r.sharePct}%
                  </span>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
            <label className="text-sm">
              <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Monthly income goal</span>
              <input
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                inputMode="numeric"
                placeholder="4000"
                className="mt-1 w-full rounded-2xl border border-white/15 bg-black/30 px-4 py-2"
              />
            </label>
            <button onClick={saveGoal} className="self-end rounded-full border border-white/20 px-5 py-2 text-sm">
              Save goal
            </button>
          </div>
        </section>

        {/* Log real income */}
        <section className="mt-6 rounded-3xl border border-white/12 bg-white/[0.03] p-6">
          <h2 className="font-display text-lg uppercase tracking-[0.06em]">Log real income</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            I never invent numbers. When money actually lands, record it here and the plan gets smarter.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-[120px_1fr_1fr_auto]">
            <input
              value={logAmount}
              onChange={(e) => setLogAmount(e.target.value)}
              inputMode="decimal"
              placeholder="$ amount"
              className="rounded-2xl border border-white/15 bg-black/30 px-4 py-2 text-sm"
            />
            <select
              value={logStream}
              onChange={(e) => setLogStream(e.target.value)}
              className="rounded-2xl border border-white/15 bg-black/30 px-4 py-2 text-sm"
            >
              {INCOME_STREAMS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.emoji} {s.label}
                </option>
              ))}
            </select>
            <input
              value={logNote}
              onChange={(e) => setLogNote(e.target.value)}
              placeholder="What was it? (optional)"
              className="rounded-2xl border border-white/15 bg-black/30 px-4 py-2 text-sm"
            />
            <button onClick={logIncome} className="rounded-full bg-white/10 px-5 py-2 text-sm hover:bg-white/15">
              Record
            </button>
          </div>
          {money.log.length > 0 && (
            <ul className="mt-4 space-y-2 text-sm">
              {[...money.log]
                .slice(-5)
                .reverse()
                .map((e, i) => (
                  <li key={`${e.date}-${i}`} className="flex justify-between rounded-2xl bg-black/20 px-3 py-2">
                    <span>
                      {streamById(e.streamId)?.emoji} {e.note || streamById(e.streamId)?.label}
                    </span>
                    <span className="text-muted-foreground">
                      ${e.amount.toLocaleString()} · {e.date}
                    </span>
                  </li>
                ))}
            </ul>
          )}
        </section>

        {/* Launch readiness */}
        <section className="mt-8 rounded-3xl border border-white/12 bg-white/[0.03] p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-display text-lg uppercase tracking-[0.06em]">Launch readiness</h2>
            <span className="font-display text-2xl">{overall}% ready</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {mode.paymentsLive
              ? "Payments are live. Readiness now tracks how well each business is set up to keep selling."
              : "The goal is 100% before launch day. Every move you make now moves one of these bars."}
          </p>
          <div className="mt-4 space-y-3">
            {readiness.map((r) => (
              <div key={r.stream.id}>
                <div className="flex justify-between text-sm">
                  <span>
                    {r.stream.emoji} {r.stream.label}
                  </span>
                  <span className="text-muted-foreground">{r.pct}% Ready</span>
                </div>
                <div className="mt-1">
                  <Bar pct={r.pct} />
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {r.parts.map((p) => `${p.label} ${p.pct}%`).join(" · ")}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Launch preparation */}
        <section className="mt-6 rounded-3xl border border-white/12 bg-white/[0.03] p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-display text-lg uppercase tracking-[0.06em]">Ready for day one</h2>
            <span className="text-sm text-muted-foreground">{prepPct}% prepared</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            On launch day you shouldn't begin building — you should begin earning. Tick these off before then.
          </p>
          <ul className="mt-4 grid gap-2 md:grid-cols-2">
            {LAUNCH_PREP.map((t) => {
              const done = money.launchPrep.includes(t.id);
              return (
                <li key={t.id} className="rounded-2xl bg-black/20 p-3">
                  <button
                    type="button"
                    onClick={() => togglePrep(t.id)}
                    className="flex w-full items-start gap-3 text-left"
                  >
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${done ? "border-[color:var(--gold,#d4af37)] bg-[color:var(--gold,#d4af37)] text-black" : "border-white/25"}`}
                    >
                      {done && <Check className="h-3 w-3" />}
                    </span>
                    <span>
                      <span className="text-sm">{t.label}</span>
                      <span className="mt-0.5 block text-[11px] text-muted-foreground">{t.why}</span>
                    </span>
                  </button>
                  {t.href && (
                    <Link to={t.href} className="mt-2 inline-block text-[11px] underline text-muted-foreground">
                      Open it
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        {/* The ecosystem */}
        <section className="mt-8">
          <h2 className="font-display text-lg uppercase tracking-[0.06em]">Your income ecosystem</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            These aren't five separate jobs. Each one strengthens the others — that's why one hour can pay twice.
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {streams.map((s) => (
              <article key={s.id} className="rounded-3xl border border-white/12 bg-white/[0.03] p-5">
                <h3 className="font-display text-base uppercase tracking-[0.05em]">
                  {s.emoji} {s.label}
                </h3>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {s.objectives.map((o) => (
                    <li key={o} className="rounded-full bg-black/25 px-3 py-1 text-[11px] text-muted-foreground">
                      {o}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-muted-foreground">{crossBenefit(s.id)}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {s.surfaces.map((sf) => (
                    <Link
                      key={sf.href}
                      to={sf.href}
                      className="rounded-full border border-white/15 px-3 py-1 text-xs hover:bg-white/5"
                    >
                      {sf.label}
                    </Link>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <p className="mt-8 text-xs text-muted-foreground">
          <Link to="/first-30-days" className="underline">
            First 30 Days
          </Link>{" "}
          ·{" "}
          <Link to="/launch-accelerator" className="underline">
            Launch Accelerator
          </Link>{" "}
          ·{" "}
          <Link to="/financial-center" className="underline">
            Financial Center
          </Link>
        </p>
      </div>
    </SiteShell>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-black/20 p-3">
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-xl">{value}</p>
    </div>
  );
}
