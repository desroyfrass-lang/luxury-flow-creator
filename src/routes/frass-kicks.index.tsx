import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/frass-kicks/")({
  beforeLoad: () => {
    throw redirect({ to: "/kicks-district" });
  },
});
