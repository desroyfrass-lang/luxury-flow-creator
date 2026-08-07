import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/kicks-district")({
  beforeLoad: () => {
    throw redirect({ to: "/shop-frass" });
  },
});
