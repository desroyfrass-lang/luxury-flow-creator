import { createFileRoute, notFound } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { PageHeader } from "@/components/page-header";
import { PageFeedback } from "@/components/page-feedback";
import { ShoeWall, type WallSection } from "@/components/shoe-wall";
import { WallSigns } from "@/components/wall-signs";
import { getKidsSegment, kidsHandle, type KidsSegment } from "@/lib/frass-kids";
import kicksWall from "@/assets/kids-shoe-wall.jpg";

const SECTION_META = [
  ["casual", "Casual", "Everyday, elevated", "Casual Kicks"],
  ["classic", "Classic", "Timeless icons", "Classic Kicks"],
  ["street", "Street", "Bold silhouettes", "Street Kicks"],
] as const;

function sections(seg: KidsSegment): WallSection[] {
  return SECTION_META.map(([id, label, caption, type]) => ({
    id,
    label,
    caption,
    handle: kidsHandle(seg, "kicks", id),
    query: `tag:"kids" tag:"${seg.ageTag}" tag:"${seg.gender}" product_type:"${type}"`,
  }));
}

export const Route = createFileRoute("/frass-kids/$segment/kicks")({
  beforeLoad: ({ params }) => {
    if (!getKidsSegment(params.segment)) throw notFound();
  },
  head: ({ params }) => {
    const seg = getKidsSegment(params.segment);
    const title = `Frass Kicks — ${seg?.title ?? "Frass Kids"} Shoe Wall`;
    const description = `Casual, Classic and Street on the illuminated kids' shoe wall — sized for ages ${seg?.age ?? "0+"}.`;
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
      <PageHeader title="Shoe wall not found" crumbs={[{ label: "Frass Kids", to: "/frass-kids" }]} />
    </SiteShell>
  ),
  component: KidsKicksRoom,
});

function KidsKicksRoom() {
  const { segment } = Route.useParams();
  const seg = getKidsSegment(segment);
  if (!seg) return null;
  const wall = sections(seg);

  return (
    <SiteShell>
      <PageHeader
        eyebrow={`Frass Kids · ${seg.title} · Footwear`}
        title="Frass Kicks"
        description="Its own section, its own entrance. Three lit bays — Casual, Classic and Street — stocked in growing-feet sizing."
        crumbs={[
          { label: "Frass District", to: "/" },
          { label: "Frass Kids", to: "/frass-kids" },
          { label: seg.title, to: "/frass-kids/$segment", params: { segment: seg.slug } },
          { label: "Frass Kicks" },
        ]}
      />
      <WallSigns labels={wall.map((s) => s.label)} />
      <section className="relative mx-auto max-w-[1600px] px-2 md:px-12">
        <div className="relative overflow-hidden rounded-2xl md:rounded-[2rem]">
          <img
            src={kicksWall}
            alt={`Illuminated wall of children's shoes for ${seg.title}`}
            width={1920}
            height={1024}
            className="h-[34vh] w-full object-cover md:h-[52vh]"
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_65%,color-mix(in_oklab,var(--background)_88%,transparent))]" />
        </div>
      </section>
      <ShoeWall sections={wall} gender={seg.gender} />
      <PageFeedback pageTitle={`Frass Kicks — ${seg.title}`} />
    </SiteShell>
  );
}
