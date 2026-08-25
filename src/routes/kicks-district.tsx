import { createFileRoute, redirect } from "@tanstack/react-router";

/** Legacy address for the shopping promenade — one hop to the Frass District. */
export const Route = createFileRoute("/kicks-district")({
  beforeLoad: () => {
    throw redirect({ to: "/frass-district", replace: true });
  },
});
