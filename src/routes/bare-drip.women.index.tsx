import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { CollectionCard } from "@/components/collection-card";
import { PageHeader } from "@/components/page-header";
import cardWomen from "@/assets/card-women.jpg";
import cardBare from "@/assets/card-bare.jpg";
import cardDrip from "@/assets/card-drip.jpg";

const PARENTS = [
  ["swimwear", "Bare Drip Swimwear", "Bikinis, one-pieces, cover-ups and swim skirts."],
  ["lingerie", "Bare Drip Lingerie", "Bras, panties, sets, bodysuits and shapewear."],
] as const;

const IMAGES = [cardWomen, cardBare, cardDrip];

export const Route = createFileRoute("/bare-drip/women/")({
  head: () => ({
    meta: [
      { title: "Women's Bare Drip" },
      { name: "description", content: "Women's swimwear and lingerie collections." },
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
          {PARENTS.map(([category, title, description], i) => (
            <CollectionCard
              key={category}
              to="/bare-drip/women/$category"
              params={{ category }}
              image={IMAGES[i % IMAGES.length]}
              eyebrow="Women"
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