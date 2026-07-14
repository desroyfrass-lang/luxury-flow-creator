import type { ReactNode } from "react";

/**
 * Wraps a subtree in the Afro Designers light-Caribbean theme.
 * Scoped design tokens (ocean, gold, chrome) live under `.afro-theme` in styles.css.
 */
export function AfroTheme({ children }: { children: ReactNode }) {
  return (
    <div className="afro-theme min-h-screen relative overflow-hidden">
      <AfroBackdrop />
      <div className="relative">{children}</div>
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
