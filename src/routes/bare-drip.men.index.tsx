import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { PageHeader } from "@/components/page-header";
import { TwoSideStore } from "@/components/two-side-store";
import underwearRoom from "@/assets/bare-men-underwear-room.jpg";
import swimRoom from "@/assets/bare-men-swim-room.jpg";

const SIDES = [
  {
    to: "/bare-drip/men/$category",
    params: { category: "underwear" },
    image: underwearRoom,
    eyebrow: "Left of the floor",
    title: "The Underwear Room",
    description: "Boxers, briefs, tanks, undershirts and sleepwear under warm amber light.",
    accent: "oklch(0.82 0.12 60)",
  },
  {
    to: "/bare-drip/men/$category",
    params: { category: "swimwear" },
    image: swimRoom,
    eyebrow: "Right of the floor",
    title: "The Swim Room",
    description: "Swim shorts, trunks, beach shorts and performance swimwear.",
    accent: "oklch(0.85 0.15 200)",
  },
] as const;

export const Route = createFileRoute("/bare-drip/men/")({
  head: () => ({
    meta: [
      { title: "Men's Bare Drip — Two Rooms, One Floor" },
      {
        name: "description",
        content: "Men's Bare Drip: the Underwear Room and the Swim Room, each lit its own way.",
      },
      { property: "og:title", content: "Men's Bare Drip — Two Rooms, One Floor" },
      {
        property: "og:description",
        content: "Step into the Underwear Room or the Swim Room at Bare Drip for Men.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <SiteShell>
      <PageHeader
        eyebrow="Men"
        title="Men's Bare Drip"
        description="Made for Movement. Built for Confidence."
        crumbs={[
          { label: "Home", to: "/" },
          { label: "Frass District", to: "/frass-district" },
          { label: "Bare Drip", to: "/bare-drip/men" },
          { label: "Bare Drip for Men" },
        ]}
      />
      <section className="mx-auto max-w-[1600px] px-6 pb-24 lg:px-12">
        <p className="mb-8 max-w-xl text-sm text-muted-foreground">
          One floor, two rooms. Amber shelving on the left, coastal light on the right.
        </p>
        <TwoSideStore sides={SIDES} />
      </section>
    </SiteShell>
  ),
});
