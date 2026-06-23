import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { CollectionCard } from "@/components/collection-card";
import { PageHeader } from "@/components/page-header";
import cardWomen from "@/assets/card-women.jpg";
import cardBare from "@/assets/card-bare.jpg";
import cardDrip from "@/assets/card-drip.jpg";

const CARDS = [
  ["casual-drip", "Casual Drip"],
  ["street-drip", "Street Drip"],
  ["vacay-drip", "Vacay Drip"],
  ["work-drip", "Work Drip"],
  ["resort-dresses", "Resort Dresses"],
  ["maxi-dresses", "Maxi Dresses"],
  ["vacation-sets", "Vacation Sets"],
  ["vacation-fits", "Vacation Fits"],
  ["cover-ups", "Cover Ups"],
  ["beachwear", "Beachwear"],
  ["resort-essentials", "Resort Essentials"],
  ["rompers", "Rompers"],
  ["denim", "Denim"],
  ["tops", "Tops"],
  ["bottoms", "Bottoms"],
] as const;

const IMAGES = [cardWomen, cardBare, cardDrip];

export const Route = createFileRoute("/frass-drip/women")({
  head: () => ({
    meta: [
      { title: "Women's Frass Drip" },
      { name: "description", content: "Women's fashion — resort, vacation, denim, tops and more." },
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
          {CARDS.map(([slug, title], i) => (
            <CollectionCard
              key={slug}
              to="/collection/$handle"
              params={{ handle: `frass-drip-women-${slug}` }}
              image={IMAGES[i % IMAGES.length]}
              eyebrow="Women"
              title={title}
              size="md"
            />
          ))}
        </div>
      </section>
    </SiteShell>
  ),
});
