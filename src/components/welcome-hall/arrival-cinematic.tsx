import { useEffect, useState } from "react";
import archHero from "@/assets/frass-gateway-arch.jpg.asset.json";

/**
 * FRASS-0924 (recovered from /arrival) — the camera passes beneath the arch
 * while Frassy narrates and the town's sounds are named as they grow.
 * Captions only: no audio is played. Shown to genuine first arrivals only.
 */
const NARRATION: { at: number; line: string; sound: string }[] = [
  { at: 600, line: "Welcome to Frass Hill.", sound: "A warm breeze through the palms" },
  { at: 4200, line: "This isn't simply a marketplace.", sound: "Dominoes, somewhere ahead" },
  { at: 8000, line: "It's a community built by people.", sound: "Children laughing below the road" },
  { at: 12000, line: "Everything you see has a purpose.", sound: "Music drifting from the studios" },
];
const END_AT = 15000;

export function ArrivalCinematic({ onDone }: { onDone: () => void }) {
  const [act, setAct] = useState<"passing" | "climbing">("passing");
  const [spoken, setSpoken] = useState(1);

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      onDone();
      return;
    }
    const timers = [
      ...NARRATION.map((n, i) => setTimeout(() => setSpoken(i + 1), n.at)),
      setTimeout(() => setAct("climbing"), 3000),
      setTimeout(onDone, END_AT),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  const current = NARRATION[spoken - 1];

  return (
    <section
      className="fixed inset-0 z-[55] overflow-hidden bg-black text-white"
      aria-label="Arriving at Frass Hill"
      data-testid="arrival-cinematic"
    >
      <img
        src={archHero.url}
        alt="Passing beneath the Frass Arch onto the road up the hill"
        className="absolute inset-0 h-full w-full object-cover transition-all duration-[9000ms] ease-[cubic-bezier(0.33,0.6,0.2,1)]"
        style={{
          transform: act === "passing" ? "scale(1.05)" : "scale(1.9)",
          filter: act === "climbing" ? "brightness(0.85)" : undefined,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/85" />
      <div className="relative flex min-h-full flex-col items-center justify-center px-6 text-center" style={{ minHeight: "100vh" }}>
        <p key={spoken} aria-live="polite" className="animate-fade-in font-display text-3xl leading-tight sm:text-5xl">
          {current.line}
        </p>
        <p className="mt-6 text-[10px] uppercase tracking-[0.35em] text-white/60">{current.sound}</p>
        <button
          type="button"
          onClick={onDone}
          className="absolute bottom-10 rounded-full border border-[color:var(--hill-gold)]/60 px-5 py-2 text-[10px] font-bold uppercase tracking-[0.3em] text-[color:var(--hill-gold)] transition hover:bg-[color:var(--hill-gold)]/10"
        >
          Skip
        </button>
      </div>
    </section>
  );
}
