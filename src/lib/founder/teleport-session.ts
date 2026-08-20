// FRASS-0570 / FRASS-0574 — Teleport session (Founder inspection only).
//
// FRASS-0574 made the route the ONLY authority: the card identity is derived
// purely from the current pathname against the canonical registry. The
// session record here is reduced to a "return to the Control Room" navigation
// hint only — it no longer carries card identity, and resolveAuditCard never
// reads it. There is zero session authority over identity.

import { resolveCanonicalCard } from "./audit-registry";

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

/** Navigate to a card's page and remember where to return to. Only the return
 *  destination is stored; card identity is never read back from here. */
export function beginTeleport(card: ActiveTeleportCard) {
  if (typeof window === "undefined") return;
  try {
    // Store only the return hint — never trust this for identity.
    window.sessionStorage.setItem(KEY, JSON.stringify({ returnTo: TELEPORT_HOME, path: card.path }));
  } catch {
    /* private mode — the chip simply won't appear */
  }
  window.location.assign(card.path);
}

export function readActiveTeleport(): { returnTo: string; path: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw || raw === "1") return null;
    const obj = JSON.parse(raw) as { returnTo?: string; path?: string };
    if (!obj?.path) return null;
    return { returnTo: obj.returnTo ?? TELEPORT_HOME, path: obj.path };
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

// FRASS-0574 — the page you are standing on is the sole source of truth.
// Resolved purely from the pathname via the canonical registry. No session
// object, no cached card, no stored destination is consulted for identity.
export function resolveAuditCard(pathname: string | null | undefined): ActiveTeleportCard | null {
  const card = resolveCanonicalCard(pathname);
  if (!card) return null;
  return {
    key: card.key,
    number: card.number,
    title: card.title,
    path: card.path,
    component: card.component,
    file: card.file,
    district: card.district,
  };
}

/** True only when a return hint exists but the current page has no card of
 *  its own — i.e. the Founder stepped somewhere that is not an audit page. */
export function isStaleTeleport(pathname: string | null | undefined): boolean {
  return Boolean(readActiveTeleport()) && resolveAuditCard(pathname) === null;
}
