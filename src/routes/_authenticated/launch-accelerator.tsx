// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0459 — Frass Business Builder · Launch Accelerator
//
// One screen. No clutter. It answers a single question every morning:
// "What is the fastest, smartest way to move closer to sustainable income?"
// ─────────────────────────────────────────────────────────────────────────────

import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check, ChevronRight, Clock, GraduationCap, Target } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { getMyProfile } from "@/lib/profiles.functions";
import { getLaunchState, saveLaunchState } from "@/lib/business/accelerator.functions";
import {
  EMPTY_STATE,
  INCOME_TIMELINE,
  LAUNCH_BUSINESSES,
  MICRO_LESSONS,
  POTENTIAL_LABEL,
  adaptivePlan,
  allMoves,
  businessById,
  businessReadiness,
  celebrate,
  coachLine,
  estimatedLaunchDays,
  normalizeState,
  readiness,
  stageDone,
  stars,
  timelineReached,
  today,
  todaysLessons,
  todaysMoves,
  weeklyReview,
  type LaunchState,
  type ResolvedMove,
} from "@/lib/business/accelerator";

export const Route = createFileRoute("/_authenticated/launch-accelerator")({
  head: () => ({
    meta: [
      { title: "Launch Accelerator — Frass Business Builder" },
      {
        name: "description",
        content:
          "Your business coach inside Frass: today's money moves, launch readiness, just-in-time lessons and an income timeline — one meaningful step at a time.",
      },
      { property: "og:title", content: "Launch Accelerator — Frass Business Builder" },
      {
        property: "og:description",
        content: "Frassy plans the fastest, smartest route from idea to income — three major moves a day, never more.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: LaunchAcceleratorPage,
});

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 18) return "Good Afternoon";
  return "Good Evening";
}

function Bar({ pct, tone = "gold" }: { pct: number; tone?: "gold" | "green" }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
      <div
        className="h-full rounded-full transition-[width] duration-500"
        style={{
          width: `${Math.min(100, Math.max(0, pct))}%`,
          background: tone === "green" ? "rgb(74 222 128)" : "var(--gold, #d4af37)",
        }}
      />
    </div>
  );
}

function LaunchAcceleratorPage() {
  const load = useServerFn(getLaunchState);
  const save = useServerFn(saveLaunchState);
  const profileFn = useServerFn(getMyProfile);

  const profile = useQuery({ queryKey: ["my-profile"], queryFn: () => profileFn({}) });
  const row = useQuery({ queryKey: ["launch-state"], queryFn: () => load({}) });

  const [state, setState] = useState<LaunchState>(EMPTY_STATE);
  const [hours, setHours] = useState(2);
  const [goal, setGoal] = useState(0);
  const [mission, setMission] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const [openBusiness, setOpenBusiness] = useState<string | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (row.isSuccess && !hydrated) {
      const r = row.data;
      setState(normalizeState(r?.state));
      setHours(Number(r?.hours_per_day ?? 2));
      setGoal(Number(r?.income_goal ?? 0));
      setMission(r?.mission ?? "");
      setHydrated(true);
    }
  }, [row.isSuccess, row.data, hydrated]);

  const name = (profile.data?.display_name as string | undefined)?.split(" ")[0] || "Builder";

  const moves = useMemo(() => todaysMoves(state, hours), [state, hours]);
  const lessons = useMemo(() => todaysLessons(state, moves), [state, moves]);
  const pct = readiness(state);
  const days = estimatedLaunchDays(state, hours);
  const plan = adaptivePlan(state, moves);
  const review = useMemo(() => weeklyReview(state, hours), [state, hours]);
  const goalPct = goal > 0 ? Math.min(100, Math.round((state.earned / goal) * 100)) : 0;

  function persist(next: LaunchState, extra: Partial<{ hoursPerDay: number; incomeGoal: number; mission: string }> = {}) {
    setState(next);
    void save({ data: { state: next as unknown as Record<string, any>, ...extra } }).catch(() => {
      setNote("I couldn't save that just now — it's still on screen, try again in a moment.");
    });
  }

  function complete(mv: ResolvedMove) {
    const done = state.done.includes(mv.key)
      ? state.done.filter((k) => k !== mv.key)
      : [...state.done, mv.key];
    const activeDays = state.activeDays.includes(today()) ? state.activeDays : [...state.activeDays, today()];
    const next: LaunchState = { ...state, done, activeDays };
    persist(next);
    if (!state.done.includes(mv.key)) setNote(celebrate(name, mv, next));
  }

  function markLesson(id: string) {
    if (state.lessons.includes(id)) return;
    persist({ ...state, lessons: [...state.lessons, id] });
  }

  return (
    <SiteShell>
      <div className="mx-auto w-full max-w-5xl px-4 py-10 md:py-14">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Frass Business Builder · Launch Accelerator
        </p>
        <h1 className="mt-2 font-display text-3xl uppercase tracking-[0.06em] md:text-4xl">
          {greeting()}, {name}.
        </h1>

        {/* ── The one screen ─────────────────────────────────────────────── */}
        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/12 bg-white/[0.03] p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Today's available work time</p>
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
                className="w-20 rounded-xl border border-white/12 bg-black/30 px-3 py-1.5 text-lg outline-none focus:border-[color:var(--gold)]"
              />
              <span className="text-sm text-muted-foreground">hours</span>
            </div>
          </div>

          <div className="rounded-3xl border border-white/12 bg-white/[0.03] p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Current launch readiness</p>
            <p className="mt-2 font-display text-3xl">{pct}%</p>
            <div className="mt-2">
              <Bar pct={pct} />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Estimated launch: {days} days at this pace.</p>
          </div>

          <div className="rounded-3xl border border-white/12 bg-white/[0.03] p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Today's income goal</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-lg opacity-60">$</span>
              <input
                type="number"
                min={0}
                value={goal}
                onChange={(e) => {
                  const v = Number(e.target.value) || 0;
                  setGoal(v);
                  void save({ data: { incomeGoal: v } });
                }}
                className="w-24 rounded-xl border border-white/12 bg-black/30 px-3 py-1.5 text-lg outline-none focus:border-[color:var(--gold)]"
              />
              <span className="ml-auto text-sm text-muted-foreground">{goalPct}%</span>
            </div>
            <div className="mt-2">
              <Bar pct={goalPct} tone="green" />
            </div>
            <button
              type="button"
              onClick={() => {
                const v = window.prompt("How much have you earned so far?", String(state.earned));
                if (v === null) return;
                persist({ ...state, earned: Math.max(0, Number(v) || 0) });
              }}
              className="mt-3 text-xs underline text-muted-foreground hover:text-[color:var(--gold)]"
            >
              Earned so far: ${state.earned.toLocaleString()}
            </button>
          </div>
        </section>

        {/* Mission — the thing everything is measured against. */}
        <section className="mt-4 rounded-3xl border border-white/12 bg-white/[0.03] p-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <Target className="h-4 w-4" /> The mission
          </div>
          <textarea
            value={mission}
            onChange={(e) => setMission(e.target.value)}
            onBlur={() => void save({ data: { mission } })}
            rows={2}
            placeholder="Replace my employment income before I return to work."
            className="mt-2 w-full rounded-2xl border border-white/12 bg-black/30 p-3 text-sm outline-none placeholder:text-white/25 focus:border-[color:var(--gold)]"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Every move below is ranked against this. Nothing gets on the list unless it moves you toward it.
          </p>
        </section>

        {/* Current businesses */}
        <section className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {LAUNCH_BUSINESSES.filter((b) => state.businesses.includes(b.id)).map((b) => {
            const bp = businessReadiness(state, b.id);
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => setOpenBusiness(openBusiness === b.id ? null : b.id)}
                className="rounded-3xl border border-white/12 bg-white/[0.03] p-4 text-left transition hover:border-[color:var(--gold)]"
              >
                <p className="font-display text-sm uppercase tracking-[0.06em]">
                  {b.emoji} {b.label}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{b.mission}</p>
                <div className="mt-3">
                  <Bar pct={bp} />
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">{bp}% · tap to see the journey</p>
              </button>
            );
          })}
        </section>

        {/* Journey map for the opened business */}
        {openBusiness && (
          <section className="mt-4 rounded-3xl border border-white/12 bg-white/[0.03] p-5">
            <p className="font-display text-lg uppercase tracking-[0.06em]">
              {businessById(openBusiness)?.emoji} {businessById(openBusiness)?.label} — the journey
            </p>
            <ol className="mt-4 space-y-2">
              {businessById(openBusiness)?.stages.map((st, i) => {
                const done = stageDone(state, openBusiness, st.id);
                return (
                  <li key={st.id} className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] ${
                        done ? "bg-green-400/20 text-green-300" : "bg-white/10 text-white/60"
                      }`}
                    >
                      {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                    </span>
                    <div>
                      <p className={`text-sm ${done ? "text-green-300" : ""}`}>{st.label}</p>
                      <p className="text-xs text-muted-foreground">{st.milestone}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
            <p className="mt-4 text-xs text-muted-foreground">
              Frassy ticks these off for you as the work below gets done — you never have to maintain the map.
            </p>
          </section>
        )}

        {/* ── Today's money moves — and nothing else ──────────────────────── */}
        <section className="mt-8">
          <h2 className="font-display text-2xl uppercase tracking-[0.06em]">Today's Money Moves</h2>

          <div className="mt-3 rounded-3xl border border-[color:var(--gold)]/30 bg-[color:var(--gold)]/[0.06] p-5">
            <p className="text-sm">{coachLine(state, moves)}</p>
            {plan.tone !== "steady" && <p className="mt-2 text-sm text-muted-foreground">{plan.line}</p>}
          </div>

          {note && (
            <div className="mt-3 rounded-3xl border border-green-400/30 bg-green-400/[0.07] p-4 text-sm">
              {note}{" "}
              <button type="button" onClick={() => setNote(null)} className="ml-2 underline text-xs opacity-70">
                dismiss
              </button>
            </div>
          )}

          <ul className="mt-4 space-y-3">
            {moves.map((mv) => (
              <li
                key={mv.key}
                className="rounded-3xl border border-white/12 bg-white/[0.03] p-4 transition hover:border-white/25"
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    aria-label={`Mark "${mv.label}" complete`}
                    onClick={() => complete(mv)}
                    className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-white/25 hover:border-[color:var(--gold)]"
                  >
                    {mv.done && <Check className="h-3.5 w-3.5" />}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                        {mv.businessEmoji} {mv.businessLabel} · {mv.stageLabel}
                      </span>
                      {mv.major && (
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em]">
                          Major
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm font-medium">{mv.label}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{mv.why}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                      <span>🕒 {mv.minutes} min</span>
                      <span title={POTENTIAL_LABEL[mv.potential]}>
                        {stars(mv.potential)} {POTENTIAL_LABEL[mv.potential]}
                      </span>
                      {mv.lesson && MICRO_LESSONS[mv.lesson] && (
                        <span>
                          <GraduationCap className="mr-1 inline h-3.5 w-3.5" />
                          {MICRO_LESSONS[mv.lesson]!.label}
                        </span>
                      )}
                      {mv.href && (
                        <Link to={mv.href} className="underline hover:text-[color:var(--gold)]">
                          Open the tool <ChevronRight className="inline h-3 w-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
            {!moves.length && (
              <li className="rounded-3xl border border-white/12 bg-white/[0.03] p-6 text-sm text-muted-foreground">
                Nothing left on today's plan. That's the whole point — stop here.
              </li>
            )}
          </ul>

          <p className="mt-3 text-xs text-muted-foreground">
            Never more than 3 major and 5 minor moves in a day. Everything else waits — finishing builds confidence,
            overload destroys it.
          </p>
        </section>

        {/* Just-in-time learning */}
        {lessons.length > 0 && (
          <section className="mt-8 rounded-3xl border border-white/12 bg-white/[0.03] p-5">
            <h2 className="font-display text-lg uppercase tracking-[0.06em]">You'll need this today</h2>
            <ul className="mt-3 space-y-2">
              {lessons.map((l) => (
                <li key={l.id} className="flex items-start justify-between gap-3 rounded-2xl bg-black/20 p-3">
                  <div>
                    <p className="text-sm">
                      {l.label} · {l.minutes} min
                    </p>
                    <p className="text-xs text-muted-foreground">{l.plain}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => markLesson(l.id)}
                    className="shrink-0 rounded-full border border-white/20 px-3 py-1 text-xs hover:border-[color:var(--gold)]"
                  >
                    Got it
                  </button>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">
              No courses. Learning only ever appears the moment the work needs it.
            </p>
          </section>
        )}

        {/* Income timeline */}
        <section className="mt-8">
          <h2 className="font-display text-2xl uppercase tracking-[0.06em]">Income timeline</h2>
          <ol className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {INCOME_TIMELINE.map((t) => {
              const hit = timelineReached(state, t);
              return (
                <li
                  key={t.id}
                  className={`rounded-2xl border p-3 text-sm ${
                    hit ? "border-green-400/40 bg-green-400/[0.08] text-green-200" : "border-white/12 bg-white/[0.03]"
                  }`}
                >
                  {hit ? "✅" : "○"} {t.label}
                </li>
              );
            })}
          </ol>
        </section>

        {/* Weekly review */}
        <section className="mt-8 rounded-3xl border border-white/12 bg-white/[0.03] p-5">
          <button
            type="button"
            onClick={() => setShowReview((v) => !v)}
            className="font-display text-lg uppercase tracking-[0.06em]"
          >
            Weekly review {showReview ? "▾" : "▸"}
          </button>
          {showReview && (
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Stat label="Days worked" value={`${review.daysWorked}`} />
              <Stat label="Moves completed" value={`${review.movesCompleted}`} />
              <Stat label="Major milestones" value={`${review.majorCompleted}`} />
              <Stat label="Time invested" value={`${Math.round(review.minutesWorked / 60)} h`} />
              <Stat label="Money earned" value={`$${review.earned.toLocaleString()}`} />
              <Stat label="Launch readiness" value={`${review.readinessPct}%`} />
              <p className="sm:col-span-3 text-sm text-muted-foreground">{review.nextWeek}</p>
            </div>
          )}
        </section>

        <p className="mt-8 text-xs text-muted-foreground">
          Part of the Business Builder — <Link to="/business-builder" className="underline">set up a new business</Link>{" "}
          · <Link to="/room" className="underline">My Workspace</Link> ·{" "}
          <Link to="/vault" className="underline">Vault</Link>
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          What this means in plain English: this page is your coach, not your filing cabinet. It already knows what
          matters most today, so you never have to decide where to start.
        </p>
      </div>
    </SiteShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-black/20 p-3">
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-xl">{value}</p>
    </div>
  );
}

/** kept for future filtering of business selection */
export const __allMoves = allMoves;
