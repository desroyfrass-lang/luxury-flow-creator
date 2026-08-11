// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0460 — First 30 Days · The Frass Partner Launch Program
// One roadmap. One highest-value action a day. Real momentum, honestly measured.
// ─────────────────────────────────────────────────────────────────────────────

import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Check, Clock, Sparkles } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { LaunchModeBanner } from "@/components/launch-mode-banner";
import { getMyProfile } from "@/lib/profiles.functions";
import { getLaunchState, saveLaunchState } from "@/lib/business/accelerator.functions";
import { EMPTY_STATE, normalizeState, type LaunchState } from "@/lib/business/accelerator";
import {
  EMPTY_PROGRAM,
  FOUNDATION_TASKS,
  PROGRAM_DAYS,
  PROGRAM_WEEKS,
  completionMessage,
  currentWeek,
  dailyFocus,
  foundationComplete,
  foundationPct,
  freshMilestones,
  launchMomentum,
  normalizeProgram,
  programComplete,
  programDay,
  programReview,
  reachedMilestones,
  reflectionForToday,
  todayISO,
  type ProgramState,
} from "@/lib/business/launch-program";

export const Route = createFileRoute("/_authenticated/first-30-days")({
  head: () => ({
    meta: [
      { title: "First 30 Days — Frass Partner Launch Program" },
      {
        name: "description",
        content:
          "A guided 30-day launch: foundation, publishing, monetizing and scaling — one highest-value action a day, with the reasoning behind it.",
      },
      { property: "og:title", content: "First 30 Days — Frass Partner Launch Program" },
      {
        property: "og:description",
        content: "From ideas to income in thirty days, one meaningful step at a time.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: First30DaysPage,
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

function First30DaysPage() {
  const profileFn = useServerFn(getMyProfile);
  const load = useServerFn(getLaunchState);
  const save = useServerFn(saveLaunchState);

  const profile = useQuery({ queryKey: ["my-profile"], queryFn: () => profileFn({}) });
  const row = useQuery({ queryKey: ["launch-state"], queryFn: () => load({}) });

  const [launch, setLaunch] = useState<LaunchState>(EMPTY_STATE);
  const [program, setProgram] = useState<ProgramState>(EMPTY_PROGRAM);
  const [hours, setHours] = useState(2);
  const [hydrated, setHydrated] = useState(false);
  const [answer, setAnswer] = useState("");
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    if (!row.isSuccess || hydrated) return;
    const raw = (row.data?.state ?? {}) as Record<string, unknown>;
    const p = normalizeProgram(raw['program']);
    setLaunch(normalizeState(raw));
    setProgram(p.startedOn ? p : { ...p, startedOn: todayISO() });
    setHours(Number(row.data?.hours_per_day ?? 2));
    setHydrated(true);
  }, [row.isSuccess, row.data, hydrated]);

  const name = (profile.data?.display_name as string | undefined)?.split(" ")[0] || "Builder";

  function persist(nextProgram: ProgramState, nextLaunch: LaunchState = launch) {
    setProgram(nextProgram);
    setLaunch(nextLaunch);
    void save({
      data: { state: { ...nextLaunch, program: nextProgram } as unknown as Record<string, any> },
    }).catch(() => setNote("I couldn't save that just now — it's still on screen, try again in a moment."));
  }

  const day = programDay(program);
  const week = currentWeek(program);
  const momentum = useMemo(() => launchMomentum(program, launch), [program, launch]);
  const focus = useMemo(() => dailyFocus(program, launch, hours), [program, launch, hours]);
  const review = useMemo(() => programReview(program, launch, hours), [program, launch, hours]);
  const reached = useMemo(() => reachedMilestones(program, launch), [program, launch]);
  const fresh = useMemo(() => freshMilestones(program, launch), [program, launch]);
  const question = reflectionForToday(program);
  const done = programComplete(program);

  function acknowledgeMilestones() {
    if (!fresh.length) return;
    const milestones = { ...program.milestones };
    for (const m of fresh) milestones[m.id] = todayISO();
    persist({ ...program, milestones });
  }

  function toggleFoundation(id: string) {
    const foundation = program.foundation.includes(id)
      ? program.foundation.filter((x) => x !== id)
      : [...program.foundation, id];
    persist({ ...program, foundation });
  }

  function submitReflection() {
    if (!question || !answer.trim()) return;
    persist({
      ...program,
      lastAskedOn: todayISO(),
      reflections: [...program.reflections, { date: todayISO(), question, answer: answer.trim().slice(0, 1200) }],
    });
    setAnswer("");
    setNote("Thank you — the Founder reads these. That's how the program gets better for the next partner.");
  }

  return (
    <SiteShell>
      <div className="mx-auto max-w-5xl px-4 pt-6">
        <LaunchModeBanner />
      </div>
      <div className="mx-auto w-full max-w-5xl px-4 py-10 md:py-14">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Frass Partner Launch Program</p>
        <h1 className="mt-2 font-display text-3xl uppercase tracking-[0.06em] md:text-4xl">First 30 Days</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Day {Math.min(day, PROGRAM_DAYS)} of {PROGRAM_DAYS} · {week.label} — {week.objective}. {week.focus}
        </p>

        {note && (
          <p className="mt-4 rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3 text-sm">{note}</p>
        )}

        {/* Completion */}
        {done && (
          <section className="mt-6 rounded-3xl border border-[color:var(--gold,#d4af37)]/40 bg-[color:var(--gold,#d4af37)]/[0.06] p-6">
            {completionMessage(name).map((line, i) => (
              <p key={line} className={i === 0 ? "font-display text-2xl uppercase tracking-[0.06em]" : "mt-2 text-sm"}>
                {line}
              </p>
            ))}
          </section>
        )}

        {/* Momentum meter */}
        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/12 bg-white/[0.03] p-5 md:col-span-2">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Launch momentum</p>
            <p className="mt-2 font-display text-4xl">{momentum}%</p>
            <div className="mt-3">
              <Bar pct={momentum} />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Setup, real progress, consistency and income — measured honestly. Nothing here is decorative.
            </p>
          </div>
          <div className="rounded-3xl border border-white/12 bg-white/[0.03] p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Daily work time</p>
            <div className="mt-2 flex items-center gap-3">
              <Clock className="h-5 w-5 opacity-60" />
              <input
                type="number"
                min={0.5}
                max={12}
                step={0.5}
                value={hours}
                onChange={(e) => {
                  const v = Number(e.target.value) || 1;
                  setHours(v);
                  void save({ data: { hoursPerDay: v } });
                }}
                className="w-20 rounded-xl border border-white/12 bg-black/30 px-3 py-1.5 text-lg outline-none focus:border-[color:var(--gold,#d4af37)]"
              />
              <span className="text-sm text-muted-foreground">hours</span>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Estimated launch: {review.launchDays} days at this pace.
            </p>
          </div>
        </section>

        {/* Today's highest-value action */}
        <section className="mt-6 rounded-3xl border border-white/12 bg-white/[0.03] p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Today</p>
          <h2 className="mt-2 font-display text-2xl">{focus.headline}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{focus.reason}</p>
          {focus.task && (
            <Link
              to={focus.task.href}
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm hover:bg-white/10"
            >
              Open {focus.task.label} <ArrowRight className="h-4 w-4" />
            </Link>
          )}
          {focus.move && (
            <Link
              to="/launch-accelerator"
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm hover:bg-white/10"
            >
              Work on it in the Accelerator <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </section>

        {/* Day One — Foundation */}
        <section className="mt-6 rounded-3xl border border-white/12 bg-white/[0.03] p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-display text-xl uppercase tracking-[0.06em]">Foundation Day</h2>
            <span className="text-xs text-muted-foreground">
              {program.foundation.length}/{FOUNDATION_TASKS.length} complete
            </span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            No income tasks here on purpose. Today prepares everything your success will need — after this, every move
            we make is meant to earn.
          </p>
          <div className="mt-3">
            <Bar pct={foundationPct(program)} />
          </div>

          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {FOUNDATION_TASKS.map((t) => {
              const isDone = program.foundation.includes(t.id);
              return (
                <li
                  key={t.id}
                  className={`rounded-2xl border p-3 ${isDone ? "border-emerald-400/30 bg-emerald-400/[0.06]" : "border-white/10 bg-black/20"}`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => toggleFoundation(t.id)}
                      aria-label={isDone ? `Mark ${t.label} not done` : `Mark ${t.label} done`}
                      className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border ${isDone ? "border-emerald-400 bg-emerald-400/20" : "border-white/25"}`}
                    >
                      {isDone && <Check className="h-3.5 w-3.5" />}
                    </button>
                    <div>
                      <p className="text-sm font-medium">{t.label}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{t.why}</p>
                      <Link to={t.href} className="mt-2 inline-block text-xs underline opacity-80 hover:opacity-100">
                        Open · {t.minutes} min
                      </Link>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {foundationComplete(program) && (
            <p className="mt-4 rounded-2xl bg-emerald-400/[0.08] px-4 py-3 text-sm text-emerald-200">
              {name}, every system you'll need is set up. From here, everything we do is meant to earn.
            </p>
          )}
        </section>

        {/* The roadmap */}
        <section className="mt-6 rounded-3xl border border-white/12 bg-white/[0.03] p-6">
          <h2 className="font-display text-xl uppercase tracking-[0.06em]">The 30-day roadmap</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            One roadmap, not thirty pages. Frassy reorganises it every week around what actually happened.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {PROGRAM_WEEKS.map((w) => {
              const active = w.index === week.index;
              const past = w.index < week.index;
              return (
                <article
                  key={w.index}
                  className={`rounded-2xl border p-4 ${active ? "border-[color:var(--gold,#d4af37)]/50 bg-[color:var(--gold,#d4af37)]/[0.07]" : past ? "border-white/10 bg-black/30 opacity-70" : "border-white/10 bg-black/20"}`}
                >
                  <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{w.label}</p>
                  <p className="mt-1 font-display text-lg">{w.objective}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{w.focus}</p>
                </article>
              );
            })}
          </div>
        </section>

        {/* Milestones */}
        <section className="mt-6 rounded-3xl border border-white/12 bg-white/[0.03] p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-display text-xl uppercase tracking-[0.06em]">Milestones</h2>
            {fresh.length > 0 && (
              <button
                type="button"
                onClick={acknowledgeMilestones}
                className="rounded-full border border-white/20 px-3 py-1 text-xs hover:bg-white/10"
              >
                Mark as seen
              </button>
            )}
          </div>
          {fresh.length > 0 && (
            <ul className="mt-3 space-y-2">
              {fresh.map((m) => (
                <li key={m.id} className="rounded-2xl bg-[color:var(--gold,#d4af37)]/[0.08] px-4 py-3 text-sm">
                  <Sparkles className="mr-2 inline h-4 w-4" />
                  {m.line(name)}
                </li>
              ))}
            </ul>
          )}
          <ul className="mt-3 flex flex-wrap gap-2 text-xs">
            {reached.map((m) => (
              <li key={m.id} className="rounded-full bg-emerald-400/[0.1] px-3 py-1 text-emerald-200">
                {m.label}
              </li>
            ))}
            {reached.length === 0 && (
              <li className="text-muted-foreground">Nothing yet — the first one is Foundation complete.</li>
            )}
          </ul>
        </section>

        {/* Weekly review */}
        <section className="mt-6 rounded-3xl border border-white/12 bg-white/[0.03] p-6">
          <h2 className="font-display text-xl uppercase tracking-[0.06em]">This week</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <Cell label="Hours invested" value={`${review.hoursInvested}`} />
            <Cell label="Tasks completed" value={`${review.tasksCompleted}`} />
            <Cell label="Businesses moved" value={`${review.businessesProgressed}`} />
            <Cell label="Published" value={`${review.contentPublished}`} />
            <Cell label="Earned" value={`$${review.earned.toLocaleString()}`} />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">{review.nextWeek}</p>
        </section>

        {/* Founder feedback — one thoughtful question */}
        {question && !done && (
          <section className="mt-6 rounded-3xl border border-white/12 bg-white/[0.03] p-6">
            <h2 className="font-display text-xl uppercase tracking-[0.06em]">One question</h2>
            <p className="mt-2 text-sm">{question}</p>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={3}
              placeholder="Say it plainly — this goes to the Founder, not a form."
              className="mt-3 w-full rounded-2xl border border-white/12 bg-black/30 px-4 py-3 text-sm outline-none focus:border-[color:var(--gold,#d4af37)]"
            />
            <button
              type="button"
              onClick={submitReflection}
              disabled={!answer.trim()}
              className="mt-3 rounded-full border border-white/20 px-4 py-2 text-sm hover:bg-white/10 disabled:opacity-40"
            >
              Send to the Founder
            </button>
          </section>
        )}

        <p className="mt-8 text-xs text-muted-foreground">
          <Link to="/launch-accelerator" className="underline">
            Launch Accelerator
          </Link>{" "}
          ·{" "}
          <Link to="/room" className="underline">
            My Workspace
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
