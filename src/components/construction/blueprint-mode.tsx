// FRASS-0200 — Construction Mode & Blueprint Mode overlay.
// Founder only. Never rendered for Builders, Partners, Vendors, Members,
// Affiliates or Administrators without Founder authority.
//
// Amendment: the Founder never edits production directly — the Founder edits
// the Blueprint. Every change is previewed, costed in development credits,
// approved, versioned, and recorded.

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useIsAdminStatus } from "@/hooks/use-is-admin";
import { DevelopmentCredits } from "@/components/construction/development-credits";
import {
  ARCHITECTURAL_PROTECTION,
  BLUEPRINT_ACTIONS,
  BLUEPRINT_COMPONENTS,
  BLUEPRINT_LIFECYCLE,
  BLUEPRINT_PRINCIPLE,
  IMPACT_PRINCIPLE,
  QUALITY_STANDARD,
  decisionsFor,
  getBlueprintComponent,
  isSandbox,
  loadVersions,
  recordDecision,
  relationshipMap,
  revertToVersion,
  saveVersion,
  setSandbox,
  simulateAction,
  updateDecision,
  type ArchitecturalDecision,
  type BlueprintVersion,
} from "@/lib/construction/blueprint-registry";
import {
  budgetWarning,
  estimateChange,
  loadBudget,
  recordSpend,
} from "@/lib/construction/credit-intelligence";
import {
  impactReport,
  impactSummary,
  type ArchitecturalImpactReport,
} from "@/lib/construction/impact-forecast";
import {
  architecturalMemory,
  expectedBehaviour,
  FOUNDER_INTENT_QUESTION,
  PRINCIPLE_13,
  PRINCIPLE_14,
  verificationVerdict,
} from "@/lib/construction/governance";

export const CONSTRUCTION_EVENT = "frass:construction-mode";

/** Ask for Construction Mode from anywhere (header, Founder Dashboard, Frassy). */
export function openConstructionMode() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(CONSTRUCTION_EVENT));
}

const REFUSAL =
  "Construction Mode is reserved for the Founder. I can help improve your own workspace or projects, but I cannot modify the Frass Operating System.";

/** Preview classes — the Blueprint is shown, production is never edited. */
function previewClassFor(action: string): string | null {
  const a = action.toLowerCase();
  if (a === "move up" || a === "move left") return "bp-preview-shift-back";
  if (a === "move down" || a === "move right") return "bp-preview-shift-fwd";
  if (a === "small") return "bp-preview-small";
  if (a === "large" || a === "full width") return "bp-preview-large";
  if (a === "hide" || a === "founder only") return "bp-preview-hidden";
  if (a === "collapse") return "bp-preview-collapse";
  if (["background", "lighting", "glass", "materials"].includes(a)) return "bp-preview-lighting";
  if (["animation", "motion"].includes(a)) return "bp-preview-motion";
  return "bp-preview-generic";
}

