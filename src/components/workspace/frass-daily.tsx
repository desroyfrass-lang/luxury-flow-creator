// ─────────────────────────────────────────────────────────────────────────────
// The Frass Daily — the universal daily command center.
// One Daily across the whole ecosystem. Opens once per calendar day, adapts to
// the Builder's role, then collapses into the workspace so the day can begin.
//
// The Daily is a navigation hub, not a static report:
//   • Every number opens the records behind it.
//   • Every number carries a data-status badge.
//   • Every business metric can be explained by Frassy.
//   • Today's answers are remembered when you reopen it later in the day.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { X, Check, Sparkles, ArrowRight, HelpCircle, Coins, ListTree, Film, Focus, Sunrise, Moon } from "lucide-react";
import { FrassyComposer } from "@/components/workspace/frassy-composer";
import { FrassLinkWidget } from "@/components/link/frass-link-widget";
import { FrassCardWidget } from "@/components/card/frass-card-widget";
import { getWallet } from "@/lib/studio.functions";
import { usdFor } from "@/lib/studio/credits";
import frassyAvatar from "@/assets/frassy-gold.png.asset.json";
import sceneCoast from "@/assets/daily-scene-coast.jpg";
import sceneWaterfall from "@/assets/daily-scene-waterfall.jpg";
import sceneMountain from "@/assets/daily-scene-mountain.jpg";
import sceneVilla from "@/assets/daily-scene-villa.jpg";
import {
  BRIEFING_ORDER,
  closeDay,
  closingReport,
  consistency,
  DAILY_PHILOSOPHY,
  dailyProgress,
  dailySteps,
  healthFor,
  isDayClosed,
  LANE,
  LANE_ORDER,
  loadHistory,
  morningBriefing,
  nextLine,
  nextStep,
  recordToday,
  reopenDay,
  sceneIndexFor,
  sectionStatuses,
  type Lane,
  type SectionStatus,
} from "@/lib/workspace/daily-os";


const SCENES = [sceneCoast, sceneWaterfall, sceneMountain, sceneVilla];




import {
  dailyFor,
  DATA_STATUS,
  formatWorkload,
  greetingFor,
  isReflectionHour,
  loadDailyState,
  saveDailyState,
  PRIORITY_LABEL,
  type DailyAudience,
  type DailyMetric,
  type DailyPriority,
  type DailyTarget,
  type DataStatus,
} from "@/lib/workspace/daily";
import {
  demoDataEnabled,
  honestDaily,
  HONEST_NOTE,
  myDay,
  resolveDailyCommand,
  ritualEnabled,
  ritualForToday,
  setDemoData,
  setRitualEnabled,
} from "@/lib/workspace/daily-intel";
import { Amount } from "@/components/finance/amount";
import { VoiceFeedbackButton } from "@/components/feedback/voice-feedback";
import { dailySnapshot, viewerFrom } from "@/lib/finance/financial-center";
import { FounderOsPanel, FounderTabRail } from "@/components/workspace/founder-os-panel";
import type { FounderTabId } from "@/lib/workspace/founder-os";


const ORDER: DailyPriority[] = ["critical", "important", "optional", "completed"];



