import { createFileRoute, redirect } from "@tanstack/react-router";

// The Bare Drip splitter page was removed — the Frass District directory
// already lists the Men's and Women's Bare Drip storefronts.
export const Route = createFileRoute("/bare-drip/")({
  beforeLoad: () => {
    throw redirect({ to: "/frass-district", replace: true });
  },
});
