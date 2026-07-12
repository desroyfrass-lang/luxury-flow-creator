import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { CollectionCard } from "@/components/collection-card";
import { PageHeader } from "@/components/page-header";
import cardKicks from "@/assets/card-kicks.jpg";
import cardWomen from "@/assets/card-women.jpg";
import cardBare from "@/assets/card-bare.jpg";

export const Route = createFileRoute("/frass-kicks/women")({
  head: () => ({
    meta: [
      { title: "Women's Footwear — Frass Kicks" },
      { name: "description", content: "Street, classic and casual women's kicks." },
      { property: "og:image", content: cardWomen },
    ],
  }),
  component: WomensKicks,
});

const CARDS = [
  { handle: "street-kicks-women", slot: "kicks-women-street", title: "Street Kicks", image: cardKicks, blurb: "Statement steppers." },
  { handle: "classic-kicks-women", slot: "kicks-women-classic", title: "Classic Kicks", image: cardBare, blurb: "Heels & icons, reimagined." },
  { handle: "casual-kicks-women", slot: "kicks-women-casual", title: "Casual Kicks", image: cardWomen, blurb: "Daily essentials, refined." },
];


function WomensKicks() {
  return (
    <SiteShell>
      <PageHeader
        eyebrow="Women"
        title="Women's Footwear"
        crumbs={[
          { label: "Home", to: "/" },
          { label: "Frass Kicks", to: "/frass-kicks" },
          { label: "Women" },
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
              eyebrow="Women"
              title={c.title}
              description={c.blurb}
            />
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
