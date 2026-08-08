// Workspace Awareness rail — Frassy notices the shape of the session and offers
// something useful. Quiet, dismissible, never an interruption.

import { useEffect, useState } from "react";
import {
  isSeen,
  loadDay,
  loadSession,
  markSeen,
  nextNudge,
  type AwarenessNudge,
} from "@/lib/workspace/awareness";

export function AwarenessRail({
  projectName,
  alternateName,
  alternateId,
  onSwitchProject,
  onAsk,
  /** Changes whenever real activity is recorded, so awareness re-evaluates. */
  pulse,
}: {
  projectName: string;
  alternateName?: string;
  alternateId?: string;
  onSwitchProject: (id: string) => void;
  onAsk: (prompt: string) => void;
  pulse: number;
}) {
  const [nudge, setNudge] = useState<AwarenessNudge | null>(null);

  useEffect(() => {
    const evaluate = () => {
      const n = nextNudge({
        session: loadSession(),
        day: loadDay(),
        projectName,
        alternateName,
        alternateId,
      });
      setNudge(n && !isSeen(n.id) ? n : null);
    };
    evaluate();
    const t = window.setInterval(evaluate, 60_000);
    return () => window.clearInterval(t);
  }, [projectName, alternateName, alternateId, pulse]);

  if (!nudge) return null;

  const dismiss = () => {
    markSeen(nudge.id);
    setNudge(null);
  };

  return (
    <div className="ws-awareness" data-blueprint="workspace-awareness">
      <span className="ws-awareness-dot" aria-hidden />
      <p className="ws-awareness-text">{nudge.message}</p>
      <div className="ws-awareness-actions">
        <button
          type="button"
          className="ws-awareness-primary"
          onClick={() => {
            if (nudge.primary.kind === "switch" && nudge.primary.payload) onSwitchProject(nudge.primary.payload);
            else if (nudge.primary.kind === "ask" && nudge.primary.payload) onAsk(nudge.primary.payload);
            dismiss();
          }}
        >
          {nudge.primary.label}
        </button>
        <button type="button" className="ws-awareness-secondary" onClick={dismiss}>
          {nudge.secondary.label}
        </button>
      </div>
    </div>
  );
}
