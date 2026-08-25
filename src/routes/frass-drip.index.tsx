import { createFileRoute, redirect } from "@tanstack/react-router";

// The Frass Drip splitter page was removed — the Frass District directory
// already lists the Men's and Women's Drip storefronts.
export const Route = createFileRoute("/frass-drip/")({
  beforeLoad: () => {
    throw redirect({ to: "/frass-district", replace: true });
  },
});
