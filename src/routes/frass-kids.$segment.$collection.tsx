import { createFileRoute, notFound } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { PageHeader } from "@/components/page-header";
import { ShowroomRack } from "@/components/showroom-rack";
import { ShowroomScene } from "@/components/showroom-scene";
import { PageFeedback } from "@/components/page-feedback";
import { getShowroomTheme } from "@/lib/showroom-themes";
import { getKidsCollection, getKidsSegment, kidsHandle } from "@/lib/frass-kids";

export const Route = createFileRoute("/frass-kids/$segment/$collection")({
  beforeLoad: ({ params }) => {
    if (!getKidsSegment(params.segment)) throw notFound();
    if (!getKidsCollection(params.collection)) throw notFound();
  },
  head: ({ params }) => {
    const seg = getKidsSegment(params.segment);
    const col = getKidsCollection(params.collection);
    const title = `${seg?.title ?? "Frass Kids"} ${col?.title ?? ""} — Frass Kids`.trim();
    const description = col?.tagline ?? "The children's flagship of the Frass District.";
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
      <PageHeader
        title="Collection not found"
        crumbs={[{ label: "Frass Kids", to: "/frass-kids" }]}
      />
    </SiteShell>
  ),
  component: KidsShowroom,
});

function KidsShowroom() {
  const { segment, collection } = Route.useParams();
  const seg = getKidsSegment(segment);
  const col = getKidsCollection(collection);
  if (!seg || !col) return null;

  const theme = getShowroomTheme(col.theme);
  const items = col.subs.map(([slug, title]) => ({
    handle: kidsHandle(seg, col.slug, slug),
    title,
    image: seg.image,
  }));

  return (
    <SiteShell>
      <div style={{ background: theme.backdrop }}>
        <PageHeader
          eyebrow={`Frass Kids · ${seg.title} · ${theme.room}`}
          title={col.title}
          description={col.tagline}
          crumbs={[
            { label: "Frass District", to: "/" },
            { label: "Frass Kids", to: "/frass-kids" },
            { label: seg.title },
            { label: col.title },
          ]}
        />
        <section className="relative mx-auto max-w-[1600px] px-6 pb-24 pt-4 lg:px-12">
          <ShowroomScene theme={theme} photo={seg.image} bright={col.bright} />
          <p className="relative mb-14 max-w-xl text-sm text-foreground/80">{theme.mood}</p>
          <div className="relative">
            <ShowroomRack items={items} theme={theme} eyebrow={col.title} />
          </div>
        </section>
      </div>

      <PageFeedback pageTitle={`Frass Kids — ${seg.title} ${col.title}`} />
    </SiteShell>
  );
}
