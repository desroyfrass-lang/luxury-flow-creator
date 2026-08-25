import { useEffect, useRef, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import {
  FRASSY_ARRIVAL_PORTRAIT_URL,
  FRASSY_HOST_ALT,
  FRASSY_HOST_BREATHE,
} from "@/lib/frassy/character";
import { setEntranceActive } from "@/lib/frassy/host-presence";
import { resolveDestination, type FrassyDestination } from "@/lib/frassy-destinations";

/**
 * Frassy Entrance — the universal host behaviour.
 *
 * First arrival at a major destination in a session: the environment softens,
 * Frassy rises into the centre at ~35% of the viewport, welcomes the visitor,
 * then shrinks and glides to the lower-right corner where she stays available
 * as the companion. Already visited this session: no takeover — she simply
 * says "Welcome back" from the corner.
 *
 * She never blocks: a click, Escape or the skip control sends her aside early.
 */

type Phase = "enter" | "speak" | "depart";

const SESSION_PREFIX = "frassy-host:";

/**
 * FRASS-0210 — the cinematic introduction belongs to the entrance only.
 * Frassy greets once, at the doors of the World of Frass. Everywhere else she
 * is already present and simply continues; she never re-introduces herself.
 */
// Step 2 — the cinematic welcome is revived for the major destinations only.
// The root arrival page (/) performs its own welcome (FRASS-0923) and is
// deliberately absent. Sub-pages, product pages, collection grids, workspace
// pages and admin utilities are not destinations, so they never trigger her:
// `resolveDestination` collapses every URL inside a destination onto one
// canonical id, and the session key is that id — never the raw URL. Refreshes,
// back-navigation, query strings and hash changes therefore never replay it.
const ENTRANCE_IDS = new Set<string>([
  "welcome-hall",
  "frass-hill",
  "district",
  "district-legacy",
]);


function seenThisSession(id: string) {
  if (typeof window === "undefined") return true;
  try {
    return sessionStorage.getItem(SESSION_PREFIX + id) === "1";
  } catch {
    return true;
  }
}

function markSeen(id: string) {
  try {
    sessionStorage.setItem(SESSION_PREFIX + id, "1");
  } catch {
    /* private mode — greet again, no harm */
  }
}

export function FrassyHost() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [greeting, setGreeting] = useState<FrassyDestination | null>(null);
  const [phase, setPhase] = useState<Phase>("enter");
  const [welcomeBack, setWelcomeBack] = useState<string | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  // Destination this instance already reacted to (StrictMode-safe).
  const handled = useRef<string | null>(null);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  // Decide what to do on each destination change.
  useEffect(() => {
    const dest = resolveDestination(pathname);
    if (!dest) return;
    if (handled.current === dest.id) return;
    handled.current = dest.id;

    clearTimers();


    // Only the entrance gets the cinematic welcome — and only once per session.
    if (!ENTRANCE_IDS.has(dest.id) || seenThisSession(dest.id)) return;

    markSeen(dest.id);
    setWelcomeBack(null);
    setGreeting(dest);
    setPhase("enter");


    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const readMs = Math.min(3000, 2000 + dest.welcome.length * 12);

    timers.current.push(setTimeout(() => setPhase("speak"), reduced ? 60 : 350));
    timers.current.push(setTimeout(() => setPhase("depart"), readMs));
    timers.current.push(
      setTimeout(() => {
        setGreeting(null);
        setPhase("enter");
      }, readMs + 700),
    );

  }, [pathname]);


  useEffect(() => () => clearTimers(), []);

  // Step 2 — while she is on stage, every other Frassy surface stands down.
  useEffect(() => {
    setEntranceActive(Boolean(greeting));
    return () => setEntranceActive(false);
  }, [greeting]);

  // Let her step aside early.
  const stepAside = () => {
    if (!greeting || phase === "depart") return;
    clearTimers();
    setPhase("depart");
    timers.current.push(
      setTimeout(() => {
        setGreeting(null);
        setPhase("enter");
      }, 700),
    );
  };

  useEffect(() => {
    if (!greeting) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") stepAside();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (welcomeBack) {
    return (
      <div
        className="pointer-events-none fixed bottom-[5.5rem] right-5 z-40 animate-fade-in"
        aria-live="polite"
      >
        <span className="block rounded-full border border-[color:var(--gold)]/40 bg-[#0b0c0e]/95 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-[color:var(--gold)] shadow-[0_10px_40px_-16px_rgba(0,0,0,0.9)]">
          {welcomeBack}
        </span>
      </div>
    );
  }

  if (!greeting) return null;

  const departing = phase === "depart";

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden px-5 py-[max(4rem,env(safe-area-inset-top))]"
      role="dialog"
      aria-live="polite"
      aria-label={`Frassy welcomes you to ${greeting.label}`}
      onClick={stepAside}
    >
      {/* The environment softens — never hidden, only quieted. */}
      <div
        className="absolute inset-0 backdrop-blur-[6px] transition-opacity duration-[600ms] ease-out"
        style={{
          background:
            "radial-gradient(70% 55% at 50% 45%, rgba(6,6,8,0.62), rgba(6,6,8,0.88))",
          opacity: departing ? 0 : 1,
        }}
      />

      <div
        className="relative flex max-h-full flex-col items-center justify-center text-center transition-all duration-[700ms]"
        style={{
          transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
          opacity: phase === "enter" ? 0 : 1,
          transform: departing
            ? "translate(calc(50vw - 3.75rem), calc(50vh - 3.75rem)) scale(0.16)"
            : phase === "enter"
              ? "translateY(18px) scale(0.94)"
              : "none",
        }}
      >
        {/* The frame reserves her space before the picture loads, so the
            greeting line can never sit over the page header on a narrow
            phone while the image is still arriving. */}
        <div className="relative h-[min(30vh,56vw)] w-[min(30vh,56vw)] shrink-0 sm:h-[min(36vh,44vw)] sm:w-[min(36vh,44vw)]">
          <span
            aria-hidden
            className="absolute inset-0 -z-10 rounded-full blur-3xl"
            style={{ background: "radial-gradient(closest-side, rgba(212,175,55,0.35), transparent 72%)" }}
          />
          <img
            src={FRASSY_ARRIVAL_PORTRAIT_URL}
            alt={FRASSY_HOST_ALT}
            decoding="async"
            className="h-full w-full rounded-full object-cover"
            style={{
              animation: departing ? undefined : FRASSY_HOST_BREATHE,
              boxShadow: "0 40px 120px -50px rgba(212,175,55,0.8)",
            }}
          />
        </div>

        <div
          className="mt-6 max-w-[min(38rem,88vw)] px-2 transition-opacity duration-700 sm:mt-8"
          style={{ opacity: phase === "speak" ? 1 : 0 }}
        >
          <span className="text-[10px] uppercase tracking-[0.4em] text-[color:var(--gold)]">
            {greeting.label}
          </span>
          <p className="mt-4 text-balance text-base leading-relaxed text-white/90 md:text-lg">
            {greeting.welcome}
          </p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              stepAside();
            }}
            className="mt-8 rounded-full border border-white/25 px-6 py-2.5 text-[10px] font-bold uppercase tracking-[0.28em] text-white/80 transition hover:border-[color:var(--gold)]/60 hover:text-white"
          >
            Start exploring
          </button>
        </div>
      </div>
    </div>
  );
}
