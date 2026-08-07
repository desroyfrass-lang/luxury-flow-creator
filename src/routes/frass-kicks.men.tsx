import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { PageHeader } from "@/components/page-header";
import { PageFeedback } from "@/components/page-feedback";
import { ShoeWall, type WallSection } from "@/components/shoe-wall";
import heroWall from "@/assets/hero-shoe-wall-men.jpg";

export const Route = createFileRoute("/frass-kicks/men")({
  head: () => ({
    meta: [
      { title: "Frass Kicks Showroom for Men" },
      { name: "description", content: "Step into the Frass Kicks Showroom for Men: casual, classic and street kicks, lit shelf to shelf." },
      { property: "og:title", content: "Frass Kicks Showroom for Men" },
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
        title="Frass Kicks Showroom for Men"
        description="Three lit bays, floor to ceiling. Casual, Classic, Street — every pair on the wall is live."
        crumbs={[
          { label: "Home", to: "/" },
          { label: "Frass District", to: "/kicks-district" },
          { label: "Frass Kicks for Men" },
        ]}
      />
      <section className="relative mx-auto max-w-[1600px] px-2 md:px-12">
        <div className="relative overflow-hidden rounded-2xl md:rounded-[2rem]">
          <img
            src={heroWall}
            alt="Illuminated wall of men's shoes on lit shelves"
            width={1920}
            height={1024}
            className="h-[40vh] w-full object-cover md:h-[58vh]"
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_65%,color-mix(in_oklab,var(--background)_88%,transparent))]" />
        </div>
      </section>
      <ShoeWall sections={SECTIONS} gender="men" />
      <PageFeedback pageTitle="Frass Kicks Showroom for Men" />
    </SiteShell>
  );
}
