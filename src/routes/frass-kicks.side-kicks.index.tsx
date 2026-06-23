import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { CollectionCard } from "@/components/collection-card";
import { PageHeader } from "@/components/page-header";
import cardKicks from "@/assets/card-kicks.jpg";
import cardMen from "@/assets/card-men.jpg";
import cardWomen from "@/assets/card-women.jpg";

export const Route = createFileRoute("/frass-kicks/side-kicks/")({
  head: () => ({
    meta: [
      { title: "Side Kicks — Frass Kicks" },
      { name: "description", content: "Side Kicks collections for men and women." },
      { property: "og:image", content: cardKicks },
    ],
  }),
  component: () => (
    <SiteShell>
      <PageHeader
        eyebrow="Frass Kicks"
        title="Side Kicks"
        description="Side, street, classic and casual kicks."
        crumbs={[
          { label: "Home", to: "/" },
          { label: "Frass Kicks", to: "/frass-kicks" },
          { label: "Side Kicks" },
        ]}
      />
      <section className="mx-auto max-w-[1600px] px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
          <CollectionCard to="/frass-kicks/side-kicks/men" image={cardMen} eyebrow="Side Kicks" title="Side Kicks — Men" description="Street · Classic · Casual · Sale" />
          <CollectionCard to="/frass-kicks/side-kicks/women" image={cardWomen} eyebrow="Side Kicks" title="Side Kicks — Women" description="Street · Classic · Casual · Sale" />
        </div>
      </section>
    </SiteShell>
  ),
});