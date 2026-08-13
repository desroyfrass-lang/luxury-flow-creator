import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { WorkspaceRoom } from "@/components/workspace/workspace-room";
import { openTheDaily } from "@/components/workspace/daily-gate";
import { ViewModeFrame } from "@/components/view-mode/simplified-view";

function RoomScreen() {
  const { daily } = Route.useSearch();
  useEffect(() => {
    if (daily) openTheDaily();
  }, [daily]);
  return (
    // FRASS-0517 — the same workspace, presented the member's way.
    <ViewModeFrame place="My Workspace">
      <WorkspaceRoom />
    </ViewModeFrame>
  );
}

export const Route = createFileRoute("/_authenticated/room")({
  validateSearch: (search: Record<string, unknown>): { daily?: true } =>
    search["daily"] === true ||
    search["daily"] === "true" ||
    search["daily"] === "1"
      ? { daily: true }
      : {},
  head: () => ({
    meta: [
      { title: "My Workspace — Frass Operating System" },
      {
        name: "description",
        content:
          "My Workspace: one canonical Frass OS workspace with modes, projects, conversation sections, task panel, timeline and a persistent composer with Frassy.",
      },
      { property: "og:title", content: "My Workspace — Frass Operating System" },
      {
        property: "og:description",
        content:
          "One workspace, many modes. Frassy is the operating partner and the workspace remembers where you left off.",
      },

      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: RoomScreen,
});
