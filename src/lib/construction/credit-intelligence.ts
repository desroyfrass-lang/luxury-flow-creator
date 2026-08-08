// FRASS-0200 (Amendment) — Development Credit Intelligence & Budget Management.
//
// "The Founder never edits production directly. The Founder edits the Blueprint."
//
// Frassy must never let the Founder spend development credits blindly. Every
// architectural change carries an honest, conservative forecast before approval,
// and the Founder is warned before the platform runs low.

import type { BlueprintComponent } from "./blueprint-registry";

export type ComplexityTier = "Micro" | "Small" | "Medium" | "Large" | "Major";

export type CreditEstimate = {
  tier: ComplexityTier;
  /** Conservative low / high credit forecast for the change. */
  min: number;
  max: number;
  /** Plain-language reasons the estimate landed where it did. */
  drivers: string[];
  risk: "Low" | "Moderate" | "High";
  /** What the Founder gets for the spend. */
  value: string;
  /** Cheaper alternative Frassy should always offer when one exists. */
  alternative?: string;
};

const TIER_RANGE: Record<ComplexityTier, [number, number]> = {
  Micro: [1, 2],
  Small: [2, 4],
  Medium: [4, 8],
  Large: [8, 16],
  Major: [16, 30],
};

const MICRO_ACTIONS = ["pin", "hide", "collapse", "expand", "rename", "small", "medium", "large", "full width", "automatic"];
const SMALL_ACTIONS = ["move up", "move down", "move left", "move right", "background", "spacing", "typography", "shape", "cards"];
const LARGE_ACTIONS = ["new panel", "new section", "duplicate", "merge", "archive", "lighting", "animation", "motion", "glass", "materials"];

/**
 * Honest, conservative forecast. Weighted by the action itself, then by how much
 * of the platform depends on the component being changed.
 */
export function estimateChange(component: BlueprintComponent, action: string): CreditEstimate {
  const a = action.toLowerCase();
  const drivers: string[] = [];

  let tier: ComplexityTier = "Medium";
  if (MICRO_ACTIONS.includes(a)) {
    tier = "Micro";
    drivers.push("Presentation-only change — no new logic");
  } else if (SMALL_ACTIONS.includes(a)) {
    tier = "Small";
    drivers.push("Layout or styling change inside an existing component");
  } else if (a.startsWith("connect") || a === "disconnect") {
    tier = "Large";
    drivers.push("Creates or removes a dependency between systems");
  } else if (LARGE_ACTIONS.includes(a)) {
    tier = "Large";
    drivers.push("Structural change — new surface, merge, or motion system work");
  } else {
    drivers.push("Behavioural change requiring review of existing rules");
  }

  // Reach multiplies cost: dependencies, connected systems, and audience.
  const reach = component.dependencies.length + component.connectedSystems.length;
  if (reach >= 8) {
    drivers.push(`${reach} dependencies and connected systems must be re-verified`);
    tier = bump(tier);
  } else if (reach >= 5) {
    drivers.push(`${reach} dependencies and connected systems to check`);
  }

  const everyone = component.usersAffected.includes("Everyone") || component.usersAffected.length >= 4;
  if (everyone) {
    drivers.push("Every role sees this component — wider testing required");
    if (tier !== "Micro") tier = bump(tier);
  } else {
    drivers.push(`Affects ${component.usersAffected.join(", ")}`);
  }

  const [min, max] = TIER_RANGE[tier];
  const risk: CreditEstimate["risk"] =
    tier === "Major" || (everyone && reach >= 8) ? "High" : tier === "Micro" || tier === "Small" ? "Low" : "Moderate";

  const value =
    tier === "Micro" || tier === "Small"
      ? "Immediate visible improvement with almost no architectural risk."
      : tier === "Medium"
        ? "A meaningful improvement to how this part of Frass OS works."
        : "A structural improvement — worth doing deliberately, not casually.";

  const alternative =
    tier === "Large" || tier === "Major"
      ? `A ${tier === "Major" ? "Small" : "Micro"} version of this — adjusting ${component.label} in place instead of restructuring it — would achieve most of the benefit for roughly ${TIER_RANGE[tier === "Major" ? "Small" : "Micro"].join("–")} credits.`
      : undefined;

  return { tier, min, max, drivers, risk, value, alternative };
}

function bump(t: ComplexityTier): ComplexityTier {
  const order: ComplexityTier[] = ["Micro", "Small", "Medium", "Large", "Major"];
  return order[Math.min(order.indexOf(t) + 1, order.length - 1)]!;
}

