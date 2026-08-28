// Atlas Recovery Phase 1 — broken alias repaired.
// `/builder-identity` was a dead address members and menus still used. It now lands on the
// one canonical destination from the navigation registry: `/workspace/profile`.
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/builder-identity")({
  beforeLoad: () => {
    throw redirect({ to: "/workspace/profile", replace: true });
  },
});
