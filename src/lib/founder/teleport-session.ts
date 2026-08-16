// FRASS-0570 — Teleport session (Founder inspection only, this device only).
//
// Remembers that the Founder stepped out of the Control Room to look at a page,
// so a floating "return" chip can bring them straight back. Stores nothing but
// a flag; changes no application data.

const KEY = "frass.teleport.active";
export const TELEPORT_HOME = "/control-room?tab=world-teleporter";

export function beginTeleport(path: string) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(KEY, "1");
  } catch {
    /* private mode — the chip simply won't appear */
  }
  window.location.assign(path);
}

export function isTeleporting(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(KEY) === "1";
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
