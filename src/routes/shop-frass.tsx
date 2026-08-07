import { createFileRoute, Link } from "@tanstack/react-router";
import { GatewayNav } from "@/components/gateway-nav";
import { CollectionCard } from "@/components/collection-card";
import marketStreet from "@/assets/district-kicks.jpg";
import storeKicksMen from "@/assets/store-kicks-men.jpg";
import storeKicksWomen from "@/assets/store-kicks-women.jpg";
import storeDripMen from "@/assets/store-drip-men.jpg";
import storeDripWomen from "@/assets/store-drip-women.jpg";
import storeBareMen from "@/assets/store-bare-men.jpg";
import storeBareWomen from "@/assets/store-bare-women.jpg";
import districtLuxury from "@/assets/district-luxury.jpg";
import districtKids from "@/assets/district-kids.jpg";
import cardMen from "@/assets/card-men.jpg";
import cardWomen from "@/assets/card-women.jpg";


export const Route = createFileRoute("/shop-frass")({
  head: () => ({
    meta: [
      { title: "Frass District — Shop Every Frass Store" },
      {
        name: "description",
        content:
          "The Frass District directory: Frass Kicks, Frass Drip, Bare Drip, Plus Size, Frass Kids and Frass Luxury House — for men and women.",
      },
      { property: "og:title", content: "Frass District — Shop Every Frass Store" },
      {
        property: "og:description",
        content:
          "Two columns, every store. Kicks, Drip, Bare, Plus Size, Kids and the Luxury House — men's side and women's side.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ShopFrassPage,
});

const STORES: { title: string; description: string; image: string; to: string; eyebrow: string }[] = [
  {
    title: "Frass Kicks for Men",
    description: "Premium footwear — casual, classic and street.",
    image: storeKicksMen,
    to: "/frass-kicks/men",
    eyebrow: "Men",
  },
  {
    title: "Frass Kicks for Women",
    description: "Sneakers, heels, sandals and slides.",
    image: storeKicksWomen,
    to: "/frass-kicks/women",
    eyebrow: "Women",
  },
  {
    title: "Frass Drip for Men",
    description: "Streetwear, apparel and complete looks.",
    image: storeDripMen,
    to: "/frass-drip/men",
    eyebrow: "Men",
  },
  {
    title: "Frass Drip for Women",
    description: "Fashion, apparel and complete looks.",
    image: storeDripWomen,
    to: "/frass-drip/women",
    eyebrow: "Women",
  },
  {
    title: "Bare Drip for Men",
    description: "Swimwear, resort wear and essentials.",
    image: storeBareMen,
    to: "/bare-drip/men",
    eyebrow: "Men",
  },
  {
    title: "Bare Drip for Women",
    description: "Swimwear, lingerie and resort collections.",
    image: storeBareWomen,
    to: "/bare-drip/women",
    eyebrow: "Women",
  },
  {
    title: "Plus Size for Men",
    description: "Extended sizing across every fit.",
    image: cardMen,
    to: "/plus-size/men",
    eyebrow: "Men",
  },
  {
    title: "Plus Size for Women",
    description: "Extended sizing across every collection.",
    image: cardWomen,
    to: "/plus-size/women",
    eyebrow: "Women",
  },
  {
    title: "Frass Kids for Boys",
    description: "Kicks, drip and essentials for young builders.",
    image: districtKids,
    to: "/frass-kids/boys",
    eyebrow: "Boys",
  },
  {
    title: "Frass Kids for Girls",
    description: "Kicks, drip and essentials for young builders.",
    image: districtKids,
    to: "/frass-kids/girls",
    eyebrow: "Girls",
  },
  {
    title: "Frass Luxury House for Men",
    description: "Tailored luxury and limited men's editions.",
    image: districtLuxury,
    to: "/frass-luxury-house/men",
    eyebrow: "Men",
  },
  {
    title: "Frass Luxury House for Women",
    description: "Couture-leaning luxury and limited women's editions.",
    image: districtLuxury,
    to: "/frass-luxury-house/women",
    eyebrow: "Women",
  },
];


function ShopFrassPage() {
  return (
    <div className="min-h-screen bg-background">
      <GatewayNav mode="shop" />

      <section className="relative h-[62vh] min-h-[420px] overflow-hidden">
        <img
          src={marketStreet}
          alt="Lush Jamaican street opening into a sunlit retail boulevard of boutique storefronts"
          width={1280}
          height={960}
          className="gateway-drift h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/40" />
        <div className="absolute inset-0 mx-auto flex max-w-[1600px] flex-col justify-end px-6 pb-12 lg:px-10">
          <span className="text-[10px] uppercase tracking-[0.35em] text-white/70">
            The FrassKicks Marketplace
          </span>
          <h1 className="gateway-rise mt-3 max-w-3xl font-display text-4xl uppercase leading-[0.95] text-white md:text-7xl">
            Frass District
          </h1>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/sales-clearance"
              className="rounded-full bg-white px-6 py-3 text-[10px] font-bold uppercase tracking-[0.28em] text-black transition hover:scale-[1.03]"
            >
              Shop Sales and Clearance
            </Link>
            <Link
              to="/frass-world"
              className="rounded-full border border-white/60 px-6 py-3 text-[10px] font-bold uppercase tracking-[0.28em] text-white transition hover:bg-white/10"
            >
              🌍 Explore Frass World
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1100px] px-6 py-20 lg:px-10">
        <header className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-4xl uppercase leading-[0.9] text-[color:var(--gold)] md:text-6xl">
            Choose Your Lane
          </h2>
          <p className="mt-4 text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
            Walk Wid Power · Step Wid Purpose · Move Wid Meaning
          </p>
          <p className="mx-auto mt-5 max-w-xl text-sm text-muted-foreground md:text-base">
            Every Frass store, in one directory — pick your door and start shopping.
          </p>
        </header>

        <div className="mt-16 grid gap-10">
          {STORES.map((s) => (
            <CollectionCard
              key={s.to}
              to={s.to}
              image={s.image}
              eyebrow={s.eyebrow}
              title={s.title}
              description={s.description}
              size="lg"
              cta="Enter Store"
            />
          ))}
        </div>
      </section>


      <footer className="border-t border-border/60 bg-card/40">
        <div className="mx-auto grid max-w-[1600px] gap-4 px-6 py-8 text-[10px] uppercase tracking-[0.22em] text-muted-foreground sm:grid-cols-2 lg:grid-cols-4 lg:px-10">
          <span className="text-[color:var(--gold)]">★ FrassKicks Quality Guarantee</span>
          <span>Batch dispatch · Sunday &amp; Monday</span>
          <span>14-day return policy</span>
          <span>Landed-cost checkout — no surprise duties</span>
        </div>
      </footer>
    </div>
  );
}
