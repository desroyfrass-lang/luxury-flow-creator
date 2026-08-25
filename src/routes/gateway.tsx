import { createFileRoute, redirect } from "@tanstack/react-router";

/** The gateway address now opens the Welcome Hall. */
export const Route = createFileRoute("/gateway")({
  beforeLoad: () => {
    throw redirect({ to: "/welcome-hall", replace: true });
  },
});
