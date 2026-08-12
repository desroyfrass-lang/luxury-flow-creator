// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0506 — Post-Launch Observation Window.
//
// A deployment is not complete the moment it reaches production. It is complete
// only after the platform has demonstrated stability under real usage.
//
// This module is pure logic: given the current deployment and the signals the
// Founder Security Center already collects (health checks, security events,
// worker/API/console errors), it answers one question in plain English —
// 🟢 Stable · 🟡 Monitoring · 🔴 Action Required.
// ─────────────────────────────────────────────────────────────────────────────

import type { HealthSignal, TieredEvent } from "@/lib/security/triage";

export type ReleaseClass = "critical" | "standard" | "minor";

/** Configurable observation periods, in hours. */
export const OBSERVATION_HOURS: Record<ReleaseClass, number> = {
  critical: 72,
  standard: 24,
  minor: 6,
};

export type DeploymentRecord = {
  /** Deployment ID from the Deployment Report (FRASS-0503-D). */
  id: string;
  /** ISO time the deployment reached production. */
  deployedAt: string;
  releaseClass: ReleaseClass;
  /** Optional override, in hours, when a release needs its own window. */
  observationHours?: number;
  commit?: string;
  note?: string;
};

export type ObservationStatus = "stable" | "monitoring" | "action_required";

export type ObservationSignal = {
  label: string;
  ok: boolean;
  critical?: boolean;
  reading: string;
};

export type ObservationVerdict = {
  status: ObservationStatus;
  /** 🟢 · 🟡 · 🔴 */
  dot: string;
  /** Stable · Monitoring · Action Required */
  headline: string;
  /** One sentence, the way an assistant would say it. */
  sentence: string;
  /** True while the deployment is still inside its window. */
  inWindow: boolean;
  elapsedHours: number;
  windowHours: number;
  remainingHours: number;
  /** True once the window closed with no critical issues — deployment accepted. */
  accepted: boolean;
  /** FRASS-0506 automatic escalation. */
  escalate: boolean;
  rollbackRecommended: boolean;
  signals: ObservationSignal[];
};

const HOUR = 60 * 60 * 1000;

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

function hoursPhrase(h: number): string {
  if (h >= 48) return `${Math.round(h / 24)} days`;
  if (h >= 1) return `${Math.round(h)} hours`;
  return `${Math.max(1, Math.round(h * 60))} minutes`;
}

/**
 * The eight things watched during every Observation Window.
 * Signals are derived from readings the Security Center already takes — this
 * adds no new collection, only a verdict.
 */
export function observationSignals(
  health: HealthSignal[] = [],
  events: TieredEvent[] = [],
  since = 0,
): ObservationSignal[] {
  const recent = events.filter((e) => Date.parse(e.created_at) >= since);
  const open = (e: TieredEvent) =>
    !e.review_status || e.review_status === "open" || e.review_status === "reviewing";
  const grouped = groupByTier(recent);
  const openCritical = grouped.critical.filter(open);
  const openSuspicious = grouped.suspicious.filter(open);

  const check = (keys: string[], label: string): ObservationSignal => {
    const found = health.filter((h) => keys.some((k) => h.key.includes(k)));
    if (!found.length) return { label, ok: true, reading: "No reading yet" };
    const down = found.find((h) => h.state === "down");
    const attention = found.find((h) => h.state === "attention");
    if (down) return { label, ok: false, critical: true, reading: `${down.key}: down` };
    if (attention) return { label, ok: false, reading: `${attention.key}: needs a look` };
    return { label, ok: true, reading: "Running normally" };
  };


  return [
    check(["app", "site", "render", "ssr"], "Application health"),
    check(["auth", "session", "login"], "Authentication"),
    check(["financ", "payment", "wallet", "order"], "Financial transactions"),
    check(["worker", "server", "function"], "Worker stability"),
    check(["api", "edge", "request"], "API errors"),
    {
      label: "Console errors",
      ok: !openSuspicious.length,
      reading: openSuspicious.length ? `${openSuspicious.length} unresolved warning(s)` : "Clean",
    },
    check(["perf", "latency", "slow", "speed"], "Performance"),
    check(["database", "db", "postgres", "storage"], "Database health"),
    {
      label: "Security events",
      ok: !openCritical.length,
      critical: openCritical.length > 0,
      reading: openCritical.length ? `${openCritical.length} critical alert(s) open` : "Nothing critical",
    },
  ];
}

export function windowHoursFor(deployment: DeploymentRecord): number {
  return deployment.observationHours ?? OBSERVATION_HOURS[deployment.releaseClass];
}

/**
 * The Observation Window verdict shown in the Founder Daily and Security Center.
 */
export function observeDeployment(
  deployment: DeploymentRecord | null,
  health: HealthSignal[] = [],
  events: TieredEvent[] = [],
  now = Date.now(),
): ObservationVerdict | null {
  if (!deployment) return null;

  const deployedAt = Date.parse(deployment.deployedAt);
  if (Number.isNaN(deployedAt)) return null;

  const windowHours = windowHoursFor(deployment);
  const elapsedHours = round1(Math.max(0, (now - deployedAt) / HOUR));
  const inWindow = elapsedHours < windowHours;
  const remainingHours = round1(Math.max(0, windowHours - elapsedHours));

  const signals = observationSignals(health, events, deployedAt);
  const failing = signals.filter((s) => !s.ok);
  const criticalFailing = failing.filter((s) => s.critical);

  let status: ObservationStatus;
  if (criticalFailing.length) status = "action_required";
  else if (failing.length || inWindow) status = inWindow || failing.length ? (failing.length ? "monitoring" : "monitoring") : "stable";
  else status = "stable";
  if (!inWindow && !failing.length) status = "stable";

  const accepted = !inWindow && !failing.length;
  const escalate = criticalFailing.length > 0;
  const rollbackRecommended = criticalFailing.length > 0 && elapsedHours <= windowHours * 2;

  const dot = status === "stable" ? "🟢" : status === "monitoring" ? "🟡" : "🔴";
  const headline =
    status === "stable" ? "Stable" : status === "monitoring" ? "Monitoring" : "Action Required";

  let sentence: string;
  if (status === "action_required") {
    sentence = `${criticalFailing[0]?.label} is failing since the last release (${criticalFailing[0]?.reading}).${
      rollbackRecommended ? " Rolling back to the previous build is recommended." : ""
    }`;
  } else if (accepted) {
    sentence = `Release ${deployment.id} stayed stable for its full ${hoursPhrase(windowHours)} of observation. It is accepted.`;
  } else if (failing.length) {
    sentence = `Release ${deployment.id} is being watched — ${failing.map((f) => f.label.toLowerCase()).join(", ")} ${failing.length === 1 ? "needs" : "need"} a look. ${hoursPhrase(remainingHours)} left in the window.`;
  } else {
    sentence = `Release ${deployment.id} is behaving. Everything is normal with ${hoursPhrase(remainingHours)} left in the observation window.`;
  }

  return {
    status,
    dot,
    headline,
    sentence,
    inWindow,
    elapsedHours,
    windowHours,
    remainingHours,
    accepted,
    escalate,
    rollbackRecommended,
    signals,
  };
}
