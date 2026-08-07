import { createFileRoute, notFound } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { PageHeader } from "@/components/page-header";
import { StorePortalCard } from "@/components/store-portal-card";
import { PageFeedback } from "@/components/page-feedback";
import { KIDS_COLLECTIONS, getKidsSegment } from "@/lib/frass-kids";

export const Route = createFileRoute("/frass-kids/$segment/")({
  beforeLoad: ({ params }) => {
    if (!getKidsSegment(params.segment)) throw notFound();
  },
  head: ({ params }) => {
    const seg = getKidsSegment(params.segment);
    const title = `${seg?.title ?? "Frass Kids"} — Frass Kids`;
    const description =
      seg?.blurb ?? "The children's flagship department store of the Frass District.";
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
      <PageHeader title="Store not found" crumbs={[{ label: "Frass Kids", to: "/frass-kids" }]} />
    </SiteShell>
  ),
  component: SegmentFloor,
});

function SegmentFloor() {
  const { segment } = Route.useParams();
  const seg = getKidsSegment(segment);
  if (!seg) return null;

  return (
    <SiteShell>
      <section className="relative h-[46vh] min-h-[320px] w-full overflow-hidden">
        <img
          src={seg.image}
          alt={`${seg.title} — Frass Kids`}
          width={1024}
          height={1280}
          className="h-full w-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,oklch(0.09_0.01_60/0.94),oklch(0.09_0.01_60/0.2)_65%)]" />
      </section>

      <PageHeader
        eyebrow={`Frass Kids · Ages ${seg.age} · ${seg.gender === "boys" ? "Boys" : "Girls"}`}
        title={seg.title}
        description={`${seg.blurb} Choose a collection to step onto the floor.`}
        crumbs={[
          { label: "Frass District", to: "/" },
          { label: "Frass Kids", to: "/frass-kids" },
          { label: seg.title },
        ]}
      />

      <section className="mx-auto grid max-w-[1600px] grid-cols-1 gap-8 px-6 pb-24 sm:grid-cols-2 lg:grid-cols-3 lg:px-12">
        {KIDS_COLLECTIONS.map((c, i) => (
          <StorePortalCard
            key={c.slug}
            to="/frass-kids/$segment/$collection"
            params={{ segment: seg.slug, collection: c.slug }}
            image={seg.image}
            title={c.title}
            description={c.tagline}
            eyebrow={`Department ${String(i + 1).padStart(2, "0")}`}
            cta="Enter"
          />
        ))}
      </section>

      <PageFeedback pageTitle={`Frass Kids — ${seg.title}`} />
    </SiteShell>
  );
}
