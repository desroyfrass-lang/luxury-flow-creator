import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { LuxuryCollectionCard, type LuxCollection } from "@/components/luxury-collection-card";
import wing from "@/assets/lux-west-wing.jpg";
import footwear from "@/assets/lux-w-footwear.jpg";
import dresses from "@/assets/lux-w-dresses.jpg";
import tailoring from "@/assets/lux-w-tailoring.jpg";

export const Route = createFileRoute("/frass-luxury-house/women")({
  head: () => ({
    meta: [
      { title: "The West Wing — Ladies' Collections | Frass Luxury House" },
      {
        name: "description",
        content:
          "The West Wing of Frass Luxury House: designer footwear, evening dresses and heirloom tailoring.",
      },
      { property: "og:title", content: "The West Wing — Ladies' Collections" },
      {
        property: "og:description",
        content: "Luxury footwear, dresses and tailoring in the ladies' wing of the house.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WestWing,
});

const COLLECTIONS: LuxCollection[] = [
  {
    handle: "womens-luxury-footwear",
    title: "Luxury Footwear",
    blurb:
      "Designer heels, pumps, flats and evening shoes — hand-lasted, balanced to be worn all night.",
    image: footwear,
  },
  {
    handle: "womens-luxury-dresses",
    title: "Dresses",
    blurb:
      "Evening gowns, cocktail and resort dressing in silk, crepe and hand-finished couture seams.",
    image: dresses,
  },
  {
    handle: "womens-luxury-tailoring",
    title: "Tailoring",
    blurb:
      "Suits, blazers and trousers cut for quiet power — the sharpest thing in any room.",
    image: tailoring,
  },
];

function WestWing() {
  return (
    <SiteShell>
      <div className="bg-[oklch(0.13_0.01_70)]">
        <section className="relative h-[64vh] min-h-[420px] w-full overflow-hidden">
          <img
            src={wing}
            alt="Ivory salon with a curved staircase and couture gowns in the ladies' wing of the Frass Luxury House"
            width={1280}
            height={1600}
            className="h-full w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(12,10,7,0.4)_0%,transparent_35%,rgba(12,10,7,0.9)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1400px] px-6 pb-14 lg:px-12">
            <Link
              to="/frass-luxury-house"
              className="text-[10px] uppercase tracking-[0.36em] text-[color:var(--gold)]"
            >
              ← Frass Luxury House
            </Link>
            <h1 className="mt-5 font-display text-[clamp(2rem,6vw,4.6rem)] uppercase leading-[0.95] tracking-[0.05em] text-foreground">
              The West Wing
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-foreground/80">
              The Ladies&rsquo; Collections. Curated slowly, worn for decades.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-[1500px] px-6 py-24 lg:px-12">
          <div className="grid gap-16 md:grid-cols-2 lg:grid-cols-3 lg:gap-12">
            {COLLECTIONS.map((item) => (
              <LuxuryCollectionCard key={item.handle} item={item} />
            ))}
          </div>
        </section>

        <section className="border-t border-[color:var(--gold)]/15">
          <div className="mx-auto grid max-w-[1400px] gap-6 px-6 py-16 text-[10px] uppercase tracking-[0.28em] text-muted-foreground sm:grid-cols-2 lg:grid-cols-4 lg:px-12">
            <span>Personal Styling</span>
            <span>Virtual Appointments</span>
            <span>Wedding Styling</span>
            <span>Gift Concierge</span>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
