import { createFileRoute, notFound } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { PageHeader } from "@/components/page-header";
import { ShowroomRack } from "@/components/showroom-rack";
import { ShowroomScene } from "@/components/showroom-scene";
import { getShapeTheme, shapeCategories, shapeHandle, type ShapeGender } from "@/lib/shape-catalog";
import doorImg from "@/assets/shape-door.jpg";
import womenRoom from "@/assets/shape-room-women.jpg";
import menRoom from "@/assets/shape-room-men.jpg";

export const Route = createFileRoute("/frass-shape/$gender/$category")({
  beforeLoad: ({ params }) => {
    const gender = params.gender as ShapeGender;
    if (gender !== "men" && gender !== "women") throw notFound();
    if (!shapeCategories(gender)[params.category]) throw notFound();
  },
  head: ({ params }) => {
    const cat = shapeCategories(params.gender as ShapeGender)?.[params.category];
    return {
      meta: [
        { title: `${cat?.title ?? "Frass Shape"} — Frass Shape` },
        { name: "description", content: cat?.tagline ?? "Frass Shape showroom." },
        { property: "og:title", content: `${cat?.title ?? "Frass Shape"} — Frass Shape` },
        { property: "og:description", content: cat?.tagline ?? "Frass Shape showroom." },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: () => (
    <SiteShell>
      <PageHeader
        eyebrow="Frass Shape"
        title="Room not found"
        crumbs={[{ label: "Frass Shape", to: "/frass-shape" }]}
      />
    </SiteShell>
  ),
  component: ShapeShowroom,
});

function ShapeShowroom() {
  const { gender: g, category } = Route.useParams();
  const gender = g as ShapeGender;
  const cat = shapeCategories(gender)[category]!;
  const theme = getShapeTheme(gender);
  const photo = gender === "men" ? menRoom : womenRoom;
  const pool = [doorImg, photo];

  const items = cat.subs.map(([slug, title], i) => ({
    handle: shapeHandle(gender, category, slug),
    title,
    image: pool[i % pool.length]!,
  }));

  return (
    <SiteShell>
      <PageHeader
        eyebrow={`${gender === "men" ? "Men" : "Women"} · ${theme.room}`}
        title={cat.title}
        description={cat.tagline}
        crumbs={[
          { label: "Frass District", to: "/frass-district" },
          { label: "Frass Shape", to: "/frass-shape" },
          { label: gender === "men" ? "Men" : "Women", to: "/frass-shape/$gender" },
          { label: cat.title },
        ]}
      />
      <section
        className="relative mx-auto mb-24 max-w-[1600px] overflow-hidden rounded-[28px] px-6 pb-24 pt-12 lg:px-12"
        style={{ background: theme.backdrop }}
      >
        <ShowroomScene theme={theme} photo={photo} bright />
        <p
          className="relative mb-14 max-w-xl text-sm"
          style={{ color: "oklch(0.34 0.02 80)" }}
        >
          {theme.mood}
        </p>
        <div className="relative">
          <ShowroomRack items={items} theme={theme} eyebrow={cat.title} />
        </div>
      </section>
    </SiteShell>
  );
}
