// FRASS-0570 — Teleport session (Founder inspection only, this device only).
//
// Remembers that the Founder stepped out of the Control Room to look at a page,
// so a floating "return" chip can bring them straight back. Stores nothing but
// the active card context; changes no application data.

const KEY = "frass.teleport.active";
const CARD_KEY = "frass.teleport.card";
export const TELEPORT_HOME = "/control-room?tab=world-teleporter";

export type ActiveTeleporterCard = {
  number: number;
  title: string;
  path: string;
  component: string;
  file: string;
  district: string;
};

export function beginTeleport(card: ActiveTeleporterCard) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(KEY, "1");
    window.sessionStorage.setItem(CARD_KEY, JSON.stringify(card));
  } catch {
    /* private mode — the chip simply won't appear */
  }
  window.location.assign(card.path);
}

export function readActiveTeleporterCard(): ActiveTeleporterCard | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(CARD_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ActiveTeleporterCard>;
    if (
      typeof parsed.number !== "number" ||
      typeof parsed.title !== "string" ||
      typeof parsed.path !== "string" ||
      typeof parsed.component !== "string" ||
      typeof parsed.file !== "string" ||
      typeof parsed.district !== "string"
    ) {
      return null;
    }
    return parsed as ActiveTeleporterCard;
  } catch {
    return null;
  }
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
