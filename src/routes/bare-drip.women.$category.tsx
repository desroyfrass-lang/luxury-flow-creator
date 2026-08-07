import { createFileRoute, notFound } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { PageHeader } from "@/components/page-header";
import { ShowroomRack } from "@/components/showroom-rack";
import { ShowroomScene } from "@/components/showroom-scene";
import { getBareTheme, isBrightBareRoom } from "@/lib/showroom-themes";
import swimRoom from "@/assets/bare-women-swim-room.jpg";
import lingerieRoom from "@/assets/bare-women-lingerie-room.jpg";
import swimCard1 from "@/assets/bare-card-w-swim-1.jpg";
import swimCard2 from "@/assets/bare-card-w-swim-2.jpg";
import lingCard1 from "@/assets/bare-card-w-ling-1.jpg";
import lingCard2 from "@/assets/bare-card-w-ling-2.jpg";
import { BARE_WOMEN_CATEGORIES as WOMEN_CATEGORIES } from "@/lib/drip-catalog";



const CARD_IMAGES: Record<string, string[]> = {
  swimwear: [swimCard1, swimCard2],
  lingerie: [lingCard1, lingCard2],
};

const ROOM_PHOTO: Record<string, string> = { swimwear: swimRoom, lingerie: lingerieRoom };

export const Route = createFileRoute("/bare-drip/women/$category")({
  beforeLoad: ({ params }) => {
    if (!WOMEN_CATEGORIES[params.category]) throw notFound();
  },
  head: ({ params }) => {
    const cat = WOMEN_CATEGORIES[params.category];
    return {
      meta: [
        { title: `${cat?.title ?? "Women's Bare Drip"} — Frass` },
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
  const theme = getBareTheme("women", category);
  const bright = isBrightBareRoom("women", category);
  const photo = ROOM_PHOTO[category];
  const pool = CARD_IMAGES[category] ?? [];
  const items = cat.subs.map(([slug, title], i) => ({
    handle: `womens-bare-drip-${category}-${slug}`,
    title,
    image: pool[i % pool.length]!,
  }));

  return (
    <SiteShell>
      <PageHeader
        eyebrow={`Women · ${theme.room}`}
        title={cat.title}
        description={cat.tagline}
        crumbs={[
          { label: "Frass District", to: "/" },
          { label: "Bare Drip for Women", to: "/bare-drip/women" },
          { label: cat.title },
        ]}
      />
      <section
        className="relative mx-auto mb-24 max-w-[1600px] overflow-hidden rounded-[28px] px-6 pb-24 pt-12 lg:px-12"
        style={{ background: theme.backdrop }}
      >
        <ShowroomScene theme={theme} photo={photo} bright={bright} />
        <p
          className="relative mb-14 max-w-xl text-sm"
          style={{ color: bright ? "oklch(0.32 0.03 220)" : undefined }}
        >
          <span className={bright ? "" : "text-foreground/80"}>{theme.mood}</span>
        </p>
        <div className="relative">
          <ShowroomRack items={items} theme={theme} eyebrow={cat.title} />
        </div>
      </section>
    </SiteShell>
  );
}
