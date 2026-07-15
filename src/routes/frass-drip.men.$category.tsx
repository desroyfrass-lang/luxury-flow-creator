import { createFileRoute, notFound } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { CollectionCard } from "@/components/collection-card";
import { PageHeader } from "@/components/page-header";
import cardDrip from "@/assets/card-drip.jpg";
import cardMen from "@/assets/card-men.jpg";
import cardKicks from "@/assets/card-kicks.jpg";

type Sub = readonly [slug: string, title: string, handleOverride?: string];

const MEN_CATEGORIES: Record<string, { title: string; tagline: string; subs: readonly Sub[] }> = {
  work: {
    title: "Men's Work Drip",
    tagline: "Dress shirts, blazers, suits & business casual.",
    subs: [
      ["dress-shirts", "Dress Shirts"],
      ["button-down-shirts", "Button Down Shirts"],
      ["polo-shirts", "Polo Shirts"],
      ["business-casual", "Business Casual"],
      ["dress-pants", "Dress Pants"],
      ["quarter-zips", "Quarter Zips"],
      ["blazers-suit-jackets", "Blazers & Suit Jackets"],
      ["full-suits", "Full Suits"],
    ],
  },
  party: {
    title: "Men's Party Drip",
    tagline: "Nightlife fits & luxury streetwear.",
    subs: [
      ["night-out-shirts", "Night Out Shirts"],
      ["dress-shirts", "Dress Shirts"],
      ["matching-sets", "Matching Sets"],
      ["party-blazers", "Party Blazers"],
      ["luxury-streetwear", "Luxury Streetwear"],
      ["dress-pants", "Dress Pants"],
      ["nightlife-fits", "Nightlife Fits"],
      ["party-fits", "Party Fits"],
    ],
  },
  casual: {
    title: "Men's Casual Drip",
    tagline: "Everyday staples, elevated.",
    subs: [
      ["casual-button-down", "Casual Button Down"],
      ["tank-tops", "Tank Tops"],
      ["shorts", "Shorts"],
      ["denim", "Denim"],
      ["casual-shirts", "Casual Shirts"],
      ["hoodies", "Hoodies"],
      ["sweat-suits", "Sweat Suits"],
      ["matching-sets", "Matching Sets"],
    ],
  },
  street: {
    title: "Men's Street Drip",
    tagline: "Cargo, denim & statement pieces.",
    subs: [
      ["oversized-tees", "Oversized Tees"],
      ["graphic-tees", "Graphic Tees"],
      ["cargo", "Cargo"],
      ["streetwear-sets", "Streetwear Sets"],
      ["tracksuits", "Tracksuits"],
      ["hoodies", "Hoodies"],
      ["denim", "Denim"],
      ["statement-pieces", "Statement Pieces"],
      ["jackets", "Jackets"],
    ],
  },
  vacay: {
    title: "Men's Vacay Drip",
    tagline: "Tropical shirts & resort essentials.",
    subs: [
      ["vacation-cruise-sets", "Vacation & Cruise Sets"],
      ["tropical-shirts", "Tropical Shirts"],
      ["vacation-shorts", "Vacation Shorts"],
      ["resort-essentials", "Resort Essentials"],
      ["summer-styles", "Summer Styles"],
    ],
  },
  sport: {
    title: "Men's Sport Drip",
    tagline: "Training, gym & court performance.",
    subs: [
      ["training-gear", "Training Gear"],
      ["activewear-sets", "Activewear Sets"],
      ["running-performance", "Running & Performance"],
      ["basketball-court", "Basketball & Court Style"],
      ["gym-fits", "Gym Fits"],
    ],
  },
  crown: {
    title: "Men's Crown Drip",
    tagline: "Signature Crown drops.",
    subs: [
      ["street-crowns", "Street Crowns"],
      ["classic-crowns", "Classic Crowns"],
      ["casual-crowns", "Casual Crowns"],
      ["on-sale", "On Sale"],
    ],
  },
  extra: {
    title: "Men's Extra Drip",
    tagline: "Overflow drops & seasonal extras.",
    subs: [
      ["street", "Street"],
      ["classic", "Classic"],
      ["casual", "Casual"],
      ["on-sale", "On Sale"],
    ],
  },
  "90s": {
    title: "Men's 90's Drip",
    tagline: "Throwback fits — casual, classic and street.",
    subs: [
      ["casual", "90's Casual", "frass-drip-90s-casual"],
      ["classic", "90's Classic", "frass-drip-90s-classic"],
      ["street", "90's Street", "frass-drip-90s-street"],
    ],
  },
};

const IMAGES = [cardDrip, cardMen, cardKicks];

export const Route = createFileRoute("/frass-drip/men/$category")({
  beforeLoad: ({ params }) => {
    if (!MEN_CATEGORIES[params.category]) throw notFound();
  },
  head: ({ params }) => {
    const cat = MEN_CATEGORIES[params.category];
    return {
      meta: [
        { title: `${cat?.title ?? "Men's Drip"} — Frass` },
        { name: "description", content: cat?.tagline ?? "" },
      ],
    };
  },
  notFoundComponent: () => (
    <SiteShell>
      <PageHeader eyebrow="Men" title="Category not found" crumbs={[{ label: "Home", to: "/" }]} />
    </SiteShell>
  ),
  component: CategoryPage,
});

function CategoryPage() {
  const { category } = Route.useParams();
  const cat = MEN_CATEGORIES[category]!;
  return (
    <SiteShell>
      <PageHeader
        eyebrow={`Men · ${cat.title}`}
        title={cat.title}
        description={cat.tagline}
        crumbs={[
          { label: "Home", to: "/" },
          { label: "Frass Drip", to: "/frass-drip" },
          { label: "Men", to: "/frass-drip/men" },
          { label: cat.title },
        ]}
      />
      <section className="mx-auto max-w-[1600px] px-6 lg:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {cat.subs.map(([slug, title, handleOverride], i) => (
            <CollectionCard
              key={slug}
              to="/collection/$handle"
              params={{ handle: handleOverride ?? `mens-${category}-drip-${slug}` }}
              image={IMAGES[i % IMAGES.length]}
              eyebrow={cat.title}
              title={title}
              size="md"
            />
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
