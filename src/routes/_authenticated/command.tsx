// FRASS-0568 — legacy route. There is only one Founder headquarters.
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/command")({
  beforeLoad: () => {
    throw redirect({ to: "/control-room", replace: true });
  },
});
