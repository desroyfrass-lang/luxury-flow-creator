import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { PageFeedback } from "@/components/page-feedback";
import { KIDS_COLLECTIONS, KIDS_SEGMENTS } from "@/lib/frass-kids";
import hero from "@/assets/kids-hero.jpg";
import foundation from "@/assets/kids-foundation.jpg";

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

      {/* Two doors — shopping, or the children's world inside Frass Hill */}
      <section className="mx-auto max-w-[1600px] px-6 pt-14 lg:px-12">
        <div className="grid gap-6 md:grid-cols-2">
          <a
            href="#shop-kids"
            className="group rounded-[2rem] border border-[color:var(--gold)]/30 bg-card p-8 transition hover:-translate-y-1 hover:border-[color:var(--gold)]/70"
          >
            <span className="text-3xl" aria-hidden>
              🛍
            </span>
            <h2 className="mt-3 font-display text-3xl uppercase leading-none md:text-4xl">
              Shop Kids
            </h2>
            <p className="mt-3 max-w-md text-sm text-muted-foreground">
              The children's flagship floor — Frass Kicks, School Drip and every
              collection, sized 0–3 through 12+.
            </p>
            <span className="mt-6 inline-block text-[10px] font-bold uppercase tracking-[0.26em] text-[color:var(--gold)]">
              Choose a store →
            </span>
          </a>
          <Link
            to="/kids-world"
            className="group rounded-[2rem] border border-[color:var(--kids-turquoise,#4ec9c1)]/40 bg-card p-8 transition hover:-translate-y-1"
            style={{ boxShadow: "0 30px 80px -60px var(--kids-turquoise, #4ec9c1)" }}
          >
            <span className="text-3xl" aria-hidden>
              🌈
            </span>
            <h2 className="mt-3 font-display text-3xl uppercase leading-none md:text-4xl">
              Enter Kids World
            </h2>
            <p className="mt-3 max-w-md text-sm text-muted-foreground">
              A district of Frass Hill: learning villages, creative studios, music
              gardens and young-builder spaces — with a parent-issued passport.
            </p>
            <span
              className="mt-6 inline-block text-[10px] font-bold uppercase tracking-[0.26em]"
              style={{ color: "var(--kids-turquoise, #4ec9c1)" }}
            >
              Step into the valley →
            </span>
          </Link>
        </div>
      </section>

      {/* Age & gender — one single selection */}
      <section id="shop-kids" className="mx-auto max-w-[1600px] px-6 pb-16 pt-14 lg:px-12">

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

      {/* Frass Hill Kids — the foundation, in brief */}
      <section className="border-t border-[color:var(--gold)]/20 bg-[color-mix(in_oklab,var(--foreground)_4%,transparent)]">
        <div className="mx-auto grid max-w-[1600px] items-center gap-10 px-6 py-16 lg:grid-cols-2 lg:px-12">
          <div className="overflow-hidden rounded-2xl border border-[color:var(--gold)]/25">
            <img
              src={foundation}
              alt="Children supported by the Frass Hill Kids foundation"
              loading="lazy"
              width={1024}
              height={768}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.38em] text-[color:var(--gold)]">
              Frass Hill Kids
            </p>
            <h2 className="mt-3 font-display text-3xl uppercase md:text-5xl">
              Every fit dresses two children
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Frass Hill Kids is our foundation arm. A portion of every children's
              order goes straight into school uniforms, shoes and back-to-school
              kits for families across the Caribbean — delivered through schools and
              community groups on the hill, never through a middleman.
            </p>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
              At checkout you can round up or add a direct donation. Nothing is
              automatic, nothing is hidden — you always see exactly where it goes.
            </p>
            <p className="mt-6 font-script text-lg italic text-[color:var(--gold)] md:text-xl">
              Dress one child, lift another.
            </p>
          </div>
        </div>
      </section>

      <PageFeedback pageTitle="Frass Kids" />
    </SiteShell>
  );
}
