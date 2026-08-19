// FRASS-0570 — Teleport session (Founder inspection only, this device only).
//
// Remembers that the Founder stepped out of the Control Room to look at a page,
// so a floating "return" chip can bring them straight back. The active card is
// also carried as read-only conversation context so Frassy never inherits the
// identity of the previously inspected card.

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
