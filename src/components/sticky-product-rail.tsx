import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { X, ArrowUpRight } from "lucide-react";

interface StickyProductRailProps {
  image: string;
  title: string;
  eyebrow?: string;
  handle: string;
  storageKey?: string;
}

/**
 * Desktop-only sticky side rail that pins a featured product to the viewport
 * as the user scrolls the home page. Dismissible; state persists per session.
 */
export function StickyProductRail({
  image,
  title,
  eyebrow = "Now stepping",
  handle,
  storageKey = "sticky-rail-dismissed",
}: StickyProductRailProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(storageKey) === "1") return;
    // Reveal after a short scroll so it doesn't compete with the hero.
    const onScroll = () => {
      if (window.scrollY > 480) {
        setVisible(true);
        window.removeEventListener("scroll", onScroll);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [storageKey]);

  const dismiss = () => {
    setVisible(false);
    if (typeof window !== "undefined") sessionStorage.setItem(storageKey, "1");
  };

  return (
    <div
      className={`pointer-events-none fixed right-5 bottom-5 z-40 hidden lg:block transition-all duration-500 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
      aria-hidden={!visible}
    >
      <div className="pointer-events-auto relative w-[260px] overflow-hidden rounded-2xl border border-[color:var(--gold)]/40 bg-[color:var(--ink,#0a0a0a)]/85 backdrop-blur-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)]">
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="absolute top-2 right-2 z-10 grid h-7 w-7 place-items-center rounded-full bg-background/60 backdrop-blur text-foreground/80 hover:bg-background hover:text-foreground transition"
        >
          <X className="h-3.5 w-3.5" />
        </button>
        <Link
          to="/product/$handle"
          params={{ handle }}
          className="group block"
        >
          <div className="relative aspect-[4/5] overflow-hidden">
            <img
              src={image}
              alt={title}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.05]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4">
              <div className="text-[9px] uppercase tracking-[0.35em] text-[color:var(--gold)]">
                {eyebrow}
              </div>
              <div className="mt-1 font-display text-lg leading-tight text-white">
                {title}
              </div>
              <div className="mt-3 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.3em] text-white/80 group-hover:text-[color:var(--gold)] transition">
                Shop now <ArrowUpRight className="h-3 w-3" />
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
