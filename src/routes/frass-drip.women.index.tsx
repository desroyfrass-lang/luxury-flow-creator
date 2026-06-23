import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { CollectionCard } from "@/components/collection-card";
import { PageHeader } from "@/components/page-header";
import cardWomen from "@/assets/card-women.jpg";
import cardBare from "@/assets/card-bare.jpg";
import cardDrip from "@/assets/card-drip.jpg";

const PARENTS = [
  ["work-drip", "Work Drip", "Blouses, blazers & professional sets."],
  ["party-drip", "Party Drip", "Dresses, clubwear & sequin looks."],
  ["casual-drip", "Casual Drip", "Sweats, denim, crop tops & basics."],
  ["street-drip", "Street Drip", "Jackets, cargo & tracksuits."],
  ["vacay-drip", "Vacay Drip", "Beachwear, resort fits & cover-ups."],
  ["sports-drip", "Sports Drip", "Training, studio & active shapewear."],
] as const;

const IMAGES = [cardWomen, cardBare, cardDrip];

export const Route = createFileRoute("/frass-drip/women/")({
  head: () => ({
    meta: [
      { title: "Women's Frass Drip" },
      { name: "description", content: "Women's fashion across work, party, casual, street, vacay and sports." },
      { property: "og:image", content: cardWomen },
    ],
  }),
  component: () => (
    <SiteShell>
      <PageHeader
        eyebrow="Women"
        title="Women's Frass Drip"
        crumbs={[
          { label: "Home", to: "/" },
          { label: "Frass Drip", to: "/frass-drip" },
          { label: "Women" },
        ]}
      />
      <section className="mx-auto max-w-[1600px] px-6 lg:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {PARENTS.map(([slug, title, description], i) => (
            <CollectionCard
              key={slug}
              to="/frass-drip/women/$category"
              params={{ category: slug }}
              image={IMAGES[i % IMAGES.length]}
              eyebrow="Women"
              title={title}
              description={description}
              size="lg"
            />
          ))}
        </div>
      </section>
    </SiteShell>
  ),
});