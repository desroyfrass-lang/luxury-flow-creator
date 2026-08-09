// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0425 — The Daily Operating System.
//
// The Daily is not a dashboard. It is a guided workday.
//   • Every actionable item becomes a numbered step.
//   • Every step carries one of four universal colours.
//   • Completed work stays visible, in green, until the next Daily.
//   • Every workspace reports its own colour summary before you open it.
//   • The day closes with a Daily Briefing through each workspace, in order.
//
// This colour language is universal — The Daily, My Workspace, Builder tools
// and every future department speak it identically.
// ─────────────────────────────────────────────────────────────────────────────

import type { DailyModel, DailyTarget } from "@/lib/workspace/daily";

export type Lane = "red" | "orange" | "blue" | "green";

export const LANE: Record<Lane, { dot: string; label: string; meaning: string }> = {
  red: { dot: "🔴", label: "Critical", meaning: "Must be completed today." },
  orange: { dot: "🟠", label: "Pending", meaning: "Waiting on approval or on someone else." },
  blue: { dot: "🔵", label: "General", meaning: "Should be done. Can safely wait if it must." },
  green: { dot: "🟢", label: "Complete", meaning: "Finished. It stays visible until tomorrow." },
};

export const LANE_ORDER: Lane[] = ["red", "orange", "blue", "green"];

export type DailyStep = DailyTarget & {
  id: string;
  n: number;
  lane: Lane;
  label: string;
  detail?: string;
  minutes: number;
  delegable: boolean;
  /** Which workspace this step belongs to — used by the Daily Briefing. */
  section: string;
  /** Present for real tasks; approvals are opened rather than ticked. */
  taskId?: string;
};

/** The nine workspaces the Daily Briefing walks through, always in this order. */
export const BRIEFING_ORDER: { id: string; title: string; note: string; href?: string }[] = [
  { id: "continue-working", title: "Continue Working", note: "Exactly where you stopped." },
  { id: "fv-studios", title: "FV Studios", note: "Creative work in production.", href: "/studio" },
  { id: "launch-feedback", title: "Launch Feedback", note: "What members told us today." },
  { id: "founder-command", title: "Founder Command Center", note: "The executive view." },
  { id: "daily-performance", title: "Daily Performance", note: "How the day actually went." },
  { id: "goals", title: "Goals & Vision Map", note: "Distance to each goal." },
  { id: "opportunities", title: "Opportunities", note: "What I don't want you to miss." },
  { id: "approvals", title: "Pending Approvals", note: "Everything waiting on you." },
  { id: "priorities", title: "Today's Priorities", note: "The numbered workday." },
];

export type SectionStatus = Record<Lane, number>;

export const EMPTY_STATUS: SectionStatus = { red: 0, orange: 0, blue: 0, green: 0 };

export function countLanes(lanes: Lane[]): SectionStatus {
  const out: SectionStatus = { red: 0, orange: 0, blue: 0, green: 0 };
  for (const l of lanes) out[l] += 1;
  return out;
}

/** Universal task → colour rule. Completion always wins. */
export function laneForTask(
  priority: string,
  opts: { done: boolean; delegated: boolean },
): Lane {
  if (opts.done || priority === "completed") return "green";
  if (opts.delegated) return "orange";
  if (priority === "critical") return "red";
  if (priority === "important") return "orange";
  return "blue";
}

/**
 * The numbered workday. Tasks first, then anything awaiting the member's
 * approval, ordered red → orange → blue → green so the next most important
 * thing is always the next thing on the page.
 */
export function dailySteps(model: DailyModel, done: string[], delegated: string[]): DailyStep[] {
  const rows: Omit<DailyStep, "n">[] = [];

  for (const t of model.tasks) {
    rows.push({
      id: `task-${t.id}`,
      taskId: t.id,
      lane: laneForTask(t.priority, { done: done.includes(t.id), delegated: delegated.includes(t.id) }),
      label: t.label,
      detail: t.detail,
      minutes: t.minutes,
      delegable: t.delegable,
      section: "priorities",
      projectId: t.projectId,
      href: t.href,
    });
  }

  for (const a of model.approvals) {
    rows.push({
      id: `approval-${a.id}`,
      taskId: `approval-${a.id}`,
      lane: done.includes(`approval-${a.id}`) ? "green" : "orange",
      label: a.label,
      detail: `${a.kind} · waiting on your decision`,
      minutes: 5,
      delegable: false,
      section: "approvals",
      projectId: a.projectId,
      href: a.href,
    });
  }

  rows.sort((x, y) => LANE_ORDER.indexOf(x.lane) - LANE_ORDER.indexOf(y.lane));
  return rows.map((r, i) => ({ ...r, n: i + 1 }));
}

export type DailyProgress = { pct: number; complete: number; total: number; bar: string };

export function dailyProgress(steps: DailyStep[]): DailyProgress {
  const total = steps.length;
  const complete = steps.filter((s) => s.lane === "green").length;
  const pct = total ? Math.round((complete / total) * 100) : 100;
  const filled = Math.round((pct / 100) * 10);
  return { pct, complete, total, bar: "█".repeat(filled) + "░".repeat(10 - filled) };
}

export function nextStep(steps: DailyStep[]): DailyStep | null {
  return steps.find((s) => s.lane !== "green") ?? null;
}

/** Status summaries for each workspace shown in the Daily Briefing. */
export function sectionStatuses(model: DailyModel, steps: DailyStep[]): Record<string, SectionStatus> {
  const out: Record<string, SectionStatus> = {};

  out.priorities = countLanes(steps.filter((s) => s.section === "priorities").map((s) => s.lane));
  out.approvals = countLanes(steps.filter((s) => s.section === "approvals").map((s) => s.lane));
  out.opportunities = countLanes(model.opportunities.map(() => "blue" as Lane));
  out.goals = countLanes(model.goals.map((g) => (g.pct >= 100 ? "green" : g.pct > 0 ? "blue" : "orange")));
  out["daily-performance"] = countLanes(
    model.performance.map((m) => (m.status === "live" ? "green" : m.status === "awaiting" ? "orange" : "blue")),
  );
  out["founder-command"] = countLanes(
    model.executive.map((m) => (m.status === "live" ? "green" : m.status === "awaiting" ? "orange" : "blue")),
  );
  out["continue-working"] = countLanes(model.resume.map(() => "blue" as Lane));
  out["fv-studios"] = countLanes(["blue"]);
  out["launch-feedback"] = countLanes(["blue"]);

  return out;
}

/** Plain-language line Frassy uses for "what's next?". */
export function nextLine(steps: DailyStep[]): string {
  const next = nextStep(steps);
  if (!next) return "Everything on today's Daily is green. Let's close the day with your Daily Briefing.";
  return `Number ${next.n} — ${LANE[next.lane].dot} ${next.label}. ${LANE[next.lane].meaning}`;
}

// ── Cinematic scenery ────────────────────────────────────────────────────────
// The Daily sits on quiet Jamaican landscape photography. It changes daily and
// never competes with the words on top of it.

export const DAILY_SCENES = [
  "daily-scene-coast",
  "daily-scene-waterfall",
  "daily-scene-mountain",
  "daily-scene-villa",
] as const;

export function sceneIndexFor(date = new Date()): number {
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86_400_000,
  );
  return dayOfYear % DAILY_SCENES.length;
}
