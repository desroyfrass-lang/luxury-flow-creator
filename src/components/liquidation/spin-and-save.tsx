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

/** Once-a-month luxury prize wheel. Elegant, no gimmicks. */
export function SpinAndSave() {
  const [used, setUsed] = useState<string | null>(null);
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [prize, setPrize] = useState<string | null>(null);
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
      <div className="grid items-center gap-10 rounded-[1.5rem] border border-[color:var(--gold)]/25 bg-[color-mix(in_oklab,var(--foreground)_5%,transparent)] p-8 backdrop-blur-sm md:grid-cols-2 md:gap-16 md:p-14">
        <div>
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
            className="mt-6 inline-flex items-center rounded-full border border-[color:var(--gold)]/50 px-8 py-3 text-[11px] uppercase tracking-[0.28em] text-[color:var(--gold)] transition-colors hover:bg-[color:var(--gold)] hover:text-[color:var(--gold-foreground)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {used !== null ? "Come back next month" : spinning ? "Spinning…" : "Spin the wheel"}
          </button>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-[340px]">
          <div className="absolute left-1/2 top-0 z-10 h-0 w-0 -translate-x-1/2 border-x-8 border-t-[18px] border-x-transparent border-t-[color:var(--gold)]" />
          <div
            className="h-full w-full rounded-full border-[6px] border-[color:var(--gold)]/50 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)]"
            style={{
              transform: `rotate(${angle}deg)`,
              transition: "transform 4s cubic-bezier(0.16, 1, 0.3, 1)",
              background: `conic-gradient(${PRIZES.map((_, i) => {
                const c =
                  i % 2 === 0
                    ? "color-mix(in oklab, var(--gold) 55%, black)"
                    : "color-mix(in oklab, black 88%, var(--gold))";
                return `${c} ${i * slice}deg ${(i + 1) * slice}deg`;
              }).join(", ")})`,
            }}
          >
            {PRIZES.map((p, i) => (
              <div
                key={p}
                className="absolute left-1/2 top-1/2 origin-left"
                style={{ transform: `rotate(${i * slice + slice / 2}deg)` }}
              >
                <span className="ml-10 block w-24 text-[9px] uppercase tracking-[0.14em] text-[color:var(--gold-soft)]">
                  {p}
                </span>
              </div>
            ))}
          </div>
          <div className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[color:var(--gold)]/60 bg-background" />
        </div>
      </div>
    </section>
  );
}
