import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { PageHeader } from "@/components/page-header";
import { PageFeedback } from "@/components/page-feedback";
import { ShoeWall, type WallSection } from "@/components/shoe-wall";
import storeMen from "@/assets/store-kicks-men.jpg";

export const Route = createFileRoute("/frass-kicks/men")({
  head: () => ({
    meta: [
      { title: "Men's Shoe Room — Frass Kicks" },
      { name: "description", content: "Step into the men's showroom wall: casual, classic and street kicks, lit shelf to shelf." },
      { property: "og:title", content: "Men's Shoe Room — Frass Kicks" },
      { property: "og:description", content: "Casual, classic and street men's footwear on the illuminated Frass Kicks wall." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MensKicksRoom,
});

const SECTIONS: WallSection[] = [
  {
    id: "casual",
    label: "Casual",
    caption: "Everyday, elevated",
    handle: "casual-kicks-men",
    query: 'vendor:"FRASS KICKS" tag:"Men\'s" product_type:"Casual Kicks"',
  },
  {
    id: "classic",
    label: "Classic",
    caption: "Timeless icons",
    handle: "classic-kicks-men",
    query: 'vendor:"FRASS KICKS" tag:"Men\'s" product_type:"Classic Kicks"',
  },
  {
    id: "street",
    label: "Street",
    caption: "Bold silhouettes",
    handle: "street-kicks-men",
    query: 'vendor:"FRASS KICKS" tag:"Men\'s" product_type:"Street Kicks"',
  },
];

function MensKicksRoom() {
  return (
    <SiteShell>
      <PageHeader
        eyebrow="Men"
        title="The Men's Shoe Room"
        description="Three lit bays, floor to ceiling. Casual, Classic, Street — every pair on the wall is live."
        crumbs={[
          { label: "Home", to: "/" },
          { label: "Frass Kicks", to: "/frass-kicks" },
          { label: "Men" },
        ]}
      />
      <section className="mx-auto max-w-[1600px] px-6 lg:px-12">
        <div className="relative overflow-hidden rounded-[2rem]">
          <img
            src={storeMen}
            alt="Frass Kicks for Men storefront archway"
            className="h-[38vh] w-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_35%,color-mix(in_oklab,var(--background)_95%,transparent))]" />
        </div>
      </section>
      <ShoeWall sections={SECTIONS} gender="men" />
      <PageFeedback pageTitle="Men's Shoe Room" />
    </SiteShell>
  );
}
