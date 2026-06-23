import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { CollectionCard } from "@/components/collection-card";
import { PageHeader } from "@/components/page-header";
import cardKicks from "@/assets/card-kicks.jpg";
import cardMen from "@/assets/card-men.jpg";
import cardWomen from "@/assets/card-women.jpg";

export const Route = createFileRoute("/frass-kicks/crown-kicks/")({
  head: () => ({
    meta: [
      { title: "Crown Kicks — Frass Kicks" },
      { name: "description", content: "Crown Kicks collections for men and women." },
      { property: "og:image", content: cardKicks },
    ],
  }),
  component: () => (
    <SiteShell>
      <PageHeader
        eyebrow="Frass Kicks"
        title="Crown Kicks"
        description="Crown, street, classic and casual kicks."
        crumbs={[
          { label: "Home", to: "/" },
          { label: "Frass Kicks", to: "/frass-kicks" },
          { label: "Crown Kicks" },
        ]}
      />
      <section className="mx-auto max-w-[1600px] px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
          <CollectionCard to="/frass-kicks/crown-kicks/men" image={cardMen} eyebrow="Crown Kicks" title="Crown Kicks — Men" description="Street · Classic · Casual · Sale" />
          <CollectionCard to="/frass-kicks/crown-kicks/women" image={cardWomen} eyebrow="Crown Kicks" title="Crown Kicks — Women" description="Street · Classic · Casual · Sale" />
        </div>
      </section>
    </SiteShell>
  ),
});