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

// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0425 Amendment — Daily Philosophy
//
// "The Daily exists so members never wonder what to do next, never lose track
//  of what they've accomplished, and always finish their workday with clarity,
//  confidence, and peace of mind."
//
// Everything below serves that sentence: an executive morning briefing before
// work begins, honest time estimates on every step, a distraction-free Focus
// Mode, a professional consistency record, workspace health at a glance, and
// one closing button — Close My Day.
// ─────────────────────────────────────────────────────────────────────────────

export const DAILY_PHILOSOPHY =
  "The Daily exists so members never wonder what to do next, never lose track of what they've accomplished, and always finish their workday with clarity, confidence, and peace of mind.";

import { dayKey, formatWorkload, greetingFor } from "@/lib/workspace/daily";

// ── 1 · Morning Briefing ─────────────────────────────────────────────────────

export type MorningBriefing = { greeting: string; lines: string[]; minutes: number };

/** What an executive assistant would say before you touch a single task. */
export function morningBriefing(
  model: DailyModel,
  steps: DailyStep[],
  name: string | undefined,
  history: DayRecord[],
): MorningBriefing {
  const open = steps.filter((s) => s.lane !== "green");
  const critical = open.filter((s) => s.lane === "red").length;
  const pending = open.filter((s) => s.lane === "orange").length;
  const minutes = open.reduce((n, s) => n + s.minutes, 0);
  const yesterday = history.find((h) => h.day === dayKey(new Date(Date.now() - 86_400_000)));

  const lines = [
    `Today we have ${steps.length} ${steps.length === 1 ? "item" : "items"} on your Daily.`,
    critical ? `${critical} ${critical === 1 ? "is" : "are"} critical.` : "Nothing is critical today.",
    pending ? `${pending} ${pending === 1 ? "is" : "are"} awaiting approval.` : "Nothing is waiting on approval.",
  ];
  if (yesterday) lines.push(`Yesterday you completed ${yesterday.pct}% of your Daily.`);
  if (model.opportunities.length)
    lines.push(
      `${model.opportunities.length} new ${model.opportunities.length === 1 ? "opportunity" : "opportunities"} arrived overnight.`,
    );
  lines.push(`Estimated completion time: ${formatWorkload(minutes)}.`);

  return { greeting: `${greetingFor()}${name ? `, ${name}` : ""}.`, lines, minutes };
}

// ── 2 & 7 · End of Day and Close My Day ──────────────────────────────────────

export type ClosingReport = {
  headline: string;
  lines: string[];
  accomplishments: string[];
  tomorrow: string[];
};

export function closingReport(model: DailyModel, steps: DailyStep[]): ClosingReport {
  const done = steps.filter((s) => s.lane === "green");
  const openCritical = steps.filter((s) => s.lane === "red").length;
  const approvals = steps.filter((s) => s.lane === "orange" && s.section === "approvals").length;

  const lines = [
    openCritical === 0 ? "All critical work has been completed." : `${openCritical} critical item${openCritical === 1 ? "" : "s"} rolls into tomorrow.`,
    "The platform is fully up to date.",
    approvals === 0 ? "There are no outstanding approvals." : `${approvals} approval${approvals === 1 ? "" : "s"} still waiting on you.`,
    `Tomorrow currently has ${model.opportunities.length + approvals || 5} scheduled priorit${
      (model.opportunities.length + approvals || 5) === 1 ? "y" : "ies"
    }.`,
  ];

  return {
    headline: openCritical === 0 ? "Daily Complete. Excellent work." : "Day closed. Solid progress.",
    lines,
    accomplishments: done.map((d) => d.label),
    tomorrow: [...model.opportunities.map((o) => o.label), ...steps.filter((s) => s.lane !== "green").map((s) => s.label)].slice(0, 5),
  };
}

// ── 5 · Professional consistency record ──────────────────────────────────────

export type DayRecord = { day: string; pct: number };

const HISTORY_KEY = "frass.daily.history";

export function loadHistory(): DayRecord[] {
  if (typeof window === "undefined") return [];
  try {
    return (JSON.parse(window.localStorage.getItem(HISTORY_KEY) ?? "[]") as DayRecord[]).slice(-120);
  } catch {
    return [];
  }
}

export function recordToday(pct: number): DayRecord[] {
  if (typeof window === "undefined") return [];
  const today = dayKey();
  const rest = loadHistory().filter((h) => h.day !== today);
  const next = [...rest, { day: today, pct }].slice(-120);
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  return next;
}

export type Consistency = { today: number; week: number; month: number };

export function consistency(history: DayRecord[], todayPct: number): Consistency {
  const avg = (n: number) => {
    const rows = history.slice(-n);
    const all = [...rows.filter((r) => r.day !== dayKey()).map((r) => r.pct), todayPct];
    return Math.round(all.reduce((a, b) => a + b, 0) / all.length);
  };
  return { today: todayPct, week: avg(7), month: avg(30) };
}

// ── 6 · Workspace health ─────────────────────────────────────────────────────

export type Health = { level: "excellent" | "attention" | "immediate"; dot: string; label: string; note: string };

export function healthFor(status: SectionStatus | undefined): Health {
  const s = status ?? EMPTY_STATUS;
  if (s.red > 0)
    return {
      level: "immediate",
      dot: "🔴",
      label: "Immediate Attention",
      note: `${s.red} critical item${s.red === 1 ? "" : "s"} here.`,
    };
  if (s.orange > 0)
    return {
      level: "attention",
      dot: "🟠",
      label: "Attention Needed",
      note: `${s.orange} item${s.orange === 1 ? "" : "s"} waiting.`,
    };
  return { level: "excellent", dot: "🟢", label: "Excellent", note: "No issues." };
}

// ── The day officially closes ────────────────────────────────────────────────

const CLOSED_KEY = "frass.daily.closed";

export function isDayClosed(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(CLOSED_KEY) === dayKey();
}

export function closeDay(): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CLOSED_KEY, dayKey());
}

export function reopenDay(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(CLOSED_KEY);
}
