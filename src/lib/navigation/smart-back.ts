// Navigation Foundation Repair — Phase 1.
//
// One Back rule for the whole site:
//   • Adults: Back means the place you were actually on before, when that was
//     a safe page inside Frass. If you arrived directly (or the previous page
//     was sign-in, a payment hand-off or a one-time ceremony), Back goes to the
//     page's canonical parent from the place registry — never a generic
//     Welcome Hall or Founder Hall dump.
//   • Kids World (locked mode): Back may only return to a previous Kids World
//     page. If there is none, it stays at the Kids World home.
//
// This reuses the router's own history index; it is not a new router.
import { useCallback, useEffect } from "react";
import { useRouter, useRouterState } from "@tanstack/react-router";
import { intentionalParent } from "./hierarchy";

const STORE_KEY = "frass-nav-trail-v1";
const KIDS_HOME = "/kids-world";

type Trail = Record<string, string>;

function readTrail(): Trail {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.sessionStorage.getItem(STORE_KEY) ?? "{}") as Trail;
  } catch {
    return {};
  }
}

function writeTrail(trail: Trail) {
  try {
    window.sessionStorage.setItem(STORE_KEY, JSON.stringify(trail));
  } catch {
    /* storage unavailable — Back simply uses the registry parent */
  }
}

function currentIndex(): number | null {
  if (typeof window === "undefined") return null;
  const idx = (window.history.state as { __TSR_index?: unknown } | null)?.__TSR_index;
  return typeof idx === "number" ? idx : null;
}

/** The page the visitor was on immediately before this one, in this tab. */
export function previousInAppHref(): string | null {
  const idx = currentIndex();
  if (idx === null || idx <= 0) return null;
  return readTrail()[String(idx - 1)] ?? null;
}

/** Pages Back must never return an adult to. */
export function isSafeAdultBackTarget(href: string): boolean {
  const [path, search = ""] = href.split("?");
  if (/^\/(auth|reset-password|signed-out|pay|api|checkout|lovable)(\/|$)/.test(path)) return false;
  if (path === "/welcome-hall" && /(^|&)(welcome|arrival)=/.test(search)) return false;
  if (path === "/arrival" || path === "/gateway" || path === "/welcome") return false;
  return true;
}

export function isKidsPath(path: string): boolean {
  return path === KIDS_HOME || path.startsWith(`${KIDS_HOME}/`);
}

/** Mounted once in the root: remembers which page sits at each history slot. */
export function NavHistoryTracker() {
  const href = useRouterState({ select: (s) => s.location.href });
  useEffect(() => {
    const idx = currentIndex();
    if (idx === null) return;
    const trail = readTrail();
    trail[String(idx)] = href;
    // Forget forward slots that a new navigation has replaced.
    for (const k of Object.keys(trail)) if (Number(k) > idx + 50) delete trail[k];
    writeTrail(trail);
  }, [href]);
  return null;
}

/** Adult Back: real previous page when safe, otherwise the registry parent. */
export function useAdultBack() {
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const fallback = intentionalParent(pathname);
  const goBack = useCallback(() => {
    const prev = previousInAppHref();
    if (prev && isSafeAdultBackTarget(prev)) {
      router.history.back();
      return;
    }
    void router.navigate({ to: fallback as never });
  }, [router, fallback]);
  return { goBack, fallback };
}

/** Kids Back: only ever to a previous Kids World page, else Kids World home. */
export function useKidsBack() {
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const goBack = useCallback(() => {
    const prev = previousInAppHref();
    if (prev && isKidsPath(prev.split("?")[0])) {
      router.history.back();
      return;
    }
    if (pathname !== KIDS_HOME && pathname !== `${KIDS_HOME}/`) {
      void router.navigate({ to: KIDS_HOME });
    }
  }, [router, pathname]);
  return { goBack };
}
