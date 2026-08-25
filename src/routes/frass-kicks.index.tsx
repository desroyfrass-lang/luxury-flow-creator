import { createFileRoute, redirect } from "@tanstack/react-router";

// The Frass Kicks splitter page was removed — the Frass District directory
// already lists the Men's and Women's Kicks storefronts. Deeper Kicks routes
// (/frass-kicks/men, /frass-kicks/women) are untouched.
export const Route = createFileRoute("/frass-kicks/")({
  beforeLoad: () => {
    throw redirect({ to: "/frass-district", replace: true });
  },
});
