import { createFileRoute, notFound } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { PageHeader } from "@/components/page-header";
import { StorePortalCard } from "@/components/store-portal-card";
import { PageFeedback } from "@/components/page-feedback";
import { KicksEntry } from "@/components/kicks-entry";
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
          src={seg.banner}
          alt={`${seg.title} — Frass Kids in the Caribbean`}
          width={1920}
          height={900}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,oklch(0.09_0.01_60/0.94),oklch(0.09_0.01_60/0.2)_65%)]" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1600px] px-6 pb-8 lg:px-12">
          <span className="text-[10px] uppercase tracking-[0.4em] text-[color:var(--gold)]">
            Frass Kids · Ages {seg.age}
          </span>
          <h2 className="mt-3 font-display text-3xl uppercase leading-none text-[color:var(--luxe-linen,#f6f1e7)] md:text-6xl">
            {seg.title}
          </h2>
          <p className="mt-3 max-w-2xl text-xs text-[color:var(--luxe-linen,#f6f1e7)]/80 md:text-base">
            {seg.bannerCaption}
          </p>
        </div>
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

      {/* Footwear — its own section, its own entrance. Never a store door. */}
      <section className="mx-auto max-w-[1600px] px-6 pb-16 lg:px-12">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-[color:var(--gold)]/20 pb-4">
          <h2 className="font-display text-2xl uppercase md:text-4xl">The Shoe Section</h2>
          <span className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
            Footwear stands alone
          </span>
        </header>
        <KicksEntry
          to="/frass-kids/$segment/kicks"
          params={{ segment: seg.slug }}
          eyebrow={`Frass Kids · ${seg.title}`}
          title="Frass Kicks"
          description="Three lit bays of Casual, Classic and Street — sized for growing feet. No doors here; you walk straight up to the wall."
        />
      </section>

      <section className="mx-auto max-w-[1600px] px-6 pb-6 lg:px-12">
        <header className="mb-2 flex flex-wrap items-end justify-between gap-3 border-b border-[color:var(--gold)]/20 pb-4">
          <h2 className="font-display text-2xl uppercase md:text-4xl">The Clothing Floors</h2>
          <span className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
            Step through a door
          </span>
        </header>
      </section>

      <section className="mx-auto grid max-w-[1600px] grid-cols-1 gap-8 px-6 pb-24 sm:grid-cols-2 lg:grid-cols-3 lg:px-12">
        {KIDS_COLLECTIONS.filter((c) => c.slug !== "kicks").map((c, i) => (
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
