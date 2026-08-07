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

/** Frost Kicks luxury prize wheel — chrome, gold, light, glow. */
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
    const target = 360 * 7 + (360 - index * slice - slice / 2);
    setAngle(target);
    window.setTimeout(() => {
      setSpinning(false);
      const won = PRIZES[index];
      setPrize(won);
      setUsed(won);
      window.localStorage.setItem(KEY, `${currentMonth()}|${won}`);
    }, 4600);
  };

  const slice = 360 / PRIZES.length;

  return (
    <section className="mx-auto max-w-[1400px] px-4 py-16 md:px-12 md:py-24">
      <div
        className="relative grid items-center gap-12 overflow-hidden rounded-[2rem] border border-[color:var(--gold)]/30 bg-[color-mix(in_oklab,var(--foreground)_4%,transparent)] p-10 backdrop-blur-md md:grid-cols-2 md:gap-20 md:p-16"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Animated gold aura */}
        <div
          className="pointer-events-none absolute inset-0 transition-all duration-700"
          style={{
            background:
              "radial-gradient(circle at 75% 45%, oklch(0.78 0.14 78 / 0.32), transparent 58%), radial-gradient(circle at 20% 20%, oklch(0.82 0.01 250 / 0.18), transparent 48%), radial-gradient(circle at 80% 80%, oklch(0.78 0.14 78 / 0.12), transparent 45%)",
            filter: hovered ? "blur(48px) brightness(1.4)" : "blur(38px)",
            opacity: hovered ? 0.9 : 0.7,
            transition: "filter 700ms ease, opacity 700ms ease",
          }}
        />

        {/* Rotating chrome light rays */}
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, oklch(1 0 0 / 0.08) 20deg, transparent 40deg, oklch(1 0 0 / 0.06) 60deg, transparent 80deg, oklch(1 0 0 / 0.1) 100deg, transparent 120deg, oklch(1 0 0 / 0.05) 140deg, transparent 160deg, oklch(1 0 0 / 0.09) 180deg, transparent 200deg, oklch(1 0 0 / 0.06) 220deg, transparent 240deg, oklch(1 0 0 / 0.08) 260deg, transparent 280deg, oklch(1 0 0 / 0.05) 300deg, transparent 320deg, oklch(1 0 0 / 0.07) 340deg, transparent 360deg)",
            animation: "chrome-pan 12s linear infinite",
          }}
        />

        {/* Chrome shimmer sweep */}
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            background:
              "linear-gradient(105deg, transparent 0%, oklch(1 0 0 / 0.08) 28%, transparent 52%, oklch(1 0 0 / 0.05) 74%, transparent 100%)",
            backgroundSize: "250% 250%",
            animation: "chrome-pan 8s ease-in-out infinite",
          }}
        />

        <div className="relative z-10">
          <p className="font-sans text-[11px] uppercase tracking-[0.42em] text-[color:var(--gold)]">
            Once a month
          </p>
          <h2 className="mt-4 font-display text-4xl uppercase tracking-[0.07em] md:text-6xl lg:text-7xl">
            Spin &amp; Save
          </h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground md:text-lg">
            One spin per visitor, per month. Quiet luxury rewards — no cheap gimmicks, no pop-ups
            chasing you around the district.
          </p>
          <div className="mt-8 flex items-center gap-4">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full border border-[color:var(--gold)]/40 bg-[color-mix(in_oklab,var(--gold)_12%,transparent)] font-display text-2xl text-[color:var(--gold)] shadow-[0_0_24px_-6px_oklch(0.78_0.14_78/0.7)]"
              aria-hidden="true"
            >
              F
            </div>
            <p className="text-sm text-muted-foreground">
              {prize ? (
                <span className="font-display text-xl uppercase tracking-[0.14em] text-[color:var(--gold)] md:text-2xl">
                  You hold: {prize}
                </span>
              ) : (
                "Your spin is waiting."
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={spin}
            disabled={spinning || used !== null}
            className="group relative mt-8 inline-flex items-center overflow-hidden rounded-full border-2 border-[color:var(--gold)] bg-[color-mix(in_oklab,var(--gold)_10%,transparent)] px-10 py-4 font-display text-sm uppercase tracking-[0.22em] text-[color:var(--gold)] transition-all duration-500 hover:bg-[color:var(--gold)] hover:text-[color:var(--gold-foreground)] hover:shadow-[0_0_60px_-10px_oklch(0.78_0.14_78/0.95)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span className="relative z-10">
              {used !== null ? "Come back next month" : spinning ? "Spinning…" : "Spin the wheel"}
            </span>
            <span className="absolute inset-0 -translate-x-full bg-[var(--gradient-gold)] opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-25" />
          </button>
        </div>

        <div className="relative z-10 mx-auto aspect-square w-full max-w-[480px]">
          {/* Outer gold halo */}
          <div
            className="absolute -inset-8 rounded-full transition-all duration-700"
            style={{
              background:
                "radial-gradient(circle, oklch(0.78 0.14 78 / 0.22) 0%, oklch(0.82 0.01 250 / 0.1) 40%, transparent 68%)",
              filter: hovered ? "blur(36px) brightness(1.35)" : "blur(28px)",
            }}
          />

          {/* Gold pointer */}
          <div className="absolute left-1/2 top-0 z-30 h-0 w-0 -translate-x-1/2 border-x-[14px] border-t-[28px] border-x-transparent border-t-[color:var(--gold)] drop-shadow-[0_0_18px_oklch(0.78_0.14_78/1)]" />

          {/* Chrome + gold rim */}
          <div
            className="absolute -inset-3 rounded-full"
            style={{
              background:
                "conic-gradient(from 0deg, oklch(0.9 0.01 250) 0%, oklch(0.7 0.01 250) 10%, oklch(0.96 0.005 250) 24%, oklch(0.78 0.14 78) 36%, oklch(0.94 0.1 85) 50%, oklch(0.78 0.14 78) 64%, oklch(0.96 0.005 250) 76%, oklch(0.7 0.01 250) 90%, oklch(0.9 0.01 250) 100%)",
              boxShadow:
                "inset 0 0 30px oklch(0 0 0 / 0.7), 0 0 0 2px oklch(0.78 0.14 78 / 0.55), 0 40px 110px -40px oklch(0 0 0 / 0.9), 0 0 60px -12px oklch(0.78 0.14 78 / 0.5)",
            }}
          />

          {/* Spinning wheel */}
          <div
            className="relative h-full w-full rounded-full border-[6px] border-[color:var(--gold)]/50 shadow-[0_40px_100px_-40px_rgba(0,0,0,0.9)]"
            style={{
              transform: `rotate(${angle}deg)`,
              transition: "transform 4.2s cubic-bezier(0.16, 1, 0.3, 1)",
              background: `conic-gradient(${PRIZES.map((_, i) => {
                const c =
                  i % 2 === 0
                    ? "color-mix(in oklab, var(--gold) 52%, black)"
                    : "color-mix(in oklab, black 88%, var(--gold))";
                return `${c} ${i * slice}deg ${(i + 1) * slice}deg`;
              }).join(", ")})`,
            }}
          >
            {/* Gold divider beams */}
            {PRIZES.map((_, i) => (
              <div
                key={`line-${i}`}
                className="absolute left-1/2 top-1/2 h-[50%] w-[3px] origin-top"
                style={{
                  transform: `rotate(${i * slice}deg)`,
                  background:
                    "linear-gradient(180deg, oklch(0.96 0.1 85 / 0.98), oklch(0.78 0.14 78 / 0.6), transparent)",
                  boxShadow: "0 0 8px oklch(0.78 0.14 78 / 0.5)",
                }}
              />
            ))}

            {PRIZES.map((p, i) => (
              <div
                key={p}
                className="absolute left-1/2 top-1/2 origin-left"
                style={{ transform: `rotate(${i * slice + slice / 2}deg)` }}
              >
                <span className="ml-12 block w-28 font-display text-[11px] uppercase tracking-[0.16em] text-[color:var(--gold-soft)] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] md:ml-14 md:w-32 md:text-xs">
                  {p}
                </span>
              </div>
            ))}

            {/* Inner chrome ring */}
            <div
              className="absolute left-1/2 top-1/2 h-[44%] w-[44%] -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 30% 30%, oklch(1 0 0 / 0.98), oklch(0.85 0.01 250 / 0.9) 38%, oklch(0.55 0.02 250 / 0.95) 100%)",
                boxShadow:
                  "inset 0 0 22px oklch(0 0 0 / 0.6), 0 0 0 3px oklch(0.78 0.14 78 / 0.6), 0 0 40px -4px oklch(0.78 0.14 78 / 0.55)",
              }}
            />
          </div>

          {/* Center hub button */}
          <button
            type="button"
            onClick={spin}
            disabled={spinning || used !== null}
            className="absolute left-1/2 top-1/2 z-20 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-[color:var(--gold)] bg-gradient-to-br from-[color:var(--chrome-soft)] via-[color:var(--chrome)] to-[color:var(--gold)] font-display text-xs uppercase tracking-wider text-[color:var(--ink)] shadow-[0_0_40px_-4px_oklch(0.78_0.14_78/0.75)] transition-all duration-300 hover:scale-110 hover:shadow-[0_0_70px_-2px_oklch(0.78_0.14_78/1)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 md:h-24 md:w-24 md:text-sm"
          >
            <span className="drop-shadow-[0_1px_2px_rgba(255,255,255,0.5)]">
              {spinning ? "…" : "Spin"}
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
