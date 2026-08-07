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
        <div className="mb-20">
          <header className="mb-10 flex flex-wrap items-center gap-3 border-b border-[color:var(--gold)]/20 pb-4">
            <h2 className="font-display text-2xl uppercase md:text-4xl">Frass Kicks</h2>
            <PlusBadge size="lg" />
            <span className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
              The shoe section
            </span>
          </header>
          <KicksEntry
            to="/frass-plus/$gender/kicks"
            params={{ gender }}
            eyebrow={`Frass Plus · ${label}`}
            title="Frass Kicks Plus+"
            description="Casual, Classic and Street on the illuminated wall — every pair that runs 10.5 and up."
            badge={<PlusBadge size="lg" />}
          />
        </div>

        {STORE_ORDER.filter((s) => s !== "kicks").map((store) => {
          const list = departments.filter((d) => d.store === store);
          if (!list.length) return null;
          return (
            <div key={store} className="mb-20">
              <header className="mb-10 flex flex-wrap items-center gap-3 border-b border-[color:var(--gold)]/20 pb-4">
                <h2 className="font-display text-2xl uppercase md:text-4xl">
                  {STORE_LABEL[store].replace(" Plus+", "")}
                </h2>
                <PlusBadge size="lg" />
                <span className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                  Mirrored collection
                </span>
              </header>

              <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((d, i) => (
                  <StorePortalCard
                    key={d.slug}
                    to="/frass-plus/$gender/$category"
                    params={{ gender, category: d.slug }}
                    slot={`plus-${gender}-${d.slug}`}
                    image={d.image}
                    eyebrow={`${STORE_LABEL[store]} · ${String(i + 1).padStart(2, "0")}`}
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
