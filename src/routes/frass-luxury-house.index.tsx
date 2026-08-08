import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import estate from "@/assets/lux-estate-hero.jpg";
import eastWing from "@/assets/lux-east-wing.jpg";
import westWing from "@/assets/lux-west-wing.jpg";

export const Route = createFileRoute("/frass-luxury-house/")({
  head: () => ({
    meta: [
      { title: "Frass Luxury House — Timeless Elegance, Exceptional Craft" },
      {
        name: "description",
        content:
          "A private Caribbean estate of curated collections. The East Wing presents the Gentlemen's Collections; the West Wing presents the Ladies' Collections.",
      },
      { property: "og:title", content: "Frass Luxury House — Timeless Elegance, Exceptional Craft" },
      {
        property: "og:description",
        content:
          "Walk the gardens, enter the house. Two wings, curated collections, pieces made to keep.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LuxuryHouse,
});

const WINGS = [
  {
    to: "/frass-luxury-house/men",
    image: eastWing,
    eyebrow: "The East Wing",
    title: "Gentlemen's Collections",
    blurb:
      "Walnut doors, leather and hand-finished tailoring. Footwear, suiting and shirting made to be kept.",
  },
  {
    to: "/frass-luxury-house/women",
    image: westWing,
    eyebrow: "The West Wing",
    title: "Ladies' Collections",
    blurb:
      "Ivory salons, silk and quiet couture. Footwear, evening dressing and tailoring with heirloom intent.",
  },
] as const;

function LuxuryHouse() {
  return (
    <SiteShell>
      <div className="bg-[oklch(0.13_0.01_70)]">
        {/* Arrival — through the gardens */}
        <section className="relative h-[86vh] min-h-[520px] w-full overflow-hidden">
          <img
            src={estate}
            alt="Botanical gardens and stone pathway leading to the Frass Luxury House estate at golden hour"
            width={1920}
            height={1088}
            className="hero-drift h-full w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(12,10,7,0.5)_0%,transparent_35%,rgba(12,10,7,0.86)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1400px] px-6 pb-16 lg:px-12">
            <span className="text-[10px] uppercase tracking-[0.46em] text-[color:var(--gold)]">
              The Estate
            </span>
            <h1 className="mt-5 max-w-4xl font-display text-[clamp(2.4rem,7vw,6rem)] uppercase leading-[0.92] tracking-[0.04em] text-foreground">
              Frass Luxury House
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-foreground/80 md:text-lg">
              Timeless elegance. Exceptional craftsmanship. Pieces people keep, collect and pass
              down.
            </p>
          </div>
        </section>

        {/* Concierge welcome */}
        <section className="mx-auto max-w-[900px] px-6 py-24 text-center lg:px-12">
          <span className="block h-px w-16 bg-[color:var(--gold)]/60 mx-auto" />
          <p className="mt-10 font-display text-[clamp(1.1rem,2.4vw,1.9rem)] uppercase leading-[1.5] tracking-[0.09em] text-foreground/90">
            &ldquo;Welcome to Frass Luxury House. The East Wing presents our Gentlemen&rsquo;s
            Collection. The West Wing presents our Ladies&rsquo; Collection. Please take your
            time — every room tells its own story.&rdquo;
          </p>
          <span className="mt-10 block text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
            House Concierge
          </span>
        </section>

        {/* Two wings */}
        <section className="mx-auto max-w-[1500px] px-6 pb-28 lg:px-12">
          <div className="grid gap-14 md:grid-cols-2 md:gap-10 lg:gap-16">
            {WINGS.map((wing) => (
              <Link key={wing.to} to={wing.to} className="group block">
                <div className="relative overflow-hidden rounded-[2px] shadow-[0_60px_120px_-70px_rgba(0,0,0,0.95)]">
                  <div className="relative aspect-[4/5] w-full overflow-hidden">
                    <img
                      src={wing.image}
                      alt={`${wing.eyebrow} — ${wing.title}`}
                      loading="lazy"
                      width={1280}
                      height={1600}
                      className="h-full w-full object-cover transition-transform duration-[2200ms] ease-out group-hover:scale-[1.06]"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(14,11,8,0.8)_100%)]" />
                    <div className="pointer-events-none absolute inset-6 opacity-0 ring-1 ring-[color:var(--gold)]/45 transition-opacity duration-700 group-hover:opacity-100" />
                    <div className="absolute inset-x-0 bottom-0 p-8 lg:p-12">
                      <span className="text-[10px] uppercase tracking-[0.42em] text-[color:var(--gold)]">
                        {wing.eyebrow}
                      </span>
                      <h2 className="mt-4 font-display text-[clamp(1.6rem,3.2vw,2.8rem)] uppercase leading-[1] tracking-[0.05em] text-foreground">
                        {wing.title}
                      </h2>
                      <p className="mt-4 max-w-sm text-sm leading-relaxed text-foreground/75">
                        {wing.blurb}
                      </p>
                      <span className="mt-7 inline-flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.34em] text-[color:var(--gold)]">
                        Enter the Wing
                        <span className="h-px w-8 bg-[color:var(--gold)] transition-all duration-500 group-hover:w-16" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* House services */}
        <section className="border-t border-[color:var(--gold)]/15">
          <div className="mx-auto grid max-w-[1400px] gap-6 px-6 py-16 text-[10px] uppercase tracking-[0.28em] text-muted-foreground sm:grid-cols-2 lg:grid-cols-4 lg:px-12">
            <span>Personal Styling</span>
            <span>Bespoke &amp; Made-to-Measure</span>
            <span>Gift Concierge</span>
            <span>Luxury Packaging</span>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
