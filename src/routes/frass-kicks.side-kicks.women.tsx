import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { CollectionCard } from "@/components/collection-card";
import { PageHeader } from "@/components/page-header";
import cardKicks from "@/assets/card-kicks.jpg";
import cardWomen from "@/assets/card-women.jpg";
import cardBare from "@/assets/card-bare.jpg";

const CARDS = [
  ["side-kicks", "Side Kicks"],
  ["street-side-kicks", "Street Side Kicks"],
  ["classic-side-kicks", "Classic Side Kicks"],
  ["casual-side-kicks", "Casual Side Kicks"],
  ["side-kicks-on-sale", "Side Kicks On Sale"],
] as const;

const IMAGES = [cardWomen, cardKicks, cardBare];

export const Route = createFileRoute("/frass-kicks/side-kicks/women")({
  head: () => ({
    meta: [
      { title: "Side Kicks — Women" },
      { name: "description", content: "Women's Side Kicks collections." },
      { property: "og:image", content: cardWomen },
    ],
  }),
  component: () => (
    <SiteShell>
      <PageHeader
        eyebrow="Women"
        title="Side Kicks — Women"
        crumbs={[
          { label: "Home", to: "/" },
          { label: "Frass Kicks", to: "/frass-kicks" },
          { label: "Side Kicks", to: "/frass-kicks/side-kicks" },
          { label: "Women" },
        ]}
      />
      <section className="mx-auto max-w-[1600px] px-6 lg:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {CARDS.map(([slug, title], i) => (
            <CollectionCard key={slug} to="/collection/$handle" params={{ handle: `side-kicks-women-${slug}` }} image={IMAGES[i % IMAGES.length]} eyebrow="Women" title={title} size="md" />
          ))}
        </div>
      </section>
    </SiteShell>
  ),
});