import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/bare-drip")({
  component: () => <Outlet />,
});
