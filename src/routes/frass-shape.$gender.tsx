import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/frass-shape/$gender")({
  beforeLoad: ({ params }) => {
    if (params.gender !== "men" && params.gender !== "women") throw notFound();
  },
  component: () => <Outlet />,
});
