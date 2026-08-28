// Atlas Recovery Phase 1 — broken alias repaired.
// `/kids` was a dead address members and menus still used. It now lands on the
// one canonical destination from the navigation registry: `/kids-world`.
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/kids")({
  beforeLoad: () => {
    throw redirect({ to: "/kids-world", replace: true });
  },
});
