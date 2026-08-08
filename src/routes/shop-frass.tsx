import { createFileRoute, redirect } from "@tanstack/react-router";

/** The shopping promenade is the Frass District. */
export const Route = createFileRoute("/shop-frass")({
  beforeLoad: () => {
    throw redirect({ to: "/frass-district", replace: true });
  },
});
