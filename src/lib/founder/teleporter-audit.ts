// FRASS-0570A — Teleporter audit numbering & status vocabulary (shared, client-safe).
//
// Every card gets a permanent audit number. The number comes from a stable sort
// of the registry (file, then path), so moving cards around the screen, filtering
// or regrouping never renumbers anything.
import { WORLD_ROUTES, type WorldRoute } from "./world-teleporter";

export type AuditStatus = "not_reviewed" | "in_progress" | "reviewed" | "consolidated" | "retired";

export const AUDIT_STATUS_META: Record<AuditStatus, { icon: string; label: string }> = {
  not_reviewed: { icon: "⚪", label: "Not Reviewed" },
  in_progress: { icon: "🟡", label: "In Progress" },
  reviewed: { icon: "🟢", label: "Reviewed" },
  consolidated: { icon: "🔄", label: "Consolidated" },
  retired: { icon: "🔴", label: "Retired" },
};

export const AUDIT_STATUS_ORDER: AuditStatus[] = [
  "not_reviewed",
  "in_progress",
  "reviewed",
  "consolidated",
  "retired",
];

/** Permanent identity of a card: the route plus the file that declares it. */
export function cardKey(route: Pick<WorldRoute, "path" | "file">): string {
  return `${route.file}::${route.path}`;
}

const NUMBERS: Map<string, number> = (() => {
  const keys = WORLD_ROUTES.map(cardKey).sort((a, b) => a.localeCompare(b));
  const map = new Map<string, number>();
  keys.forEach((k, i) => map.set(k, i + 1));
  return map;
})();

export function cardNumber(route: Pick<WorldRoute, "path" | "file">): number {
  return NUMBERS.get(cardKey(route)) ?? 0;
}

export function formatCardNumber(n: number): string {
  return `#${String(n).padStart(3, "0")}`;
}

export const TOTAL_CARDS = WORLD_ROUTES.length;
