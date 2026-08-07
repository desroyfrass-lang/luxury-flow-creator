import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { PageFeedback } from "@/components/page-feedback";
import { KIDS_COLLECTIONS, KIDS_SEGMENTS } from "@/lib/frass-kids";
import hero from "@/assets/kids-hero.jpg";

const TITLE = "FRASS Kids — The Children's Flagship of the Frass District";
const DESCRIPTION =
  "Caribbean-warm children's department store: Frass Kicks, School Drip, Casual, Street, Party, Vacay, Sports, Denim and Seasonal — for ages 0–3 through 12+.";

export const Route = createFileRoute("/frass-kids/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: KidsHome,
});

function KidsHome() {
  return (
    <SiteShell>
      <section className="relative h-[74vh] min-h-[500px] w-full overflow-hidden">
        <img
          src={hero}
          alt="Children playing outside the open-air Frass Kids boutique in the Caribbean"
          width={1920}
          height={1080}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,oklch(0.09_0.01_60/0.94),oklch(0.09_0.01_60/0.15)_58%,oklch(0.09_0.01_60/0.35))]" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1600px] px-6 pb-14 lg:px-12">
          <span className="text-[10px] uppercase tracking-[0.42em] text-[color:var(--gold)]">
            Frass District · Flagship
          </span>
          <h1 className="mt-4 font-display text-5xl uppercase leading-[0.88] text-[color:var(--luxe-linen,#f6f1e7)] md:text-8xl">
            Frass Kids
          </h1>
          <p className="mt-5 max-w-2xl text-sm text-[color:var(--luxe-linen,#f6f1e7)]/80 md:text-lg">
            The same Frass architecture, seen through the eyes of a child. Open-air
            boutiques, tropical light and collections that grow with them.
          </p>
          <p className="mt-3 font-script text-lg italic text-[color:var(--gold)] md:text-2xl">
            Room to play. Room to grow.
          </p>
        </div>
      </section>

      {/* Age & gender — one single selection */}
      <section className="mx-auto max-w-[1600px] px-6 pb-16 pt-14 lg:px-12">
        <header className="mb-9 max-w-2xl">
          <p className="text-[10px] uppercase tracking-[0.38em] text-[color:var(--gold)]">
            Choose a store
          </p>
          <h2 className="mt-3 font-display text-3xl uppercase md:text-5xl">
            Age &amp; department
          </h2>
          <p className="mt-4 text-sm text-muted-foreground">
            Pick the store that fits your child and walk straight onto the floor.
          </p>
        </header>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {KIDS_SEGMENTS.map((s) => (
            <Link
              key={s.slug}
              to="/frass-kids/$segment"
              params={{ segment: s.slug }}
              className="group relative overflow-hidden rounded-2xl border border-[color:var(--gold)]/25 bg-card transition hover:border-[color:var(--gold)]/70"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden">
                <img
                  src={s.image}
                  alt={`${s.title} — Frass Kids`}
                  loading="lazy"
                  width={1024}
                  height={1280}
                  className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.07]"
                />
                <div className="absolute inset-0 bg-[linear-gradient(to_top,oklch(0.08_0.01_60/0.92),transparent_58%)]" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <span className="text-2xl" aria-hidden>
                    {s.emoji}
                  </span>
                  <h3 className="mt-1 font-display text-2xl uppercase leading-none text-[color:var(--luxe-linen,#f6f1e7)]">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-xs text-[color:var(--luxe-linen,#f6f1e7)]/75">
                    {s.blurb}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Shared architecture */}
      <section className="mx-auto max-w-[1600px] px-6 pb-24 lg:px-12">
        <header className="mb-7 max-w-2xl">
          <p className="text-[10px] uppercase tracking-[0.38em] text-[color:var(--gold)]">
            One ecosystem
          </p>
          <h2 className="mt-3 font-display text-3xl uppercase md:text-5xl">
            The same collections, kid-sized
          </h2>
          <p className="mt-4 text-sm text-muted-foreground">
            Every age group carries the same collection architecture as the adult
            district — only Work Drip becomes School Drip. Children grow into the
            grown-up floors naturally.
          </p>
        </header>
        <div className="flex flex-wrap gap-3">
          {KIDS_COLLECTIONS.map((c) => (
            <span
              key={c.slug}
              className="rounded-full border border-[color:var(--gold)]/35 px-5 py-2 text-[10px] font-bold uppercase tracking-[0.26em] text-[color:var(--gold)]"
            >
              {c.title}
            </span>
          ))}
        </div>
      </section>

      <PageFeedback pageTitle="Frass Kids" />
    </SiteShell>
  );
}
