// ─────────────────────────────────────────────────────────────────────────────
// SPEC-BLUEPRINT-001-FINAL §2 — Money Move Lifecycle & Nested Hierarchy.
//
//   Money Move (business objective)
//        └── Fast Tracks (guided steps)
//                └── Ready to Build
//                        └── Workshop (creation)
//                                └── Monetization (live endpoint)
//
// One nested component in the Daily. No separate, floating step lists — those
// are Retired Systems. This model is assembled from the existing Vault family
// (FRASS-0503), so nothing is duplicated.
// ─────────────────────────────────────────────────────────────────────────────

import { BUSINESS_VAULTS, type BusinessVault, type VaultMove } from "@/lib/business/vault-family";
import {
  PRIORITY_META,
  priorityOf,
  type PriorityMap,
  type VaultPriority,
} from "@/lib/builder-os/vault-priority";
import {
  FAST_TRACK_LEGACY_STORAGE_KEY,
  fastTrackKey,
  legacyFastTrackId,
  parentMoveIdForVault,
} from "@/lib/builder-os/fast-track-identity";

export type LifecycleStage =
  | "money-move"
  | "fast-tracks"
  | "ready-to-build"
  | "workshop"
  | "monetization";

export const LIFECYCLE: { id: LifecycleStage; label: string; everyday: string; emoji: string }[] = [
  {
    id: "money-move",
    label: "Money Move",
    emoji: "🎯",
    everyday: "The goal worth money.",
  },
  {
    id: "fast-tracks",
    label: "Fast Tracks",
    emoji: "⚡",
    everyday: "The small steps that get you there.",
  },
  {
    id: "ready-to-build",
    label: "Ready to Build",
    emoji: "🚪",
    everyday: "Thinking is done. Time to make it.",
  },
  {
    id: "workshop",
    label: "Workshop",
    emoji: "🛠",
    everyday: "The room where the work happens.",
  },
  {
    id: "monetization",
    label: "Monetization",
    emoji: "💰",
    everyday: "A real place people can pay you.",
  },
];

export type FastTrack = {
  /** Legacy position-based id — kept only so old browser ticks can migrate. */
  id: string;
  /** Stable account-backed identity: ft.<vault-key>.<step-slug>. */
  key: string;
  /** Step 1 catalogue Money Move, only where safely determinable. */
  parentMoveId: string | null;
  vaultKey: string;
  title: string;
  minutes: number;
  /** Where in Frass this step actually happens. Never an invented destination. */
  to?: string;
  stage: VaultMove["stage"];
  done: boolean;
};

export type MoneyMove = {
  id: string;
  vaultKey: string;
  emoji: string;
  title: string;
  everyday: string;
  priority: VaultPriority;
  fastTracks: FastTrack[];
  minutes: number;
  completed: number;
  pct: number;
  /** Which lifecycle stage this Money Move currently sits at. */
  stage: LifecycleStage;
  /** The FRASS-0480 endpoint this objective must finish at. */
  monetizationOutcome: string;
  /** The Workshop destination for Ready to Build. */
  workshopTo: string;
};

/**
 * DEPRECATED browser store. The Builder's account
 * (public.fast_track_progress) is authoritative. This is read ONCE so old
 * ticks can be moved into the account, then cleared. Never written again.
 */
export function loadLegacyDoneTracks(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(FAST_TRACK_LEGACY_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export function clearLegacyDoneTracks(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(FAST_TRACK_LEGACY_STORAGE_KEY);
  } catch {
    /* nothing to clean up */
  }
}

function stageFor(pct: number, completedMonetize: boolean): LifecycleStage {
  if (completedMonetize) return "monetization";
  if (pct >= 100) return "monetization";
  if (pct >= 60) return "workshop";
  if (pct >= 30) return "ready-to-build";
  if (pct > 0) return "fast-tracks";
  return "money-move";
}

export function moneyMoveForVault(
  vault: BusinessVault,
  priority: VaultPriority,
  /** Finished Fast Tracks — account keys, plus legacy ids during migration. */
  done: Iterable<string>,
): MoneyMove {
  const doneSet = done instanceof Set ? done : new Set(done);
  const parentMoveId = parentMoveIdForVault(vault.key);
  const fastTracks: FastTrack[] = vault.moves.map((m, i) => {
    const id = legacyFastTrackId(vault.key, i);
    const key = fastTrackKey(vault.key, m.title);
    return {
      id,
      key,
      parentMoveId,
      vaultKey: vault.key,
      title: m.title,
      minutes: m.minutes,
      to: m.to,
      stage: m.stage,
      done: doneSet.has(key) || doneSet.has(id),
    };
  });
  const completed = fastTracks.filter((f) => f.done).length;
  const pct = fastTracks.length ? Math.round((completed / fastTracks.length) * 100) : 0;
  const monetizeDone = fastTracks.filter((f) => f.stage === "monetize").every((f) => f.done);

  return {
    id: `mm-${vault.key}`,
    vaultKey: vault.key,
    emoji: vault.emoji,
    title: vault.label.replace(/ Vault$/, ""),
    everyday: vault.summary,
    priority,
    fastTracks,
    minutes: fastTracks.filter((f) => !f.done).reduce((n, f) => n + f.minutes, 0),
    completed,
    pct,
    stage: stageFor(pct, monetizeDone && fastTracks.length > 0),
    monetizationOutcome: vault.monetizationOutcome,
    workshopTo: vault.showcase?.to ?? "/room",
  };
}

/**
 * The Daily's Money Move stack. Vault Priority decides what appears and in
 * which order — Future and Archived Vaults schedule nothing (FRASS-0469).
 */
export function moneyMoves(
  map: PriorityMap,
  /** Finished Fast Track keys, read from the Builder's account. */
  done: Iterable<string> = [],
  vaults: BusinessVault[] = BUSINESS_VAULTS,
): MoneyMove[] {
  return vaults
    .map((v) => moneyMoveForVault(v, priorityOf(map, v.key), done))
    .filter((m) => PRIORITY_META[m.priority].schedules)
    .sort(
      (a, b) =>
        PRIORITY_META[b.priority].dailyWeight - PRIORITY_META[a.priority].dailyWeight ||
        b.pct - a.pct,
    );
}

/** The next Fast Track waiting inside a Money Move. */
export function nextFastTrack(move: MoneyMove): FastTrack | null {
  return move.fastTracks.find((f) => !f.done) ?? null;
}
