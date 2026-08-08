// Platform Status Center — the executive heartbeat of Frass OS.
//
// Honest by construction: a light is only green when a real signal says so.
// Anything unverified reads grey, never green, and says how to verify it.

import { loadBudget, spentThisMonth } from "@/lib/construction/credit-intelligence";
import { loadDailyState } from "@/lib/workspace/daily";

export type StatusLevel = "green" | "amber" | "orange" | "red" | "unknown";

export type StatusRow = {
  id: string;
  label: string;
  level: StatusLevel;
  detail: string;
  /** Where the number came from — nothing is unexplainable. */
  source: string;
  to?: string;
};

export const STATUS_DOT: Record<StatusLevel, string> = {
  green: "🟢",
  amber: "🟡",
  orange: "🟠",
  red: "🔴",
  unknown: "⚪",
};

const UNVERIFIED = "Not verified — no live signal is connected yet.";

/** Founder-recorded operational counters (population, vendor review, backups). */
export type OpsCounters = {
  populationDone: number | null;
  populationTotal: number | null;
  vendorsReviewed: number | null;
  vendorsTotal: number | null;
  lastBackupAt: string | null;
};

const OPS_KEY = "frass.platform.ops";

export const EMPTY_OPS: OpsCounters = {
  populationDone: null,
  populationTotal: null,
  vendorsReviewed: null,
  vendorsTotal: null,
  lastBackupAt: null,
};

export function loadOps(): OpsCounters {
  if (typeof window === "undefined") return EMPTY_OPS;
  try {
    const raw = window.localStorage.getItem(OPS_KEY);
    return raw ? { ...EMPTY_OPS, ...(JSON.parse(raw) as OpsCounters) } : EMPTY_OPS;
  } catch {
    return EMPTY_OPS;
  }
}

export function saveOps(next: Partial<OpsCounters>): OpsCounters {
  const merged = { ...loadOps(), ...next };
  if (typeof window !== "undefined") window.localStorage.setItem(OPS_KEY, JSON.stringify(merged));
  return merged;
}

function ratio(done: number | null, total: number | null): StatusLevel {
  if (done === null || total === null || total === 0) return "unknown";
  const pct = done / total;
  if (pct >= 1) return "green";
  if (pct >= 0.5) return "amber";
  return "orange";
}

export type StatusInputs = {
  /** The app rendered this panel, so the site is serving. */
  online: boolean;
  /** True when the AI Gateway answered this session. */
  aiOk: boolean | null;
  /** True when a commerce backend is connected. */
  paymentsConnected: boolean | null;
  ops?: OpsCounters;
};

export function platformStatus(input: StatusInputs): StatusRow[] {
  const ops = input.ops ?? loadOps();
  const budget = loadBudget();
  const daily = loadDailyState();
  const dailyDone = daily.done.length > 0 || daily.delegated.length > 0;

  const creditLevel: StatusLevel =
    budget.balance === null
      ? "unknown"
      : budget.balance <= 25
        ? "red"
        : budget.balance <= 100
          ? "orange"
          : "green";

  return [
    {
      id: "website",
      label: "Website",
      level: input.online ? "green" : "red",
      detail: input.online ? "Online and serving" : "Not responding",
      source: "This session is being served by the live app",
      to: "/",
    },
    {
      id: "payments",
      label: "Payments",
      level: input.paymentsConnected === null ? "unknown" : input.paymentsConnected ? "green" : "orange",
      detail:
        input.paymentsConnected === null
          ? UNVERIFIED
          : input.paymentsConnected
            ? "Checkout connected"
            : "No payment provider connected",
      source: "Storefront checkout configuration",
      to: "/admin",
    },
    {
      id: "population",
      label: "Product Population",
      level: ratio(ops.populationDone, ops.populationTotal),
      detail:
        ops.populationDone === null || ops.populationTotal === null
          ? "No target recorded yet"
          : `${ops.populationDone} / ${ops.populationTotal} products placed`,
      source: "Product Population project counters",
      to: "/room",
    },
    {
      id: "marketplace",
      label: "Marketplace",
      level: "unknown",
      detail: UNVERIFIED,
      source: "Marketplace vendor and order signals",
      to: "/workspace/merch",
    },
    {
      id: "vendors",
      label: "Vendor Review",
      level: ratio(ops.vendorsReviewed, ops.vendorsTotal),
      detail:
        ops.vendorsReviewed === null || ops.vendorsTotal === null
          ? "No vendor review in progress"
          : `${ops.vendorsReviewed} of ${ops.vendorsTotal} scorecards complete`,
      source: "Vendor scorecard counters",
      to: "/admin/partner-vendors",
    },
    {
      id: "foundation",
      label: "Foundation",
      level: "unknown",
      detail: UNVERIFIED,
      source: "Foundation initiative records",
      to: "/foundation",
    },
    {
      id: "daily",
      label: "The Daily",
      level: dailyDone ? "green" : "amber",
      detail: dailyDone ? "Reviewed today" : "Not reviewed yet today",
      source: "Today's Daily state",
    },
    {
      id: "credits",
      label: "Development Credits",
      level: creditLevel,
      detail:
        budget.balance === null
          ? "No balance recorded"
          : `${budget.balance} recorded · ${spentThisMonth()} forecast spend this month`,
      source: "Founder-recorded balance (Development Credits)",
      to: "/founder",
    },
    {
      id: "backup",
      label: "Backup",
      level: ops.lastBackupAt ? "green" : "unknown",
      detail: ops.lastBackupAt
        ? `Last recorded ${new Date(ops.lastBackupAt).toLocaleDateString()}`
        : "No backup recorded",
      source: "Founder-recorded backup log",
    },
    {
      id: "ai",
      label: "AI Services",
      level: input.aiOk === null ? "unknown" : input.aiOk ? "green" : "red",
      detail:
        input.aiOk === null ? "Not checked this session" : input.aiOk ? "Frassy responding normally" : "Frassy is not responding",
      source: "Live check against the AI Gateway",
      to: "/frassy",
    },
  ];
}

export function statusHeadline(rows: StatusRow[]): string {
  const red = rows.filter((r) => r.level === "red").length;
  const attention = rows.filter((r) => r.level === "orange" || r.level === "amber").length;
  const unknown = rows.filter((r) => r.level === "unknown").length;
  if (red) return `${red} system${red > 1 ? "s" : ""} need immediate attention.`;
  if (attention) return `${attention} area${attention > 1 ? "s" : ""} in progress or worth a look.`;
  if (unknown) return `Everything checked is healthy · ${unknown} signal${unknown > 1 ? "s" : ""} not connected yet.`;
  return "Every system is healthy.";
}
