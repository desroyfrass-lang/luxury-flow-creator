import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { CollectionCard } from "@/components/collection-card";
import { PageHeader } from "@/components/page-header";
import cardWomen from "@/assets/card-women.jpg";
import cardBare from "@/assets/card-bare.jpg";
import cardDrip from "@/assets/card-drip.jpg";

const CARDS = [
  ["swimwear", "Swimwear"],
  ["bikinis", "Bikinis"],
  ["one-piece", "One Piece"],
  ["cover-ups", "Cover Ups"],
  ["resort-swimwear", "Resort Swimwear"],
  ["lingerie", "Lingerie"],
  ["bras", "Bras"],
  ["panties", "Panties"],
  ["sets", "Sets"],
  ["sleepwear", "Sleepwear"],
] as const;

const IMAGES = [cardWomen, cardBare, cardDrip];

export const Route = createFileRoute("/bare-drip/women")({
  head: () => ({
    meta: [
      { title: "Women's Bare Drip" },
      { name: "description", content: "Women's swim, lingerie and sleepwear." },
      { property: "og:image", content: cardWomen },
    ],
  }),
  component: () => (
    <SiteShell>
      <PageHeader
        eyebrow="Women"
        title="Women's Bare Drip"
        crumbs={[
          { label: "Home", to: "/" },
          { label: "Bare Drip", to: "/bare-drip" },
          { label: "Women" },
        ]}
      />
      <section className="mx-auto max-w-[1600px] px-6 lg:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {CARDS.map(([slug, title], i) => (
            <CollectionCard
              key={slug}
              to="/collection/$handle"
              params={{ handle: `bare-drip-women-${slug}` }}
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
