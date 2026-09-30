// RETIRED — the classic My Workspace room. There is one Workshop now; old
// bookmarks land there in one hop.
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/room-classic")({
  beforeLoad: () => {
    throw redirect({ to: "/workshop", replace: true });
  },
});
