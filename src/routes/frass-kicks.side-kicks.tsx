import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/frass-kicks/side-kicks")({
  component: () => <Outlet />,
});