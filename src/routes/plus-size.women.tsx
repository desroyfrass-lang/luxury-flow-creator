import { createFileRoute, redirect } from "@tanstack/react-router";

/** Legacy path — Plus Size is now the Frass Plus flagship. */
export const Route = createFileRoute("/plus-size/women")({
  beforeLoad: () => {
    throw redirect({ to: "/frass-plus/$gender", params: { gender: "women" } });
  },
});
