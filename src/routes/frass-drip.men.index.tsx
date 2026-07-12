import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { CollectionCard } from "@/components/collection-card";
import { PageHeader } from "@/components/page-header";
import cardDrip from "@/assets/card-drip.jpg";
import cardMen from "@/assets/card-men.jpg";
import cardKicks from "@/assets/card-kicks.jpg";

const PARENTS = [
  ["work", "Work Drip", "Tailored essentials for the boardroom."],
  ["party", "Party Drip", "Nightlife fits & luxury streetwear."],
  ["casual", "Casual Drip", "Everyday staples, elevated."],
  ["street", "Street Drip", "Cargo, denim & statement pieces."],
  ["vacay", "Vacay Drip", "Tropical shirts & resort essentials."],
  ["sport", "Sport Drip", "Training, gym & court performance."],
  ["crown", "Crown Drip", "Signature drops from the Crown line."],
  ["extra", "Extra Drip", "Overflow drops & seasonal extras."],
] as const;

const IMAGES = [cardDrip, cardMen, cardKicks];

export const Route = createFileRoute("/frass-drip/men/")({
  head: () => ({
    meta: [
      { title: "Men's Frass Drip" },
      { name: "description", content: "Men's fashion — work, party, casual, street, vacay, sport, crown and extra." },
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
          {PARENTS.map(([slug, title, description], i) => (
            <CollectionCard
              key={slug}
              to="/frass-drip/men/$category"
              params={{ category: slug }}
              image={IMAGES[i % IMAGES.length]}
              eyebrow="Men"
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
