// Atlas Recovery Phase 1 — broken alias repaired.
// `/wallet` was a dead address members and menus still used. It now lands on the
// one canonical destination from the navigation registry: `/workspace/wallet`.
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/wallet")({
  beforeLoad: () => {
    throw redirect({ to: "/workspace/wallet", replace: true });
  },
});
