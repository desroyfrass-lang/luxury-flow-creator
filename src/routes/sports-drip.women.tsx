import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { CollectionCard } from "@/components/collection-card";
import { PageHeader } from "@/components/page-header";
import cardWomen from "@/assets/card-women.jpg";
import cardBare from "@/assets/card-bare.jpg";
import cardDrip from "@/assets/card-drip.jpg";

const CARDS = [
  ["training-essentials", "Training Essentials", "Sports bras, leggings, training tops, workout basics."],
  ["activewear-sets", "Activewear Sets", "Matching gym sets and coordinated athletic outfits."],
  ["running-performance", "Running & Performance", "Running shorts, performance leggings, lightweight activewear."],
  ["studio-yoga", "Studio & Yoga", "Yoga apparel, stretching essentials, low-impact training wear."],
  ["active-shapewear", "Active Shapewear", "Sculpting activewear, compression leggings, body-contouring fits."],
] as const;

const IMAGES = [cardWomen, cardBare, cardDrip];

export const Route = createFileRoute("/sports-drip/women")({
  head: () => ({
    meta: [
      { title: "Women's Sports Drip" },
      { name: "description", content: "Move Freely. Train Boldly. Sculpt Beautifully." },
      { property: "og:image", content: cardWomen },
    ],
  }),
  component: () => (
    <SiteShell>
      <PageHeader
        eyebrow="Women"
        title="Women's Sports Drip"
        description="Move Freely. Train Boldly. Sculpt Beautifully."
        crumbs={[
          { label: "Home", to: "/" },
          { label: "Sports Drip", to: "/sports-drip" },
          { label: "Women" },
        ]}
      />
      <section className="mx-auto max-w-[1600px] px-6 lg:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {CARDS.map(([slug, title, description], i) => (
            <CollectionCard
              key={slug}
              to="/collection/$handle"
              params={{ handle: `sports-drip-women-${slug}` }}
              image={IMAGES[i % IMAGES.length]}
              eyebrow="Women"
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