export function ConstructionMode() {
  const { isAdmin, loading } = useIsAdminStatus();
  const [active, setActive] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [action, setAction] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [history, setHistory] = useState<ArchitecturalDecision[]>([]);
  const [previewing, setPreviewing] = useState(false);
  const [sandbox, setSandboxState] = useState(false);
  const [versions, setVersions] = useState<BlueprintVersion[]>([]);
  const [showMap, setShowMap] = useState(false);
  const [impactRead, setImpactRead] = useState(false);

  const component = useMemo(() => getBlueprintComponent(selected), [selected]);
  const simulation = component && action ? simulateAction(component, action) : null;
  const estimate = component && action ? estimateChange(component, action) : null;
  const warning = estimate ? budgetWarning(loadBudget(), estimate.max) : null;
  const relations = useMemo(() => (component ? relationshipMap(component) : null), [component]);
  // Principle 12 — Impact Forecast. Nothing is approved before the ripple is understood.
  const impact = useMemo(
    () => (component && action ? impactReport(component, action) : null),
    [component, action],
  );

  // Activation — Founder only, no exceptions.
  useEffect(() => {
    const toggle = () => {
      if (loading) return;
      if (!isAdmin) {
        toast("Frassy", { description: REFUSAL });
        return;
      }
      setActive((v) => !v);
    };
    const key = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggle();
      }
      if (e.key === "Escape") setActive(false);
    };
    window.addEventListener(CONSTRUCTION_EVENT, toggle);
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener(CONSTRUCTION_EVENT, toggle);
      window.removeEventListener("keydown", key);
    };
  }, [isAdmin, loading]);

  useEffect(() => {
    if (active) {
      setSandboxState(isSandbox());
      setVersions(loadVersions());
    }
  }, [active]);

  // Blueprint layer — every tagged component becomes selectable.
  useEffect(() => {
    if (!active) {
      document.body.classList.remove("blueprint-on");
      return;
    }
    document.body.classList.add("blueprint-on");
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest("[data-blueprint-ui]")) return;
      const node = target?.closest("[data-blueprint]") as HTMLElement | null;
      if (!node) return;
      e.preventDefault();
      e.stopPropagation();
      setSelected(node.getAttribute("data-blueprint"));
      setAction(null);
      setNote("");
      setPreviewing(false);
    };
    document.addEventListener("click", onClick, true);
    return () => {
      document.body.classList.remove("blueprint-on");
      document.removeEventListener("click", onClick, true);
    };
  }, [active]);

  useEffect(() => {
    if (selected) setHistory(decisionsFor(selected));
  }, [selected, active]);

  // Live preview — the Blueprint is shown on the real screen, nothing is saved.
  useEffect(() => {
    if (!previewing || !component || !action) return;
    const cls = previewClassFor(action);
    if (!cls) return;
    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>(`[data-blueprint="${component.id}"]`),
    );
    nodes.forEach((n) => n.classList.add("bp-preview", cls));
    return () => nodes.forEach((n) => n.classList.remove("bp-preview", cls));
  }, [previewing, component, action]);

  useEffect(() => {
    setPreviewing(false);
    setImpactRead(false);
  }, [action]);

  const approve = useCallback(() => {
    if (!component || !action || !simulation || !estimate || !impact) return;
    if (!impactRead) {
      toast("Impact Forecast", {
        description: "Read the Architectural Impact Report first — every approval starts with knowing what else changes.",
      });
      return;
    }
    recordDecision({
      componentId: component.id,
      componentLabel: component.label,
      action,
      simulation: `${simulation}\n\nForecast: ${estimate.tier} · ${estimate.min}–${estimate.max} credits · ${estimate.risk} risk.\n\nImpact: ${impactSummary(impact, { min: estimate.min, max: estimate.max })}`,
      note: note.trim() || undefined,
    });
    recordSpend(`${component.label} — ${action}`, estimate.max);
    saveVersion(`${component.label} — ${action}`);
    setVersions(loadVersions());
    setHistory(decisionsFor(component.id));
    setAction(null);
    setNote("");
    setPreviewing(false);
    setImpactRead(false);
    toast("Blueprint approved", {
      description: `${component.label} — ${action}. Forecast ${estimate.min}–${estimate.max} credits. Recorded, versioned, implementation brief follows.`,
    });
  }, [component, action, simulation, estimate, note, impact, impactRead]);

  if (!isAdmin || !active) return null;

  return (
    <div data-blueprint-ui className="bp-root">
      <div className="bp-banner">
        <span className="bp-dot" />
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-bold uppercase tracking-[0.32em] text-[color:var(--gold)]">
            Construction Mode · Blueprint Layer{sandbox ? " · Sandbox" : ""}
          </div>
          <div className="truncate text-xs text-muted-foreground">{BLUEPRINT_PRINCIPLE}</div>
        </div>
        <button
          type="button"
          className={`bp-close${sandbox ? " bp-sandbox-on" : ""}`}
          onClick={() => {
            const next = !sandbox;
            setSandbox(next);
            setSandboxState(next);
            toast(next ? "Sandbox on" : "Sandbox off", {
              description: next
                ? "Explore freely — nothing here reaches the live platform until you approve a Blueprint."
                : "Approvals now flow into the implementation queue as normal.",
            });
          }}
        >
          Sandbox
        </button>
        <button type="button" className="bp-close" onClick={() => setActive(false)}>
          Exit
        </button>
      </div>

      <aside className="bp-panel">
        {!component ? (
          <div className="p-6">
            <div className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
              Architectural Intelligence
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Click any highlighted component to open its living blueprint — purpose, registry
              references, connected systems, dependencies, users affected, relationships, credit
              forecast, and every approved decision in its history.
            </p>

            <div className="mt-5">
              <DevelopmentCredits />
            </div>

            <div className="mt-6 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Blueprint lifecycle
            </div>
            <div className="mt-2 text-xs text-muted-foreground">{BLUEPRINT_LIFECYCLE.join(" → ")}</div>

            <div className="mt-6 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Selectable components
            </div>
            <div className="mt-2 space-y-1">
              {BLUEPRINT_COMPONENTS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className="bp-list-item"
                  onClick={() => {
                    setSelected(c.id);
                    setAction(null);
                  }}
                >
                  <span className="flex-1 truncate text-left">{c.label}</span>
                  <span className="bp-status">{c.status}</span>
                </button>
              ))}
            </div>

            <div className="mt-6 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Blueprint versions
            </div>
            {versions.length === 0 ? (
              <p className="mt-2 text-xs text-muted-foreground">
                No versions yet. Every approval saves a restorable version of the architecture.
              </p>
            ) : (
              <ul className="mt-2 space-y-1.5">
                {versions.slice(0, 8).map((v) => (
                  <li key={v.id} className="flex items-center gap-2 text-xs">
                    <span className="flex-1 truncate text-muted-foreground">{v.label}</span>
                    <button
                      type="button"
                      className="bp-action"
                      onClick={() => {
                        revertToVersion(v.id);
                        setVersions(loadVersions());
                        toast("Blueprint restored", { description: `Architecture log restored to "${v.label}".` });
                      }}
                    >
                      Restore
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-6 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Architectural protection
            </div>
            <div className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {ARCHITECTURAL_PROTECTION.join(" → ")}
            </div>
            <div className="mt-4 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Quality standard
            </div>
            <div className="mt-2 text-xs text-muted-foreground">{QUALITY_STANDARD.join(" · ")}</div>
          </div>
        ) : (
          <div className="p-6">
            <button type="button" className="bp-back" onClick={() => setSelected(null)}>
              ← All components
            </button>
            <h2 className="mt-3 font-display text-2xl">{component.label}</h2>
            <div className="mt-1 text-xs text-muted-foreground">{component.purpose}</div>

            <div className="bp-intel">
              <Row label="Registry references" value={component.registry.join(", ")} />
              <Row label="Connected systems" value={component.connectedSystems.join(", ")} />
              <Row label="Dependencies" value={component.dependencies.join(", ")} />
              <Row label="Users affected" value={component.usersAffected.join(", ")} />
              <Row label="Last approved by" value={component.lastApprovedBy} />
              <Row label="Last modified" value={component.lastModified} />
              <Row label="Implementation status" value={component.status} />
            </div>

            <div className="mt-5 rounded-sm border border-border/70 bg-background/60 p-4 text-xs leading-relaxed text-muted-foreground">
              <span className="text-[color:var(--gold)]">Specification · </span>
              {component.specification}
            </div>

            {/* Relationship mapping */}
            <button type="button" className="bp-back mt-5 block" onClick={() => setShowMap((v) => !v)}>
              {showMap ? "− Hide relationships" : "+ Show relationships"}
            </button>
            {showMap && relations && (
              <div className="bp-map">
                <MapRow label="Depends on" items={relations.upstream.map((c) => c.label)} />
                <MapRow label="Depended on by" items={relations.downstream.map((c) => c.label)} />
                <MapRow label="Shares systems with" items={relations.siblings.map((c) => c.label)} />
              </div>
            )}

            <div className="mt-6 text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
              Actions
            </div>
            {BLUEPRINT_ACTIONS.map((g) => (
              <div key={g.group} className="mt-3">
                <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  {g.group}
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {g.actions.map((a) => (
                    <button
                      key={a}
                      type="button"
                      className={`bp-action${action === a ? " bp-action-on" : ""}`}
                      onClick={() => setAction(a)}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {simulation && estimate && (
              <div className="bp-sim">
                <div className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
                  Live simulation — Frassy
                </div>
                <p className="mt-2 text-xs leading-relaxed">{simulation}</p>

                {/* Principle 12 — Architectural Impact Report */}
                {impact && (
                  <div className="bp-impact">
                    <div className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
                      Architectural Impact Report
                    </div>
                    <p className="mt-1 text-[11px] italic text-muted-foreground">
                      "{impact.question}"
                    </p>
                    <div className="mt-3 space-y-2">
                      {impact.lines.map((l) => (
                        <div key={l.label} className="bp-impact-line">
                          <span className={`bp-impact-dot bp-impact-${l.level}`} />
                          <div className="min-w-0">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.16em]">
                              {l.label}
                            </div>
                            <div className="text-[11px] leading-relaxed text-muted-foreground">
                              {l.detail}
                            </div>
                          </div>
                        </div>
                      ))}
                      {impact.untouched.length > 0 && (
                        <div className="bp-impact-line">
                          <span className="bp-impact-dot bp-impact-none" />
                          <div className="min-w-0">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.16em]">
                              Untouched
                            </div>
                            <div className="text-[11px] leading-relaxed text-muted-foreground">
                              {impact.untouched.join(", ")} — no impact.
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                      Testing — {impact.testCount} interaction checks
                    </div>
                    <ul className="mt-1.5 space-y-1 text-[11px] text-muted-foreground">
                      {impact.testing.map((t) => (
                        <li key={t}>· {t}</li>
                      ))}
                    </ul>

                    <div className="mt-3 text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                      Future maintenance
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                      {impact.maintenance}
                    </p>

                    <p className="bp-impact-rec">
                      <span className="text-[color:var(--gold)]">Recommendation · </span>
                      {impact.recommendation}
                    </p>

                    <label className="bp-impact-ack">
                      <input
                        type="checkbox"
                        checked={impactRead}
                        onChange={(e) => setImpactRead(e.target.checked)}
                      />
                      <span>I have read the impact report</span>
                    </label>
                  </div>
                )}

                {/* Estimated development impact — never spend blindly */}

                <div className="bp-cost">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
                    Estimated development impact
                  </div>
                  <div className="mt-2 font-display text-lg">
                    {estimate.min}–{estimate.max} credits
                    <span className="ml-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                      {estimate.tier} · {estimate.risk} risk
                    </span>
                  </div>
                  <ul className="mt-2 space-y-1 text-[11px] text-muted-foreground">
                    {estimate.drivers.map((d) => (
                      <li key={d}>· {d}</li>
                    ))}
                  </ul>
                  <p className="mt-2 text-[11px] text-muted-foreground">{estimate.value}</p>
                  {estimate.alternative && (
                    <p className="mt-2 text-[11px] italic text-muted-foreground">{estimate.alternative}</p>
                  )}
                  {warning && warning.level !== "none" && (
                    <p className={`bp-warn bp-warn-${warning.level}`}>{warning.message}</p>
                  )}
                </div>

                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Founder note (optional) — why this change, in your own words."
                  className="bp-note"
                  rows={2}
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={`bp-action${previewing ? " bp-action-on" : ""}`}
                    onClick={() => setPreviewing((v) => !v)}
                  >
                    {previewing ? "Stop preview" : "Preview on screen"}
                  </button>
                  <button type="button" className="bp-approve" onClick={approve}>
                    Approve blueprint
                  </button>
                  <button type="button" className="bp-decline" onClick={() => setAction(null)}>
                    Not yet
                  </button>
                </div>
                <p className="mt-2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  {BLUEPRINT_PRINCIPLE}
                </p>
                <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
                  {IMPACT_PRINCIPLE}
                </p>
              </div>
            )}

            <div className="mt-6 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Decision history
            </div>
            {history.length === 0 ? (
              <p className="mt-2 text-xs text-muted-foreground">
                No approved changes yet. Every approval is remembered here permanently.
              </p>
            ) : (
              <ul className="mt-2 space-y-2">
                {history.map((d) => (
                  <li key={d.id} className="bp-history">
                    <div className="text-xs font-semibold">{d.action}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {new Date(d.approvedAt).toLocaleString()} · Approved by Founder
                    </div>
                    {d.note && <div className="mt-1 text-[11px] italic text-muted-foreground">"{d.note}"</div>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="bp-row">
      <div className="bp-row-label">{label}</div>
      <div className="bp-row-value">{value}</div>
    </div>
  );
}

function MapRow({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="bp-map-row">
      <div className="bp-row-label">{label}</div>
      <div className="mt-1 flex flex-wrap gap-1.5">
        {items.length === 0 ? (
          <span className="text-[11px] text-muted-foreground">None recorded</span>
        ) : (
          items.map((i) => (
            <span key={i} className="bp-map-chip">
              {i}
            </span>
          ))
        )}
      </div>
    </div>
  );
}
