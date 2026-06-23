import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { CollectionCard } from "@/components/collection-card";
import { PageHeader } from "@/components/page-header";
import cardBare from "@/assets/card-bare.jpg";
import cardMen from "@/assets/card-men.jpg";
import cardWomen from "@/assets/card-women.jpg";

export const Route = createFileRoute("/bare-drip")({
  head: () => ({
    meta: [
      { title: "Bare Drip — Swim & Intimates" },
      { name: "description", content: "Swim, intimates and lifestyle essentials." },
      { property: "og:image", content: cardBare },
    ],
  }),
  component: () => (
    <SiteShell>
      <PageHeader
        eyebrow="Division 03"
        title="Bare Drip"
        description="Made for movement. Built for confidence."
        crumbs={[{ label: "Home", to: "/" }, { label: "Bare Drip" }]}
      />
      <section className="mx-auto max-w-[1600px] px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
          <CollectionCard to="/bare-drip/men" image={cardMen} eyebrow="Bare Drip" title="Men's Bare Drip" description="Swim · Underwear · Essentials" ratio="wide" />
          <CollectionCard to="/bare-drip/women" image={cardWomen} eyebrow="Bare Drip" title="Women's Bare Drip" description="Swim · Lingerie · Sleepwear" ratio="wide" />
        </div>
      </section>
    </SiteShell>
  ),
});