export function FrassDaily({
  audience,
  name,
  onDismiss,
  onOpenProject,
  onNavigate,
}: {
  audience: DailyAudience;
  name?: string;
  onDismiss: () => void;
  onOpenProject?: (projectId: string) => void;
  onNavigate?: (href: string) => void;
}) {
  const [demo, setDemo] = useState(() => demoDataEnabled());
  const base = useMemo(() => dailyFor(audience), [audience]);
  const model = useMemo(() => honestDaily(base, demo), [base, demo]);
  const initial = useMemo(() => loadDailyState(), []);
  const [delegated, setDelegated] = useState<string[]>(initial.delegated);
  const [done, setDone] = useState<string[]>(initial.done);
  const [explaining, setExplaining] = useState<string | null>(null);
  const [entered, setEntered] = useState(false);
  const [shrunk, setShrunk] = useState(false);
  const [ritualOn, setRitualOn] = useState(() => ritualEnabled());
  const [command, setCommand] = useState("");
  const [commandNote, setCommandNote] = useState<string | null>(null);
  const reflecting = isReflectionHour();
  const ritual = useMemo(() => ritualForToday(), []);

  useEffect(() => {
    const a = window.setTimeout(() => setEntered(true), 40);
    const b = window.setTimeout(() => setShrunk(true), 1900);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, []);

  // The Daily is resumable — reopening it restores exactly how you left it.
  useEffect(() => {
    saveDailyState({ done, delegated });
  }, [done, delegated]);

  const remaining = model.tasks
    .filter((t) => t.priority !== "completed")
    .filter((t) => !delegated.includes(t.id) && !done.includes(t.id))
    .reduce((n, t) => n + t.minutes, 0);

  const savedByFrassy = model.tasks
    .filter((t) => delegated.includes(t.id))
    .reduce((n, t) => n + t.minutes, 0);

  const day = useMemo(() => myDay(model, done, delegated), [model, done, delegated]);

  /** FRASS-0425 — the numbered workday, the progress metre, the section statuses. */
  const steps = useMemo(() => dailySteps(model, done, delegated), [model, done, delegated]);
  const progress = useMemo(() => dailyProgress(steps), [steps]);
  const statuses = useMemo(() => sectionStatuses(model, steps), [model, steps]);
  const scene = SCENES[sceneIndexFor()];
  const [briefingStep, setBriefingStep] = useState(0);

  // FRASS-0425 Amendment — morning briefing, consistency record, focus mode, closing.
  const [history, setHistory] = useState(() => loadHistory());
  const brief = useMemo(() => morningBriefing(model, steps, name, history), [model, steps, name, history]);
  const [briefOpen, setBriefOpen] = useState(true);
  const record = useMemo(() => consistency(history, progress.pct), [history, progress.pct]);
  const [focus, setFocus] = useState(false);
  const [closed, setClosed] = useState(() => isDayClosed());
  const report = useMemo(() => closingReport(model, steps), [model, steps]);
  const current = nextStep(steps);

  // Today's completion is written to the consistency record as it changes.
  useEffect(() => {
    setHistory(recordToday(progress.pct));
  }, [progress.pct]);




  /** FRASS-0402 — the AI credit balance travels with the Builder, not with a role. */
  const fetchWallet = useServerFn(getWallet);
  const wallet = useQuery({ queryKey: ["studio-wallet"], queryFn: () => fetchWallet(), staleTime: 60_000 });


  /** No dead information — every item resolves to the records behind it. */
  const go = (target: DailyTarget) => {
    if (target.href) onNavigate?.(target.href);
    else if (target.projectId) onOpenProject?.(target.projectId);
    onDismiss();
  };

  /** The Daily is navigable by conversation, not clicks alone. */
  const runIntent = (said: string) => {
    if (!said) return;
    // "Frassy, what's next?" — always answer with the highest-priority open step.
    if (/what'?s?\s+next|next\s+(thing|task|step)/i.test(said)) {
      setCommand("");
      setCommandNote(nextLine(steps));
      return;
    }
    const result = resolveDailyCommand(said, model);
    setCommand("");

    if (!result) {
      setCommandNote("I didn't catch a destination in that. Try “show me the orders”, “continue yesterday's work”, or “open Marketplace”.");
      return;
    }
    if ("explainMetric" in result) {
      const key = [...model.briefing, ...model.performance, ...model.executive].find(
        (m) => m.label === result.explainMetric,
      );
      if (key) {
        const id = model.briefing.includes(key) ? `b-${key.label}` : model.performance.includes(key) ? `p-${key.label}` : `e-${key.label}`;
        setExplaining(id);
        setCommandNote(`Opening the breakdown for ${key.label}.`);
        window.setTimeout(() => document.getElementById(`metric-${key.label}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 60);
      }
      return;
    }
    setCommandNote(`Taking you to ${result.label}.`);
    go(result.target);
  };

  // ── 4 · Focus Mode — current task, Frassy, progress, composer. Nothing else.
  if (focus) {
    return (
      <div data-blueprint="daily-focus" className="frass-workspace daily-overlay is-in daily-focus" role="dialog" aria-label="Focus Mode">
        <div className="daily-scene" aria-hidden="true">
          <img src={scene} alt="" />
        </div>
        <div className="daily-focus-inner">
          <div className="daily-focus-top">
            <img className="daily-focus-frassy" src={frassyAvatar.url} alt="" />
            <button type="button" className="ws-chip" onClick={() => setFocus(false)}>
              Leave Focus Mode
            </button>
          </div>

          <div className="daily-bar daily-progress-bar">
            <span className={progress.pct >= 100 ? "is-done" : ""} style={{ width: `${progress.pct}%` }} />
          </div>
          <p className="ws-meta">
            {progress.complete} of {progress.total} complete · {progress.pct}%
          </p>

          {current ? (
            <div className={`daily-focus-task lane-${current.lane}`}>
              <span className="ws-meta">
                Step {current.n} · {LANE[current.lane].dot} {LANE[current.lane].label} · {current.minutes} min
              </span>
              <h2 className="daily-focus-label">{current.label}</h2>
              {current.detail && <p className="ws-meta">{current.detail}</p>}
              <div className="daily-focus-actions">
                {current.taskId && (
                  <button type="button" className="daily-enter" onClick={() => setDone((d) => [...d, current.taskId!])}>
                    <Check className="mr-1.5 inline h-4 w-4" /> Finished — next task
                  </button>
                )}
                <button type="button" className="ws-chip" onClick={() => go(current)}>
                  Open it <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="daily-focus-task lane-green">
              <h2 className="daily-focus-label">Everything is finished.</h2>
              <p className="ws-meta">Leave Focus Mode and close your day.</p>
            </div>
          )}
        </div>

        <div className="daily-dock">
          <FrassyComposer
            value={command}
            onChange={setCommand}
            onSend={(text) => runIntent(text.trim())}
            voice
            placeholder="Talk to Frassy while you work…"
            tools={["files", "images", "documents", "camera", "clipboard"]}
          />
        </div>
      </div>
    );
  }

  return (
    <div data-blueprint="daily" className={`frass-workspace daily-overlay ${entered ? "is-in" : ""}`} role="dialog" aria-label="The Frass Daily">

      {/* Cinematic scenery — quiet Jamaican landscape, rotating by the day */}
      <div className="daily-scene" aria-hidden="true">
        <img src={scene} alt="" />
      </div>

      {/* Frassy greets large, then shrinks into her assistant position */}
      <div className={`daily-frassy ${shrunk ? "is-small" : ""}`}>
        <img src={frassyAvatar.url} alt="" />
      </div>


      <div className={`daily-scroll ${isFounder ? "is-founder-os" : ""}`}>
        <header className="daily-head">
          <div>
            <div className="ws-meta">The Frass Daily</div>
            <h1 className="daily-title">
              {greetingFor()}
              {name ? `, ${name}` : ""}. {model.greeting}.
            </h1>
            <p className="daily-sub">{reflecting ? "Evening. Want to reflect before we close the day?" : model.subline}</p>
          </div>
          <button type="button" className="ws-icon" onClick={onDismiss} aria-label="Enter my workspace">
            <X className="h-4 w-4" />
          </button>
        </header>

        {isFounder && <FounderTabRail tab={tab} onSelect={setTab} showAudit />}

        {tab !== "today" && <FounderOsPanel tab={tab} onNavigate={onNavigate} />}

        {tab === "today" && (
        <>


        {/* Daily welcome ritual — one short moment, on or off by choice */}
        {ritualOn && (
          <div className="daily-ritual">
            <span className="ws-meta">{ritual.kind}</span>
            <p className="daily-ritual-text">{ritual.text}</p>
            <button
              type="button"
              className="ws-chip"
              onClick={() => {
                setRitualEnabled(false);
                setRitualOn(false);
              }}
            >
              Turn the daily ritual off
            </button>
          </div>
        )}
        {!ritualOn && (
          <button
            type="button"
            className="ws-chip daily-ritual-off"
            onClick={() => {
              setRitualEnabled(true);
              setRitualOn(true);
            }}
          >
            Turn the daily ritual back on
          </button>
        )}

        {/* FRASS-0429 — the Frass Card stays deliberately small in The Daily */}
        <FrassCardWidget variant="daily" />

        {/* FRASS-0428 — the permanent Frass Link, always one tap away */}
        <FrassLinkWidget context="The Daily" />

        {/* 1 · Morning Briefing — context before work, the way an assistant would give it */}
        {briefOpen && (
          <section className="daily-brief-card" data-blueprint="daily-morning">
            <div className="daily-brief-card-head">
              <span className="ws-meta">
                <Sunrise className="mr-1.5 inline h-3.5 w-3.5" /> Morning Briefing
              </span>
              <span className="daily-progress-pct">{formatWorkload(brief.minutes)}</span>
            </div>
            <h2 className="daily-brief-greet">{brief.greeting}</h2>
            <ul className="daily-brief-lines">
              {brief.lines.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
            <div className="daily-brief-card-actions">
              <button type="button" className="daily-enter" onClick={() => setBriefOpen(false)}>
                Ready to begin
              </button>
              <button type="button" className="ws-chip" onClick={() => setFocus(true)}>
                <Focus className="h-3.5 w-3.5" /> Focus Mode
              </button>
            </div>
          </section>
        )}

        {/* 5 · Consistency — operational, not gamified */}
        <section className="daily-consistency">
          {[
            { k: "Today's Completion", v: record.today },
            { k: "This Week", v: record.week },
            { k: "This Month", v: record.month },
          ].map((r) => (
            <div key={r.k} className="daily-consistency-cell">
              <span className="ws-meta">{r.k}</span>
              <span className="daily-consistency-pct">{r.v}%</span>
            </div>
          ))}
        </section>

        {/* Today's Progress — one quiet metre of momentum, at the very top */}

        <section className="daily-progress" data-blueprint="daily-myday">
          <div className="daily-progress-head">
            <h2 className="daily-h2">Today's Progress</h2>
            <span className="daily-progress-pct">{progress.pct}% Complete</span>
          </div>
          <div className="daily-bar daily-progress-bar">
            <span className={progress.pct >= 100 ? "is-done" : ""} style={{ width: `${progress.pct}%` }} />
          </div>
          <p className="ws-meta">
            {progress.complete} of {progress.total} steps completed · {formatWorkload(day.remainingMinutes)} of work left
          </p>
          <p className="daily-next">{nextLine(steps)}</p>
        </section>


        {/* Navigate by conversation — handled by the docked Frassy Composer below */}

        {commandNote && <p className="ws-meta daily-command-note">{commandNote}</p>}

        <div className="daily-legend">
          {(Object.keys(DATA_STATUS) as DataStatus[]).map((s) => (
            <span key={s} className="daily-badge">
              {DATA_STATUS[s].dot} {DATA_STATUS[s].label}
            </span>
          ))}
          <button
            type="button"
            className={`ws-chip ${demo ? "daily-chip-on" : ""}`}
            onClick={() => {
              setDemoData(!demo);
              setDemo(!demo);
            }}
          >
            {demo ? "Showing demonstration data" : "Showing real data only"}
          </button>
        </div>

        {!demo && <p className="ws-meta daily-note">{HONEST_NOTE}</p>}

        {model.alerts.length > 0 && (
          <div className="daily-alert">
            {model.alerts.map((a) => (
              <p key={a}>⚠ {a}</p>
            ))}
          </div>
        )}



        {/* 1 — Celebrate first */}
        <Section title="Celebrate first" note="Progress before problems.">
          <div className="daily-grid">
            {model.wins.map((w) => (
              <div key={w.id} className="daily-card daily-win">
                <span className="daily-emoji">{w.icon}</span>
                <span>{w.label}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* 2 — Daily briefing */}
        <Section title="Since you were last here" note="Everything that moved while you were away. Click any number to see what it is.">
          <div className="daily-grid">
            {model.briefing.map((m) => (
              <MetricCard
                key={m.label}
                metric={m}
                open={explaining === `b-${m.label}`}
                onToggleExplain={() => setExplaining((v) => (v === `b-${m.label}` ? null : `b-${m.label}`))}
                onOpen={() => go(m)}
                onRecord={go}
              />
            ))}
          </div>
        </Section>

        {/* 2b — Financial snapshot (FRASS-0302). Every figure is clickable. */}
        <Section
          title="Financial snapshot"
          note="Your Frass Financial Center, one click away. Available money is withdrawable now — settlement timing only applies to pending."
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {dailySnapshot(viewerFrom(audience === "founder" ? ["admin"] : [])).map((a) => (
              <Amount key={a.id} item={a} compact />
            ))}
          </div>
          <button
            type="button"
            className="daily-link mt-3"
            onClick={() => onNavigate?.("/financial-center")}
          >
            Open the Financial Center <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </Section>



        {/* 3 — The numbered workday (FRASS-0425) */}
        <Section
          blueprintId="daily-priorities"
          title="Today's Priorities"
          status={statuses.priorities}
          note={`Work through them in order. Estimated work today: ${formatWorkload(remaining)}${
            savedByFrassy ? ` · Frassy is carrying ${formatWorkload(savedByFrassy)}` : ""
          }`}
        >
          <ol className="daily-steps">
            {steps.map((s) => {
              const isDone = s.lane === "green";
              const isDelegated = !!s.taskId && delegated.includes(s.taskId);
              return (
                <li key={s.id} className={`daily-step lane-${s.lane}`}>
                  <span className="daily-step-n" aria-hidden="true">
                    {s.n}
                  </span>
                  <span className={`daily-step-dot lane-dot-${s.lane}`} title={LANE[s.lane].meaning} />
                  <button type="button" className="daily-step-main" onClick={() => go(s)}>
                    <span className="daily-step-label">{s.label}</span>
                    {s.detail && <span className="ws-meta">{s.detail}</span>}
                  </button>
                  <div className="daily-step-actions">
                    <span className={`daily-step-est lane-pill-${s.lane}`}>
                      {LANE[s.lane].dot} {s.minutes} min
                    </span>
                    <span className="ws-meta daily-step-lane">{LANE[s.lane].label}</span>
                    {!isDone && s.taskId && (
                      <>
                        <button
                          type="button"
                          className="ws-chip"
                          onClick={() => setDone((d) => [...d, s.taskId!])}
                        >
                          <Check className="h-3.5 w-3.5" /> Done
                        </button>
                        {s.delegable && (
                          <button
                            type="button"
                            className={`ws-chip ${isDelegated ? "daily-chip-on" : ""}`}
                            onClick={() =>
                              setDelegated((d) =>
                                d.includes(s.taskId!) ? d.filter((x) => x !== s.taskId) : [...d, s.taskId!],
                              )
                            }
                          >
                            <Sparkles className="h-3.5 w-3.5" />
                            {isDelegated ? "Frassy has it" : "Frassy handles it"}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
          <div className="daily-lane-key">
            {LANE_ORDER.map((l) => (
              <span key={l} className="ws-meta">
                {LANE[l].dot} {LANE[l].label} — {LANE[l].meaning}
              </span>
            ))}
          </div>
        </Section>


        {/* 6 — Pending approvals */}
        {model.approvals.length > 0 && (
          <Section title="Pending Approvals" status={statuses.approvals} note="Everything waiting on you, in one place.">
            <div className="daily-grid">
              {model.approvals.map((a) => (
                <button key={a.id} type="button" className="daily-card daily-clickable" onClick={() => go(a)}>
                  <span className="ws-meta">{a.kind}</span>
                  <span>{a.label}</span>
                  <span className="daily-go">
                    Open <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </button>
              ))}
            </div>
          </Section>
        )}

        {/* 7 — Opportunities */}
        <Section title="Opportunities" status={statuses.opportunities} note="Things I don't want you to miss.">
          <div className="daily-grid">
            {model.opportunities.map((o) => (
              <button key={o.id} type="button" className="daily-card daily-clickable" onClick={() => go(o)}>
                <span className="daily-badge">{DATA_STATUS.ai.dot} {DATA_STATUS.ai.label}</span>
                <span className="daily-task-label">
                  {o.icon} {o.label}
                </span>
                <span className="ws-meta">{o.why}</span>
              </button>
            ))}
          </div>
        </Section>

        {/* 8 — Goals & Vision Maps */}
        <Section title="Goals & Vision Map" status={statuses.goals} note="How close you are.">
          <div className="daily-lines">
            {model.goals.map((g) => (
              <button key={g.id} type="button" className="daily-goal daily-clickable-row" onClick={() => go(g)}>
                <div className="daily-line">
                  <span>{g.label}</span>
                  <span className="daily-badge">{DATA_STATUS[g.status].dot} {DATA_STATUS[g.status].label}</span>
                  <span className="ws-meta">{g.note}</span>
                </div>
                <div className="daily-bar">
                  <span style={{ width: `${g.pct}%` }} />
                </div>
              </button>
            ))}
          </div>
        </Section>

        {/* 9 — Daily performance */}
        <Section title="Daily Performance" status={statuses["daily-performance"]} note="One glance tells you how things are going.">
          <div className="daily-grid">
            {model.performance.map((m) => (
              <MetricCard
                key={m.label}
                metric={m}
                open={explaining === `p-${m.label}`}
                onToggleExplain={() => setExplaining((v) => (v === `p-${m.label}` ? null : `p-${m.label}`))}
                onOpen={() => go(m)}
                onRecord={go}
              />
            ))}
          </div>
        </Section>

        {/* Founder-only executive panels */}
        {model.executive.length > 0 && (
          <Section title="Founder Command Center" status={statuses["founder-command"]} note="The executive view. Everything here opens the Founder Dashboard or the records behind it.">
            <div className="daily-grid">
              {model.executive.map((m) => (
                <MetricCard
                  key={m.label}
                  metric={m}
                  open={explaining === `e-${m.label}`}
                  onToggleExplain={() => setExplaining((v) => (v === `e-${m.label}` ? null : `e-${m.label}`))}
                  onOpen={() => go(m)}
                  onRecord={go}
                />
              ))}
            </div>
          </Section>
        )}

        {/* 10 — Recent activity */}
        <Section title="Recent activity" note="Since your last session.">
          <div className="daily-lines">
            {model.activity.map((a) => (
              <button key={a.id} type="button" className="daily-line daily-clickable-row" onClick={() => go(a)}>
                <span className="daily-emoji">{a.icon}</span>
                <span className="flex-1 text-left">{a.label}</span>
                <span className="ws-meta">{a.when}</span>
              </button>
            ))}
          </div>
        </Section>

        {/* Evening reflection — never mandatory */}
        {reflecting && (
          <Section title="Evening reflection" note="Optional. Only if you want it.">
            <div className="daily-grid">
              {["What you accomplished", "Goals completed", "Progress made", "Tomorrow's priorities", "Notes for tomorrow"].map(
                (r) => (
                  <div key={r} className="daily-card">
                    <span>{r}</span>
                  </div>
                ),
              )}
            </div>
          </Section>
        )}

        {/* FRASS-0412 — temporary launch feedback program */}
        <Section
          title="🎤 Launch Feedback"
          note="Talk to us. Record a voice note about anything — an idea, a bug, or something that felt confusing. Frassy writes it up for the Founder."
        >
          <div className="daily-grid">
            <div className="daily-card">
              <span className="daily-task-label">Your voice shapes Frass</span>
              <span className="ws-meta">
                Voluntary, private, and temporary — nothing is published without your permission.
              </span>
              <div className="mt-3">
                <VoiceFeedbackButton source="daily" />
              </div>
            </div>
          </div>
        </Section>

        {/* FRASS-0401/0402/0407 — Frass Vision Studios, open to every member and partner */}
        <Section
          title="🎬 Frass Vision Studios"
          note="Continue your latest creative project in FV Studios. Manual editing is always free — AI work is forecast before it runs."
        >
          <div className="daily-grid">
            <button
              type="button"
              className="daily-card daily-clickable"
              onClick={() => {
                onNavigate?.("/studio");
                onDismiss();
              }}
            >
              <span className="daily-task-label">
                <Film className="mr-1.5 inline h-3.5 w-3.5" />
                Open the Studio
              </span>
              <span className="ws-meta">
                Describe the edit in plain words and Frassy builds it — video, b-roll, voice, captions, motion.
              </span>
              <span className="daily-go">
                Enter <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </button>

            <button
              type="button"
              className="daily-card daily-clickable"
              onClick={() => {
                onNavigate?.("/studio");
                onDismiss();
              }}
            >
              <span className="daily-task-label">
                <Coins className="mr-1.5 inline h-3.5 w-3.5" />
                {wallet.isLoading
                  ? "Loading your AI credits…"
                  : `${(wallet.data?.balance ?? 0).toLocaleString()} Frass AI Credits`}
              </span>
              <span className="ws-meta">
                {wallet.data
                  ? `About ${usdFor(wallet.data.balance)} of AI compute. Used today: ${(wallet.data.today_used ?? 0).toLocaleString()}.`
                  : "Your credit balance for AI work across the whole platform."}
              </span>
              <span className="daily-go">
                See receipts <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </button>
          </div>
        </Section>

        {/* 11 — Continue working */}
        <Section title="Continue Working" status={statuses["continue-working"]} note="Exactly where you stopped.">

          <div className="daily-grid">
            {model.resume.map((r) => (
              <button key={r.id} type="button" className="daily-card daily-clickable" onClick={() => go(r)}>
                <span className="daily-task-label">{r.label}</span>
                <span className="ws-meta">{r.detail}</span>
                <span className="daily-go">
                  Resume <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </button>
            ))}
          </div>
        </Section>

        {/* Phase Two — the Daily Briefing. The same nine workspaces, every day, in order. */}
        <Section
          blueprintId="daily-briefing"
          title="Daily Briefing"
          note="The closing routine. Frassy walks every workspace with you, in the same order, until the day is closed."
        >
          <ol className="daily-brief">
            {BRIEFING_ORDER.map((w, i) => {
              const st = statuses[w.id];
              const open = i === briefingStep;
              const outstanding = st ? st.red + st.orange + st.blue : 0;
              return (
                <li key={w.id} className={`daily-brief-row ${open ? "is-open" : ""}`}>
                  <button type="button" className="daily-brief-head" onClick={() => setBriefingStep(open ? -1 : i)}>
                    <span className="daily-step-n" aria-hidden="true">{i + 1}</span>
                    <span className="daily-brief-title">{w.title}</span>
                    <span className={`daily-health is-${healthFor(st).level}`} title={healthFor(st).note}>
                      {healthFor(st).dot} {healthFor(st).label}
                    </span>
                    <StatusPills status={st} />
                  </button>
                  {open && (
                    <div className="daily-brief-body">
                      <p className="ws-meta">{w.note}</p>
                      <p className="daily-next">
                        {outstanding === 0
                          ? "Nothing outstanding here. This workspace is closed for today."
                          : `${outstanding} item${outstanding === 1 ? "" : "s"} still open here${
                              st?.red ? ` — ${st.red} critical` : ""
                            }. Everything else is settled.`}
                      </p>
                      <div className="daily-brief-actions">
                        {w.href && (
                          <button type="button" className="ws-chip" onClick={() => go({ href: w.href })}>
                            Open {w.title} <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          className="ws-chip"
                          onClick={() => setBriefingStep(Math.min(i + 1, BRIEFING_ORDER.length - 1))}
                        >
                          Reviewed — next workspace
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
          <p className="daily-next mt-4">
            {progress.pct >= 100
              ? "Everything is green. That's a finished day — rest well."
              : "Finish the numbered list above, then close the day here."}
          </p>
        </Section>

        {/* 2 & 7 · The Last Button — Close My Day, and the celebration that follows */}
        <section className="daily-close" data-blueprint="daily-close">
          {!closed ? (
            <>
              <h2 className="daily-h2">
                <Moon className="mr-2 inline h-4 w-4" /> Ready to finish?
              </h2>
              <p className="ws-meta">{DAILY_PHILOSOPHY}</p>
              <div className="daily-brief-card-actions">
                <button
                  type="button"
                  className="daily-enter"
                  onClick={() => {
                    closeDay();
                    setClosed(true);
                  }}
                >
                  Close My Day
                </button>
                <button type="button" className="ws-chip" onClick={() => setFocus(true)}>
                  <Focus className="h-3.5 w-3.5" /> Focus Mode
                </button>
              </div>
            </>
          ) : (
            <div className="daily-celebrate">
              <h2 className="daily-brief-greet">{report.headline}</h2>
              <ul className="daily-brief-lines">
                {report.lines.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
              {report.accomplishments.length > 0 && (
                <>
                  <span className="ws-meta">What you accomplished</span>
                  <ul className="daily-brief-lines">
                    {report.accomplishments.map((a) => (
                      <li key={a}>🟢 {a}</li>
                    ))}
                  </ul>
                </>
              )}
              {report.tomorrow.length > 0 && (
                <>
                  <span className="ws-meta">Waiting for tomorrow</span>
                  <ul className="daily-brief-lines">
                    {report.tomorrow.map((t) => (
                      <li key={t}>• {t}</li>
                    ))}
                  </ul>
                </>
              )}
              <div className="daily-brief-card-actions">
                <button type="button" className="daily-enter" onClick={onDismiss}>
                  Rest well — enter my workspace
                </button>
                <button
                  type="button"
                  className="ws-chip"
                  onClick={() => {
                    reopenDay();
                    setClosed(false);
                  }}
                >
                  Reopen my day
                </button>
              </div>
            </div>
          )}
        </section>
        </>
        )}


        <div className="daily-footer">
          <button type="button" className="daily-enter" onClick={onDismiss}>
            Enter my workspace
          </button>
          <p className="ws-meta">
            The Daily stays in your navigation. Reopen it any time today and it comes back exactly as you left it.
          </p>
        </div>
      </div>

      {/* FRASS-0400 — the Frassy Workspace Composer, docked in The Daily */}

      <div className="daily-dock">
        {commandNote && <p className="ws-meta daily-command-note">{commandNote}</p>}
        <FrassyComposer
          value={command}
          onChange={setCommand}
          onSend={(text) => runIntent(text.trim())}
          voice
          placeholder="Talk to Frassy, drop files or folders, capture a photo — “show me the orders”, “continue yesterday's work”…"
          tools={audience === "founder" ? undefined : ["files", "images", "documents", "camera", "clipboard"]}
        />

      </div>
    </div>
  );
}


function MetricCard({
  metric,
  open,
  onOpen,
  onToggleExplain,
  onRecord,
}: {
  metric: DailyMetric;
  open: boolean;
  onOpen: () => void;
  onToggleExplain: () => void;
  onRecord?: (target: DailyTarget) => void;
}) {
  const status = DATA_STATUS[metric.status];
  const [drill, setDrill] = useState(false);
  const [money, setMoney] = useState(false);
  return (
    <div id={`metric-${metric.label}`} className="daily-card daily-metric">
      <span className="daily-badge" title={status.note}>
        {status.dot} {status.label}
      </span>
      <span className="ws-meta">{metric.label}</span>
      <span className="daily-task-label">
        {metric.value} {metric.trend ? <span className="daily-trend">{metric.trend}</span> : null}
      </span>
      <div className="daily-metric-actions">
        <button type="button" className={`ws-chip ${drill ? "daily-chip-on" : ""}`} onClick={() => setDrill((v) => !v)}>
          <ListTree className="h-3.5 w-3.5" /> View details
        </button>
        {metric.sources && (
          <button type="button" className={`ws-chip ${money ? "daily-chip-on" : ""}`} onClick={() => setMoney((v) => !v)}>
            <Coins className="h-3.5 w-3.5" /> Where did this come from?
          </button>
        )}
        <button type="button" className={`ws-chip ${open ? "daily-chip-on" : ""}`} onClick={onToggleExplain}>
          <HelpCircle className="h-3.5 w-3.5" /> What does this mean?
        </button>
      </div>

      {/* Drill-down — the records behind the number, before you leave the Daily */}
      {drill && (
        <div className="daily-drill">
          {metric.records && metric.records.length > 0 ? (
            <ul className="daily-drill-list">
              {metric.records.map((r) => (
                <li key={r.id}>
                  <button type="button" onClick={() => onRecord?.(r)}>
                    <span>{r.label}</span>
                    {r.meta && <em>{r.meta}</em>}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="ws-meta">No records behind this number yet. It will fill in as real activity happens.</p>
          )}
          <button type="button" className="ws-chip" onClick={onOpen}>
            Open in my workspace <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Provenance — money always explains itself */}
      {money && metric.sources && (
        <div className="daily-drill">
          <table className="daily-sources">
            <tbody>
              {metric.sources.map((s) => (
                <tr key={s.label}>
                  <td>{s.label}</td>
                  <td>{s.value}</td>
                  <td>
                    <span className="daily-badge">
                      {DATA_STATUS[s.status].dot} {DATA_STATUS[s.status].label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {open && (
        <p className="daily-explain">
          {metric.explain} <em>{status.note}</em>
        </p>
      )}
    </div>
  );
}


function StatusPills({ status }: { status?: SectionStatus }) {
  if (!status) return null;
  const shown = LANE_ORDER.filter((l) => status[l] > 0);
  if (!shown.length) return null;
  return (
    <span className="daily-status">
      {shown.map((l) => (
        <span key={l} className={`daily-status-pill lane-pill-${l}`} title={LANE[l].meaning}>
          {LANE[l].dot} {status[l]} {LANE[l].label}
        </span>
      ))}
    </span>
  );
}

function Section({
  title,
  note,
  blueprintId,
  status,
  children,
}: {
  title: string;
  note?: string;
  blueprintId?: string;
  status?: SectionStatus;
  children: React.ReactNode;
}) {
  return (
    <section data-blueprint={blueprintId} className="daily-section">
      <div className="daily-section-head">
        <h2 className="daily-h2">{title}</h2>
        <StatusPills status={status} />
      </div>
      {note && <p className="ws-meta daily-note">{note}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

