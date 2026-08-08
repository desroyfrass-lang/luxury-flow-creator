import { createFileRoute, redirect } from "@tanstack/react-router";

/** The entrance now lives at the homepage. */
export const Route = createFileRoute("/gateway")({
  beforeLoad: () => {
    throw redirect({ to: "/", replace: true });
  },
});
