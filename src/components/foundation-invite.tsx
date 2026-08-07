import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Heart, X } from "lucide-react";
import foundationImg from "@/assets/kids-foundation.jpg";

const SEEN_KEY = "frass:foundation-invite-seen";
/** Invite appears after this much browsing time, never sooner. */
const DELAY_MS = 12 * 60 * 1000;

/**
 * A gentle, once-per-session invitation to learn about the Frass Foundation
 * while browsing FRASS Kids. Never interrupts a checkout, never guilts.
 */
export function FoundationInvite({ cause = "kids" }: { cause?: "kids" | "community" }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SEEN_KEY)) return;
    const t = setTimeout(() => {
      sessionStorage.setItem(SEEN_KEY, "1");
      setOpen(true);
    }, DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  if (!open) return null;

  const chooseDonation = () => {
    try {
      localStorage.setItem("frass:donation-cause", cause);
    } catch {
      /* ignore */
    }
    setOpen(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Frass Foundation"
      className="fixed inset-0 z-[80] flex items-end justify-center bg-background/70 p-4 backdrop-blur-sm sm:items-center"
    >
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-[color:var(--gold)]/30 bg-card shadow-2xl">
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 rounded-full bg-background/70 p-2 text-foreground/70 transition hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative aspect-[16/9] w-full overflow-hidden">
          <img
            src={foundationImg}
            alt="Children learning together in a Frass Foundation classroom"
            loading="lazy"
            width={1536}
            height={1024}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(to_top,oklch(0.09_0.01_60/0.92),transparent_60%)]" />
        </div>

        <div className="p-7">
          <p className="text-[10px] uppercase tracking-[0.38em] text-[color:var(--gold)]">
            The Frass Foundation
          </p>
          <h2 className="mt-3 font-display text-3xl uppercase leading-none md:text-4xl">
            Help Build Brighter Futures
          </h2>
          <p className="mt-4 font-script text-lg italic text-[color:var(--gold)]">
            “Every child deserves the opportunity to learn, grow, and dream.”
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            The Frass Foundation supports children and families through Frass Hill
            initiatives — classrooms, school supplies, mentorship and community
            programmes. Every contribution goes toward keeping a child learning.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              to="/checkout"
              onClick={chooseDonation}
              className="inline-flex items-center gap-2 rounded-full bg-[color:var(--gold)] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.26em] text-[color:var(--ink,#0d0d0d)]"
            >
              <Heart className="h-3.5 w-3.5" /> Add a donation
            </Link>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full border border-border px-6 py-3 text-[11px] uppercase tracking-[0.26em] text-muted-foreground transition hover:text-foreground"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
