import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { CollectionCard } from "@/components/collection-card";
import { PageHeader } from "@/components/page-header";
import cardDrip from "@/assets/card-drip.jpg";
import cardMen from "@/assets/card-men.jpg";
import cardKicks from "@/assets/card-kicks.jpg";

const CARDS = [
  ["casual-drip", "Casual Drip"],
  ["street-drip", "Street Drip"],
  ["vacay-drip", "Vacay Drip"],
  ["work-drip", "Work Drip"],
  ["hoodie-drip", "Hoodie Drip"],
  ["denim-drip", "Denim Drip"],
  ["matching-sets", "Matching Sets"],
  ["sweat-suits", "Sweat Suits"],
  ["tank-tops", "Tank Tops"],
  ["shorts", "Shorts"],
  ["button-downs", "Button Downs"],
  ["graphic-tees", "Graphic Tees"],
  ["sports-drip-training-gear", "Sports — Training Gear"],
  ["sports-drip-activewear-sets", "Sports — Activewear Sets"],
  ["sports-drip-running-performance", "Sports — Running & Performance"],
  ["sports-drip-basketball-court", "Sports — Basketball & Court"],
  ["sports-drip-gym-fits", "Sports — Gym Fits"],
] as const;

const IMAGES = [cardDrip, cardMen, cardKicks];

export const Route = createFileRoute("/frass-drip/men")({
  head: () => ({
    meta: [
      { title: "Men's Frass Drip" },
      { name: "description", content: "Men's fashion across casual, street, vacay, work and more." },
      { property: "og:image", content: cardDrip },
    ],
  }),
  component: () => (
    <SiteShell>
      <PageHeader
        eyebrow="Men"
        title="Men's Frass Drip"
        crumbs={[
          { label: "Home", to: "/" },
          { label: "Frass Drip", to: "/frass-drip" },
          { label: "Men" },
        ]}
      />
      <section className="mx-auto max-w-[1600px] px-6 lg:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {CARDS.map(([slug, title], i) => (
            <CollectionCard
              key={slug}
              to="/collection/$handle"
              params={{ handle: `frass-drip-men-${slug}` }}
              image={IMAGES[i % IMAGES.length]}
              eyebrow="Men"
              title={title}
              size="md"
            />
          ))}
        </div>
      </section>
    </SiteShell>
  ),
});
