// Types and pure helpers for the Daily priority engine.
// Kept out of the .functions file: server-function modules must contain only
// imports, types and server-function declarations.

import type { WorkItem } from "@/lib/daily/work.functions";
import { BUSINESS_VAULTS } from "@/lib/business/vault-family";
import { fastTrackKey } from "@/lib/builder-os/fast-track-identity";

export type DailySource =
  | "workshop"
  | "vault"
  | "opportunity"
  | "academy"
  | "money"
  | "frass-hill"
  | "fast-track";

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
  /** Truthful financial state of a linked Money Move (never "earned"). */
  statusLabel?: string;
  statusNote?: string;
};

export type DailyBoard = {
  today: DailyCard[];
  continueWork: DailyCard[];
  schedule: DailyCard[];
  moneyMoves: DailyCard[];
  opportunities: DailyCard[];
  learn: DailyCard[];
  frassHill: DailyCard[];
  /** Only the next step of Money Moves this Builder has actually started. */
  fastTracks: DailyCard[];
  doneToday: DailyCard[];
  /** Honest counts so Frassy and the UI never guess. */
  summary: {
    activeWork: number;
    overdue: number;
    dueToday: number;
    completedToday: number;
    vaults: number;
    fastTracksDone: number;
    hasAnything: boolean;
  };
};

export type FastTrackRow = {
  track_key: string;
  vault_key: string;
  parent_move_id: string | null;
  title: string;
  status: string;
  updated_at: string;
};

/**
 * Daily = what to do today. So it shows ONE next Fast Track per Money Move the
 * Builder has genuinely started — never the whole 154-step catalogue.
 * These are context cards: they carry no work-item id and no money meaning.
 */
export function nextFastTrackCards(rows: FastTrackRow[], limit = 3): DailyCard[] {
  const doneKeys = new Set(rows.filter((r) => r.status === "done").map((r) => r.track_key));
  const touchedVaults = new Map<string, string>(); // vault key → most recent touch
  for (const r of rows) {
    const prev = touchedVaults.get(r.vault_key);
    if (!prev || r.updated_at > prev) touchedVaults.set(r.vault_key, r.updated_at);
  }

  const cards: DailyCard[] = [];
  for (const [vaultKey, touchedAt] of [...touchedVaults.entries()].sort((a, b) =>
    b[1].localeCompare(a[1]),
  )) {
    const vault = BUSINESS_VAULTS.find((v) => v.key === vaultKey);
    if (!vault) continue;
    const next = vault.moves.find((m) => !doneKeys.has(fastTrackKey(vaultKey, m.title)));
    if (!next) continue; // every step finished — nothing to nag about
    cards.push({
      id: `fast-track:${fastTrackKey(vaultKey, next.title)}`,
      title: next.title,
      detail: `Next Fast Track in ${vault.label.replace(/ Vault$/, "")} · about ${next.minutes} min`,
      source: "fast-track",
      sourceLabel: vault.label,
      ...(next.to ? { href: next.to } : {}),
      priority: 2,
      score: scoreFor({ priority: 2, updatedAt: touchedAt }),
    });
    if (cards.length >= limit) break;
  }
  return cards;
}

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
