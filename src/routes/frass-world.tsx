import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * "Frass World" is retired. Frass Hill IS the world — everything branches from
 * the town plan. This route is kept so existing links keep working.
 */
export const Route = createFileRoute("/frass-world")({
  beforeLoad: () => {
    throw redirect({ to: "/frass-hill", replace: true });
  },
});
