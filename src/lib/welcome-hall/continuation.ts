// Atlas Recovery Phase 1 — "continue to where I was going" must never mean
// "stay exactly where you are".
//
// A continuation destination is only honoured when it is a real internal
// address that is not the Welcome Hall itself (or one of its aliases), not the
// sign-in door, and not the onboarding conversation. Anything else falls back
// to the member's own workspace — the canonical member destination in the
// navigation registry (`my-workspace` → /room).

/** Where a member goes when there is nowhere sensible to send them back to. */
export const SAFE_MEMBER_DESTINATION = "/room";

/** Welcome Hall and every equivalent arrival address. */
const WELCOME_HALL_ALIASES = ["/welcome-hall", "/welcome", "/arrival"];

/** Doors that would restart a journey instead of continuing one. */
const LOOPING_DESTINATIONS = ["/auth", "/onboarding", "/sign-in", "/login"];

function samePlace(path: string, candidate: string): boolean {
  return path === candidate || path.startsWith(`${candidate}/`);
}

/** Returns a safe internal path to continue to. Never self-referential. */
export function safeContinuation(next: string | undefined | null): string {
  if (typeof next !== "string") return SAFE_MEMBER_DESTINATION;
  // Internal, absolute paths only — no protocol-relative or external escapes.
  if (!next.startsWith("/") || next.startsWith("//")) return SAFE_MEMBER_DESTINATION;
  const path = (next.split("?")[0] ?? "").split("#")[0] ?? "";
  if (!path) return SAFE_MEMBER_DESTINATION;
  for (const alias of [...WELCOME_HALL_ALIASES, ...LOOPING_DESTINATIONS]) {
    if (samePlace(path, alias)) return SAFE_MEMBER_DESTINATION;
  }
  return next;
}
