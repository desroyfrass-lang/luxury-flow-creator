import { createFileRoute } from "@tanstack/react-router";
import { WorkspaceRoom } from "@/components/workspace/workspace-room";

export const Route = createFileRoute("/_authenticated/room")({
  head: () => ({
    meta: [
      { title: "Founder Room — Frass OS Workspace" },
      {
        name: "description",
        content:
          "The Frass OS professional workspace: projects, conversation sections, task panel, workspace timeline and a persistent composer with Frassy.",
      },
      { property: "og:title", content: "Founder Room — Frass OS Workspace" },
      {
        property: "og:description",
        content:
          "A professional AI workspace where Frassy is the operating partner and the room is the office.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: () => <WorkspaceRoom />,
});
