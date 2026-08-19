// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0572A — Frassy Engine diagnostic feed.
//
// Plain English: a little label that says which Frassy you are actually talking
// to right now — which engine, which mode, where her memory came from, and how
// many audit turns were dropped before she read it.
//
// Surfaces publish what they loaded; the badge reads it. Founder-only display.
// ─────────────────────────────────────────────────────────────────────────────

import type { FrassyMode, FrassyPipeline } from "./engine-registry";

export type FrassyEngineDiagnostics = {
  pipeline: FrassyPipeline;
  mode: FrassyMode;
  historySource: "builder_journey_messages" | "shared_transcript" | "clean_room";
  /** Turns handed to the model. */
  historyTurns: number;
  /** Teleporter audit turns removed before the model read anything. */
  auditTurnsFiltered: number;
  /** Card context for audit mode, e.g. "Card #025". */
  cardLabel?: string;
  path: string;
};

type Listener = (d: FrassyEngineDiagnostics | null) => void;

let current: FrassyEngineDiagnostics | null = null;
const listeners = new Set<Listener>();

export function publishEngineDiagnostics(d: FrassyEngineDiagnostics) {
  current = d;
  listeners.forEach((l) => l(current));
}

export function clearEngineDiagnostics() {
  current = null;
  listeners.forEach((l) => l(null));
}

export function readEngineDiagnostics() {
  return current;
}

export function subscribeEngineDiagnostics(l: Listener) {
  listeners.add(l);
  l(current);
  return () => {
    listeners.delete(l);
  };
}
