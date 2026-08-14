// ─────────────────────────────────────────────────────────────────────────────
// SPEC-BLUEPRINT-001-FINAL §4 — Vault Priority Classification.
//
// Every Business Vault carries exactly one classification. Priority is the
// single dial that decides what the Daily recommends, what the Workshop opens
// by default, and how Project Fund income is allocated.
//
// This extends the existing Vault family (FRASS-0503) and the Future Vault
// shelf (FRASS-0469). A "Future" Vault still schedules nothing — that rule is
// untouched.
// ─────────────────────────────────────────────────────────────────────────────

export type VaultPriority = "active" | "growing" | "future" | "archived";

export const VAULT_PRIORITIES: VaultPriority[] = ["active", "growing", "future", "archived"];

export const PRIORITY_META: Record<
  VaultPriority,
  {
    label: string;
    emoji: string;
    everyday: string;
    /** Share of Daily recommendations this classification may claim. */
    dailyWeight: number;
    /** Share of Project Fund income allocated to this classification. */
    fundShare: number;
    /** May this Vault produce Daily work at all? */
    schedules: boolean;
  }
> = {
  active: {
    label: "Active",
    emoji: "🔥",
    everyday: "You're working on this now. It gets first call on your time.",
    dailyWeight: 3,
    fundShare: 0.6,
    schedules: true,
  },
  growing: {
    label: "Growing",
    emoji: "🌿",
    everyday: "This one is coming up behind. Steady progress, not full attention.",
    dailyWeight: 1,
    fundShare: 0.3,
    schedules: true,
  },
  future: {
    label: "Future",
    emoji: "🌱",
    everyday: "Parked on purpose. It waits until you say the word — it never fills your day.",
    dailyWeight: 0,
    fundShare: 0.1,
    schedules: false,
  },
  archived: {
    label: "Archived",
    emoji: "🗄",
    everyday: "Kept, not deleted. Nothing from here reaches your Daily.",
    dailyWeight: 0,
    fundShare: 0,
    schedules: false,
  },
};

export const DEFAULT_PRIORITY: VaultPriority = "future";

const KEY = "frass.vault.priority.v1";

export type PriorityMap = Record<string, VaultPriority>;

export function loadPriorities(): PriorityMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PriorityMap) : {};
  } catch {
    return {};
  }
}

export function priorityOf(map: PriorityMap, vaultKey: string): VaultPriority {
  return map[vaultKey] ?? DEFAULT_PRIORITY;
}

export function setPriority(vaultKey: string, priority: VaultPriority): PriorityMap {
  const next = { ...loadPriorities(), [vaultKey]: priority };
  if (typeof window !== "undefined") window.localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

/** Vault keys allowed to place work in the Daily, strongest first. */
export function schedulableVaults(map: PriorityMap, keys: string[]): string[] {
  return keys
    .filter((k) => PRIORITY_META[priorityOf(map, k)].schedules)
    .sort(
      (a, b) =>
        PRIORITY_META[priorityOf(map, b)].dailyWeight - PRIORITY_META[priorityOf(map, a)].dailyWeight,
    );
}

/** The Vault the Workshop opens by default. */
export function defaultWorkshopVault(map: PriorityMap, keys: string[]): string | null {
  return schedulableVaults(map, keys)[0] ?? null;
}

/** Project Fund allocation across the Builder's Vaults, as whole percentages. */
export function fundAllocation(map: PriorityMap, keys: string[]): { key: string; pct: number }[] {
  const weighted = keys.map((k) => ({ key: k, share: PRIORITY_META[priorityOf(map, k)].fundShare }));
  const total = weighted.reduce((n, w) => n + w.share, 0);
  if (!total) return keys.map((k) => ({ key: k, pct: 0 }));
  return weighted.map((w) => ({ key: w.key, pct: Math.round((w.share / total) * 100) }));
}
