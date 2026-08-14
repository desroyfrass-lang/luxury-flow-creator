// FRASS-0568 — the legacy Control Room interface is retired. Every Founder-only
// capability it held now lives in the unified Founder Control Room.
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/founder")({
  beforeLoad: () => {
    throw redirect({ to: "/control-room", replace: true });
  },
});
