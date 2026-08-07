import { useEffect, useRef, useState } from "react";

type Reward = {
  id: string;
  emoji: string;
  label: string;
  short: string;
  note: string;
  line: string;
};

const REWARDS: Reward[] = [
  {
    id: "off10",
    emoji: "🛍️",
    label: "10% OFF",
    short: "10% Off",
    note: "Perfect for everyday shopping.",
    line: "Nice one! Looks like today is your lucky day.",
  },
  {
    id: "off15",
    emoji: "🎁",
    label: "15% OFF",
    short: "15% Off",
    note: "One of our most popular rewards.",
    line: "I had a feeling this reward was waiting for you.",
  },
  {
    id: "off20",
    emoji: "⭐",
    label: "20% OFF",
    short: "20% Off",
    note: "A premium reward for your next purchase.",
    line: "Twenty percent — walk wid power, yuh hear?",
  },
  {
    id: "ship",
    emoji: "🚚",
    label: "FREE SHIPPING",
    short: "Free Shipping",
    note: "No minimum purchase.",
    line: "Free shipping is on me this time. Enjoy!",
  },
  {
    id: "points",
    emoji: "🎉",
    label: "DOUBLE POINTS",
    short: "2× Points",
    note: "Earn twice the Builder Rewards points on your next order.",
    line: "Double points. Your next order works twice as hard.",
  },
  {
    id: "mystery",
    emoji: "🎁",
    label: "MYSTERY GIFT",
    short: "Mystery Gift",
    note: "A surprise gift with your next qualifying purchase.",
    line: "Don't wait too long — this one won't stay forever.",
  },
  {
    id: "early",
    emoji: "✨",
    label: "EARLY ACCESS",
    short: "Early Access",
    note: "Shop the next collection before everyone else.",
    line: "Doors open early for you this month.",
  },
  {
    id: "walk",
    emoji: "👟",
    label: "WALK WID POWER",
    short: "Walk Wid Power",
    note: "One exclusive product at a members-only price.",
    line: "The Walk Wid Power pick is yours. Choose wisely.",
  },
];

const GOLDEN: Reward = {
  id: "golden",
  emoji: "👑",
  label: "GOLDEN SPIN",
  short: "Golden Spin",
  note: "30% off · VIP Shopping Pass · Premium shipping for 30 days · Exclusive Frass merch · Limited-drop early access · Bonus Builder points.",
  line: "You've just unlocked this month's Golden Reward.",
};

const KEY = "frass-lucky-spin";
const GOLDEN_ODDS = 0.008;

function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function findReward(id: string) {
  return id === GOLDEN.id ? GOLDEN : REWARDS.find((r) => r.id === id) ?? null;
}

/** Soft, non-casino chime. */
function chime(kind: "tick" | "win" | "golden") {
  try {
    const Ctx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const notes = kind === "tick" ? [880] : kind === "win" ? [523.25, 659.25, 783.99] : [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = f;
      const t = ctx.currentTime + i * 0.13;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(kind === "tick" ? 0.04 : 0.12, t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
      o.connect(g).connect(ctx.destination);
      o.start(t);
      o.stop(t + 0.75);
    });
    window.setTimeout(() => ctx.close(), 2000);
  } catch {
    /* audio is a nicety, never a requirement */
  }
}

