// Atlas Recovery Phase 1 — broken alias repaired.
// `/card` was a dead address members and menus still used. It now lands on the
// one canonical destination from the navigation registry: `/workspace/card`.
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/card/")({
  beforeLoad: () => {
    throw redirect({ to: "/workspace/card", replace: true });
  },
});
