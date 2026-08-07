import { createFileRoute, redirect } from "@tanstack/react-router";

/** Frass District is now the homepage — keep the old URL working. */
export const Route = createFileRoute("/shop-frass")({
  beforeLoad: () => {
    throw redirect({ to: "/", replace: true });
  },
});
