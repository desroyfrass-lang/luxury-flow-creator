import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { CollectionCard } from "@/components/collection-card";
import { PageHeader } from "@/components/page-header";
import cardMen from "@/assets/card-men.jpg";
import cardWomen from "@/assets/card-women.jpg";
import cardDrip from "@/assets/card-drip.jpg";

export const Route = createFileRoute("/frass-drip")({
  head: () => ({
    meta: [
      { title: "Frass Drip — Fashion" },
      { name: "description", content: "Fashion-forward apparel for the everyday icon." },
      { property: "og:image", content: cardDrip },
    ],
  }),
  component: FrassDrip,
});

function FrassDrip() {
  return (
    <SiteShell>
      <PageHeader
        eyebrow="Division 02"
        title="Frass Drip"
        description="Fashion-forward apparel — casual, street, vacation, work and beyond."
        crumbs={[{ label: "Home", to: "/" }, { label: "Frass Drip" }]}
      />
      <section className="mx-auto max-w-[1600px] px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
          <CollectionCard to="/frass-drip/men" image={cardMen} eyebrow="Frass Drip" title="Men's Fashion" description="Casual · Street · Vacay · Work" ratio="wide" />
          <CollectionCard to="/frass-drip/women" image={cardWomen} eyebrow="Frass Drip" title="Women's Fashion" description="Resort · Vacation · Tops · Denim" ratio="wide" />
        </div>
      </section>
    </SiteShell>
  );
}
