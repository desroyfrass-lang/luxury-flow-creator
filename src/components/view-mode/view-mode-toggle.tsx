// FRASS-0517 — the switch between Standard and Simplified View.
// Always in the upper-right of a workspace that supports both.

import { Sparkles, LayoutGrid } from "lucide-react";
import { useViewMode } from "@/lib/view-mode/view-mode";

export function ViewModeToggle({ className = "" }: { className?: string }) {
  const { simplified, toggle, ready } = useViewMode();
  if (!ready) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={simplified}
      title={
        simplified
          ? "Standard View — full dashboards and tools"
          : "Simplified View — a calm conversation with Frassy"
      }
      className={`inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-3 py-1.5 text-[10px] uppercase tracking-[0.28em] text-white/80 backdrop-blur transition hover:border-[color:var(--gold)]/60 hover:text-[color:var(--gold)] ${className}`}
    >
      {simplified ? (
        <>
          <LayoutGrid className="h-3.5 w-3.5" /> Standard View
        </>
      ) : (
        <>
          <Sparkles className="h-3.5 w-3.5" /> Simplified View
        </>
      )}
    </button>
  );
}
