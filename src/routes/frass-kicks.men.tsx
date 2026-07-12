import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { CollectionCard } from "@/components/collection-card";
import { PageHeader } from "@/components/page-header";
import cardKicks from "@/assets/card-kicks.jpg";
import cardMen from "@/assets/card-men.jpg";
import cardDrip from "@/assets/card-drip.jpg";

export const Route = createFileRoute("/frass-kicks/men")({
  head: () => ({
    meta: [
      { title: "Men's Footwear — Frass Kicks" },
      { name: "description", content: "Street, classic and casual men's kicks." },
      { property: "og:image", content: cardMen },
    ],
  }),
  component: MensKicks,
});

const CARDS = [
  { handle: "street-kicks-men", slot: "kicks-men-street", title: "Street Kicks", image: cardDrip, blurb: "Bold silhouettes for the city." },
  { handle: "classic-kicks-men", slot: "kicks-men-classic", title: "Classic Kicks", image: cardMen, blurb: "Timeless icons, modern feel." },
  { handle: "casual-kicks-men", slot: "kicks-men-casual", title: "Casual Kicks", image: cardKicks, blurb: "Everyday comfort, elevated." },
];


function MensKicks() {
  return (
    <SiteShell>
      <PageHeader
        eyebrow="Men"
        title="Men's Footwear"
        crumbs={[
          { label: "Home", to: "/" },
          { label: "Frass Kicks", to: "/frass-kicks" },
          { label: "Men" },
        ]}
      />
      <section className="mx-auto max-w-[1600px] px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {CARDS.map((c) => (
            <CollectionCard
              key={c.handle}
              to="/collection/$handle"
              params={{ handle: c.handle }}
              image={c.image}
              eyebrow="Men"
              title={c.title}
              description={c.blurb}
            />
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
