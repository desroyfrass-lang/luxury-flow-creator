import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/frass-kids/boys")({
  beforeLoad: () => {
    throw redirect({ to: "/frass-kids" });
  },
  component: () => null,
});
