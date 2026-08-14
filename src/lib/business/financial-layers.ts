// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0501 — The Three-Layer Financial Engine
// "Every Money Move Has a Purpose."
//
// Constitutional Amendment · P0 · platform-wide (not just Kanko).
//
// Every member who joins Frass is assumed to have one common reality: they
// need to improve their financial situation. But not every Money Move serves
// the same purpose. Frassy must identify the LAYER before recommending the
// opportunity. Members work all three layers at the same time — the only thing
// that changes day to day is how today's available time is allocated.
//
// This extends the existing Money Moves engine (FRASS-0461). It creates no new
// task system, no second ledger and no duplicate catalogue (FRASS-0494).
// ─────────────────────────────────────────────────────────────────────────────

import type { ObjectiveId } from "./money-moves";

export type LayerId = "immediate-income" | "business-builder" | "financial-freedom";

export type FinancialLayer = {
  id: LayerId;
  /** The member-facing dot. Never a jargon badge. */
  dot: string;
  label: string;
  /** The question this layer answers, in the member's own words. */
  question: string;
  purpose: string;
  /** Plain-English line shown on a Money Move card so the member knows WHY it appeared. */
  because: string;
  examples: string[];
};

export const FINANCIAL_LAYERS: FinancialLayer[] = [
  {
    id: "immediate-income",
    dot: "🟢",
    label: "Immediate Income",
    question: "How do I make money now?",
    purpose: "Immediate financial stability. This layer pays today's bills.",
    because: "Estimated to generate income quickly.",
    examples: [
      "Quick service opportunities",
      "Selling existing products",
      "Fast-paying gigs",
      "Marketplace opportunities",
      "Brokerage opportunities",
      "Consultations",
      "Any ethical opportunity that creates near-term income",
    ],
  },
  {
    id: "business-builder",
    dot: "🔵",
    label: "Business Builder",
    question: "How do I build my long-term businesses?",
    purpose: "Develop sustainable businesses. These are long-term assets that may take months or years to mature.",
    because: "Strengthens the business you are building.",
    examples: [
      "Coco Vintage",
      "Freight Brokerage",
      "Wellness business",
      "Frass Gallery",
      "Music business",
      "Future ventures",
    ],
  },
  {
    id: "financial-freedom",
    dot: "🟣",
    label: "Financial Freedom",
    question: "How do I stop depending on employment altogether?",
    purpose: "Create lasting financial independence.",
    because: "Builds recurring long-term income.",
    examples: [
      "Multiple income streams",
      "Passive income",
      "Business systems",
      "Investments (where appropriate)",
      "Royalties",
      "Licensing",
      "Automated businesses",
    ],
  },
];

export const LAYER_BY_ID = Object.fromEntries(
  FINANCIAL_LAYERS.map((l) => [l.id, l]),
) as Record<LayerId, FinancialLayer>;

/** The one line a member sees on any recommendation. Transparency is required. */
export function layerBadge(id: LayerId): string {
  const l = LAYER_BY_ID[id];
  return `${l.dot} ${l.label} — ${l.because}`;
}

/**
 * Which layer a Money Move belongs to. Derived from the objectives the existing
 * engine already computes, so no move has to be re-catalogued.
 * Frassy must never show a move without a layer.
 */
export function layerForObjectives(objectives: ObjectiveId[]): LayerId {
  if (objectives.includes("earn-today")) return "immediate-income";
  if (objectives.includes("earn-future")) return "financial-freedom";
  if (objectives.includes("milestone")) return "business-builder";
  if (
    objectives.includes("discover") ||
    objectives.includes("convert") ||
    objectives.includes("credibility") ||
    objectives.includes("audience")
  ) {
    return "business-builder";
  }
  return "business-builder";
}

// ── Daily balance ───────────────────────────────────────────────────────────
// The destination never changes. The emphasis does.

/** How much financial pressure the member is under right now. */
export type FinancialPressure = "high" | "moderate" | "covered";

export type LayerAllocation = {
  layer: LayerId;
  minutes: number;
  /** Share of today's available time, 0–100. */
  pct: number;
};

export type DailyBalance = {
  pressure: FinancialPressure;
  availableMinutes: number;
  allocation: LayerAllocation[];
  /** Here's how it works: why today looks the way it does. */
  explanation: string;
};

const WEIGHTS: Record<FinancialPressure, Record<LayerId, number>> = {
  // Bills are urgent — most of today goes to money that lands soon.
  high: { "immediate-income": 0.75, "business-builder": 0.17, "financial-freedom": 0.08 },
  // Kanko's reality: benefits cover today, so build while there is room.
  moderate: { "immediate-income": 0.5, "business-builder": 0.37, "financial-freedom": 0.13 },
  // Bills are covered — shift weight to assets and lasting freedom.
  covered: { "immediate-income": 0.25, "business-builder": 0.45, "financial-freedom": 0.3 },
};

const EXPLAIN: Record<FinancialPressure, string> = {
  high: "Money needs to land soon, so most of today goes to income you can actually collect this week. We still keep a little time for what you're building, so tomorrow isn't only about today.",
  moderate: "Today's bills are handled for now, so we split the day: earn something real, and use the calm window to build the business that replaces the paycheck.",
  covered: "Your bills are covered, so most of today goes into assets — the businesses and systems that keep paying after you close the laptop.",
};

/**
 * Turn whatever time a member actually has into a three-layer plan.
 * Never fabricates time. If a member has 30 minutes, the plan is 30 minutes.
 */
export function balanceDay(availableMinutes: number, pressure: FinancialPressure): DailyBalance {
  const minutes = Math.max(0, Math.round(availableMinutes));
  const w = WEIGHTS[pressure];
  const raw = FINANCIAL_LAYERS.map((l) => ({
    layer: l.id,
    exact: minutes * (w[l.id] ?? 0),
  }));
  // Round in 5-minute steps so the plan reads like a human wrote it.
  let used = 0;
  const allocation: LayerAllocation[] = raw.map((r, i) => {
    const isLast = i === raw.length - 1;
    const m = isLast ? Math.max(0, minutes - used) : Math.round(r.exact / 5) * 5;
    used += m;
    return { layer: r.layer, minutes: m, pct: minutes ? Math.round((m / minutes) * 100) : 0 };
  });
  return { pressure, availableMinutes: minutes, allocation, explanation: EXPLAIN[pressure] };
}

/** "60 minutes on Immediate Income · 45 on Coco Vintage · 15 on freedom systems" */
export function balanceSentence(balance: DailyBalance): string {
  return balance.allocation
    .filter((a) => a.minutes > 0)
    .map((a) => `${a.minutes} min · ${LAYER_BY_ID[a.layer].label}`)
    .join("   ");
}
