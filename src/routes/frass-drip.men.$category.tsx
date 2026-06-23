import { createFileRoute, notFound } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { CollectionCard } from "@/components/collection-card";
import { PageHeader } from "@/components/page-header";
import cardDrip from "@/assets/card-drip.jpg";
import cardMen from "@/assets/card-men.jpg";
import cardKicks from "@/assets/card-kicks.jpg";

type Sub = readonly [slug: string, title: string];

const MEN_CATEGORIES: Record<string, { title: string; tagline: string; subs: readonly Sub[] }> = {
  "work-drip": {
    title: "Work Drip",
    tagline: "Tailored essentials for the boardroom.",
    subs: [
      ["dress-shirts", "Dress Shirts"],
      ["blazers-suit-jackets", "Blazers & Suit Jackets"],
      ["dress-pants", "Dress Pants"],
      ["polo-shirts", "Polo Shirts"],
      ["button-down-shirts", "Button Down Shirts"],
    ],
  },
  "party-drip": {
    title: "Party Drip",
    tagline: "Nightlife fits & luxury streetwear.",
    subs: [
      ["dress-shirts", "Dress Shirts"],
      ["party-blazers", "Party Blazers"],
      ["dress-pants", "Dress Pants"],
      ["matching-sets", "Matching Sets"],
      ["night-out-shirts", "Night Out Shirts"],
      ["nightlife-fits", "Nightlife Fits"],
      ["party-fits", "Party Fits"],
      ["luxury-streetwear", "Luxury Streetwear"],
    ],
  },
  "casual-drip": {
    title: "Casual Drip",
    tagline: "Everyday staples, elevated.",
    subs: [
      ["casual-shirts", "Casual Shirts"],
      ["shorts", "Shorts"],
      ["hoodies", "Hoodies"],
      ["denim", "Denim"],
      ["tank-tops", "Tank Tops"],
      ["casual-button-down", "Casual Button Down"],
      ["matching-sets", "Matching Sets"],
      ["sweat-suits", "Sweat Suits"],
    ],
  },
  "street-drip": {
    title: "Street Drip",
    tagline: "Cargo, denim & statement pieces.",
    subs: [
      ["streetwear-sets", "Streetwear Sets"],
      ["cargo", "Cargo"],
      ["hoodies", "Hoodies"],
      ["tracksuits", "Tracksuits"],
      ["oversized-tees", "Oversized Tees"],
      ["denim", "Denim"],
      ["graphic-tees", "Graphic Tees"],
      ["statement-pieces", "Statement Pieces"],
      ["jackets", "Jackets"],
    ],
  },
  "vacay-drip": {
    title: "Vacay Drip",
    tagline: "Tropical shirts & resort essentials.",
    subs: [
      ["tropical-shirts", "Tropical Shirts"],
      ["vacation-shorts", "Vacation Shorts"],
      ["vacation-cruise-sets", "Vacation & Cruise Sets"],
      ["resort-essentials", "Resort Essentials"],
      ["summer-styles", "Summer Styles"],
    ],
  },
  "sports-drip": {
    title: "Sports Drip",
    tagline: "Training, gym & court performance.",
    subs: [
      ["training-gear", "Training Gear"],
      ["activewear-sets", "Activewear Sets"],
      ["running-performance", "Running & Performance"],
      ["basketball-court", "Basketball & Court Style"],
      ["gym-fits", "Gym Fits"],
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
        { title: `Men's ${cat?.title ?? "Drip"} — Frass` },
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
          {cat.subs.map(([slug, title], i) => (
            <CollectionCard
              key={slug}
              to="/collection/$handle"
              params={{ handle: `frass-drip-men-${category}-${slug}` }}
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
