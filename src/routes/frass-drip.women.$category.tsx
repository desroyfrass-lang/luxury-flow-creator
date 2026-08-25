import { createFileRoute, notFound } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { PageHeader } from "@/components/page-header";
import { ShowroomRack } from "@/components/showroom-rack";
import { ShowroomScene } from "@/components/showroom-scene";
import { getShowroomTheme } from "@/lib/showroom-themes";
import cardWomen from "@/assets/card-women.jpg";
import cardBare from "@/assets/card-bare.jpg";
import cardDrip from "@/assets/card-drip.jpg";
import { WOMEN_CATEGORIES } from "@/lib/drip-catalog";




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
            { label: "Frass District", to: "/frass-district" },
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

