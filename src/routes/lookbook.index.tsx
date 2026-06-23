import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { PageHeader } from "@/components/page-header";
import { LOOKBOOK_STORIES } from "@/lib/lookbook";
import { useSiteImages } from "@/hooks/use-site-images";

export const Route = createFileRoute("/lookbook/")({
  head: () => ({
    meta: [
      { title: "Lookbook — Frass" },
      {
        name: "description",
        content:
          "Mood-driven editorial stories from the Frass house — Work, Party, Street, Casual, Vacay, Sports and Bare Drip.",
      },
      { property: "og:title", content: "Lookbook — Frass" },
      {
        property: "og:description",
        content: "Editorial stories from the Frass house.",
      },
    ],
  }),
  component: LookbookIndex,
});

function LookbookIndex() {
  const { data: overrides } = useSiteImages();
  return (
    <SiteShell>
      <PageHeader
        eyebrow="The Frass Lookbook"
        title="Stories, Not Catalogs."
        description="Seven moods, seven volumes. Editorial fits styled to the way you actually wear them — from boardroom to block to beach."
        crumbs={[{ label: "Home", to: "/" }, { label: "Lookbook" }]}
      />

      <section className="mx-auto max-w-[1600px] px-6 lg:px-12 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 lg:gap-8">
          {LOOKBOOK_STORIES.map((story, i) => {
            // editorial asymmetric grid: alternate wide / tall blocks
            const pattern = [
              "md:col-span-4 md:row-span-2 aspect-[16/11]",
              "md:col-span-2 md:row-span-2 aspect-[3/4]",
              "md:col-span-2 aspect-[3/4]",
              "md:col-span-2 aspect-[3/4]",
              "md:col-span-2 aspect-[3/4]",
              "md:col-span-3 aspect-[4/3]",
              "md:col-span-3 aspect-[4/3]",
            ];
            const span = pattern[i % pattern.length];
            return (
              <Link
                key={story.slug}
                to="/lookbook/$story"
                params={{ story: story.slug }}
                className={`lux-card group relative block overflow-hidden rounded-2xl bg-card ${span}`}
              >
                <img
                  src={overrides?.get(`lookbook-cover-${story.slug}`)?.url ?? story.cover}
                  alt={story.title}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1600ms] ease-out group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,oklch(0.07_0.005_80_/_0.25)_0%,oklch(0.07_0.005_80_/_0.55)_55%,oklch(0.07_0.005_80_/_0.92)_100%)]" />
                <div className="absolute inset-3 ring-1 ring-[color:var(--gold)]/25 rounded-xl pointer-events-none" />
                <div className="absolute inset-x-0 bottom-0 p-8 md:p-10">
                  <div className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--gold)]/90 mb-3">
                    {story.kicker}
                  </div>
                  <h3
                    className="title-glow font-display uppercase text-4xl md:text-6xl leading-[0.95] tracking-[0.01em] text-[color:var(--gold-soft,#f0d78c)]"
                  >
                    {story.title}
                  </h3>
                  <p className="mt-3 max-w-md text-sm md:text-base italic font-script text-foreground/85">
                    {story.tagline}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </SiteShell>
  );
}
