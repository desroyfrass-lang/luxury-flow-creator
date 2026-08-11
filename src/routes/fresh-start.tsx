import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * FRASS-0471 — Clean Arrival Test Route.
 *
 * Wipes every trace of a previous visit from this browser (session, cached
 * greeting flags, stored preferences) and drops the tester back at the front
 * door as a complete stranger. Nothing server-side is deleted — a brand-new
 * email address is still a brand-new member.
 */
export const Route = createFileRoute("/fresh-start")({
  head: () => ({
    meta: [
      { title: "Fresh start — arrive at Frass as a stranger" },
      {
        name: "description",
        content:
          "Clears this browser's Frass session and saved arrival state, so the welcome experience plays exactly as a first-time visitor would see it.",
      },
      { property: "og:title", content: "Fresh start — Frass" },
      { property: "og:description", content: "Clear this browser and arrive as a first-time visitor." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: FreshStart,
});

function FreshStart() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    let alive = true;
    const wipe = async () => {
      try {
        await supabase.auth.signOut({ scope: "global" });
      } catch {
        try {
          await supabase.auth.signOut();
        } catch {
          /* already signed out */
        }
      }
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch {
        /* private mode — nothing to clear */
      }
      if (alive) setDone(true);
    };
    void wipe();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-lg px-6 py-28 text-center">
        <div className="text-[11px] uppercase tracking-[0.32em] text-[color:var(--gold)]">
          Clean arrival
        </div>
        <h1 className="mt-3 font-display text-5xl">
          {done ? "This browser is a stranger again." : "Clearing this browser…"}
        </h1>
        <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
          {done
            ? "Signed out everywhere, saved preferences cleared, nothing remembered. Walk up to the front door and Frass will greet you exactly as it greets a first-time visitor."
            : "One moment — ending the session and clearing anything this browser remembered."}
        </p>
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          <span className="text-[color:var(--gold)]">What this means in plain English: </span>
          it's like handing someone a brand-new phone before they visit the site — no history, no
          shortcuts, no half-finished setup.
        </p>
        {done && (
          <Link
            to="/"
            className="lux-press mt-10 inline-flex rounded-sm border border-[color:var(--gold)] bg-[color:var(--gold)] px-7 py-3.5 text-[11px] font-bold uppercase tracking-[0.3em] text-[color:var(--ink)]"
          >
            Start at the front door
          </Link>
        )}
      </div>
    </main>
  );
}
