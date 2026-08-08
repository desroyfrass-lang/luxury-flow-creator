import { useEffect, useState } from "react";
import {
  atmosphereAt,
  blendsFrom,
  memoryOf,
  occasionOn,
  rememberVisit,
  streetLifeIn,
  type HillAtmosphere,
} from "@/lib/frass-hill-movement";
import { hillDistrict } from "@/lib/frass-hill";

/* ---------------- Living time ---------------- */

/** The hour of the town. Renders nothing until hydrated so SSR never mismatches. */
export function HillHourBand({ className = "" }: { className?: string }) {
  const [atmo, setAtmo] = useState<HillAtmosphere | null>(null);
  const [occasion, setOccasion] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => {
      setAtmo(atmosphereAt());
      const o = occasionOn();
      setOccasion(o ? `${o.name} — ${o.feels}` : null);
    };
    tick();
    const t = setInterval(tick, 60_000);
    return () => clearInterval(t);
  }, []);

  if (!atmo) return null;

  return (
    <div
      className={`rounded-2xl border border-[color:var(--hill-gold)]/25 bg-card/40 p-5 ${className}`}
    >
      <div className="flex flex-wrap items-baseline gap-3">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--hill-gold)]">
          Right now in Frass Hill
        </span>
        <span className="font-display text-lg uppercase">{atmo.label}</span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{atmo.mood}</p>
      <p className="mt-1 text-xs italic text-muted-foreground">{atmo.detail}</p>
      {occasion && (
        <p className="mt-3 border-l-2 border-[color:var(--hill-gold)] pl-3 text-xs">{occasion}</p>
      )}
    </div>
  );
}

/** Time-of-day wash laid over a hero image. */
export function HillHourWash() {
  const [wash, setWash] = useState<string | null>(null);
  useEffect(() => setWash(atmosphereAt().wash), []);
  if (!wash) return null;
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 transition-opacity duration-1000"
      style={{ background: wash }}
    />
  );
}

/* ---------------- Street life ---------------- */

/**
 * Things you pass. Not destinations — life. Deliberately not clickable:
 * if you click nothing at all, the town still happens around you.
 */
export function StreetLife({
  districtId,
  className = "",
}: {
  districtId: string;
  className?: string;
}) {
  const moments = streetLifeIn(districtId);
  const [i, setI] = useState(0);

  useEffect(() => {
    if (moments.length < 2) return;
    const t = setInterval(() => setI((n) => (n + 1) % moments.length), 6500);
    return () => clearInterval(t);
  }, [moments.length]);

  if (moments.length === 0) return null;
  const m = moments[i % moments.length]!;

  return (
    <div className={className}>
      <div className="text-[10px] uppercase tracking-[0.28em] text-[color:var(--hill-gold)]">
        On the way
      </div>
      <p
        key={i}
        className="mt-2 animate-fade-in text-sm italic text-muted-foreground"
        aria-live="polite"
      >
        <span className="mr-2 not-italic opacity-60">{SENSE_GLYPH[m.sense]}</span>
        {m.moment}
      </p>
    </div>
  );
}

const SENSE_GLYPH: Record<string, string> = {
  sight: "👁",
  sound: "♪",
  scent: "≋",
  people: "☺",
};

/* ---------------- District transitions ---------------- */

/** Districts don't have borders — they blend. This is the walk between them. */
export function DistrictBlends({
  districtId,
  className = "",
}: {
  districtId: string;
  className?: string;
}) {
  const blends = blendsFrom(districtId);
  if (blends.length === 0) return null;

  return (
    <div className={className}>
      <div className="text-[10px] uppercase tracking-[0.28em] text-[color:var(--hill-gold)]">
        Walking out of here
      </div>
      <div className="mt-3 space-y-3">
        {blends.map((b) => {
          const to = hillDistrict(b.to);
          return (
            <div key={b.to} className="rounded-xl border border-border/50 bg-background/30 p-3">
              <div className="text-xs font-semibold">
                {to?.glyph} toward {to?.name}
              </div>
              <ol className="mt-2 space-y-1">
                {b.stages.map((s, i) => (
                  <li
                    key={s}
                    className="flex gap-2 text-xs text-muted-foreground"
                    style={{ opacity: 0.55 + (i / Math.max(1, b.stages.length - 1)) * 0.45 }}
                  >
                    <span className="text-[color:var(--hill-gold)]">·</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Memory ---------------- */

/** "Last time you were here…" — quiet, once, never in the way. */
export function TownMemory({
  districtId,
  note,
  className = "",
}: {
  districtId: string;
  /** What the visitor was working on, if the surface knows. */
  note?: string;
  className?: string;
}) {
  const [line, setLine] = useState<string | null>(null);

  useEffect(() => {
    setLine(memoryOf(districtId));
    rememberVisit(districtId, note);
  }, [districtId, note]);

  if (!line) return null;

  return (
    <p
      className={`animate-fade-in border-l-2 border-[color:var(--hill-gold)] pl-3 text-xs italic text-muted-foreground ${className}`}
    >
      {line}
    </p>
  );
}
