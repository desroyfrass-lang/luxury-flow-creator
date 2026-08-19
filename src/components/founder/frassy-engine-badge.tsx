// FRASS-0572A — Founder-only Frassy Engine badge.
//
// Shows, on screen, exactly which Frassy engine is answering: mode, history
// source, audit turns loaded, and the active Teleporter card. If a cross-engine
// bug ever returns, it is visible in one glance instead of three days of tests.

import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { useIsAdminStatus } from "@/hooks/use-is-admin";
import { frassyPipelineFor } from "@/lib/frassy/engine-registry";
import { resolveAuditCard } from "@/lib/founder/teleport-session";
import {
  subscribeEngineDiagnostics,
  type FrassyEngineDiagnostics,
} from "@/lib/frassy/engine-diagnostics";

const STORAGE_KEY = "frass.frassy.engine-badge";

export function FrassyEngineBadge() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { isAdmin } = useIsAdminStatus();
  const [live, setLive] = useState<FrassyEngineDiagnostics | null>(null);
  const [open, setOpen] = useState(true);

  useEffect(() => subscribeEngineDiagnostics(setLive), []);

  useEffect(() => {
    try {
      setOpen(window.localStorage.getItem(STORAGE_KEY) !== "off");
    } catch {
      /* private mode — badge simply stays open */
    }
  }, []);

  if (!isAdmin) return null;
  if (pathname.startsWith("/auth") || pathname.startsWith("/api")) return null;

  const card = resolveAuditCard(pathname);
  const pipeline = frassyPipelineFor(pathname);
  const auditActive = Boolean(card) && pipeline === "shared";

  const mode = auditActive ? "Teleporter Audit" : live?.mode ?? (pipeline === "journey" ? "journey" : "—");
  const historySource = auditActive
    ? "clean_room"
    : live?.historySource ?? (pipeline === "journey" ? "builder_journey_messages" : "shared_transcript");

  const toggle = () => {
    const next = !open;
    setOpen(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next ? "on" : "off");
    } catch {
      /* nothing to persist */
    }
  };

  if (!open) {
    return (
      <button
        onClick={toggle}
        className="fixed bottom-2 left-2 z-[60] rounded-full border border-border/60 bg-background/80 px-2 py-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground backdrop-blur"
      >
        engine
      </button>
    );
  }

  return (
    <div className="fixed bottom-2 left-2 z-[60] max-w-[240px] rounded-md border border-border/60 bg-background/85 px-3 py-2 font-mono text-[10px] leading-relaxed text-muted-foreground shadow-lg backdrop-blur">
      <div className="mb-1 flex items-center justify-between gap-3">
        <span className="font-semibold uppercase tracking-widest text-foreground">Frassy Engine</span>
        <button onClick={toggle} className="text-muted-foreground hover:text-foreground" aria-label="Hide engine badge">
          ×
        </button>
      </div>
      <div>Pipeline: {pipeline}</div>
      <div>Mode: {mode}</div>
      <div>History: {historySource}</div>
      <div>Turns loaded: {auditActive ? 0 : live?.historyTurns ?? 0}</div>
      <div>Audit turns filtered: {auditActive ? 0 : live?.auditTurnsFiltered ?? 0}</div>
      {card ? <div>Context: Card #{String(card.number).padStart(3, "0")}</div> : null}
      <div className="truncate opacity-70">{pathname}</div>
    </div>
  );
}
