// FRASS-0560 — Founder Preview Reset. Every build begins at the front door.
//
// When a new preview build finishes and the Founder is sitting somewhere in
// the middle of the platform, Frass rewinds the movie: back to frasskicks.com,
// the same place every real member starts. Members are never affected — this
// only runs for the Founder, and only when they've left it switched on.
import { useEffect } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { toast } from "sonner";
import { isNewBuild, previewResetEnabled } from "@/lib/founder/simulator";
import { useIsAdmin } from "@/hooks/use-is-admin";

declare const __FRASS_BUILD_ID__: string | undefined;

export function FounderPreviewReset() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { isAdmin } = useIsAdmin();

  useEffect(() => {
    if (!isAdmin) return;
    if (!previewResetEnabled()) return;
    const stamp = typeof __FRASS_BUILD_ID__ === "string" ? __FRASS_BUILD_ID__ : "dev";
    if (!isNewBuild(stamp)) return;
    if (pathname === "/") return;
    toast("New build — back to the front door.", {
      description: "Every test starts where every member starts.",
    });
    void navigate({ to: "/" });
    // Runs once per build, on the first render after it loads.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  return null;
}
