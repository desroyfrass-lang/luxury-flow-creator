import { createFileRoute, notFound } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { CollectionCard } from "@/components/collection-card";
import { PageHeader } from "@/components/page-header";
import cardMen from "@/assets/card-men.jpg";
import cardBare from "@/assets/card-bare.jpg";
import cardKicks from "@/assets/card-kicks.jpg";

type Sub = readonly [slug: string, title: string];

const MEN_CATEGORIES: Record<string, { title: string; tagline: string; subs: readonly Sub[] }> = {
  swimwear: {
    title: "Men's Bare Drip Swimwear",
    tagline: "Swim shorts, trunks, beach shorts and performance swimwear.",
    subs: [
      ["swim-shorts", "Swim Shorts"],
      ["swim-trunks", "Swim Trunks"],
      ["beach-shorts", "Beach Shorts"],
      ["performance-swimwear", "Performance Swimwear"],
    ],
  },
  underwear: {
    title: "Men's Bare Drip Underwear",
    tagline: "Boxers, briefs, tanks, undershirts and sleepwear.",
    subs: [
      ["boxers", "Boxers"],
      ["boxer-briefs", "Boxer Briefs"],
      ["briefs", "Briefs"],
      ["performance-underwear", "Performance Underwear"],
      ["undershirts", "Undershirts"],
      ["tank-tops", "Tank Tops"],
      ["sleepwear", "Sleepwear"],
    ],
  },
};

const IMAGES = [cardMen, cardKicks, cardBare];

export const Route = createFileRoute("/bare-drip/men/$category")({
  beforeLoad: ({ params }) => {
    if (!MEN_CATEGORIES[params.category]) throw notFound();
  },
  head: ({ params }) => {
    const cat = MEN_CATEGORIES[params.category];
    return {
      meta: [
        { title: `${cat?.title ?? "Men's Bare Drip"} — Frass` },
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
          { label: "Bare Drip", to: "/bare-drip" },
          { label: "Men", to: "/bare-drip/men" },
          { label: cat.title },
        ]}
      />
      <section className="mx-auto max-w-[1600px] px-6 lg:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {cat.subs.map(([slug, title], i) => (
            <CollectionCard
              key={slug}
              to="/collection/$handle"
              params={{ handle: `mens-bare-drip-${category}-${slug}` }}
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
