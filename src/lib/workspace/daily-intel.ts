// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0210 — Daily intelligence layer.
//
//   • Honest data      — if live data does not exist, the Daily shows real zeros.
//   • My Day           — the single summary of today at the very top.
//   • Welcome ritual    — one short moment of inspiration, on/off by the Builder.
//   • Natural language  — the Daily is navigable by conversation, not clicks alone.
// ─────────────────────────────────────────────────────────────────────────────

import {
  DATA_STATUS,
  type DailyMetric,
  type DailyModel,
  type DailyTarget,
} from "@/lib/workspace/daily";

// ── Honest data ──────────────────────────────────────────────────────────────
// Trust is more important than a beautiful dashboard. Demonstration numbers are
// never shown by default; zero is shown until real records exist.

const DEMO_KEY = "frass.daily.demo";

export function demoDataEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(DEMO_KEY) === "on";
}

export function setDemoData(on: boolean): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DEMO_KEY, on ? "on" : "off");
}

/** Anything that is a placeholder becomes a truthful zero. */
function zeroValue(value: string): string {
  if (/\$/.test(value)) return "$0.00";
  if (/\d/.test(value)) return value.replace(/[\d.,]+/, "0");
  return "None yet";
}

function honestMetric(m: DailyMetric): DailyMetric {
  if (m.status !== "sample") return m;
  return {
    ...m,
    value: zeroValue(m.value),
    trend: undefined,
    status: "awaiting",
    sources: m.sources?.filter((s) => s.status !== "sample"),
    records: [],
  };
}

/** Apply the truth rule to a whole Daily unless demonstration data is enabled. */
export function honestDaily(model: DailyModel, demo = demoDataEnabled()): DailyModel {
  if (demo) return model;
  return {
    ...model,
    wins: [],
    briefing: model.briefing.map(honestMetric),
    performance: model.performance.map(honestMetric),
    executive: model.executive.map(honestMetric),
    goals: model.goals.map((g) => (g.status === "sample" ? { ...g, pct: 0, note: "No data yet", status: "awaiting" as const } : g)),
    activity: [],
  };
}

export const HONEST_NOTE =
  "No live business records exist yet, so every number reads zero. Nothing here is simulated.";

export function statusLabel(status: DailyMetric["status"]): string {
  return `${DATA_STATUS[status].dot} ${DATA_STATUS[status].label}`;
}

// ── My Day ───────────────────────────────────────────────────────────────────

export type MyDay = {
  pct: number;
  remainingMinutes: number;
  tasks: number;
  delegated: number;
  awaitingApproval: number;
  completed: number;
};

export function myDay(model: DailyModel, done: string[], delegated: string[]): MyDay {
  const all = model.tasks;
  const active = all.filter((t) => t.priority !== "completed");
  const finished = all.filter((t) => t.priority === "completed" || done.includes(t.id));
  const carried = active.filter((t) => delegated.includes(t.id));
  const remaining = active
    .filter((t) => !done.includes(t.id) && !delegated.includes(t.id))
    .reduce((n, t) => n + t.minutes, 0);
  const total = all.length || 1;
  return {
    pct: Math.round(((finished.length + carried.length) / total) * 100),
    remainingMinutes: remaining,
    tasks: active.length,
    delegated: carried.length,
    awaitingApproval: model.approvals.length,
    completed: finished.length,
  };
}

// ── Daily welcome ritual ─────────────────────────────────────────────────────

const RITUAL_KEY = "frass.daily.ritual";

export type Ritual = { kind: string; text: string };

const RITUALS: Ritual[] = [
  { kind: "Founder insight", text: "Build the thing you'd be proud to hand to your grandmother. Standards travel further than speed." },
  { kind: "Business principle", text: "Margin is the only revenue you actually keep. Protect it before you promise it to anyone." },
  { kind: "Community milestone", text: "Every Builder who finishes one small thing today moves the whole hill forward." },
  { kind: "Motivation", text: "You don't need the whole staircase. One honest step, done properly, is today's work." },
  { kind: "Foundation story", text: "Everything we sell carries someone home. Commerce here is service with a receipt." },
  { kind: "Builder success", text: "Somebody started here with nothing but a phone and a plan. Consistency did the rest." },
  { kind: "Quote", text: "\"Elegance is refusal.\" Say no to the ninety, so the ten can be excellent." },
];

export function ritualEnabled(): boolean {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(RITUAL_KEY) !== "off";
}

