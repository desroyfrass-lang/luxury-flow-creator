// LEGACY REDIRECT — /room was "My Workspace".
// There is now one Workshop (/workshop) and one Daily (/daily), so this old
// entry point sends the member to the canonical Workshop instead of a second
// competing workspace. The original room is preserved at /room-classic.

import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/room")({
  validateSearch: (search: Record<string, unknown>): { daily?: true } =>
    search["daily"] === true || search["daily"] === "true" || search["daily"] === "1"
      ? { daily: true }
      : {},
  beforeLoad: ({ search }) => {
    throw redirect({ to: search.daily ? "/daily" : "/workshop" });
  },
});
