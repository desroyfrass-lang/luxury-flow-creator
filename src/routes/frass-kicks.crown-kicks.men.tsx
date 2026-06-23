import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { CollectionCard } from "@/components/collection-card";
import { PageHeader } from "@/components/page-header";
import cardKicks from "@/assets/card-kicks.jpg";
import cardMen from "@/assets/card-men.jpg";
import cardDrip from "@/assets/card-drip.jpg";

const CARDS = [
  ["crown-kicks", "Crown Kicks"],
  ["street-crown-kicks", "Street Crown Kicks"],
  ["classic-crown-kicks", "Classic Crown Kicks"],
  ["casual-crown-kicks", "Casual Crown Kicks"],
  ["crown-kicks-on-sale", "Crown Kicks On Sale"],
] as const;

const IMAGES = [cardKicks, cardDrip, cardMen];

export const Route = createFileRoute("/frass-kicks/crown-kicks/men")({
  head: () => ({
    meta: [
      { title: "Crown Kicks — Men" },
      { name: "description", content: "Men's Crown Kicks collections." },
      { property: "og:image", content: cardMen },
    ],
  }),
  component: () => (
    <SiteShell>
      <PageHeader
        eyebrow="Men"
        title="Crown Kicks — Men"
        crumbs={[
          { label: "Home", to: "/" },
          { label: "Frass Kicks", to: "/frass-kicks" },
          { label: "Crown Kicks", to: "/frass-kicks/crown-kicks" },
          { label: "Men" },
        ]}
      />
      <section className="mx-auto max-w-[1600px] px-6 lg:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {CARDS.map(([slug, title], i) => (
            <CollectionCard key={slug} to="/collection/$handle" params={{ handle: `crown-kicks-men-${slug}` }} image={IMAGES[i % IMAGES.length]} eyebrow="Men" title={title} size="md" />
          ))}
        </div>
      </section>
    </SiteShell>
  ),
});