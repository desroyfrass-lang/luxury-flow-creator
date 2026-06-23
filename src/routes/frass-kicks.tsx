import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/frass-kicks")({
  component: () => <Outlet />,
});
