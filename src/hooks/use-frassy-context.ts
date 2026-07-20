// Situational awareness for Frassy.
// Decides whether Frassy is allowed to proactively surface (greet, pulse,
// auto-open on cart-add) based on the shopper's current context.

import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";

export type FrassyMode = "shopping" | "checkout" | "reading" | "workspace" | "auth";

const CHECKOUT_ROUTES = ["/checkout", "/cart"];
// Spec 032 — Attention Awareness: product pages, lookbooks, journals, blog,
// capsule detail, and any long-form reading surface are "reading" (no proactive
// interruption).
const READING_ROUTES = [
  "/blog",
  "/lookbook",
  "/lookbooks",
  "/story",
  "/journal",
  "/product/",
  "/capsules/",
  "/social-media-virals/",
  "/afro-designers/designers/",
];
const WORKSPACE_ROUTES = ["/admin", "/workspace", "/frassy"];
const AUTH_ROUTES = ["/auth", "/login", "/signup", "/reset"];

function classify(pathname: string): FrassyMode {
  if (CHECKOUT_ROUTES.some((r) => pathname.startsWith(r))) return "checkout";
  if (AUTH_ROUTES.some((r) => pathname.startsWith(r))) return "auth";
  if (WORKSPACE_ROUTES.some((r) => pathname.startsWith(r))) return "workspace";
  if (READING_ROUTES.some((r) => pathname.startsWith(r) || pathname.includes(r))) return "reading";
  return "shopping";
}

export function useFrassyContext() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const mode = classify(pathname);

  // Idle tracker — resets on any user interaction; used to offer help after ~90s
  // of no interaction while browsing.
  const [idleSeconds, setIdleSeconds] = useState(0);
  useEffect(() => {
    if (typeof window === "undefined") return;
    let last = Date.now();
    const bump = () => {
      last = Date.now();
      setIdleSeconds(0);
    };
    const events = ["mousemove", "keydown", "scroll", "touchstart", "click"];
    events.forEach((e) => window.addEventListener(e, bump, { passive: true }));
    const iv = window.setInterval(() => {
      setIdleSeconds(Math.round((Date.now() - last) / 1000));
    }, 5000);
    return () => {
      events.forEach((e) => window.removeEventListener(e, bump));
      window.clearInterval(iv);
    };
  }, [pathname]);

  // Spec 032 — Attention Awareness: never surface while a form field is focused
  // (typing address, payment, search, etc.). Tracked via focusin/focusout.
  const [formActive, setFormActive] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const check = () => {
      const el = document.activeElement as HTMLElement | null;
      if (!el) return setFormActive(false);
      const tag = el.tagName;
      const editable = (el as HTMLElement).isContentEditable;
      setFormActive(tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || editable);
    };
    const on = () => check();
    document.addEventListener("focusin", on);
    document.addEventListener("focusout", on);
    return () => {
      document.removeEventListener("focusin", on);
      document.removeEventListener("focusout", on);
    };
  }, []);

  const attentionOk = mode === "shopping" && !formActive;
  const canProactivelySpeak = attentionOk;
  const canAutoOpenOnCart = attentionOk;
  const shouldOfferHelp = attentionOk && idleSeconds >= 90;

  return { mode, pathname, idleSeconds, formActive, canProactivelySpeak, canAutoOpenOnCart, shouldOfferHelp };
}

// Simple seasonal accent — presentation only, not a personality shift.
export type FrassySeason = "holiday" | "valentine" | "summer" | "fall" | "spring" | "none";
export function currentSeason(now: Date = new Date()): FrassySeason {
  const m = now.getMonth(); // 0-11
  const d = now.getDate();
  if (m === 11 || (m === 0 && d <= 5)) return "holiday";
  if (m === 1) return "valentine";
  if (m >= 5 && m <= 7) return "summer";
  if (m >= 8 && m <= 10) return "fall";
  if (m >= 2 && m <= 4) return "spring";
  return "none";
}

export function seasonalAccent(season: FrassySeason): string | null {
  switch (season) {
    case "holiday":
      return "It's the holiday season — I've found some festive favorites for you.";
    case "valentine":
      return "Love is in the air — want to see a few pieces perfect for date night?";
    case "summer":
      return "Ready for something fresh this season? Summer capsules just landed.";
    case "fall":
      return "Layer weather is here — I curated a few fall-ready picks.";
    case "spring":
      return "Fresh spring drops are in — want a look?";
    default:
      return null;
  }
}
