import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GARDEN_WALK, PROMISE_ARCH_INSCRIPTION } from "@/lib/bridal";
import arch from "@/assets/bridal-promise-arch.jpg";
import gardenPath from "@/assets/bridal-garden-path.jpg";

export const Route = createFileRoute("/bridal/walk")({
  head: () => ({
    meta: [
      { title: "The Garden Walk & The Promise Arch — Frass Bridal" },
      {
        name: "description",
        content:
          "The cinematic walk from the Frass District promenade to the Bridal Estate, ending beneath the Promise Arch where the Wedding Journey officially begins.",
      },
      { property: "og:title", content: "The Garden Walk & The Promise Arch — Frass Bridal" },
      {
        property: "og:description",
        content: "Every great marriage begins with a shared vision.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GardenWalk,
});

function GardenWalk() {
  const [step, setStep] = useState(0);
  const atArch = step >= GARDEN_WALK.length - 2;
  const arrived = step === GARDEN_WALK.length - 1;

  useEffect(() => {
    if (arrived) return;
    const t = window.setTimeout(() => setStep((s) => Math.min(s + 1, GARDEN_WALK.length - 1)), 3200);
    return () => window.clearTimeout(t);
  }, [step, arrived]);

  const stage = GARDEN_WALK[step];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[oklch(0.13_0.01_75)] text-[oklch(0.96_0.01_80)]">
      <img
        src={atArch ? arch : gardenPath}
        alt={
          atArch
            ? "A flower-covered stone arch at the end of a garden walkway, the bridal estate glowing beyond it"
            : "A quiet stone garden path lined with flowers, leading away from the promenade"
        }
        width={1280}
        height={960}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[6000ms] ease-out"
        style={{ transform: `scale(${1.04 + step * 0.035})` }}
      />
      <div
        className="absolute inset-0 transition-opacity duration-[2000ms]"
        style={{
          background:
            "linear-gradient(to top, oklch(0.13 0.01 75) 8%, oklch(0.13 0.01 75 / 0.35) 55%, transparent 100%)",
          opacity: 0.65 + step * 0.05,
        }}
      />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1100px] flex-col justify-end px-6 pb-16 lg:px-10">
        <div className="mb-8 flex gap-1.5">
          {GARDEN_WALK.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStep(i)}
              aria-label={s.title}
              className={`h-1 flex-1 rounded-full transition-all duration-700 ${
                i <= step ? "bg-[color:var(--hill-gold)]" : "bg-white/20"
              }`}
            />
          ))}
        </div>

        <div key={stage.id} className="animate-fade-in">
          <span className="text-[10px] uppercase tracking-[0.4em] text-[color:var(--hill-gold)]">
            Frass District → Frass Bridal
          </span>
          <h1 className="mt-3 font-display text-3xl uppercase leading-[0.95] md:text-6xl">
            {stage.title}
          </h1>
          <p className="mt-4 max-w-xl text-sm text-[oklch(0.86_0.01_80)]">{stage.note}</p>
        </div>

        {atArch && (
          <p className="mt-8 max-w-2xl border-y border-[color:var(--hill-gold)]/40 py-5 text-center font-display text-lg uppercase tracking-[0.12em] text-[color:var(--hill-gold)] md:text-2xl">
            “{PROMISE_ARCH_INSCRIPTION}”
          </p>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          {arrived ? (
            <Link
              to="/bridal"
              className="rounded-full bg-[color:var(--hill-gold)] px-7 py-3.5 text-[10px] font-bold uppercase tracking-[0.24em] text-black transition hover:scale-[1.03]"
            >
              Enter the Welcome Hall
            </Link>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setStep((s) => Math.min(s + 1, GARDEN_WALK.length - 1))}
                className="rounded-full border border-[color:var(--hill-gold)]/50 px-7 py-3.5 text-[10px] font-bold uppercase tracking-[0.24em] transition hover:bg-white/10"
              >
                Keep walking
              </button>
              <button
                type="button"
                onClick={() => setStep(GARDEN_WALK.length - 1)}
                className="rounded-full border border-white/20 px-7 py-3.5 text-[10px] font-bold uppercase tracking-[0.24em] text-[oklch(0.78_0.01_80)] transition hover:bg-white/5"
              >
                Go straight to the estate
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
