import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/bare-drip/men")({
  component: () => <Outlet />,
});
