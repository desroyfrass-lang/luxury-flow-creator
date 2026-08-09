// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0426 — The Frass Card.
//
// Constitutional principle:
//   "Every Frass member should always have a professional way to introduce
//    themselves. No setup required."
//
// The card is the member's digital handshake: always current, always
// professional, always one click away from The Daily, My Workspace, FOR ME and
// the Financial Center. It is not a contact card — it is a miniature version of
// the member's Frass world.
// ─────────────────────────────────────────────────────────────────────────────

export const CARD_PRINCIPLE =
  "Everyone has a Frass Card. It is the member's digital handshake — always current, always professional, always ready to share.";

/**
 * FRASS-0428A Constitutional Amendment — Universal Frass Card.
 * The Frass Card replaces the traditional concept of a user profile and becomes
 * the universal identity object across the entire Frass ecosystem: FOR ME,
 * For Us, Town Square, Marketplace, Brand Partnerships, FV Studios, Frass
 * Radio, music and media, comments, followers and following, search results,
 * live broadcasts, QR codes and shared links. Selecting a member anywhere
 * opens their Frass Card — never a tiny profile.
 */
export const UNIVERSAL_CARD_AMENDMENT =
  "Every member automatically receives a Frass Card. Whenever a member's name, image, avatar, hero media or identity is selected anywhere on Frass, the platform opens their Frass Card. It is their permanent digital identity.";

/** Permanent Frass URL for a member's card. */
export function cardPath(handle: string): string {
  return `/card/${handle}`;
}

export function cardUrl(handle: string, origin?: string): string {
  const base = origin ?? (typeof window !== "undefined" ? window.location.origin : "https://frasskicks.com");
  return `${base}${cardPath(handle)}`;
}

// ── Themes ───────────────────────────────────────────────────────────────────
// Recognisably Frass, with room for the member's own personality.

export type CardTheme = "midnight" | "chrome" | "island" | "ivory";

export const CARD_THEMES: Record<CardTheme, { label: string; note: string; wash: string; ink: string }> = {
  midnight: { label: "Midnight", note: "Dark streetwear. The house default.", wash: "oklch(0.16 0.02 260)", ink: "oklch(0.97 0 0)" },
  chrome: { label: "Chrome", note: "Brushed metal and hard edges.", wash: "oklch(0.24 0.01 250)", ink: "oklch(0.98 0 0)" },
  island: { label: "Island", note: "Caribbean warmth and sea light.", wash: "oklch(0.22 0.05 200)", ink: "oklch(0.98 0.01 90)" },
  ivory: { label: "Ivory", note: "Quiet luxury, printed-paper calm.", wash: "oklch(0.95 0.01 90)", ink: "oklch(0.2 0.01 260)" },
};

export type CardAccent = "gold" | "chrome" | "coral" | "emerald" | "violet";

export const CARD_ACCENTS: Record<CardAccent, string> = {
  gold: "oklch(0.82 0.13 85)",
  chrome: "oklch(0.85 0.01 250)",
  coral: "oklch(0.72 0.17 30)",
  emerald: "oklch(0.72 0.14 160)",
  violet: "oklch(0.68 0.16 300)",
};

export function accentValue(accent: string): string {
  return CARD_ACCENTS[(accent as CardAccent) ?? "gold"] ?? CARD_ACCENTS.gold;
}

export function themeValue(theme: string) {
  return CARD_THEMES[(theme as CardTheme) ?? "midnight"] ?? CARD_THEMES.midnight;
}

// ── Sections ─────────────────────────────────────────────────────────────────

export const CARD_SECTIONS = [
  { id: "story", label: "Story & Living Bio" },
  { id: "business", label: "Business & Store" },
  { id: "work", label: "Latest work" },
  { id: "links", label: "Links & socials" },
  { id: "contact", label: "Contact" },
] as const;

export type CardSectionId = (typeof CARD_SECTIONS)[number]["id"];

// ── Sharing ──────────────────────────────────────────────────────────────────
// One card, ten doors. Every share is a potential relationship.

export type ShareTarget = {
  id: string;
  label: string;
  /** Builds the outbound URL, or null when the action is handled in-app. */
  href: ((url: string, text: string) => string) | null;
};

export const SHARE_TARGETS: ShareTarget[] = [
  { id: "whatsapp", label: "WhatsApp", href: (u, t) => `https://wa.me/?text=${encodeURIComponent(`${t} ${u}`)}` },
  { id: "email", label: "Email", href: (u, t) => `mailto:?subject=${encodeURIComponent(t)}&body=${encodeURIComponent(u)}` },
  { id: "sms", label: "Text message", href: (u, t) => `sms:?&body=${encodeURIComponent(`${t} ${u}`)}` },
  { id: "qr", label: "QR code", href: null },
  { id: "facebook", label: "Facebook", href: (u) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}` },
  { id: "instagram", label: "Instagram", href: null },
  { id: "x", label: "X", href: (u, t) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}` },
  { id: "linkedin", label: "LinkedIn", href: (u) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(u)}` },
  { id: "copy", label: "Copy link", href: null },
  { id: "frass", label: "Frass Messages", href: null },
];

// ── Analytics vocabulary ─────────────────────────────────────────────────────

export type CardEventKind =
  | "view"
  | "share"
  | "qr_scan"
  | "website_click"
  | "affiliate_click"
  | "marketplace_click"
  | "message"
  | "booking"
  | "sale";

export const CARD_EVENT_LABELS: Record<CardEventKind, string> = {
  view: "Card views",
  share: "Shares",
  qr_scan: "QR scans",
  website_click: "Website clicks",
  affiliate_click: "Affiliate clicks",
  marketplace_click: "Marketplace clicks",
  message: "Messages received",
  booking: "Bookings generated",
  sale: "Sales generated",
};

export const CARD_EVENT_ORDER = Object.keys(CARD_EVENT_LABELS) as CardEventKind[];
