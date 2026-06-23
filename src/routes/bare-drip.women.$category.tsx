import { createFileRoute, notFound } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { CollectionCard } from "@/components/collection-card";
import { PageHeader } from "@/components/page-header";
import cardWomen from "@/assets/card-women.jpg";
import cardBare from "@/assets/card-bare.jpg";
import cardDrip from "@/assets/card-drip.jpg";

type Sub = readonly [slug: string, title: string];

const WOMEN_CATEGORIES: Record<string, { title: string; tagline: string; subs: readonly Sub[] }> = {
  swimwear: {
    title: "Bare Drip Swimwear",
    tagline: "Bikinis, one-pieces, cover-ups and swim skirts.",
    subs: [
      ["bikini-sets", "Bikini Sets"],
      ["bikini-tops", "Bikini Tops"],
      ["bikini-bottoms", "Bikini Bottoms"],
      ["one-piece-swimwear", "One-Piece Swimwear"],
      ["cover-ups", "Cover-Ups"],
      ["photo-shoot-worthy", "Photo Shoot Worthy"],
      ["swim-skirts", "Swim Skirts"],
    ],
  },
  lingerie: {
    title: "Bare Drip Lingerie",
    tagline: "Bras, panties, sets, bodysuits and shapewear.",
    subs: [
      ["bras", "Bras"],
      ["panties", "Panties"],
      ["bras-panty-sets", "Bras & Panty Sets"],
      ["bodysuits", "Bodysuits"],
      ["lingerie-sets", "Lingerie Sets"],
      ["sleepwear", "Sleepwear"],
      ["babydolls", "Babydolls"],
      ["teddies", "Teddies"],
      ["shapewear", "Shapewear"],
    ],
  },
};

const IMAGES = [cardWomen, cardBare, cardDrip];

export const Route = createFileRoute("/bare-drip/women/$category")({
  beforeLoad: ({ params }) => {
    if (!WOMEN_CATEGORIES[params.category]) throw notFound();
  },
  head: ({ params }) => {
    const cat = WOMEN_CATEGORIES[params.category];
    return {
      meta: [
        { title: `Women's ${cat?.title ?? "Bare Drip"} — Frass` },
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
          { label: "Bare Drip", to: "/bare-drip" },
          { label: "Women", to: "/bare-drip/women" },
          { label: cat.title },
        ]}
      />
      <section className="mx-auto max-w-[1600px] px-6 lg:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {cat.subs.map(([slug, title], i) => (
            <CollectionCard
              key={slug}
              to="/collection/$handle"
              params={{ handle: `bare-drip-women-${category}-${slug}` }}
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