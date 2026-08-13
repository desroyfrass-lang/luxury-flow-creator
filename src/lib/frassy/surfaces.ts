// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0558 — One Frassy Experience.
//
// There is only one Frassy and only one conversation. This module is the single
// place that decides *how* she appears on a page — never whether a second one
// gets created.
//
//   "workspace" — the page already contains a full Frassy conversation.
//                 The floating companion stays away entirely.
//   "beacon"    — the page has no built-in conversation, so the compact beacon
//                 offers her in one tap.
//   "none"      — social, play and entertainment surfaces. Conversation never
//                 interrupts them; members summon Frassy deliberately.
//
// Plain English: this is the guest list that stops six different Frassys from
// showing up to the same party.
// ─────────────────────────────────────────────────────────────────────────────

export type FrassySurface = "workspace" | "beacon" | "none";

/** Pages that already host a full Frassy conversation workspace. */
const WORKSPACE_PREFIXES = [
  "/welcome-hall",
  "/welcome",
  "/arrival",
  "/daily",
  "/room",
  "/workspace",
  "/founder",
  "/command",
  "/builder-hall",
  "/frassy",
  "/studio",
  "/creation",
  "/onboarding",
];

/** Social, play and entertainment surfaces — conversation never intrudes. */
const QUIET_PREFIXES = [
  "/for-us",
  "/for-me",
  "/town-square",
  "/kids-world",
  "/kids-valley",
  "/frass-street",
  "/live",
  "/frass-radio",
  "/music-media",
  "/builder/",
  "/card/",
  "/link/",
];

/** Surfaces that own their own exits: sign-in, payment, checkout, machinery. */
const SILENT_PREFIXES = [
  "/auth",
  "/reset-password",
  "/signed-out",
  "/pay/",
  "/checkout",
  "/api",
  "/mcp",
];

function matches(pathname: string, prefixes: string[]) {
  return prefixes.some(
    (p) => pathname === p || pathname === p.replace(/\/$/, "") || pathname.startsWith(p),
  );
}

export function frassySurface(pathname: string): FrassySurface {
  if (matches(pathname, SILENT_PREFIXES)) return "none";
  if (matches(pathname, QUIET_PREFIXES)) return "none";
  if (matches(pathname, WORKSPACE_PREFIXES)) return "workspace";
  return "beacon";
}
