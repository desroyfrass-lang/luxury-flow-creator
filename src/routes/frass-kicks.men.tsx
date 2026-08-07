import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { PageHeader } from "@/components/page-header";
import { PageFeedback } from "@/components/page-feedback";
import { ShoeWall, type WallSection } from "@/components/shoe-wall";
import heroWall from "@/assets/hero-shoe-wall-men.jpg";

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
      <section className="relative mx-auto max-w-[1600px] px-2 md:px-12">
        <div className="relative overflow-hidden rounded-t-2xl md:rounded-t-[2rem]">
          <img
            src={heroWall}
            alt="Illuminated wall of men's shoes: casual, classic and street shelves"
            width={1920}
            height={1024}
            className="h-[26vh] w-full object-cover md:h-[38vh]"
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,color-mix(in_oklab,var(--background)_92%,transparent))]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 grid grid-cols-3">
            {["Casual", "Classic", "Street"].map((l) => (
              <div key={l} className="border-t border-[color:var(--gold)]/40 py-2 text-center text-[9px] uppercase tracking-[0.28em] text-foreground/85 md:text-[11px]">
                {l}
              </div>
            ))}
          </div>
        </div>
      </section>
      <ShoeWall sections={SECTIONS} gender="men" />
      <PageFeedback pageTitle="Men's Shoe Room" />
    </SiteShell>
  );
}
