// ─────────────────────────────────────────────────────────────────────────────
// The Frass Daily — the universal daily command center.
// One Daily across the whole ecosystem. Opens once per calendar day, adapts to
// the Builder's role, then collapses into the workspace so the day can begin.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useState } from "react";
import { X, Check, Sparkles, ArrowRight } from "lucide-react";
import frassyAvatar from "@/assets/frassy-gold.png.asset.json";
import {
  dailyFor,
  formatWorkload,
  greetingFor,
  isReflectionHour,
  PRIORITY_LABEL,
  type DailyAudience,
  type DailyPriority,
} from "@/lib/workspace/daily";

const ORDER: DailyPriority[] = ["critical", "important", "optional", "completed"];

export function FrassDaily({
  audience,
  name,
  onDismiss,
  onOpenProject,
}: {
  audience: DailyAudience;
  name?: string;
  onDismiss: () => void;
  onOpenProject?: (projectId: string) => void;
}) {
  const model = useMemo(() => dailyFor(audience), [audience]);
  const [delegated, setDelegated] = useState<string[]>([]);
  const [done, setDone] = useState<string[]>([]);
  const [entered, setEntered] = useState(false);
  const [shrunk, setShrunk] = useState(false);
  const reflecting = isReflectionHour();

  useEffect(() => {
    const a = window.setTimeout(() => setEntered(true), 40);
    const b = window.setTimeout(() => setShrunk(true), 1900);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, []);

  const remaining = model.tasks
    .filter((t) => t.priority !== "completed")
    .filter((t) => !delegated.includes(t.id) && !done.includes(t.id))
    .reduce((n, t) => n + t.minutes, 0);

  const savedByFrassy = model.tasks
    .filter((t) => delegated.includes(t.id))
    .reduce((n, t) => n + t.minutes, 0);

  const go = (projectId?: string) => {
    if (projectId) onOpenProject?.(projectId);
    onDismiss();
  };

  return (
    <div className={`frass-workspace daily-overlay ${entered ? "is-in" : ""}`} role="dialog" aria-label="The Frass Daily">
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
        <Section title="Daily briefing" note="Everything since you were last here.">
          <div className="daily-lines">
            {model.briefing.map((l) => (
              <div key={l.label} className="daily-line">
                <span className="ws-meta">{l.label}</span>
                <span>{l.value}</span>
                {l.trend && <span className="daily-trend">{l.trend}</span>}
              </div>
            ))}
          </div>
        </Section>

        {/* 3 + 4 + 5 — Priorities, workload, delegation */}
        <Section
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
                      <button type="button" className="daily-task-main" onClick={() => go(t.projectId)}>
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
                <button key={a.id} type="button" className="daily-card daily-clickable" onClick={() => go(a.projectId)}>
                  <span className="ws-meta">{a.kind}</span>
                  <span>{a.label}</span>
                </button>
              ))}
            </div>
          </Section>
        )}

        {/* 7 — Opportunities */}
        <Section title="Opportunities" note="Things I don't want you to miss.">
          <div className="daily-grid">
            {model.opportunities.map((o) => (
              <div key={o.id} className="daily-card">
                <span className="daily-emoji">{o.icon}</span>
                <span className="daily-task-label">{o.label}</span>
                <span className="ws-meta">{o.why}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* 8 — Goals & Vision Maps */}
        <Section title="Goals & Vision Maps" note="How close you are.">
          <div className="daily-lines">
            {model.goals.map((g) => (
              <div key={g.id} className="daily-goal">
                <div className="daily-line">
                  <span>{g.label}</span>
                  <span className="ws-meta">{g.note}</span>
                </div>
                <div className="daily-bar">
                  <span style={{ width: `${g.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* 9 — Daily performance */}
        <Section title="Daily performance" note="One glance tells you how things are going.">
          <div className="daily-grid">
            {model.performance.map((p) => (
              <div key={p.label} className="daily-card">
                <span className="ws-meta">{p.label}</span>
                <span className="daily-task-label">
                  {p.value} {p.trend ?? ""}
                </span>
              </div>
            ))}
          </div>
        </Section>

        {/* Founder-only executive panels */}
        {model.executive.length > 0 && (
          <Section title="Founder command center" note="The executive view.">
            <div className="daily-grid">
              {model.executive.map((e) => (
                <div key={e.label} className="daily-card">
                  <span className="ws-meta">{e.label}</span>
                  <span className="daily-task-label">{e.value}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* 10 — Recent activity */}
        <Section title="Recent activity" note="Since your last session.">
          <div className="daily-lines">
            {model.activity.map((a) => (
              <div key={a.id} className="daily-line">
                <span className="daily-emoji">{a.icon}</span>
                <span className="flex-1">{a.label}</span>
                <span className="ws-meta">{a.when}</span>
              </div>
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
              <button key={r.id} type="button" className="daily-card daily-clickable" onClick={() => go(r.projectId)}>
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
          <p className="ws-meta">The Daily collapses into your sidebar. Reopen it whenever you like.</p>
        </div>
      </div>
    </div>
  );
}

function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="daily-section">
      <h2 className="daily-h2">{title}</h2>
      {note && <p className="ws-meta daily-note">{note}</p>}
      <div className="mt-3">{children}</div>
    </section>
  );
}
