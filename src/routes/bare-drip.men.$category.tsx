import { createFileRoute, notFound } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { PageHeader } from "@/components/page-header";
import { ShowroomRack } from "@/components/showroom-rack";
import { ShowroomScene } from "@/components/showroom-scene";
import { getBareTheme, isBrightBareRoom } from "@/lib/showroom-themes";
import swimRoom from "@/assets/bare-men-swim-room.jpg";
import underwearRoom from "@/assets/bare-men-underwear-room.jpg";
import swimCard1 from "@/assets/bare-card-m-swim-1.jpg";
import swimCard2 from "@/assets/bare-card-m-swim-2.jpg";
import underCard1 from "@/assets/bare-card-m-under-1.jpg";
import underCard2 from "@/assets/bare-card-m-under-2.jpg";

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

const CARD_IMAGES: Record<string, string[]> = {
  swimwear: [swimCard1, swimCard2],
  underwear: [underCard1, underCard2],
};

const ROOM_PHOTO: Record<string, string> = { swimwear: swimRoom, underwear: underwearRoom };

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
  const theme = getBareTheme("men", category);
  const bright = isBrightBareRoom("men", category);
  const photo = ROOM_PHOTO[category];
  const pool = CARD_IMAGES[category] ?? [];
  const items = cat.subs.map(([slug, title], i) => ({
    handle: `mens-bare-drip-${category}-${slug}`,
    title,
    image: pool[i % pool.length]!,
  }));

  return (
    <SiteShell>
      <PageHeader
        eyebrow={`Men · ${theme.room}`}
        title={cat.title}
        description={cat.tagline}
        crumbs={[
          { label: "Frass District", to: "/" },
          { label: "Bare Drip for Men", to: "/bare-drip/men" },
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
