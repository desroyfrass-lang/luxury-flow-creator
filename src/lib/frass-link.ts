// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0428 — The Frass Link System
//
// Constitutional principles:
//   1. "Every member owns one permanent Frass Link for life."
//   2. "Every meaningful connection on Frass begins with a Link."
//
// One link is the member's identity, business card, referral link, recruitment
// link, welcome link, QR code, commerce link and creator link. It never changes,
// even as the member grows.
//
// What that means in everyday language: it is a street address for a person. The
// house can be repainted, extended, or turned into a shop — the address on the
// gate stays the same, so anyone who ever wrote it down can still find you.
// ─────────────────────────────────────────────────────────────────────────────

export const LINK_PRINCIPLE =
  "Every member owns one permanent Frass Link for life — identity, business card, referral link, welcome link, QR code and checkout, all from one address.";

export const CONNECTION_PRINCIPLE = "Every meaningful connection on Frass begins with a Link.";

/** The permanent address. `/link/handle` welcomes and attributes, then opens the card. */
export function linkPath(handle: string): string {
  return `/link/${handle}`;
}

export function linkUrl(handle: string, origin?: string): string {
  const base =
    origin ?? (typeof window !== "undefined" ? window.location.origin : "https://frasskicks.com");
  return `${base}${linkPath(handle)}`;
}

/** Display form — what a member reads out loud or prints. */
export function linkLabel(handle: string): string {
  return `frasskicks.com/link/${handle}`;
}

/** Where the arrival came from. */
export const LINK_SOURCES = [
  { id: "link", label: "Frass Link" },
  { id: "qr", label: "QR code" },
  { id: "card", label: "Frass Card" },
  { id: "campaign", label: "Campaign" },
  { id: "affiliate", label: "Affiliate link" },
] as const;
export type LinkSource = (typeof LINK_SOURCES)[number]["id"];

/* ── Recruitment stages ──────────────────────────────────────────────────── */
// The Human Link (who introduced you) and the Digital Link (the URL you used)
// stay permanently connected. Stages only ever move forward.

export const REFERRAL_STAGES = [
  { id: "signed_up", label: "Signed up", plain: "They joined through your link." },
  { id: "qualified_member", label: "Qualified member", plain: "They finished setting up and started using Frass." },
  { id: "qualified_affiliate", label: "Qualified affiliate", plain: "They activated as an affiliate." },
  { id: "qualified_partner", label: "Qualified partner", plain: "They launched as a partner." },
  { id: "business_launched", label: "Business launched", plain: "They opened a real business on Frass." },
] as const;
export type ReferralStage = (typeof REFERRAL_STAGES)[number]["id"];

export function stageLabel(stage: string): string {
  return REFERRAL_STAGES.find((s) => s.id === stage)?.label ?? "Introduced";
}

export function stageRank(stage: string): number {
  const i = REFERRAL_STAGES.findIndex((s) => s.id === stage);
  return i < 0 ? 0 : i;
}

/* ── Recruitment bonuses ─────────────────────────────────────────────────── */
// Milestone bonuses — never endless lifetime commissions. Each one is earned
// once, for one qualifying event, and appears as its own earnings category.

export type BonusRule = {
  kind: string;
  label: string;
  stage: ReferralStage;
  amount: number;
  plain: string;
};

export const BONUS_RULES: BonusRule[] = [
  {
    kind: "qualified_member",
    label: "Qualified member joined",
    stage: "qualified_member",
    amount: 5,
    plain: "Someone you introduced finished setting up and is actually using Frass.",
  },
  {
    kind: "qualified_affiliate",
    label: "Qualified affiliate activated",
    stage: "qualified_affiliate",
    amount: 15,
    plain: "Someone you introduced switched on affiliate selling.",
  },
  {
    kind: "qualified_partner",
    label: "Qualified partner launched",
    stage: "qualified_partner",
    amount: 40,
    plain: "Someone you introduced became a working partner.",
  },
  {
    kind: "business_launched",
    label: "Business activation milestone",
    stage: "business_launched",
    amount: 75,
    plain: "Someone you introduced opened a real business on Frass.",
  },
];

export function rulesForStage(stage: string): BonusRule[] {
  const rank = stageRank(stage);
  return BONUS_RULES.filter((r) => stageRank(r.stage) <= rank);
}

export function bonusLabel(kind: string): string {
  return BONUS_RULES.find((r) => r.kind === kind)?.label ?? "Recruitment bonus";
}

/* ── Attribution held in the browser until sign-up ───────────────────────── */

export const REF_STORAGE_KEY = "frass.link.ref";
const REF_TTL_MS = 30 * 24 * 60 * 60 * 1000; // Thirty days to make up their mind.

export type StoredRef = { handle: string; source: LinkSource; path: string; at: number };

export function rememberRef(ref: StoredRef) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(REF_STORAGE_KEY, JSON.stringify(ref));
  } catch {
    /* private browsing — the introduction simply isn't remembered */
  }
}

export function readRef(): StoredRef | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(REF_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredRef;
    if (!parsed?.handle || Date.now() - parsed.at > REF_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearRef() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(REF_STORAGE_KEY);
  } catch {
    /* nothing to clear */
  }
}
