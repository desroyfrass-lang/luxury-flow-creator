// FRASS-0502 Deployment Gate follow-up: /daily is an expected URL.
// There is no second Daily application — this is a pure redirect into the one
// canonical Daily that lives inside My Workspace.
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/daily")({
  beforeLoad: () => {
    throw redirect({ to: "/room", search: { daily: true } });
  },
});
