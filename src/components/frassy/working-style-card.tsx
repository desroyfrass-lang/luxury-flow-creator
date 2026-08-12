// FRASS-0478 — the member's window into what Frassy has learned about how they
// like to work, and the one button that makes her forget it.
import { useEffect, useState } from "react";
import {
  describeWorkingStyle,
  forgetWorkingStyle,
  loadWorkingStyle,
  type WorkingStyle,
} from "@/lib/frassy/working-style";

export function WorkingStyleCard() {
  const [style, setStyle] = useState<WorkingStyle | null>(null);

  useEffect(() => {
    setStyle(loadWorkingStyle());
  }, []);

  if (!style) return null;

  return (
    <div className="rounded-2xl border border-border/70 bg-background/60 p-6 backdrop-blur">
      <div className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
        How you like to work
      </div>
      <p className="mt-3 text-sm leading-relaxed">{describeWorkingStyle(style)}</p>
      <p className="mt-2 text-xs text-muted-foreground">
        In plain English: Frassy quietly notices your rhythm — voice or typing, short answers or
        full walkthroughs, morning or evening — so she fits the way you work. It never leaves this
        device, and it never changes who she is.
      </p>
      <button
        type="button"
        onClick={() => {
          forgetWorkingStyle();
          setStyle(loadWorkingStyle());
        }}
        className="mt-4 rounded-sm border border-border px-4 py-2 text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground transition hover:text-foreground"
      >
        Forget how I work
      </button>
    </div>
  );
}
