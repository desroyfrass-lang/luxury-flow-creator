import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { CollectionCard } from "@/components/collection-card";
import { PageHeader } from "@/components/page-header";
import cardMen from "@/assets/card-men.jpg";
import cardWomen from "@/assets/card-women.jpg";
import cardDrip from "@/assets/card-drip.jpg";

export const Route = createFileRoute("/sports-drip")({
  head: () => ({
    meta: [
      { title: "Sports Drip — Performance Apparel" },
      { name: "description", content: "Performance-driven activewear. Built for training, styled for confidence." },
      { property: "og:image", content: cardDrip },
    ],
  }),
  component: SportsDrip,
});

function SportsDrip() {
  return (
    <SiteShell>
      <PageHeader
        eyebrow="Division 04"
        title="Sports Drip"
        description="Built for Performance. Styled for Confidence."
        crumbs={[{ label: "Home", to: "/" }, { label: "Sports Drip" }]}
      />
      <section className="mx-auto max-w-[1600px] px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
          <CollectionCard to="/sports-drip/men" image={cardMen} eyebrow="Sports Drip" title="Men's Sports Drip" description="Training · Activewear · Running · Court · Gym" ratio="wide" />
          <CollectionCard to="/sports-drip/women" image={cardWomen} eyebrow="Sports Drip" title="Women's Sports Drip" description="Training · Activewear · Running · Studio · Shapewear" ratio="wide" />
        </div>
      </section>
    </SiteShell>
  );
}
