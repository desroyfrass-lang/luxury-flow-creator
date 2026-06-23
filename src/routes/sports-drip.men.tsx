import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { CollectionCard } from "@/components/collection-card";
import { PageHeader } from "@/components/page-header";
import cardDrip from "@/assets/card-drip.jpg";
import cardMen from "@/assets/card-men.jpg";
import cardKicks from "@/assets/card-kicks.jpg";

const CARDS = [
  ["training-gear", "Training Gear", "Performance shirts, compression wear, training shorts."],
  ["activewear-sets", "Activewear Sets", "Coordinated gym sets and matching athletic outfits."],
  ["running-performance", "Running & Performance", "Running apparel and endurance-focused styles."],
  ["basketball-court", "Basketball & Court Style", "Court-inspired apparel, jerseys and shorts."],
  ["gym-fits", "Gym Fits", "Workout sets, muscle-fit styles, training essentials."],
] as const;

const IMAGES = [cardDrip, cardMen, cardKicks];

export const Route = createFileRoute("/sports-drip/men")({
  head: () => ({
    meta: [
      { title: "Men's Sports Drip" },
      { name: "description", content: "Built for Performance. Styled for Confidence." },
      { property: "og:image", content: cardMen },
    ],
  }),
  component: () => (
    <SiteShell>
      <PageHeader
        eyebrow="Men"
        title="Men's Sports Drip"
        description="Built for Performance. Styled for Confidence."
        crumbs={[
          { label: "Home", to: "/" },
          { label: "Sports Drip", to: "/sports-drip" },
          { label: "Men" },
        ]}
      />
      <section className="mx-auto max-w-[1600px] px-6 lg:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {CARDS.map(([slug, title, description], i) => (
            <CollectionCard
              key={slug}
              to="/collection/$handle"
              params={{ handle: `sports-drip-men-${slug}` }}
              image={IMAGES[i % IMAGES.length]}
              eyebrow="Men"
              title={title}
              description={description}
              size="md"
            />
          ))}
        </div>
      </section>
    </SiteShell>
  ),
});
