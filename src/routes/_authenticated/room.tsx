import { createFileRoute } from "@tanstack/react-router";
import { WorkspaceRoom } from "@/components/workspace/workspace-room";

export const Route = createFileRoute("/_authenticated/room")({
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
  component: () => <WorkspaceRoom />,
});
