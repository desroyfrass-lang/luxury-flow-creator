import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * FRASS-0924 — RETIRED as a separate page. Its arch journey, Frassy's four
 * lines and the sound captions now play inside the first arrival
 * (arrival-cinematic.tsx); its drag-across-town overlook lives at the top of
 * /frass-hill (first-overlook.tsx). Old links land on the town in one hop.
 * The Frass Gateway Arch photo is kept as a brand asset.
 */
export const Route = createFileRoute("/arrival")({
  beforeLoad: () => {
    throw redirect({ to: "/frass-hill", replace: true });
  },
});
