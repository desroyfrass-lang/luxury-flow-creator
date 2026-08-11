// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0476 — Platform Protection Mode (the Founder Freeze Switch).
//
// One Founder-only switch that pauses new transactions across the platform
// while an issue is investigated or a critical fix ships. Nothing is deleted,
// nothing is hidden: members keep browsing, but no new money or accounts move
// until the Founder turns it off.
//
// State reuses the existing `launch_program_settings` table on the row
// `platform_protection` — `enabled` is the switch, `notice` holds the JSON list
// of paused domains. No new table.
// ─────────────────────────────────────────────────────────────────────────────

export const PROTECTION_SETTINGS_ID = "platform_protection";

export type ProtectionDomain =
  | "registrations"
  | "purchases"
  | "broadcasting"
  | "payments"
  | "withdrawals";

export const PROTECTION_DOMAINS: {
  id: ProtectionDomain;
  label: string;
  what: string;
  plain: string;
}[] = [
  {
    id: "registrations",
    label: "New registrations",
    what: "No new accounts can be created.",
    plain: "The front door is closed to new arrivals. Everyone already inside stays inside.",
  },
  {
    id: "purchases",
    label: "Marketplace purchases",
    what: "No new marketplace orders can be placed.",
    plain: "The shelves stay lit, but the till is closed.",
  },
  {
    id: "broadcasting",
    label: "Live broadcasting",
    what: "No new live broadcasts can start.",
    plain: "Nobody new goes on air until you say so.",
  },
  {
    id: "payments",
    label: "Payments",
    what: "No new payment requests can be created or approved.",
    plain: "No money can start moving in either direction.",
  },
  {
    id: "withdrawals",
    label: "Wallet withdrawals",
    what: "No money can leave a Frass wallet.",
    plain: "Balances are safe where they are — nothing leaves the building.",
  },
];

export type ProtectionState = {
  /** True while Platform Protection Mode is active. */
  active: boolean;
  /** Which domains are paused. Only meaningful while `active` is true. */
  paused: ProtectionDomain[];
  /** When the Founder last changed the switch. */
  updatedAt: string | null;
};

export const PROTECTION_OFF: ProtectionState = { active: false, paused: [], updatedAt: null };

/** Everything paused — the default posture when the switch is first thrown. */
export const ALL_DOMAINS: ProtectionDomain[] = PROTECTION_DOMAINS.map((d) => d.id);

export function parsePaused(notice: string | null | undefined): ProtectionDomain[] {
  if (!notice) return [];
  try {
    const raw = JSON.parse(notice);
    if (!Array.isArray(raw)) return [];
    return ALL_DOMAINS.filter((d) => raw.includes(d));
  } catch {
    return [];
  }
}

export function serializePaused(paused: ProtectionDomain[]): string {
  return JSON.stringify(ALL_DOMAINS.filter((d) => paused.includes(d)));
}

/** Is this part of the platform currently frozen? */
export function isPaused(state: ProtectionState, domain: ProtectionDomain): boolean {
  return state.active && state.paused.includes(domain);
}

/** What a member is told when they reach a paused surface. Calm, never alarming. */
export function pausedMessage(domain: ProtectionDomain): string {
  const d = PROTECTION_DOMAINS.find((x) => x.id === domain);
  return `Frass is in Platform Protection Mode. ${d?.what ?? "This action is paused."} Everything is safe — please try again shortly.`;
}

/** The one line the Security Center shows about the switch. */
export function protectionHeadline(state: ProtectionState): string {
  if (!state.active) return "Platform Protection Mode is off. Everything is operating normally.";
  if (!state.paused.length)
    return "Platform Protection Mode is on, but nothing is paused yet — choose what to freeze.";
  const names = PROTECTION_DOMAINS.filter((d) => state.paused.includes(d.id)).map((d) =>
    d.label.toLowerCase(),
  );
  const list =
    names.length === 1
      ? names[0]
      : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
  return `Platform Protection Mode is on. Paused: ${list}. Everything else stays viewable.`;
}
