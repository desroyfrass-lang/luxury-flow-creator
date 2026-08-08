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
import { X, Check, Sparkles, ArrowRight, HelpCircle, Coins, ListTree, Send } from "lucide-react";
import frassyAvatar from "@/assets/frassy-gold.png.asset.json";
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
import { dailySnapshot, viewerFrom } from "@/lib/finance/financial-center";


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

  /** No dead information — every item resolves to the records behind it. */
  const go = (target: DailyTarget) => {
    if (target.href) onNavigate?.(target.href);
    else if (target.projectId) onOpenProject?.(target.projectId);
    onDismiss();
  };

  /** The Daily is navigable by conversation, not clicks alone. */
  const runIntent = (said: string) => {
    if (!said) return;
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


  return (
    <div data-blueprint="daily" className={`frass-workspace daily-overlay ${entered ? "is-in" : ""}`} role="dialog" aria-label="The Frass Daily">
      {/* Frassy greets large, then shrinks into her assistant position */}
      <div className={`daily-frassy ${shrunk ? "is-small" : ""}`}>
        <img src={frassyAvatar.url} alt="" />
      </div>

      <div className="daily-scroll">
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

        {/* My Day — today, at a glance */}
        <section className="daily-myday" data-blueprint="daily-myday">
          <div className="daily-myday-head">
            <h2 className="daily-h2">My Day</h2>
            <span className="ws-meta">{formatWorkload(day.remainingMinutes)} remaining</span>
          </div>
          <div className="daily-bar daily-myday-bar">
            <span style={{ width: `${day.pct}%` }} />
          </div>
          <div className="daily-myday-stats">
            <span>{day.pct}% complete</span>
            <span>{day.tasks} tasks</span>
            <span>{day.delegated} delegated</span>
            <span>{day.awaitingApproval} waiting approval</span>
            <span>{day.completed} completed</span>
          </div>
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
        <Section title="Daily briefing" note="Everything since you were last here. Click any number to see what it is.">
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



        {/* 3 + 4 + 5 — Priorities, workload, delegation */}
        <Section
          blueprintId="daily-priorities"
          title="Today's priorities"

          note={`Estimated work today: ${formatWorkload(remaining)}${
            savedByFrassy ? ` · Frassy is carrying ${formatWorkload(savedByFrassy)}` : ""
          }`}
        >
          {ORDER.map((p) => {
            const items = model.tasks.filter((t) => t.priority === p);
            if (!items.length) return null;
            return (
              <div key={p} className="daily-block">
                <div className="ws-meta daily-block-title">{PRIORITY_LABEL[p]}</div>
                {items.map((t) => {
                  const isDelegated = delegated.includes(t.id);
                  const isDone = done.includes(t.id) || t.priority === "completed";
                  return (
                    <div key={t.id} className={`daily-task ${isDone ? "is-done" : ""}`}>
                      <button type="button" className="daily-task-main" onClick={() => go(t)}>
                        <span className="daily-task-label">{t.label}</span>
                        {t.detail && <span className="ws-meta">{t.detail}</span>}
                        {t.minutes > 0 && <span className="ws-meta">≈ {formatWorkload(t.minutes)}</span>}
                      </button>
                      {!isDone && (
                        <div className="daily-task-actions">
                          <button
                            type="button"
                            className="ws-chip"
                            onClick={() => setDone((d) => [...d, t.id])}
                          >
                            <Check className="h-3.5 w-3.5" /> I'll do it
                          </button>
                          {t.delegable && (
                            <button
                              type="button"
                              className={`ws-chip ${isDelegated ? "daily-chip-on" : ""}`}
                              onClick={() =>
                                setDelegated((d) =>
                                  d.includes(t.id) ? d.filter((x) => x !== t.id) : [...d, t.id],
                                )
                              }
                            >
                              <Sparkles className="h-3.5 w-3.5" />
                              {isDelegated ? "Frassy has it" : "Frassy handles it"}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </Section>

        {/* 6 — Pending approvals */}
        {model.approvals.length > 0 && (
          <Section title="Pending approvals" note="Everything waiting on you, in one place.">
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
        <Section title="Opportunities" note="Things I don't want you to miss.">
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
        <Section title="Goals & Vision Maps" note="How close you are.">
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
        <Section title="Daily performance" note="One glance tells you how things are going.">
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
          <Section title="Founder command center" note="The executive view. Everything here opens the Founder Dashboard or the records behind it.">
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

        {/* 11 — Continue working */}
        <Section title="Continue working" note="Exactly where you stopped.">
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


function Section({
  title,
  note,
  blueprintId,
  children,
}: {
  title: string;
  note?: string;
  blueprintId?: string;
  children: React.ReactNode;
}) {
  return (
    <section data-blueprint={blueprintId} className="daily-section">
      <h2 className="daily-h2">{title}</h2>

      {note && <p className="ws-meta daily-note">{note}</p>}
      <div className="mt-3">{children}</div>
    </section>
  );
}
