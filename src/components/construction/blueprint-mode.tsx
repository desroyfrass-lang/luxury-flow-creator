// FRASS-0200 — Construction Mode & Blueprint Mode overlay.
// Founder only. Never rendered for Builders, Partners, Vendors, Members,
// Affiliates or Administrators without Founder authority.

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useIsAdminStatus } from "@/hooks/use-is-admin";
import {
  ARCHITECTURAL_PROTECTION,
  BLUEPRINT_ACTIONS,
  BLUEPRINT_COMPONENTS,
  QUALITY_STANDARD,
  decisionsFor,
  getBlueprintComponent,
  recordDecision,
  simulateAction,
  type ArchitecturalDecision,
} from "@/lib/construction/blueprint-registry";

export const CONSTRUCTION_EVENT = "frass:construction-mode";

/** Ask for Construction Mode from anywhere (header, Founder Dashboard, Frassy). */
export function openConstructionMode() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(CONSTRUCTION_EVENT));
}

const REFUSAL =
  "Construction Mode is reserved for the Founder. I can help improve your own workspace or projects, but I cannot modify the Frass Operating System.";

export function ConstructionMode() {
  const { isAdmin, loading } = useIsAdminStatus();
  const [active, setActive] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [action, setAction] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [history, setHistory] = useState<ArchitecturalDecision[]>([]);

  const component = useMemo(() => getBlueprintComponent(selected), [selected]);
  const simulation = component && action ? simulateAction(component, action) : null;

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

  const approve = useCallback(() => {
    if (!component || !action || !simulation) return;
    recordDecision({
      componentId: component.id,
      componentLabel: component.label,
      action,
      simulation,
      note: note.trim() || undefined,
    });
    setHistory(decisionsFor(component.id));
    setAction(null);
    setNote("");
    toast("Architectural decision approved", {
      description: `${component.label} — ${action}. Recorded in the architecture log; implementation brief follows.`,
    });
  }, [component, action, simulation, note]);

  if (!isAdmin || !active) return null;

  return (
    <div data-blueprint-ui className="bp-root">
      <div className="bp-banner">
        <span className="bp-dot" />
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-bold uppercase tracking-[0.32em] text-[color:var(--gold)]">
            Construction Mode · Blueprint Layer
          </div>
          <div className="truncate text-xs text-muted-foreground">
            Frassy is your Chief Systems Architect. Select any component to inspect and redesign it.
          </div>
        </div>
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
              references, connected systems, dependencies, users affected, and every approved
              decision in its history.
            </p>
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

            {simulation && (
              <div className="bp-sim">
                <div className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
                  Live simulation — Frassy
                </div>
                <p className="mt-2 text-xs leading-relaxed">{simulation}</p>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Founder note (optional) — why this change, in your own words."
                  className="bp-note"
                  rows={2}
                />
                <div className="mt-3 flex gap-2">
                  <button type="button" className="bp-approve" onClick={approve}>
                    Approve & record
                  </button>
                  <button type="button" className="bp-decline" onClick={() => setAction(null)}>
                    Not yet
                  </button>
                </div>
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
