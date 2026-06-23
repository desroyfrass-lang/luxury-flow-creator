import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/frass-drip")({
  component: () => <Outlet />,
});
