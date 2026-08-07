import { createFileRoute, notFound } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { PageHeader } from "@/components/page-header";
import { PageFeedback } from "@/components/page-feedback";
import { PlusBadge } from "@/components/plus-badge";
import { ShoeWall, type WallSection } from "@/components/shoe-wall";
import { isPlusGender } from "@/lib/frass-plus";
import type { ShopifyProduct } from "@/lib/shopify";
import { plusWallImages, WALL_ACCENT, type WallCategory } from "@/lib/wall-images";
import heroMen from "@/assets/hero-shoe-wall-men.jpg";
import heroWomen from "@/assets/hero-shoe-wall-women.jpg";

/** Extended sizing: every pair offered in 10.5 and up. */
const MIN_SIZE = 10.5;

function isExtendedSize(product: ShopifyProduct) {
  return product.node.variants.edges.some(({ node }) =>
    node.selectedOptions.some((opt) => {
      if (!/size/i.test(opt.name)) return false;
      const value = Number.parseFloat(opt.value.replace(/[^\d.]/g, ""));
      return Number.isFinite(value) && value >= MIN_SIZE;
    }),
  );
}

const SECTION_META = [
  ["casual", "Casual", "Everyday, elevated", "Casual Kicks"],
  ["classic", "Classic", "Timeless icons", "Classic Kicks"],
  ["street", "Street", "Bold silhouettes", "Street Kicks"],
] as const;

function sections(gender: "men" | "women"): WallSection[] {
  const tag = gender === "men" ? "Men's" : "Women's";
  const shelves = plusWallImages(gender);
  return SECTION_META.map(([id, label, caption, type]) => ({
    id,
    label,
    caption,
    image: shelves[id as WallCategory],
    accent: WALL_ACCENT[id as WallCategory],
    handle: `${id}-kicks-${gender}-plus`,
    query: `vendor:"FRASS KICKS" tag:"${tag}" product_type:"${type}"`,
    filter: isExtendedSize,
  }));
}

export const Route = createFileRoute("/frass-plus/$gender/kicks")({
  beforeLoad: ({ params }) => {
    if (!isPlusGender(params.gender)) throw notFound();
  },
  head: ({ params }) => {
    const label = params.gender === "men" ? "Men" : "Women";
    const title = `Frass Kicks Plus+ Showroom for ${label}`;
    const description = `Casual, Classic and Street on the illuminated Frass Kicks wall — every pair on the ${label.toLowerCase()}'s Plus+ wall runs size ${MIN_SIZE} and up.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: () => (
    <SiteShell>
      <PageHeader title="Showroom not found" crumbs={[{ label: "Frass Plus", to: "/frass-plus" }]} />
    </SiteShell>
  ),
  component: PlusKicksRoom,
});

function PlusKicksRoom() {
  const { gender } = Route.useParams();
  if (!isPlusGender(gender)) return null;
  const label = gender === "men" ? "Men" : "Women";
  const wall = sections(gender);
  const hero = gender === "men" ? heroMen : heroWomen;

  return (
    <SiteShell>
      <PageHeader
        eyebrow={`Frass Plus · ${label}`}
        title={`Frass Kicks Plus+ Showroom for ${label}`}
        description={`Three lit bays, floor to ceiling. Casual, Classic, Street — the exact same wall, stocked with every pair that runs ${MIN_SIZE} and up.`}
        crumbs={[
          { label: "Frass District", to: "/" },
          { label: "Frass Plus", to: "/frass-plus" },
          { label, to: gender === "men" ? "/frass-plus/men" : "/frass-plus/women" },
          { label: "Frass Kicks Plus+" },
        ]}
      />
      <section className="relative mx-auto max-w-[1600px] px-2 md:px-12">
        <div className="relative overflow-hidden rounded-2xl md:rounded-[2rem]">
          <img
            src={hero}
            alt={`Illuminated wall of ${label.toLowerCase()}'s extended-size shoes on lit shelves`}
            width={1920}
            height={1024}
            className="h-[40vh] w-full object-cover md:h-[58vh]"
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_65%,color-mix(in_oklab,var(--background)_88%,transparent))]" />
          <div className="absolute left-5 top-5">
            <PlusBadge size="lg" />
          </div>
        </div>
      </section>
      <ShoeWall sections={wall} gender={gender} />
      <PageFeedback pageTitle={`Frass Kicks Plus+ — ${label}`} />
    </SiteShell>
  );
}
