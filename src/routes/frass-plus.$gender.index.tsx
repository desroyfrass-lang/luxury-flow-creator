import { createFileRoute, notFound } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { PageHeader } from "@/components/page-header";
import { StorePortalCard } from "@/components/store-portal-card";
import { PageFeedback } from "@/components/page-feedback";
import { PlusBadge } from "@/components/plus-badge";
import { KicksEntry } from "@/components/kicks-entry";
import { PLUS_DEPARTMENTS, isPlusGender, plusName } from "@/lib/frass-plus";

const STORE_LABEL = {
  kicks: "Frass Kicks Plus+",
  drip: "Frass Drip Plus+",
  bare: "Bare Drip Plus+",
} as const;

const STORE_ORDER = ["kicks", "drip", "bare"] as const;

export const Route = createFileRoute("/frass-plus/$gender/")({
  beforeLoad: ({ params }) => {
    if (!isPlusGender(params.gender)) throw notFound();
  },
  head: ({ params }) => {
    const label = params.gender === "men" ? "Men's" : "Women's";
    const title = `${label} Frass Plus+ — The Full Collection`;
    const description = `Every ${label} Frass collection — Kicks, Drip and Bare Drip — mirrored department for department in extended sizing.`;
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
  const label = gender === "men" ? "Men" : "Women";
  const departments = PLUS_DEPARTMENTS[gender];

  return (
    <SiteShell>
      <PageHeader
        eyebrow={`Frass Plus · ${label}`}
        title={`${label}'s Frass Plus+`}
        description="The exact same collection architecture as the main Frass District — every department mirrored, every drop released together. Only the fit is extended."
        crumbs={[
          { label: "Frass District", to: "/" },
          { label: "Frass Plus", to: "/frass-plus" },
          { label },
        ]}
      />

      <section className="mx-auto max-w-[1600px] px-6 pb-24 lg:px-12">
        {/* Footwear is its own section — never a store door. */}
        <div className="mb-24">
          <SectionMarquee
            kicker="Section 01 · Footwear"
            title="Frass Kicks"
            accent="oklch(0.92 0.02 240)"
            blurb="The shoe department. An illuminated three-bay wall — Casual, Classic and Street — every pair carried in 10.5 and up."
          />
          <KicksEntry
            to="/frass-plus/$gender/kicks"
            params={{ gender }}
            eyebrow={`Frass Plus · ${label}`}
            title="Frass Kicks Plus+"
            description="Casual, Classic and Street on the illuminated wall — every pair that runs 10.5 and up."
            badge={<PlusBadge size="lg" />}
          />
        </div>

        {STORE_ORDER.filter((s) => s !== "kicks").map((store, si) => {
          const list = departments.filter((d) => d.store === store);
          if (!list.length) return null;
          return (
            <div key={store} className="mb-24">
              <SectionMarquee
                kicker={`Section ${String(si + 2).padStart(2, "0")} · ${
                  store === "drip" ? "Clothing" : "Intimates & Swim"
                }`}
                title={STORE_LABEL[store].replace(" Plus+", "")}
                accent={
                  store === "drip" ? "oklch(0.72 0.20 305)" : "oklch(0.80 0.13 200)"
                }
                blurb={
                  store === "drip"
                    ? "The clothing floor. Every doorway is a showroom of its own — step through the one that matches your day."
                    : "The intimates and swim floor. Two rooms, one boutique — cut and carried in extended sizing."
                }
              />

              <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((d, i) => (
                  <StorePortalCard
                    key={d.slug}
                    to="/frass-plus/$gender/$category"
                    params={{ gender, category: d.slug }}
                    slot={`plus-${gender}-${d.slug}`}
                    image={d.image}
                    eyebrow={`Department ${String(i + 1).padStart(2, "0")}`}
                    title={plusName(d.title)}
                    description={d.tagline}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </section>

      <PageFeedback pageTitle={`Frass Plus — ${label}`} />
    </SiteShell>
  );
}
