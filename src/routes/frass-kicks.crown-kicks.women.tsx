import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { CollectionCard } from "@/components/collection-card";
import { PageHeader } from "@/components/page-header";
import cardKicks from "@/assets/card-kicks.jpg";
import cardWomen from "@/assets/card-women.jpg";
import cardBare from "@/assets/card-bare.jpg";

const CARDS = [
  ["crown-kicks", "Crown Kicks"],
  ["street-crown-kicks", "Street Crown Kicks"],
  ["classic-crown-kicks", "Classic Crown Kicks"],
  ["casual-crown-kicks", "Casual Crown Kicks"],
  ["crown-kicks-on-sale", "Crown Kicks On Sale"],
] as const;

const IMAGES = [cardWomen, cardKicks, cardBare];

export const Route = createFileRoute("/frass-kicks/crown-kicks/women")({
  head: () => ({
    meta: [
      { title: "Crown Kicks — Women" },
      { name: "description", content: "Women's Crown Kicks collections." },
      { property: "og:image", content: cardWomen },
    ],
  }),
  component: () => (
    <SiteShell>
      <PageHeader
        eyebrow="Women"
        title="Crown Kicks — Women"
        crumbs={[
          { label: "Home", to: "/" },
          { label: "Frass Kicks", to: "/frass-kicks" },
          { label: "Crown Kicks", to: "/frass-kicks/crown-kicks" },
          { label: "Women" },
        ]}
      />
      <section className="mx-auto max-w-[1600px] px-6 lg:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {CARDS.map(([slug, title], i) => (
            <CollectionCard key={slug} to="/collection/$handle" params={{ handle: `crown-kicks-women-${slug}` }} image={IMAGES[i % IMAGES.length]} eyebrow="Women" title={title} size="md" />
          ))}
        </div>
      </section>
    </SiteShell>
  ),
});