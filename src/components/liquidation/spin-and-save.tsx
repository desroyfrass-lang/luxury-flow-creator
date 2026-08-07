import { useEffect, useRef, useState } from "react";

const PRIZES = [
  "10% Off",
  "15% Off",
  "Free Shipping",
  "Bonus Reward Points",
  "Early Access",
  "Mystery Gift",
];

const KEY = "frass-spin-month";

function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()}`;
}

/** Once-a-month luxury prize wheel. Frost Kicks chrome + gold edition. */
export function SpinAndSave() {
  const [used, setUsed] = useState<string | null>(null);
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [prize, setPrize] = useState<string | null>(null);
  const [hovered, setHovered] = useState(false);
  const hydrated = useRef(false);

  useEffect(() => {
    hydrated.current = true;
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const [month, won] = raw.split("|");
      if (month === currentMonth()) {
        setUsed(won ?? "");
        setPrize(won ?? null);
      }
    }
  }, []);

  const spin = () => {
    if (spinning || used !== null) return;
    setSpinning(true);
    const index = Math.floor(Math.random() * PRIZES.length);
    const slice = 360 / PRIZES.length;
    const target = 360 * 6 + (360 - index * slice - slice / 2);
    setAngle(target);
    window.setTimeout(() => {
      setSpinning(false);
      const won = PRIZES[index];
      setPrize(won);
      setUsed(won);
      window.localStorage.setItem(KEY, `${currentMonth()}|${won}`);
    }, 4200);
  };

  const slice = 360 / PRIZES.length;

  return (
    <section className="mx-auto max-w-[1200px] px-4 py-14 md:px-12 md:py-20">
      <div
        className="relative grid items-center gap-10 overflow-hidden rounded-[1.5rem] border border-[color:var(--gold)]/25 bg-[color-mix(in_oklab,var(--foreground)_5%,transparent)] p-8 backdrop-blur-sm md:grid-cols-2 md:gap-16 md:p-14"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Animated gold glow background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-60 transition-opacity duration-700"
          style={{
            background:
              "radial-gradient(circle at 70% 50%, oklch(0.78 0.14 78 / 0.22), transparent 55%), radial-gradient(circle at 30% 20%, oklch(0.82 0.01 250 / 0.12), transparent 45%)",
            filter: hovered ? "blur(40px) brightness(1.25)" : "blur(34px)",
            transition: "filter 700ms ease, opacity 700ms ease",
          }}
        />

        {/* Chrome shimmer overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            background:
              "linear-gradient(135deg, transparent 0%, oklch(1 0 0 / 0.06) 25%, transparent 50%, oklch(1 0 0 / 0.04) 75%, transparent 100%)",
            backgroundSize: "200% 200%",
            animation: "chrome-pan 10s ease-in-out infinite",
          }}
        />

        <div className="relative z-10">
          <p className="text-[10px] uppercase tracking-[0.35em] text-[color:var(--gold)]">
            Once a month
          </p>
          <h2 className="mt-3 font-display text-3xl uppercase tracking-[0.08em] md:text-5xl">
            Spin &amp; Save
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            One spin per visitor, per month. Quiet luxury rewards — no cheap gimmicks, no pop-ups
            chasing you around the district.
          </p>
          <p className="mt-6 text-sm text-muted-foreground">
            {prize ? (
              <span className="font-display text-lg uppercase tracking-[0.16em] text-[color:var(--gold)]">
                You hold: {prize}
              </span>
            ) : (
              "Your spin is waiting."
            )}
          </p>
          <button
            type="button"
            onClick={spin}
            disabled={spinning || used !== null}
            className="group relative mt-6 inline-flex items-center overflow-hidden rounded-full border border-[color:var(--gold)]/60 bg-[color-mix(in_oklab,var(--gold)_8%,transparent)] px-8 py-3 text-[11px] uppercase tracking-[0.28em] text-[color:var(--gold)] transition-all duration-500 hover:border-[color:var(--gold)] hover:bg-[color:var(--gold)] hover:text-[color:var(--gold-foreground)] hover:shadow-[0_0_40px_-8px_oklch(0.78_0.14_78/0.85)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span className="relative z-10">
              {used !== null ? "Come back next month" : spinning ? "Spinning…" : "Spin the wheel"}
            </span>
            <span className="absolute inset-0 -translate-x-full bg-[var(--gradient-gold)] opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-20" />
          </button>
        </div>

        <div className="relative z-10 mx-auto aspect-square w-full max-w-[360px]">
          {/* Outer chrome halo */}
          <div
            className="absolute -inset-6 rounded-full opacity-70 transition-all duration-700"
            style={{
              background:
                "radial-gradient(circle, oklch(0.78 0.14 78 / 0.18) 0%, oklch(0.82 0.01 250 / 0.08) 45%, transparent 70%)",
              filter: hovered ? "blur(28px) brightness(1.3)" : "blur(22px)",
            }}
          />

          {/* Gold pointer */}
          <div className="absolute left-1/2 top-0 z-30 h-0 w-0 -translate-x-1/2 border-x-8 border-t-[22px] border-x-transparent border-t-[color:var(--gold)] drop-shadow-[0_0_12px_oklch(0.78_0.14_78/0.9)]" />

          {/* Wheel rim / chrome bezel */}
          <div
            className="absolute -inset-2 rounded-full"
            style={{
              background:
                "conic-gradient(from 0deg, oklch(0.88 0.01 250) 0%, oklch(0.72 0.01 250) 12%, oklch(0.95 0.005 250) 25%, oklch(0.78 0.14 78) 38%, oklch(0.92 0.09 85) 50%, oklch(0.78 0.14 78) 62%, oklch(0.95 0.005 250) 75%, oklch(0.72 0.01 250) 88%, oklch(0.88 0.01 250) 100%)",
              boxShadow:
                "inset 0 0 24px oklch(0 0 0 / 0.65), 0 0 0 1px oklch(0.78 0.14 78 / 0.45), 0 30px 90px -30px oklch(0 0 0 / 0.85)",
            }}
          />

          {/* Spinning wheel */}
          <div
            className="relative h-full w-full rounded-full border-[5px] border-[color:var(--gold)]/40 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)]"
            style={{
              transform: `rotate(${angle}deg)`,
              transition: "transform 4s cubic-bezier(0.16, 1, 0.3, 1)",
              background: `conic-gradient(${PRIZES.map((_, i) => {
                const c =
                  i % 2 === 0
                    ? "color-mix(in oklab, var(--gold) 48%, black)"
                    : "color-mix(in oklab, black 90%, var(--gold))";
                return `${c} ${i * slice}deg ${(i + 1) * slice}deg`;
              }).join(", ")})`,
            }}
          >
            {/* Chrome divider lines */}
            {PRIZES.map((_, i) => (
              <div
                key={`line-${i}`}
                className="absolute left-1/2 top-1/2 h-[50%] w-[2px] origin-top"
                style={{
                  transform: `rotate(${i * slice}deg)`,
                  background:
                    "linear-gradient(180deg, oklch(0.92 0.09 85 / 0.95), oklch(0.78 0.14 78 / 0.4), transparent)",
                }}
              />
            ))}

            {PRIZES.map((p, i) => (
              <div
                key={p}
                className="absolute left-1/2 top-1/2 origin-left"
                style={{ transform: `rotate(${i * slice + slice / 2}deg)` }}
              >
                <span className="ml-10 block w-24 text-[9px] uppercase tracking-[0.14em] text-[color:var(--gold-soft)] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                  {p}
                </span>
              </div>
            ))}

            {/* Inner chrome ring */}
            <div
              className="absolute left-1/2 top-1/2 h-[42%] w-[42%] -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 30% 30%, oklch(1 0 0 / 0.95), oklch(0.82 0.01 250 / 0.85) 40%, oklch(0.55 0.02 250 / 0.9) 100%)",
                boxShadow:
                  "inset 0 0 18px oklch(0 0 0 / 0.55), 0 0 0 2px oklch(0.78 0.14 78 / 0.5), 0 0 30px -4px oklch(0.78 0.14 78 / 0.45)",
              }}
            />
          </div>

          {/* Center hub button */}
          <button
            type="button"
            onClick={spin}
            disabled={spinning || used !== null}
            className="absolute left-1/2 top-1/2 z-20 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[color:var(--gold)]/70 bg-gradient-to-br from-[color:var(--chrome-soft)] via-[color:var(--chrome)] to-[color:var(--gold)] text-[10px] font-display uppercase tracking-wider text-[color:var(--ink)] shadow-[0_0_30px_-4px_oklch(0.78_0.14_78/0.65)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_50px_-2px_oklch(0.78_0.14_78/0.9)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]">
              {spinning ? "…" : "Spin"}
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
