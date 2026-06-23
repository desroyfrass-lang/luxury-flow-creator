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
      { name: "description", content: "Casual, street and classic women's kicks." },
      { property: "og:image", content: cardWomen },
    ],
  }),
  component: WomensKicks,
});

const CARDS = [
  { handle: "frass-kicks-women-casual", title: "Casual", image: cardWomen, blurb: "Daily essentials, refined." },
  { handle: "frass-kicks-women-street", title: "Street", image: cardKicks, blurb: "Statement steppers." },
  { handle: "frass-kicks-women-classic", title: "Classic", image: cardBare, blurb: "Heels & icons, reimagined." },
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