export function LuckySpin() {
  const [mounted, setMounted] = useState(false);
  const [opened, setOpened] = useState(false);
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [reward, setReward] = useState<Reward | null>(null);
  const [expires, setExpires] = useState<number | null>(null);
  const [hovered, setHovered] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return;
    try {
      const saved = JSON.parse(raw) as { month: string; id: string; expires: number };
      if (saved.month === currentMonth()) {
        const r = findReward(saved.id);
        if (r) {
          setReward(r);
          setExpires(saved.expires);
          setOpened(true);
        }
      }
    } catch {
      window.localStorage.removeItem(KEY);
    }
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  const slice = 360 / REWARDS.length;

  const spin = () => {
    if (spinning || reward) return;
    setSpinning(true);
    chime("tick");
    const golden = Math.random() < GOLDEN_ODDS;
    const index = Math.floor(Math.random() * REWARDS.length);
    const won = golden ? GOLDEN : REWARDS[index];
    const target = 360 * 6 + (360 - index * slice - slice / 2);
    setAngle(target);
    timer.current = window.setTimeout(() => {
      const exp = Date.now() + 30 * 86400000;
      setSpinning(false);
      setReward(won);
      setExpires(exp);
      chime(golden ? "golden" : "win");
      window.localStorage.setItem(
        KEY,
        JSON.stringify({ month: currentMonth(), id: won.id, expires: exp }),
      );
    }, 6200);
  };

  const isGolden = reward?.id === GOLDEN.id;

  return (
    <section className="mx-auto max-w-[1400px] px-4 py-16 md:px-12 md:py-24">
      <div
        className="relative overflow-hidden rounded-[2rem] border border-[color:var(--gold)]/30 bg-[color-mix(in_oklab,var(--foreground)_4%,transparent)] p-8 backdrop-blur-md md:p-16"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 70% 40%, oklch(0.78 0.14 78 / 0.26), transparent 60%), radial-gradient(circle at 15% 80%, oklch(0.78 0.14 78 / 0.12), transparent 50%)",
            filter: hovered ? "blur(44px) brightness(1.3)" : "blur(36px)",
            transition: "filter 700ms ease",
          }}
        />

        {!opened ? (
          /* ── The invitation ─────────────────────────── */
          <div className="relative z-10 mx-auto max-w-2xl text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[color:var(--gold)]/50 bg-[color-mix(in_oklab,var(--gold)_12%,transparent)] font-display text-3xl text-[color:var(--gold)] shadow-[0_0_36px_-8px_oklch(0.78_0.14_78/0.9)]">
              F
            </div>
            <p className="mt-6 font-sans text-[11px] uppercase tracking-[0.42em] text-[color:var(--gold)]">
              An invitation
            </p>
            <h2 className="mt-4 font-display text-4xl uppercase leading-[0.95] tracking-[0.05em] md:text-6xl">
              Spin Rewards
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-[color:var(--gold-soft,var(--gold))]">
              Your monthly Frass Reward is waiting.
            </p>
            <p className="mx-auto mt-3 max-w-lg text-base leading-relaxed text-muted-foreground">
              Take your complimentary spin and discover what Frassy has chosen for you this month.
              No purchase required. No gimmicks. Just a little thank you for being part of the Frass
              community.
            </p>
            <button
              type="button"
              onClick={() => setOpened(true)}
              className="group relative mt-9 inline-flex items-center overflow-hidden rounded-full border-2 border-[color:var(--gold)] bg-[color-mix(in_oklab,var(--gold)_10%,transparent)] px-12 py-4 font-display text-sm uppercase tracking-[0.24em] text-[color:var(--gold)] transition-all duration-500 hover:bg-[color:var(--gold)] hover:text-[color:var(--gold-foreground)] hover:shadow-[0_0_60px_-10px_oklch(0.78_0.14_78/0.95)]"
            >
              <span className="relative z-10">Spin the wheel</span>
            </button>
            <p className="mt-5 text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
              One spin per account · Resets each calendar month
            </p>
          </div>
        ) : (
          /* ── The wheel ──────────────────────────────── */
          <div className="relative z-10 grid items-center gap-12 md:grid-cols-2 md:gap-16">
            <div>
              <p className="font-sans text-[11px] uppercase tracking-[0.42em] text-[color:var(--gold)]">
                {reward ? "This month's reward" : "Your complimentary spin"}
              </p>
              <h2 className="mt-4 font-display text-4xl uppercase leading-[0.95] tracking-[0.05em] md:text-6xl">
                Spin Rewards
              </h2>

              {reward ? (
                <div
                  className={`mt-7 rounded-2xl border p-6 ${
                    isGolden
                      ? "border-[color:var(--gold)] bg-[color-mix(in_oklab,var(--gold)_16%,transparent)] shadow-[0_0_70px_-16px_oklch(0.78_0.14_78/0.9)]"
                      : "border-[color:var(--gold)]/40 bg-[color-mix(in_oklab,var(--gold)_7%,transparent)]"
                  }`}
                >
                  <div className="text-4xl" aria-hidden="true">
                    {reward.emoji}
                  </div>
                  <p className="mt-3 font-display text-3xl uppercase tracking-[0.1em] text-[color:var(--gold)] md:text-4xl">
                    {reward.label}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">{reward.note}</p>
                  <div className="mt-5 flex items-start gap-3 border-t border-[color:var(--gold)]/25 pt-5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[color:var(--gold)]/50 font-display text-sm text-[color:var(--gold)]">
                      F
                    </div>
                    <p className="text-sm italic leading-relaxed text-foreground/90">
                      &ldquo;{reward.line}&rdquo;
                    </p>
                  </div>
                  {mounted && expires && (
                    <p className="mt-4 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                      Expires{" "}
                      {new Date(expires).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      · Next spin unlocks next month
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
                    Eight rewards on the wheel — and, very rarely, the Golden Spin. Take your time.
                    It&rsquo;s a gift, not a game.
                  </p>
                  <button
                    type="button"
                    onClick={spin}
                    disabled={spinning}
                    className="group relative mt-8 inline-flex items-center overflow-hidden rounded-full border-2 border-[color:var(--gold)] bg-[color-mix(in_oklab,var(--gold)_10%,transparent)] px-12 py-4 font-display text-sm uppercase tracking-[0.24em] text-[color:var(--gold)] transition-all duration-500 hover:bg-[color:var(--gold)] hover:text-[color:var(--gold-foreground)] hover:shadow-[0_0_60px_-10px_oklch(0.78_0.14_78/0.95)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="relative z-10">
                      {spinning ? "Frassy is choosing…" : "Take my spin"}
                    </span>
                  </button>
                </>
              )}

              <ul className="mt-8 space-y-1.5 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                <li>One spin per account</li>
                <li>Resets once every calendar month</li>
                <li>Rewards expire after 30 days</li>
              </ul>
            </div>

            <div className="relative mx-auto aspect-square w-full max-w-[480px]">
              <div
                className="absolute -inset-8 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, oklch(0.78 0.14 78 / 0.24) 0%, transparent 66%)",
                  filter: hovered || spinning ? "blur(36px) brightness(1.4)" : "blur(28px)",
                  transition: "filter 700ms ease",
                }}
              />

              <div className="absolute left-1/2 top-0 z-30 h-0 w-0 -translate-x-1/2 border-x-[14px] border-t-[28px] border-x-transparent border-t-[color:var(--gold)] drop-shadow-[0_0_18px_oklch(0.78_0.14_78/1)]" />

              <div
                className="absolute -inset-3 rounded-full"
                style={{
                  background:
                    "conic-gradient(from 0deg, oklch(0.9 0.01 250), oklch(0.68 0.01 250) 12%, oklch(0.97 0.005 250) 26%, oklch(0.78 0.14 78) 38%, oklch(0.94 0.1 85) 50%, oklch(0.78 0.14 78) 62%, oklch(0.97 0.005 250) 76%, oklch(0.68 0.01 250) 88%, oklch(0.9 0.01 250) 100%)",
                  boxShadow:
                    "inset 0 0 30px oklch(0 0 0 / 0.7), 0 0 0 2px oklch(0.78 0.14 78 / 0.55), 0 40px 110px -40px oklch(0 0 0 / 0.9), 0 0 60px -12px oklch(0.78 0.14 78 / 0.5)",
                }}
              />

              <div
                className="relative h-full w-full rounded-full border-[6px] border-[color:var(--gold)]/50"
                style={{
                  transform: `rotate(${angle}deg)`,
                  transition: "transform 6s cubic-bezier(0.12, 0.75, 0.05, 1)",
                  background: `conic-gradient(${REWARDS.map((_, i) => {
                    const c =
                      i % 2 === 0
                        ? "color-mix(in oklab, var(--gold) 46%, black)"
                        : "color-mix(in oklab, black 92%, var(--gold))";
                    return `${c} ${i * slice}deg ${(i + 1) * slice}deg`;
                  }).join(", ")})`,
                }}
              >
                {REWARDS.map((_, i) => (
                  <div
                    key={`beam-${i}`}
                    className="absolute left-1/2 top-1/2 h-[50%] w-[2px] origin-top"
                    style={{
                      transform: `rotate(${i * slice}deg)`,
                      background:
                        "linear-gradient(180deg, oklch(0.96 0.1 85 / 0.95), oklch(0.78 0.14 78 / 0.5), transparent)",
                    }}
                  />
                ))}

                {REWARDS.map((r, i) => (
                  <div
                    key={r.id}
                    className="absolute left-1/2 top-1/2 origin-left"
                    style={{ transform: `rotate(${i * slice + slice / 2}deg)` }}
                  >
                    <span className="ml-[22%] flex w-[46%] items-center gap-2 font-display text-[13px] font-bold uppercase leading-tight tracking-[0.08em] text-[oklch(0.99_0.03_88)] [text-shadow:0_1px_2px_rgba(0,0,0,0.95),0_0_14px_oklch(0.78_0.14_78/0.8)] md:text-[17px]">
                      <span className="text-base md:text-xl" aria-hidden="true">
                        {r.emoji}
                      </span>
                      {r.short}
                    </span>
                  </div>
                ))}

                <div
                  className="absolute left-1/2 top-1/2 h-[40%] w-[40%] -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle at 30% 30%, oklch(1 0 0 / 0.98), oklch(0.85 0.01 250 / 0.9) 38%, oklch(0.5 0.02 250 / 0.95) 100%)",
                    boxShadow:
                      "inset 0 0 22px oklch(0 0 0 / 0.6), 0 0 0 3px oklch(0.78 0.14 78 / 0.6), 0 0 40px -4px oklch(0.78 0.14 78 / 0.55)",
                  }}
                />
              </div>

              <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 flex h-[26%] w-[26%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-[color:var(--gold)]/70 bg-[color-mix(in_oklab,black_86%,var(--gold))] font-display text-2xl text-[color:var(--gold)] shadow-[0_0_40px_-6px_oklch(0.78_0.14_78/0.9)] md:text-3xl">
                F
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