/** Batching several approved changes into one implementation is always cheaper. */
export function estimateBatch(estimates: CreditEstimate[]): { min: number; max: number; saving: number } {
  if (estimates.length === 0) return { min: 0, max: 0, saving: 0 };
  const min = estimates.reduce((n, e) => n + e.min, 0);
  const max = estimates.reduce((n, e) => n + e.max, 0);
  // Shared context and one verification pass instead of many.
  const saving = estimates.length > 1 ? Math.round(max * 0.2) : 0;
  return { min: Math.max(1, min - Math.round(saving * 0.5)), max: Math.max(1, max - saving), saving };
}

// ── Budget state — Founder-owned, never invented ───────────────────────────

export type CreditBudget = {
  /** Credits the Founder has told us are available. null = not recorded yet. */
  balance: number | null;
  /** Development budget the Founder set for this month. null = no budget set. */
  monthlyBudget: number | null;
  updatedAt: string | null;
};

export type CreditSpend = {
  id: string;
  label: string;
  credits: number;
  at: string;
};

const BUDGET_KEY = "frass.construction.budget";
const SPEND_KEY = "frass.construction.spend";

export const EMPTY_BUDGET: CreditBudget = { balance: null, monthlyBudget: null, updatedAt: null };

export function loadBudget(): CreditBudget {
  if (typeof window === "undefined") return EMPTY_BUDGET;
  try {
    const raw = window.localStorage.getItem(BUDGET_KEY);
    return raw ? { ...EMPTY_BUDGET, ...(JSON.parse(raw) as CreditBudget) } : EMPTY_BUDGET;
  } catch {
    return EMPTY_BUDGET;
  }
}

export function saveBudget(next: Partial<CreditBudget>): CreditBudget {
  const merged: CreditBudget = { ...loadBudget(), ...next, updatedAt: new Date().toISOString() };
  if (typeof window !== "undefined") window.localStorage.setItem(BUDGET_KEY, JSON.stringify(merged));
  return merged;
}

export function loadSpend(): CreditSpend[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SPEND_KEY);
    return raw ? (JSON.parse(raw) as CreditSpend[]) : [];
  } catch {
    return [];
  }
}

export function recordSpend(label: string, credits: number): CreditSpend[] {
  const entry: CreditSpend = { id: `${Date.now()}`, label, credits, at: new Date().toISOString() };
  const all = [entry, ...loadSpend()].slice(0, 200);
  if (typeof window !== "undefined") window.localStorage.setItem(SPEND_KEY, JSON.stringify(all));
  return all;
}

export function spentThisMonth(entries = loadSpend()): number {
  const now = new Date();
  return entries
    .filter((e) => {
      const d = new Date(e.at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((n, e) => n + e.credits, 0);
}

export type BudgetWarning = {
  level: "none" | "notice" | "warning" | "critical";
  message: string;
};

/** Frassy warns before the platform runs low — never after. */
export function budgetWarning(budget: CreditBudget, forecastMax = 0): BudgetWarning {
  const spent = spentThisMonth();
  if (budget.monthlyBudget && spent + forecastMax > budget.monthlyBudget) {
    return {
      level: "critical",
      message: `This would put development spend at ${spent + forecastMax} credits against your ${budget.monthlyBudget}-credit budget for this month. I'd recommend we stage it, or raise the budget deliberately.`,
    };
  }
  if (budget.balance === null) {
    return {
      level: "notice",
      message:
        "I don't have your current credit balance. Record it below and I'll forecast every architectural change against it before you approve anything.",
    };
  }
  const remaining = budget.balance - forecastMax;
  if (remaining <= 0) {
    return {
      level: "critical",
      message: `This change is forecast at up to ${forecastMax} credits and your recorded balance is ${budget.balance}. Top up before approving, or choose the lighter alternative.`,
    };
  }
  if (budget.balance <= 25 || remaining / budget.balance < 0.15) {
    return {
      level: "warning",
      message: `Credits are running low — ${budget.balance} recorded, roughly ${remaining} left after this change. Let's prioritise what matters most before we spend.`,
    };
  }
  if (budget.balance <= 60) {
    return {
      level: "notice",
      message: `${budget.balance} credits recorded. Comfortable, but worth batching related changes together from here.`,
    };
  }
  return { level: "none", message: `${budget.balance} credits recorded · ${spent} spent this month.` };
}

export function formatEstimate(e: CreditEstimate): string {
  return `${e.tier} · ${e.min}–${e.max} credits · ${e.risk} risk`;
}
