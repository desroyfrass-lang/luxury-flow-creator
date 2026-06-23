import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { CollectionCard } from "@/components/collection-card";
import { PageHeader } from "@/components/page-header";
import cardMen from "@/assets/card-men.jpg";
import cardBare from "@/assets/card-bare.jpg";
import cardKicks from "@/assets/card-kicks.jpg";

const PARENTS = [
  ["swimwear", "Bare Drip Swimwear", "Swim shorts, trunks, beach shorts and performance swimwear."],
  ["underwear", "Bare Drip Underwear", "Boxers, briefs, tanks, undershirts and sleepwear."],
] as const;

const IMAGES = [cardMen, cardKicks, cardBare];

export const Route = createFileRoute("/bare-drip/men/")({
  head: () => ({
    meta: [
      { title: "Men's Bare Drip" },
      { name: "description", content: "Men's swimwear and underwear collections." },
      { property: "og:image", content: cardMen },
    ],
  }),
  component: () => (
    <SiteShell>
      <PageHeader
        eyebrow="Men"
        title="Men's Bare Drip"
        description="Made for Movement. Built for Confidence."
        crumbs={[
          { label: "Home", to: "/" },
          { label: "Bare Drip", to: "/bare-drip" },
          { label: "Men" },
        ]}
      />
      <section className="mx-auto max-w-[1600px] px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
          {PARENTS.map(([category, title, description], i) => (
            <CollectionCard
              key={category}
              to="/bare-drip/men/$category"
              params={{ category }}
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