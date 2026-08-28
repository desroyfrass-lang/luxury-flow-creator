// Types and pure helpers for the Daily priority engine.
// Kept out of the .functions file: server-function modules must contain only
// imports, types and server-function declarations.

import type { WorkItem } from "@/lib/daily/work.functions";

export type DailySource =
  | "workshop"
  | "vault"
  | "opportunity"
  | "academy"
  | "money"
  | "frass-hill";

export type DailyCard = {
  id: string;
  /** Present when the card is a real work item the member can act on. */
  workItemId?: string;
  title: string;
  detail?: string;
  source: DailySource;
  sourceLabel: string;
  href?: string;
  vaultName?: string;
  dueAt?: string;
  scheduledFor?: string;
  priority: number;
  score: number;
  completedAt?: string;
};

export type DailyBoard = {
  today: DailyCard[];
  continueWork: DailyCard[];
  schedule: DailyCard[];
  moneyMoves: DailyCard[];
  opportunities: DailyCard[];
  learn: DailyCard[];
  frassHill: DailyCard[];
  doneToday: DailyCard[];
  /** Honest counts so Frassy and the UI never guess. */
  summary: {
    activeWork: number;
    overdue: number;
    dueToday: number;
    completedToday: number;
    vaults: number;
    hasAnything: boolean;
  };
};

export type Sb = { from: (t: string) => any };

export const DAY = 24 * 60 * 60 * 1000;

export function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function scoreFor(item: {
  priority: number;
  dueAt?: string | null;
  scheduledFor?: string | null;
  updatedAt?: string | null;
}): number {
  let score = (4 - Math.min(3, Math.max(1, item.priority))) * 20; // explicit priority
  const now = Date.now();
  if (item.dueAt) {
    const due = new Date(item.dueAt).getTime();
    if (due < now) score += 60; // overdue
    else if (due - now < DAY) score += 40; // due today
    else if (due - now < 3 * DAY) score += 15;
  }
  if (item.scheduledFor) {
    const s = new Date(item.scheduledFor + "T00:00:00").getTime();
    if (s <= now + DAY) score += 25;
  }
  if (item.updatedAt) {
    const age = now - new Date(item.updatedAt).getTime();
    if (age < 3 * DAY) score += 10; // recently active work
  }
  return score;
}

export async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}


export type { WorkItem };
