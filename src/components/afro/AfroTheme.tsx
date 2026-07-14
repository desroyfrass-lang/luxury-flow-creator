import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { FrassyGold } from "./FrassyGold";

/**
 * Wraps a subtree in the Afro Designers light-Caribbean theme.
 * Scoped design tokens (ocean, gold, chrome) live under `.afro-theme` in styles.css.
 */
export function AfroTheme({ children }: { children: ReactNode }) {
  return (
    <div className="afro-theme min-h-screen relative overflow-hidden">
      <AfroBackdrop />
      <AfroTopBar />
      <div className="relative">{children}</div>
    </div>
  );
}

function AfroTopBar() {
  return (
    <div className="relative z-20 mx-auto max-w-[1600px] px-6 lg:px-12 pt-6 flex items-center justify-between">
      <Link
        to="/afro-designers"
        aria-label="Afro Designers home"
        className="inline-flex items-center gap-3"
      >
        <FrassyGold className="h-10 w-10" />
        <span className="afro-serif text-xl text-[color:var(--afro-ink)]">Afro Designers</span>
      </Link>
      <Link
        to="/"
        className="text-[10px] uppercase tracking-[0.35em] text-[color:var(--afro-ocean-deep)] hover:text-[color:var(--afro-gold)] transition"
      >
        ← Return to Frass Kicks
      </Link>
    </div>
  );
}

function AfroBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-0">
      {/* Sky-to-sand wash */}
      <div className="absolute inset-0 afro-sky-wash" />
      {/* Soft ocean waves band */}
      <div className="absolute inset-x-0 top-[40vh] h-[60vh] afro-wave-band opacity-70" />
      {/* Sun bloom */}
      <div className="absolute left-1/2 -top-40 h-[70vh] w-[70vh] -translate-x-1/2 rounded-full afro-sun-bloom" />
      {/* Gold shimmer particles */}
      <div className="absolute inset-0 afro-glitter" />
    </div>
  );
}
