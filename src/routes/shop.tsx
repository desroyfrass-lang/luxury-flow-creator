// Atlas Recovery Phase 1 — broken alias repaired.
// `/shop` was a dead address members and menus still used. It now lands on the
// one canonical destination from the navigation registry: `/frass-district`.
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/shop")({
  beforeLoad: () => {
    throw redirect({ to: "/frass-district", replace: true });
  },
});
