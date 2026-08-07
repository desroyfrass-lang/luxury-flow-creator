import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { PageHeader } from "@/components/page-header";
import { PageFeedback } from "@/components/page-feedback";
import { ShoeWall, type WallSection } from "@/components/shoe-wall";
import heroWall from "@/assets/hero-shoe-wall-women.jpg";

export const Route = createFileRoute("/frass-kicks/women")({
  head: () => ({
    meta: [
      { title: "Frass Kicks Show Room for Women" },
      { name: "description", content: "Step into the Frass Kicks Show Room for Women: casual, classic and street footwear, lit shelf to shelf." },
      { property: "og:title", content: "Frass Kicks Show Room for Women" },
      { property: "og:description", content: "Casual, classic and street women's footwear on the illuminated Frass Kicks wall." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WomensKicksRoom,
});

const SECTIONS: WallSection[] = [
  {
    id: "casual",
    label: "Casual",
    caption: "Daily essentials, refined",
    handle: "casual-kicks-women",
    query: 'vendor:"FRASS KICKS" tag:"Women\'s" product_type:"Casual Kicks"',
  },
  {
    id: "classic",
    label: "Classic",
    caption: "Heels & icons",
    handle: "classic-kicks-women",
    query: 'vendor:"FRASS KICKS" tag:"Women\'s" product_type:"Classic Kicks"',
  },
  {
    id: "street",
    label: "Street",
    caption: "Statement steppers",
    handle: "street-kicks-women",
    query: 'vendor:"FRASS KICKS" tag:"Women\'s" product_type:"Street Kicks"',
  },
];

function WomensKicksRoom() {
  return (
    <SiteShell>
      <PageHeader
        eyebrow="Women"
        title="Frass Kicks Show Room for Women"
        description="Three lit bays, floor to ceiling. Casual, Classic, Street — every pair on the wall is live."
        crumbs={[
          { label: "Home", to: "/" },
          { label: "Frass District", to: "/kicks-district" },
          { label: "Frass Kicks", to: "/frass-kicks" },
          { label: "Frass Kicks for Women" },
        ]}
      />
      <section className="relative mx-auto max-w-[1600px] px-2 md:px-12">
        <div className="relative overflow-hidden rounded-2xl md:rounded-[2rem]">
          <img
            src={heroWall}
            alt="Illuminated wall of women's shoes on lit shelves"
            width={1920}
            height={1024}
            className="h-[40vh] w-full object-cover md:h-[58vh]"
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_65%,color-mix(in_oklab,var(--background)_88%,transparent))]" />
        </div>
      </section>
      <ShoeWall sections={SECTIONS} gender="women" />
      <PageFeedback pageTitle="Frass Kicks Show Room for Women" />
    </SiteShell>
  );
}
