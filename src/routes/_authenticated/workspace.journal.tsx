// FRASS-0463 — the Journal is reachable from inside the Workspace too.
// One journal, two doors: /journal and /workspace/journal.

import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/workspace/journal")({
  beforeLoad: () => {
    throw redirect({ to: "/journal" });
  },
});
