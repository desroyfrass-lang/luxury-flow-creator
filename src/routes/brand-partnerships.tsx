// FRASS-0410 — Frass Brand Partnerships Network (layout).
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/brand-partnerships")({
  component: () => <Outlet />,
});
