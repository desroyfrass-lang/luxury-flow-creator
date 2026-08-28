// DEPRECATED — FOUNDER REVIEW.
// The original My Workspace room, preserved intact so nothing is destroyed
// while the canonical Workshop (/workshop) becomes the one execution
// environment. Nothing links here from member navigation.

import { createFileRoute } from "@tanstack/react-router";
import { WorkspaceRoom } from "@/components/workspace/workspace-room";
import { ViewModeFrame } from "@/components/view-mode/simplified-view";
import { WelcomeGate } from "@/components/welcome-gate";

export const Route = createFileRoute("/_authenticated/room-classic")({
  head: () => ({
    meta: [
      { title: "Classic Workspace — Frass (archived)" },
      {
        name: "description",
        content: "The previous My Workspace room, kept for reference while the Workshop is canonical.",
      },
      { property: "og:title", content: "Classic Workspace — Frass (archived)" },
      {
        property: "og:description",
        content: "Archived workspace room retained during the Daily/Workshop consolidation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: () => (
    <WelcomeGate>
      <ViewModeFrame place="Classic Workspace">
        <WorkspaceRoom />
      </ViewModeFrame>
    </WelcomeGate>
  ),
});
