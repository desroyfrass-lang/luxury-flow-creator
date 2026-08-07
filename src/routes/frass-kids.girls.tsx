import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/frass-kids/girls")({
  beforeLoad: () => {
    throw redirect({ to: "/frass-kids" });
  },
  component: () => null,
});
