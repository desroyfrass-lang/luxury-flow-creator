import { createFileRoute, notFound } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { PageHeader } from "@/components/page-header";
import { ShowroomRack } from "@/components/showroom-rack";
import { ShowroomScene } from "@/components/showroom-scene";
import { getShowroomTheme } from "@/lib/showroom-themes";
import cardWomen from "@/assets/card-women.jpg";
import cardBare from "@/assets/card-bare.jpg";
import cardDrip from "@/assets/card-drip.jpg";

type Sub = readonly [slug: string, title: string, handleOverride?: string];


const WOMEN_CATEGORIES: Record<string, { title: string; tagline: string; subs: readonly Sub[] }> = {
  work: {
    title: "Women's Work Drip",
    tagline: "Blazers, blouses, dresses & professional sets.",
    subs: [
      ["blazers", "Blazers"],
      ["work-dresses", "Work Dresses"],
      ["pencil-skirts", "Pencil Skirts"],
      ["dress-pants", "Dress Pants"],
      ["wide-leg-trousers", "Wide-Leg Trousers"],
      ["work-blouses", "Work Blouses"],
      ["professional-sets", "Professional Sets"],
      ["business-casual", "Business Casual"],
      ["jackets", "Jackets"],
    ],
  },
  party: {
    title: "Women's Party Drip",
    tagline: "Dresses, clubwear & sequin looks.",
    subs: [
      ["party-dresses", "Party Dresses"],
      ["birthday-dresses", "Birthday Dresses"],
      ["mini-dresses", "Mini Dresses"],
      ["maxi-dresses", "Maxi Dresses"],
      ["corset-tops", "Corset Tops"],
      ["two-piece-sets", "Two-Piece Sets"],
      ["clubwear", "Clubwear"],
      ["sequin-looks", "Sequin Looks"],
      ["nightlife-fits", "Nightlife Fits"],
      ["jackets", "Jackets"],
    ],
  },
  casual: {
    title: "Women's Casual Drip",
    tagline: "Sweats, denim, crop tops & basics.",
    subs: [
      ["casual-dresses", "Casual Dresses"],
      ["matching-sets", "Matching Sets"],
      ["basic-tops", "Basic Tops"],
      ["graphic-tees", "Graphic Tees"],
      ["crop-tops", "Crop Tops"],
      ["bodysuits", "Bodysuits"],
      ["leggings", "Leggings"],
      ["denim", "Denim"],
      ["shorts", "Shorts"],
      ["sweaters", "Sweaters"],
      ["sweats", "Sweats"],
      ["jackets", "Jackets"],
    ],
  },
  street: {
    title: "Women's Street Drip",
    tagline: "Jackets, cargo, tracksuits & statement pieces.",
    subs: [
      ["oversized-graphic-tees", "Oversized & Graphic Tees"],
      ["cargo", "Cargo"],
      ["streetwear-sets", "Streetwear Sets"],
      ["tracksuits", "Tracksuits"],
      ["hoodies", "Hoodies"],
      ["sweaters", "Sweaters"],
      ["denim", "Denim"],
      ["statement-pieces", "Statement Pieces"],
      ["jumpsuits-rompers", "Jumpsuits & Rompers"],
      ["sweats", "Sweats"],
      ["jackets", "Jackets"],
    ],
  },
  vacay: {
    title: "Women's Vacay Drip",
    tagline: "Beachwear, resort fits & cover-ups.",
    subs: [
      ["resort-dresses", "Resort Dresses"],
      ["maxi-dresses", "Maxi Dresses"],
      ["vacation-sets", "Vacation Sets"],
      ["vacation-fits", "Vacation Fits"],
      ["cover-ups", "Cover-Ups"],
      ["beachwear", "Beachwear"],
      ["resort-essentials", "Resort Essentials"],
      ["rompers-jumpsuits", "Rompers & Jumpsuits"],
      ["jackets", "Jackets"],
    ],
  },
  sport: {
    title: "Women's Sport Drip",
    tagline: "Training, studio, running & active shapewear.",
    subs: [
      ["training-essentials", "Training Essentials"],
      ["activewear-sets", "Activewear Sets"],
      ["running-performance", "Running & Performance"],
      ["studio-yoga", "Studio & Yoga"],
      ["active-shapewear", "Active Shapewear"],
      ["gym-fits", "Gym Fits"],
      ["jackets", "Jackets"],
    ],
  },
  crown: {
    title: "Women's Crown Drip",
    tagline: "Signature Crown drops.",
    subs: [
      ["street-crowns", "Street Crowns"],
      ["classic-crowns", "Classic Crowns"],
      ["casual-crowns", "Casual Crowns"],
      ["on-sale", "On Sale"],
    ],
  },
  extra: {
    title: "Women's Extra Drip",
    tagline: "Overflow drops & seasonal extras.",
    subs: [
      ["street", "Street"],
      ["classic", "Classic"],
      ["casual", "Casual"],
      ["on-sale", "On Sale"],
    ],
  },
  "90s": {
    title: "Women's 90's Drip",
    tagline: "Throwback fits — casual, classic and street.",
    subs: [
      ["casual", "90's Casual", "frass-drip-90s-casual"],
      ["classic", "90's Classic", "frass-drip-90s-classic"],
      ["street", "90's Street", "frass-drip-90s-street"],
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
        { title: `${cat?.title ?? "Women's Drip"} — Frass` },
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
  const theme = getShowroomTheme(category);
  const items = cat.subs.map(([slug, title, handleOverride], i) => ({
    handle: handleOverride ?? `womens-${category}-drip-${slug}`,
    title,
    image: IMAGES[i % IMAGES.length]!,
  }));

  return (
    <SiteShell>
      <div style={{ background: theme.backdrop }}>
        <PageHeader
          eyebrow={`Women · ${theme.room}`}
          title={cat.title}
          description={cat.tagline}
          crumbs={[
            { label: "Home", to: "/" },
            { label: "Frass District", to: "/shop-frass" },
            { label: "Frass Drip for Women", to: "/frass-drip/women" },
            { label: cat.title },
          ]}
        />
        <section className="relative mx-auto max-w-[1600px] px-6 pb-24 pt-4 lg:px-12">
          <ShowroomScene theme={theme} />
          <p className="relative mb-14 max-w-xl text-sm text-foreground/80">{theme.mood}</p>
          <div className="relative">
            <ShowroomRack items={items} theme={theme} eyebrow={cat.title} />
          </div>
        </section>
      </div>
    </SiteShell>
  );
}

