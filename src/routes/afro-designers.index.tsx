import { createFileRoute, Link } from "@tanstack/react-router";
import heroImg from "@/assets/afro-hero-caribbean.jpg.asset.json";
import { FrassyGold } from "@/components/afro/FrassyGold";
import { DesignerCard } from "@/components/afro/DesignerCard";
import { RegionPillar } from "@/components/afro/RegionPillar";
import {
  DESIGNERS,
  REGIONS,
  ISLAND_COLLECTIONS,
} from "@/data/afro-designers";

export const Route = createFileRoute("/afro-designers/")({
  head: () => ({
    meta: [
      { title: "Afro Designers — Where Culture Meets Luxury | Frass Kicks" },
      {
        name: "description",
        content:
          "A curated marketplace of African, African American, Caribbean, Jamaican, and diaspora designers. Luxury resort-wear, couture, streetwear, and artisan pieces.",
      },
      { property: "og:title", content: "Afro Designers — Where Culture Meets Luxury" },
      {
        property: "og:description",
        content:
          "Step into a Caribbean-luxury marketplace showcasing designers from across the diaspora.",
      },
      { property: "og:image", content: heroImg.url },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: heroImg.url },
    ],
  }),
  component: AfroLanding,
});

function AfroLanding() {
  const featured = DESIGNERS.filter((d) => d.featured);
  const spotlight = DESIGNERS[0];
  return (
    <div>
      {/* HERO */}
      <section className="relative min-h-[92vh] w-full overflow-hidden">
        <img
          src={heroImg.url}
          alt="Luxury Caribbean beach at golden hour"
          width={1920}
          height={1080}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/20 to-white/85" />
        <div className="absolute inset-0 afro-glitter opacity-70" />

        <div className="relative mx-auto flex min-h-[92vh] max-w-[1400px] flex-col items-center justify-center px-6 pt-24 pb-32 text-center">
          <FrassyGold className="h-28 w-28 md:h-40 md:w-40 drop-shadow-[0_20px_40px_rgba(180,140,40,0.35)]" float />
          <p className="mt-6 text-[11px] uppercase tracking-[0.5em] text-[color:var(--afro-ocean-deep)]">
            A Frass Kicks Destination
          </p>
          <h1 className="afro-serif mt-4 text-5xl md:text-7xl lg:text-8xl leading-[0.95] text-[color:var(--afro-ink)]">
            Afro <span className="afro-gold-text">Designers</span>
          </h1>
          <p className="afro-serif italic mt-6 text-2xl md:text-3xl text-[color:var(--afro-ocean-deep)]">
            Where Culture Meets Luxury
          </p>
          <p className="mt-6 max-w-2xl text-base md:text-lg text-[color:var(--afro-ink-soft)]">
            Discover the creativity, craftsmanship, and stories of designers from Africa,
            the Caribbean, and the Diaspora — curated inside one resort-boutique experience.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/afro-designers/designers"
              className="afro-gold-btn rounded-full px-8 py-4 text-xs uppercase tracking-[0.3em] text-white shadow-lg hover:shadow-2xl"
            >
              Explore Designers
            </Link>
            <Link
              to="/afro-designers/collections/$slug"
              params={{ slug: "caribbean" }}
              className="rounded-full border border-[color:var(--afro-chrome)] bg-white/80 px-8 py-4 text-xs uppercase tracking-[0.3em] text-[color:var(--afro-ink)] backdrop-blur hover:border-[color:var(--afro-gold)] transition"
            >
              Shop Collections
            </Link>
          </div>
        </div>

        <div aria-hidden className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-b from-transparent to-white" />
      </section>

      {/* REGIONS */}
      <section className="relative mx-auto max-w-[1400px] px-6 lg:px-12 py-24">
        <SectionHead
          eyebrow="Explore by region"
          title="Five houses. One heritage."
          copy="Each region carries its own signature. Step into the one that calls you."
        />
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {REGIONS.map((r) => (
            <RegionPillar key={r.slug} region={r} />
          ))}
        </div>
      </section>

      {/* FEATURED DESIGNERS */}
      <section className="relative mx-auto max-w-[1400px] px-6 lg:px-12 py-24">
        <SectionHead
          eyebrow="Featured designers"
          title="The house selection"
          copy="Handpicked studios showing this season on Afro Designers."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {featured.map((d) => (
            <DesignerCard key={d.slug} designer={d} />
          ))}
        </div>
      </section>

      {/* ISLAND COLLECTIONS */}
      <section className="relative mx-auto max-w-[1400px] px-6 lg:px-12 py-24">
        <SectionHead
          eyebrow="Island collections"
          title="Resort essentials, curated."
          copy="From swim to occasion — pieces built for sun, sand, and long dinners."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ISLAND_COLLECTIONS.map((c) => (
            <div
              key={c.title}
              className="afro-tile group relative overflow-hidden rounded-3xl p-8"
            >
              <p className="text-[10px] uppercase tracking-[0.35em] text-[color:var(--afro-ocean-deep)]">
                Collection
              </p>
              <h3 className="afro-serif mt-3 text-2xl text-[color:var(--afro-ink)]">
                {c.title}
              </h3>
              <p className="mt-2 text-sm text-[color:var(--afro-ink-soft)]">{c.note}</p>
              <div className="mt-8 h-px afro-gold-hairline" />
            </div>
          ))}
        </div>
      </section>

      {/* SPOTLIGHT */}
      <section className="relative mx-auto max-w-[1400px] px-6 lg:px-12 py-24">
        <div className="relative overflow-hidden rounded-[2.5rem] afro-spotlight">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] items-stretch">
            <div className="relative min-h-[420px]">
              <img
                src={spotlight.image}
                alt={spotlight.name}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
            <div className="p-10 lg:p-14 flex flex-col justify-center">
              <p className="text-[10px] uppercase tracking-[0.4em] afro-gold-text">
                Designer Spotlight · This Week
              </p>
              <h3 className="afro-serif mt-4 text-4xl md:text-5xl text-[color:var(--afro-ink)]">
                {spotlight.name}
              </h3>
              <p className="mt-2 text-sm uppercase tracking-[0.25em] text-[color:var(--afro-ocean-deep)]">
                {spotlight.flag} {spotlight.country} · {spotlight.studio}
              </p>
              <p className="mt-6 text-base text-[color:var(--afro-ink-soft)]">
                {spotlight.story}
              </p>
              <div className="mt-8">
                <Link
                  to="/afro-designers/designers/$slug"
                  params={{ slug: spotlight.slug }}
                  className="afro-gold-btn inline-flex rounded-full px-7 py-3.5 text-xs uppercase tracking-[0.3em] text-white shadow-lg"
                >
                  Visit the atelier
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CLOSING BAND */}
      <section className="relative px-6 py-28 text-center">
        <FrassyGold className="mx-auto h-16 w-16" />
        <p className="afro-serif mt-6 text-3xl md:text-4xl text-[color:var(--afro-ink)]">
          Culture. Creativity. Heritage. Luxury.
        </p>
        <p className="mt-4 text-sm uppercase tracking-[0.3em] text-[color:var(--afro-ocean-deep)]">
          A global marketplace for the diaspora.
        </p>
        <div className="mx-auto mt-8 h-px w-32 afro-gold-hairline" />
      </section>
    </div>
  );
}

function SectionHead({
  eyebrow,
  title,
  copy,
}: {
  eyebrow: string;
  title: string;
  copy: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="text-[11px] uppercase tracking-[0.4em] afro-gold-text">{eyebrow}</p>
      <h2 className="afro-serif mt-4 text-4xl md:text-5xl leading-[1.02] text-[color:var(--afro-ink)]">
        {title}
      </h2>
      <p className="mt-4 text-base text-[color:var(--afro-ink-soft)]">{copy}</p>
    </div>
  );
}
