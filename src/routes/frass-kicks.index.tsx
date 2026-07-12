import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { CollectionCard } from "@/components/collection-card";
import { PageHeader } from "@/components/page-header";
import { ProductGrid } from "@/components/product-grid";
import cardMen from "@/assets/card-men.jpg";
import cardWomen from "@/assets/card-women.jpg";
import cardKicks from "@/assets/card-kicks.jpg";

export const Route = createFileRoute("/frass-kicks/")({
  head: () => ({
    meta: [
      { title: "Frass Kicks — Luxury Footwear" },
      { name: "description", content: "Casual, street and classic premium footwear by Frass Kicks." },
      { property: "og:title", content: "Frass Kicks — Luxury Footwear" },
      { property: "og:image", content: cardKicks },
    ],
  }),
  component: FrassKicks,
});

function FrassKicks() {
  return (
    <SiteShell>
      <PageHeader
        eyebrow="Division 01"
        title="Frass Kicks"
        description="Premium footwear engineered for movement, designed for confidence."
        crumbs={[{ label: "Home", to: "/" }, { label: "Frass Kicks" }]}
      />
      <section className="mx-auto max-w-[1600px] px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
          <CollectionCard
            to="/frass-kicks/men"
            image={cardMen}
            eyebrow="Frass Kicks"
            title="Men's Footwear"
            description="Street · Classic · Casual"
          />
          <CollectionCard
            to="/frass-kicks/women"
            image={cardWomen}
            eyebrow="Frass Kicks"
            title="Women's Footwear"
            description="Street · Classic · Casual"
          />
        </div>
      </section>
      <section className="mx-auto max-w-[1600px] px-6 lg:px-12 mt-24">
        <div className="mb-10 flex items-end justify-between gap-6">
          <h2 className="font-display text-4xl md:text-5xl">The full catalog</h2>
          <span className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Live catalog</span>
        </div>
        <ProductGrid query='vendor:"FRASS KICKS"' first={24} />
      </section>
    </SiteShell>
  );
}
