// FRASS-0570 — Teleport session (Founder inspection only, this device only).
//
// Remembers that the Founder stepped out of the Control Room to look at a page,
// so a floating "return" chip can bring them straight back. The active card is
// also carried as read-only conversation context so Frassy never inherits the
// identity of the previously inspected card.

import { WORLD_ROUTES } from "./world-teleporter";
import { cardKey, cardNumber } from "./teleporter-audit";

const KEY = "frass.teleport.active";
export const TELEPORT_HOME = "/control-room?tab=world-teleporter";

export type ActiveTeleportCard = {
  key: string;
  number: number;
  title: string;
  path: string;
  component: string;
  file: string;
  district: string;
};

export function beginTeleport(card: ActiveTeleportCard) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(card));
  } catch {
    /* private mode — the chip simply won't appear */
  }
  window.location.assign(card.path);
}

export function readActiveTeleport(): ActiveTeleportCard | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw || raw === "1") return null;
    const card = JSON.parse(raw) as ActiveTeleportCard;
    return card?.key && card?.path && Number.isFinite(card.number) ? card : null;
  } catch {
    return null;
  }
}

export function isTeleporting(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(KEY) !== null;
  } catch {
    return false;
  }
}

export function endTeleport() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    /* nothing to clear */
  }
}

// The page you are standing on is the source of truth.
//
// The session record can go stale (an older card left behind, a path saved with
// a query string, a trailing slash). Resolving the card from the live pathname
// against the Teleporter registry means Frassy can never inherit the identity of
// a previously inspected card.
function normalizePath(p: string | null | undefined): string {
  if (!p) return "";
  const clean = p.split("?")[0].split("#")[0];
  const trimmed = clean.length > 1 ? clean.replace(/\/+$/, "") : clean;
  return trimmed.toLowerCase();
}

export function resolveAuditCard(pathname: string | null | undefined): ActiveTeleportCard | null {
  const here = normalizePath(pathname);
  if (!here) return null;
  const active = readActiveTeleport();
  if (active && normalizePath(active.path) === here) return active;
  const route = WORLD_ROUTES.find((r) => normalizePath(r.path) === here);
  if (!route) return null;
  return {
    key: cardKey(route),
    number: cardNumber(route),
    title: route.title,
    path: route.path,
    component: route.component,
    file: route.file,
    district: route.district,
  };
}

/** True only when a teleport session is open on a page that has no card of its own. */
export function isStaleTeleport(pathname: string | null | undefined): boolean {
  return Boolean(readActiveTeleport()) && resolveAuditCard(pathname) === null;
}
