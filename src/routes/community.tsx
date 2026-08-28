// Atlas Recovery Phase 1 — broken alias repaired.
// `/community` was a dead address members and menus still used. It now lands on the
// one canonical destination from the navigation registry: `/town-square`.
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/community")({
  beforeLoad: () => {
    throw redirect({ to: "/town-square", replace: true });
  },
});
