import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import {
  WELLNESS_ARMS,
  WELLNESS_ROOMS,
  WELLNESS_PRINCIPLE,
  WELLNESS_FEELING,
  CARE_BOUNDARY,
  roomsForArm,
} from "@/lib/wellness";
import sanctuary from "@/assets/hill-wellness-centre.jpg";

export const Route = createFileRoute("/health-wellness")({
  head: () => ({
    meta: [
      { title: "Frass Health & Wellness Centre — The Mountain Sanctuary" },
      {
        name: "description",
        content:
          "Frass Wellness keeps everyday care free — herbs, movement, food, rest and mental steadiness. Frass Care Network connects you to verified professionals when you need one.",
      },
      { property: "og:title", content: "Frass Health & Wellness Centre" },
      {
        property: "og:description",
        content:
          "The mountain sanctuary of Frass Hill: free everyday wellbeing, and a vetted directory of real practitioners.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WellnessCentre,
});

function WellnessCentre() {
  return (
    <SiteShell>
      <div className="bg-[oklch(0.16_0.03_150)] text-[oklch(0.95_0.01_120)]">
        {/* The walk up the hill */}
        <section className="relative h-[80vh] min-h-[480px] w-full overflow-hidden">
          <img
            src={sanctuary}
            alt="An open-air Caribbean mountain herbalist pavilion at dawn, drying herbs hanging from the beams and misted green peaks behind"
            width={1600}
            height={1008}
            className="hero-drift h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.16_0.03_150)] via-[oklch(0.16_0.03_150)]/45 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1400px] px-6 pb-12 lg:px-10">
            <span className="text-[10px] uppercase tracking-[0.4em] text-[color:var(--hill-gold)]">
              Frass Hill · above the Farm District
            </span>
            <h1 className="mt-4 font-display text-4xl uppercase leading-[0.95] md:text-7xl">
              Health &amp; Wellness Centre
            </h1>
            <p className="mt-4 max-w-2xl text-sm text-[oklch(0.88_0.01_120)]">
              Cooler air. Herbs drying in the rafters. Somebody up here knows what the leaves are
              for — and knows when you need a doctor instead.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#frass-wellness"
                className="rounded-full bg-[color:var(--hill-gold)] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.24em] text-black transition hover:scale-[1.03]"
              >
                🌿 Frass Wellness — free
              </a>
              <a
                href="#care-network"
                className="rounded-full border border-[oklch(0.95_0.01_120)]/40 px-6 py-3 text-[10px] font-bold uppercase tracking-[0.24em] transition hover:bg-white/10"
              >
                🩺 Frass Care Network
              </a>
            </div>
          </div>
        </section>

        {/* Two arms, stated plainly */}
        <section className="mx-auto max-w-[1400px] px-6 pt-12 lg:px-10">
          <p className="border-l-2 border-[color:var(--hill-gold)] pl-4 text-sm italic text-[oklch(0.84_0.01_120)]">
            {WELLNESS_PRINCIPLE}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {WELLNESS_FEELING.map((f) => (
              <span
                key={f}
                className="rounded-full border border-[color:var(--hill-gold)]/30 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-[oklch(0.88_0.01_120)]"
              >
                {f}
              </span>
            ))}
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            {WELLNESS_ARMS.map((arm) => (
              <article
                key={arm.id}
                id={arm.id === "wellness" ? "frass-wellness" : "care-network"}
                className="scroll-mt-24 rounded-[1.75rem] border border-[color:var(--hill-gold)]/25 bg-white/[0.03] p-7"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-display text-2xl uppercase leading-tight">
                    {arm.glyph} {arm.name}
                  </span>
                  <span className="shrink-0 rounded-full bg-[color:var(--hill-gold)] px-3 py-1 text-[9px] uppercase tracking-[0.18em] text-black">
                    {arm.access}
                  </span>
                </div>
                <p className="mt-2 text-sm text-[color:var(--hill-gold)]">{arm.tagline}</p>
                <p className="mt-4 text-sm text-[oklch(0.84_0.01_120)]">{arm.what}</p>
                <p className="mt-4 border-t border-white/10 pt-4 text-sm text-[oklch(0.92_0.01_120)]">
                  <span className="text-[10px] uppercase tracking-[0.22em] text-[oklch(0.66_0.01_120)]">
                    What this means in plain English
                  </span>
                  <span className="mt-1 block">{arm.plain}</span>
                </p>

                <div className="mt-5 grid gap-3">
                  {roomsForArm(arm.id).map((r) => (
                    <div
                      key={r.id}
                      className="rounded-xl border border-white/10 bg-black/20 p-4 transition hover:border-[color:var(--hill-gold)]/40"
                    >
                      <div className="text-sm font-semibold">
                        {r.glyph} {r.name}
                      </div>
                      <p className="mt-1 text-xs text-[oklch(0.8_0.01_120)]">{r.does}</p>
                      <p className="mt-2 text-xs italic text-[oklch(0.68_0.01_120)]">{r.plain}</p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* The boundary — never buried */}
        <section className="mx-auto max-w-[1400px] px-6 py-12 lg:px-10">
          <div className="rounded-2xl border border-[oklch(0.95_0.01_120)]/20 bg-black/25 p-6">
            <div className="text-[10px] uppercase tracking-[0.28em] text-[color:var(--hill-gold)]">
              Where the free side stops
            </div>
            <p className="mt-3 max-w-3xl text-sm text-[oklch(0.86_0.01_120)]">{CARE_BOUNDARY}</p>
          </div>
        </section>

        {/* Walk on */}
        <section className="mx-auto max-w-[1400px] px-6 pb-20 lg:px-10">
          <div className="text-[10px] uppercase tracking-[0.28em] text-[oklch(0.66_0.01_120)]">
            From here you can walk to
          </div>
          <div className="mt-3 flex flex-wrap gap-3">
            <Link
              to="/frass-hill"
              className="rounded-full border border-[color:var(--hill-gold)]/40 px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.22em] transition hover:bg-white/10"
            >
              The Town Plan
            </Link>
            <Link
              to="/studio"
              className="rounded-full border border-[color:var(--hill-gold)]/40 px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.22em] transition hover:bg-white/10"
            >
              Studio District — Artist Wellness
            </Link>
            <Link
              to="/for-us"
              search={{ from: "health-wellness" }}
              className="rounded-full border border-[oklch(0.95_0.01_120)]/20 px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.22em] text-[oklch(0.8_0.01_120)] transition hover:bg-white/5"
            >
              For Us — the Community Hall
            </Link>
          </div>
          <p className="mt-6 text-xs text-[oklch(0.62_0.01_120)]">
            {WELLNESS_ROOMS.length} rooms open. Growers named in the Growers' Desk are paid through
            the Farm District, not by the Centre.
          </p>
        </section>
      </div>
    </SiteShell>
  );
}
