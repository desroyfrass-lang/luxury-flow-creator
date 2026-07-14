import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/social-media-virals")({
  component: () => <Outlet />,
});
