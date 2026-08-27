// FRASS-0513 / FRASS-0514 / FRASS-0590 — Core Route Registry.
//
// Members never type URLs. Frassy, buttons and menus take them where they are
// going. This file no longer keeps its own private map of Frass Hill: it is
// DERIVED from the one authoritative registry in `hierarchy.ts`, so Frassy can
// never contradict the visible menus.

import { allNavNodes, type NavNode } from "./hierarchy";

export type CoreRoute = {
  /** Stable key used by Frassy's navigation tool. */
  key: string;
  /** What a member calls it, in everyday language. */
  label: string;
  /** The internal path — an implementation detail members never see. */
  path: string;
  /** Requires a signed-in member; unauthenticated visitors go to sign-in first. */
  requiresAuth: boolean;
  /** Founder / owner only. */
  founderOnly?: boolean;
  /** This path intentionally redirects somewhere else. */
  redirectsTo?: string;
  /** Things a member might say that mean this place. */
  spoken: string[];
};

/** Paths that deliberately land somewhere else. */
const REDIRECTS: Record<string, string> = {
  "/daily": "/room?daily=true",
};

function toCoreRoute(node: NavNode): CoreRoute {
  const founderOnly = node.audience === "FOUNDER" || node.audience === "ADMIN";
  return {
    key: node.key,
    label: node.label,
    path: node.path,
    requiresAuth: founderOnly || node.audience === "MEMBER" || node.audience === "CREATOR",
    ...(founderOnly ? { founderOnly: true } : {}),
    ...(REDIRECTS[node.path] ? { redirectsTo: REDIRECTS[node.path] } : {}),
    spoken: node.spoken ?? [node.label.toLowerCase()],
  };
}

export const CORE_ROUTES: CoreRoute[] = (() => {
  const seen = new Set<string>();
  const routes: CoreRoute[] = [];
  for (const node of allNavNodes()) {
    if (seen.has(node.key)) continue;
    seen.add(node.key);
    routes.push(toCoreRoute(node));
  }
  return routes;
})();


export function coreRouteByKey(key: string): CoreRoute | undefined {
  return CORE_ROUTES.find((r) => r.key === key);
}

/** Match what a member actually said to a destination. Never returns a URL to read aloud. */
export function matchSpokenDestination(text: string): CoreRoute | undefined {
  const t = text.toLowerCase();
  let best: { route: CoreRoute; len: number } | undefined;
  for (const route of CORE_ROUTES) {
    for (const phrase of [route.label.toLowerCase(), ...route.spoken]) {
      if (t.includes(phrase) && (!best || phrase.length > best.len)) {
        best = { route, len: phrase.length };
      }
    }
  }
  return best?.route;
}

/** Where an onboarding action should send someone, given whether they are signed in. */
export function onboardingDestination(signedIn: boolean): string {
  return signedIn ? "/onboarding" : "/auth?next=%2Fonboarding";
}
