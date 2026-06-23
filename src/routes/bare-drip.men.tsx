import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { CollectionCard } from "@/components/collection-card";
import { PageHeader } from "@/components/page-header";
import cardMen from "@/assets/card-men.jpg";
import cardBare from "@/assets/card-bare.jpg";
import cardKicks from "@/assets/card-kicks.jpg";

const CARDS = [
  ["swim-shorts", "Swim Shorts"],
  ["swim-trunks", "Swim Trunks"],
  ["beach-shorts", "Beach Shorts"],
  ["performance-swimwear", "Performance Swimwear"],
  ["underwear", "Underwear"],
  ["boxer-briefs", "Boxer Briefs"],
  ["briefs", "Briefs"],
  ["trunks", "Trunks"],
  ["essentials", "Essentials"],
] as const;

const IMAGES = [cardMen, cardKicks, cardBare];

export const Route = createFileRoute("/bare-drip/men")({
  head: () => ({
    meta: [
      { title: "Men's Bare Drip" },
      { name: "description", content: "Men's swim, underwear and essentials." },
      { property: "og:image", content: cardMen },
    ],
  }),
  component: () => (
    <SiteShell>
      <PageHeader
        eyebrow="Men"
        title="Men's Bare Drip"
        description="Made for Movement. Built for Confidence."
        crumbs={[
          { label: "Home", to: "/" },
          { label: "Bare Drip", to: "/bare-drip" },
          { label: "Men" },
        ]}
      />
      <section className="mx-auto max-w-[1600px] px-6 lg:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {CARDS.map(([slug, title], i) => (
            <CollectionCard
              key={slug}
              to="/collection/$handle"
              params={{ handle: `bare-drip-men-${slug}` }}
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
