import { createFileRoute, notFound } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { PageHeader } from "@/components/page-header";
import { StorePortalCard } from "@/components/store-portal-card";
import { PageFeedback } from "@/components/page-feedback";
import { PLUS_DEPARTMENTS, isPlusGender } from "@/lib/frass-plus";

export const Route = createFileRoute("/frass-plus/$gender/")({
  beforeLoad: ({ params }) => {
    if (!isPlusGender(params.gender)) throw notFound();
  },
  head: ({ params }) => {
    const label = params.gender === "men" ? "Gentlemen's" : "Ladies'";
    const title = `Frass Plus — The ${label} Collection`;
    const description = `${label} footwear, apparel, tailoring, resort and activewear at Frass Plus, thoughtfully cut for extended sizing.`;
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
        crumbs={[{ label: "Frass Plus", to: "/frass-plus" }]}
      />
    </SiteShell>
  ),
  component: WingPage,
});

function WingPage() {
  const { gender } = Route.useParams();
  if (!isPlusGender(gender)) return null;
  const label = gender === "men" ? "Gentlemen" : "Ladies";
  const departments = PLUS_DEPARTMENTS[gender];

  return (
    <SiteShell>
      <PageHeader
        eyebrow={`Frass Plus · ${label}`}
        title={`The ${label}' Collection`}
        description="Browse by collection, occasion and lifestyle. Fit is a promise, not a category."
        crumbs={[
          { label: "Frass District", to: "/" },
          { label: "Frass Plus", to: "/frass-plus" },
          { label },
        ]}
      />

      <section className="mx-auto max-w-[1600px] px-6 pb-24 lg:px-12">
        <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((d, i) => (
            <StorePortalCard
              key={d.slug}
              to="/frass-plus/$gender/$category"
              params={{ gender, category: d.slug }}
              slot={`plus-${gender}-${d.slug}`}
              image={d.image}
              eyebrow={`Department ${String(i + 1).padStart(2, "0")}`}
              title={d.title}
              description={d.tagline}
            />
          ))}
        </div>
      </section>

      <PageFeedback pageTitle={`Frass Plus — ${label}`} />
    </SiteShell>
  );
}
