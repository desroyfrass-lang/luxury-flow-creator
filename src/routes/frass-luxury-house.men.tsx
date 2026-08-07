import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { LuxuryCollectionCard, type LuxCollection } from "@/components/luxury-collection-card";
import wing from "@/assets/lux-east-wing.jpg";
import footwear from "@/assets/lux-m-footwear.jpg";
import tailoring from "@/assets/lux-m-tailoring.jpg";
import shirts from "@/assets/lux-m-shirts.jpg";

export const Route = createFileRoute("/frass-luxury-house/men")({
  head: () => ({
    meta: [
      { title: "The East Wing — Gentlemen's Collections | Frass Luxury House" },
      {
        name: "description",
        content:
          "The East Wing of Frass Luxury House: Italian leather footwear, bespoke tailoring and Egyptian cotton shirting.",
      },
      { property: "og:title", content: "The East Wing — Gentlemen's Collections" },
      {
        property: "og:description",
        content: "Luxury footwear, tailoring and shirting in the gentlemen's wing of the house.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EastWing,
});

const COLLECTIONS: LuxCollection[] = [
  {
    handle: "mens-luxury-footwear",
    title: "Luxury Footwear",
    blurb:
      "Italian leather dress shoes, loafers, monk straps and handmade boots — resoled, never replaced.",
    image: footwear,
  },
  {
    handle: "mens-luxury-tailoring",
    title: "Tailoring",
    blurb:
      "Bespoke suits, dinner jackets and waistcoats cut with a full canvas and a quiet shoulder.",
    image: tailoring,
  },
  {
    handle: "mens-luxury-shirts",
    title: "Shirts",
    blurb:
      "Egyptian cotton, Irish linen and silk — collars that hold, cloth that softens with every wear.",
    image: shirts,
  },
];

function EastWing() {
  return (
    <SiteShell>
      <div className="bg-[oklch(0.13_0.01_70)]">
        <section className="relative h-[64vh] min-h-[420px] w-full overflow-hidden">
          <img
            src={wing}
            alt="Walnut doors opening into the gentlemen's salon of the Frass Luxury House"
            width={1280}
            height={1600}
            className="h-full w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(12,10,7,0.45)_0%,transparent_35%,rgba(12,10,7,0.9)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1400px] px-6 pb-14 lg:px-12">
            <Link
              to="/frass-luxury-house"
              className="text-[10px] uppercase tracking-[0.36em] text-[color:var(--gold)]"
            >
              ← Frass Luxury House
            </Link>
            <h1 className="mt-5 font-display text-[clamp(2rem,6vw,4.6rem)] uppercase leading-[0.95] tracking-[0.05em] text-foreground">
              The East Wing
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-foreground/80">
              The Gentlemen&rsquo;s Collections. Craftsmanship you can feel before you see the label.
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
            <span>Bespoke Tailoring</span>
            <span>Made-to-Measure</span>
            <span>Personal Styling</span>
            <span>Luxury Packaging</span>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