export function setRitualEnabled(on: boolean): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(RITUAL_KEY, on ? "on" : "off");
}

/** Fresh, never repetitive — rotates with the calendar day. */
export function ritualForToday(date = new Date()): Ritual {
  const seed = Math.floor(date.getTime() / 86_400_000);
  return RITUALS[seed % RITUALS.length];
}

// ── Natural language navigation ──────────────────────────────────────────────

export type DailyCommand = { label: string; target: DailyTarget } | { label: string; explainMetric: string } | null;

const ORDINALS: Record<string, number> = {
  first: 0, "1st": 0, one: 0,
  second: 1, "2nd": 1, two: 1,
  third: 2, "3rd": 2, three: 2,
  fourth: 3, "4th": 3, four: 3,
  fifth: 4, "5th": 4, five: 4,
};

/**
 * Frassy understands intent, not syntax.
 * "Let's do the second one." · "Show me the orders." · "Open Marketplace."
 * "Continue yesterday's work." · "Take me to vendor 4."
 */
export function resolveDailyCommand(rawInput: string, model: DailyModel): DailyCommand {
  const q = rawInput.trim().toLowerCase();
  if (!q) return null;

  const activeTasks = model.tasks.filter((t) => t.priority !== "completed");

  // "the second one" / "number 3" — positional priorities.
  const ordinalWord = Object.keys(ORDINALS).find((w) => new RegExp(`\\b${w}\\b`).test(q));
  const numeric = q.match(/\b(?:number|task|priority)\s*(\d+)\b/);
  if (ordinalWord || numeric) {
    const i = numeric ? Number(numeric[1]) - 1 : ORDINALS[ordinalWord as string];
    const task = activeTasks[i];
    if (task && /(do|start|open|take|let'?s|begin|continue)/.test(q)) {
      return { label: task.label, target: task };
    }
  }

  // "continue" / "finish yesterday" — resume where work stopped.
  if (/(continue|resume|yesterday|where (we|i) (left|stopped)|pick up)/.test(q)) {
    const r = model.resume[0];
    if (r) return { label: r.label, target: r };
  }

  // "what are those 18 orders" / "show me revenue" — metrics and their records.
  const metrics = [...model.briefing, ...model.performance, ...model.executive];
  const metric = metrics.find((m) => q.includes(m.label.toLowerCase()));
  if (metric) {
    if (/(what|explain|mean|where|come from|breakdown|source)/.test(q)) {
      return { label: metric.label, explainMetric: metric.label };
    }
    return { label: metric.label, target: metric };
  }

  // Approvals, opportunities, goals, tasks by name.
  const byName =
    activeTasks.find((t) => q.includes(t.label.toLowerCase().slice(0, 14))) ??
    model.approvals.find((a) => q.includes(a.label.toLowerCase().slice(0, 14))) ??
    model.goals.find((g) => q.includes(g.label.toLowerCase().slice(0, 12)));
  if (byName) return { label: byName.label, target: byName };

  // Destinations by keyword.
  const DEST: { keys: RegExp; label: string; target: DailyTarget }[] = [
    { keys: /marketplace/, label: "Marketplace", target: { projectId: "marketplace" } },
    { keys: /vendor/, label: "Vendors", target: { href: "/admin/partner-vendors" } },
    { keys: /affiliate|commission/, label: "Affiliate", target: { href: "/workspace/affiliate" } },
    { keys: /academy|lesson|learn/, label: "Academy", target: { href: "/academy" } },
    { keys: /vault/, label: "Builder Vault", target: { href: "/vault" } },
    { keys: /foundation/, label: "Foundation", target: { projectId: "foundation" } },
    { keys: /product|catalog|population|sourcing/, label: "Product Population", target: { projectId: "product-population" } },
    { keys: /approval|waiting on me/, label: "Approvals", target: { href: "/admin/approvals" } },
    { keys: /founder|dashboard|launch/, label: "Founder Dashboard", target: { href: "/control-room" } },
    { keys: /message|inbox|notification/, label: "Messages", target: { href: "/notifications" } },
    { keys: /kids/, label: "Kids World", target: { projectId: "kids-world" } },
    { keys: /luxury|bridal/, label: "Luxury House", target: { projectId: "luxury-house" } },
  ];
  const dest = DEST.find((d) => d.keys.test(q));
  if (dest) return { label: dest.label, target: dest.target };

  return null;
}
