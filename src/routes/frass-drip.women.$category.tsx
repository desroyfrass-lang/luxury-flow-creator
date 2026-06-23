import { createFileRoute, notFound } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { CollectionCard } from "@/components/collection-card";
import { PageHeader } from "@/components/page-header";
import cardWomen from "@/assets/card-women.jpg";
import cardBare from "@/assets/card-bare.jpg";
import cardDrip from "@/assets/card-drip.jpg";

type Sub = readonly [slug: string, title: string];

const WOMEN_CATEGORIES: Record<string, { title: string; tagline: string; subs: readonly Sub[] }> = {
  "work-drip": {
    title: "Work Drip",
    tagline: "Blouses, blazers & professional sets.",
    subs: [
      ["work-blouses", "Work Blouses"],
      ["work-dresses", "Work Dresses"],
      ["blazers", "Blazers"],
      ["business-casual", "Business Casual"],
      ["professional-sets", "Professional Sets"],
      ["dress-pants", "Dress Pants"],
      ["pencil-skirts", "Pencil Skirts"],
      ["wide-leg-trousers", "Wide-Leg Trousers"],
    ],
  },
  "party-drip": {
    title: "Party Drip",
    tagline: "Dresses, clubwear & sequin looks.",
    subs: [
      ["party-dresses", "Party Dresses"],
      ["clubwear", "Clubwear"],
      ["nightlife-fits", "Nightlife Fits"],
      ["sequin-looks", "Sequin Looks"],
      ["maxi-dresses", "Maxi Dresses"],
      ["mini-dresses", "Mini Dresses"],
      ["birthday-dresses", "Birthday Dresses"],
      ["two-piece-sets", "Two-Piece Sets"],
    ],
  },
  "casual-drip": {
    title: "Casual Drip",
    tagline: "Sweats, denim, crop tops & basics.",
    subs: [
      ["casual-dresses", "Casual Dresses"],
      ["sweats", "Sweats"],
      ["shorts", "Shorts"],
      ["denim", "Denim"],
      ["leggings", "Leggings"],
      ["bodysuits", "Bodysuits"],
      ["crop-tops", "Crop Tops"],
      ["graphic-tees", "Graphic Tees"],
      ["basic-tops", "Basic Tops"],
    ],
  },
  "street-drip": {
    title: "Street Drip",
    tagline: "Jackets, cargo & tracksuits.",
    subs: [
      ["jackets", "Jackets"],
      ["sweats", "Sweats"],
      ["denim", "Denim"],
      ["hoodies", "Hoodies"],
      ["tracksuits", "Tracksuits"],
      ["cargo", "Cargo"],
      ["jumpsuits-rompers", "Jumpsuits & Rompers"],
      ["statement-pieces", "Statement Pieces"],
      ["streetwear-sets", "Streetwear Sets"],
    ],
  },
  "vacay-drip": {
    title: "Vacay Drip",
    tagline: "Beachwear, resort fits & cover-ups.",
    subs: [
      ["beachwear", "Beachwear"],
      ["rompers-jumpsuits", "Rompers & Jumpsuits"],
      ["resort-essentials", "Resort Essentials"],
      ["cover-ups", "Cover-Ups"],
      ["vacation-fits", "Vacation Fits"],
      ["vacation-sets", "Vacation Sets"],
      ["resort-dresses", "Resort Dresses"],
    ],
  },
  "sports-drip": {
    title: "Sports Drip",
    tagline: "Training, studio & active shapewear.",
    subs: [
      ["training-essentials", "Training Essentials"],
      ["activewear-sets", "Activewear Sets"],
      ["running-performance", "Running & Performance"],
      ["studio-yoga", "Studio & Yoga"],
      ["active-shapewear", "Active Shapewear"],
    ],
  },
};

const IMAGES = [cardWomen, cardBare, cardDrip];

export const Route = createFileRoute("/frass-drip/women/$category")({
  beforeLoad: ({ params }) => {
    if (!WOMEN_CATEGORIES[params.category]) throw notFound();
  },
  head: ({ params }) => {
    const cat = WOMEN_CATEGORIES[params.category];
    return {
      meta: [
        { title: `Women's ${cat?.title ?? "Drip"} — Frass` },
        { name: "description", content: cat?.tagline ?? "" },
      ],
    };
  },
  notFoundComponent: () => (
    <SiteShell>
      <PageHeader eyebrow="Women" title="Category not found" crumbs={[{ label: "Home", to: "/" }]} />
    </SiteShell>
  ),
  component: CategoryPage,
});

function CategoryPage() {
  const { category } = Route.useParams();
  const cat = WOMEN_CATEGORIES[category]!;
  return (
    <SiteShell>
      <PageHeader
        eyebrow={`Women · ${cat.title}`}
        title={cat.title}
        description={cat.tagline}
        crumbs={[
          { label: "Home", to: "/" },
          { label: "Frass Drip", to: "/frass-drip" },
          { label: "Women", to: "/frass-drip/women" },
          { label: cat.title },
        ]}
      />
      <section className="mx-auto max-w-[1600px] px-6 lg:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {cat.subs.map(([slug, title], i) => (
            <CollectionCard
              key={slug}
              to="/collection/$handle"
              params={{ handle: `frass-drip-women-${category}-${slug}` }}
              image={IMAGES[i % IMAGES.length]}
              eyebrow={cat.title}
              title={title}
              size="md"
            />
          ))}
          {!cat.subs.some(([s]) => s === "on-sale") && (
            <CollectionCard
              key="on-sale"
              to="/collection/$handle"
              params={{ handle: `frass-drip-women-${category}-on-sale` }}
              image={IMAGES[cat.subs.length % IMAGES.length]}
              eyebrow={cat.title}
              title={`${cat.title} On Sale`}
              description="Marked-down pieces from this drop."
              size="md"
              cta="Shop Sale"
            />
          )}
        </div>
      </section>
    </SiteShell>
  );
}
