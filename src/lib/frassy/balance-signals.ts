// FRASS-0479A — reading the member's pace from systems that already exist.
//
// No new tracking system: the signals come from the Daily's own state (open
// tasks, what got done, what carried over) and the working-style engine. This
// module only reads.

import { dailyFor, loadDailyState, type DailyAudience } from "@/lib/workspace/daily";
import type { BalanceSignals } from "./human-balance";

export { NO_SIGNALS, readBalance, balanceBriefing } from "./human-balance";
export type { Balance, BalanceSignals } from "./human-balance";

const HISTORY_KEY = "frassy:balance:history:v1";

type History = { days: string[]; completed: number };

function history(): History {
  if (typeof window === "undefined") return { days: [], completed: 0 };
  try {
    return JSON.parse(window.localStorage.getItem(HISTORY_KEY) ?? '{"days":[],"completed":0}') as History;
  } catch {
    return { days: [], completed: 0 };
  }
}

/** Called by the Daily when it opens — records that this was a working day. */
export function noteWorkingDay(completedToday: number) {
  if (typeof window === "undefined") return;
  const h = history();
  const today = new Date().toISOString().slice(0, 10);
  if (h.days.includes(today)) return;
  const days = [...h.days, today].slice(-30);
  try {
    window.localStorage.setItem(
      HISTORY_KEY,
      JSON.stringify({ days, completed: h.completed + completedToday }),
    );
  } catch {
    /* pace simply reads as settled */
  }
}

function consecutiveDays(days: string[]): number {
  if (days.length === 0) return 0;
  const set = new Set(days);
  let count = 0;
  const cursor = new Date();
  for (let i = 0; i < 30; i += 1) {
    const key = cursor.toISOString().slice(0, 10);
    if (!set.has(key)) break;
    count += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}

export function readBalanceSignals(audience: DailyAudience = "builder"): BalanceSignals | null {
  if (typeof window === "undefined") return null;
  try {
    const model = dailyFor(audience);
    const state = loadDailyState();
    const tasks = model.tasks ?? [];
    const done = new Set(state.done ?? []);
    const openTasks = tasks.filter((t) => !done.has(t.id) && t.priority !== "completed").length;
    const carriedOver = tasks.filter((t) => !done.has(t.id) && t.priority === "critical").length;
    const h = history();
    return {
      openTasks,
      carriedOver,
      completedThisWeek: Math.min(h.completed, 40),
      daysWithoutRest: consecutiveDays(h.days),
      minutesToday: tasks
        .filter((t) => !done.has(t.id) && t.priority !== "completed")
        .reduce((sum, t) => sum + (t.minutes ?? 0), 0),

    };
  } catch {
    return null;
  }
}
