import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { PageHeader } from "@/components/page-header";
import { TwoSideStore } from "@/components/two-side-store";
import lingerieRoom from "@/assets/bare-women-lingerie-room.jpg";
import swimRoom from "@/assets/bare-women-swim-room.jpg";

const SIDES = [
  {
    to: "/bare-drip/women/$category",
    params: { category: "lingerie" },
    image: lingerieRoom,
    eyebrow: "Left of the floor",
    title: "The Lingerie Room",
    description: "Bras, panties, sets, bodysuits and shapewear under blush light.",
    accent: "oklch(0.78 0.16 350)",
  },
  {
    to: "/bare-drip/women/$category",
    params: { category: "swimwear" },
    image: swimRoom,
    eyebrow: "Right of the floor",
    title: "The Swim Room",
    description: "Bikinis, one-pieces, cover-ups and swim skirts in resort light.",
    accent: "oklch(0.86 0.14 195)",
  },
] as const;

export const Route = createFileRoute("/bare-drip/women/")({
  head: () => ({
    meta: [
      { title: "Women's Bare Drip — Two Rooms, One Floor" },
      {
        name: "description",
        content: "Women's Bare Drip: the Lingerie Room and the Swim Room, each lit its own way.",
      },
      { property: "og:title", content: "Women's Bare Drip — Two Rooms, One Floor" },
      {
        property: "og:description",
        content: "Step into the Lingerie Room or the Swim Room at Bare Drip for Women.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <SiteShell>
      <PageHeader
        eyebrow="Women"
        title="Women's Bare Drip"
        description="Made for Movement. Built for Confidence."
        crumbs={[
          { label: "Home", to: "/" },
          { label: "Frass District", to: "/frass-district" },
          { label: "Bare Drip", to: "/bare-drip/women" },
          { label: "Bare Drip for Women" },
        ]}
      />
      <section className="mx-auto max-w-[1600px] px-6 pb-24 lg:px-12">
        <p className="mb-8 max-w-xl text-sm text-muted-foreground">
          One floor, two rooms. Blush silk on the left, resort light on the right.
        </p>
        <TwoSideStore sides={SIDES} />
      </section>
    </SiteShell>
  ),
});
