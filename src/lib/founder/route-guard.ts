// FRASS-0530 / Atlas Recovery Phase 1 — one server-verified Founder door.
//
// Every Founder-only route runs this before it renders or loads anything.
// The answer comes from the server (`checkIsAdmin` re-reads `has_role` with the
// caller's own token), never from a client flag, menu visibility or storage.
// An unauthorized visitor is walked back to the Welcome Hall — never sideways
// into another Founder route.
import { redirect } from "@tanstack/react-router";
import { checkIsAdmin } from "@/lib/admin.functions";

export async function requireFounderRoute(): Promise<void> {
  let allowed = false;
  try {
    allowed = Boolean(await checkIsAdmin());
  } catch {
    allowed = false;
  }
  if (!allowed) {
    throw redirect({ to: "/welcome-hall", replace: true });
  }
}
