import { createFileRoute, notFound } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { PageHeader } from "@/components/page-header";
import { TwoSideStore } from "@/components/two-side-store";
import { isPlusGender, type PlusGender } from "@/lib/frass-plus";
import menUnderwear from "@/assets/bare-plus-men-underwear-room.jpg";
import menSwim from "@/assets/bare-plus-men-swim-room.jpg";
import womenLingerie from "@/assets/bare-plus-women-lingerie-room.jpg";
import womenSwim from "@/assets/bare-plus-women-swim-room.jpg";

const SIDES: Record<PlusGender, readonly {
  to: string;
  params: Record<string, string>;
  image: string;
  eyebrow: string;
  title: string;
  description: string;
  accent: string;
}[]> = {
  men: [
    {
      to: "/frass-plus/$gender/$category",
      params: { gender: "men", category: "bare-underwear" },
      image: menUnderwear,
      eyebrow: "Left of the floor",
      title: "The Underwear Room",
      description:
        "Boxers, briefs, tanks, undershirts and sleepwear — the same room, cut with room to move.",
      accent: "oklch(0.86 0.10 80)",
    },
    {
      to: "/frass-plus/$gender/$category",
      params: { gender: "men", category: "bare-swimwear" },
      image: menSwim,
      eyebrow: "Right of the floor",
      title: "The Swim Room",
      description: "Swim shorts, trunks and beach shorts under open Caribbean light.",
      accent: "oklch(0.87 0.13 200)",
    },
  ],
  women: [
    {
      to: "/frass-plus/$gender/$category",
      params: { gender: "women", category: "bare-lingerie" },
      image: womenLingerie,
      eyebrow: "Left of the floor",
      title: "The Lingerie Salon",
      description:
        "Bras, sets, bodysuits, sleepwear and shapewear in a bright crystal salon.",
      accent: "oklch(0.90 0.06 20)",
    },
    {
      to: "/frass-plus/$gender/$category",
      params: { gender: "women", category: "bare-swimwear" },
      image: womenSwim,
      eyebrow: "Right of the floor",
      title: "The Swim Room",
      description: "Bikinis, one-pieces, cover-ups and swim skirts, all beachside light.",
      accent: "oklch(0.88 0.12 195)",
    },
  ],
};

export const Route = createFileRoute("/frass-plus/$gender/bare")({
  beforeLoad: ({ params }) => {
    if (!isPlusGender(params.gender)) throw notFound();
  },
  head: ({ params }) => {
    const label = params.gender === "women" ? "Women" : "Men";
    const title = `Bare Drip Plus+ for ${label} — Two Rooms, One Floor`;
    const description = `Bare Drip Plus+ for ${label}: the same two rooms as the main Bare Drip floor, in extended sizing.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: BarePlusFloor,
});

function BarePlusFloor() {
  const { gender } = Route.useParams();
  const g: PlusGender = gender === "women" ? "women" : "men";
  const label = g === "women" ? "Women" : "Men";

  return (
    <SiteShell>
      <PageHeader
        eyebrow={label}
        title={`Bare Drip Plus+ for ${label}`}
        description="Made for Movement. Built for Confidence."
        crumbs={[
          { label: "Frass District", to: "/" },
          { label: "Frass Plus", to: "/frass-plus" },
          { label: `Bare Drip Plus+ for ${label}` },
        ]}
      />
      <section className="mx-auto max-w-[1600px] px-6 pb-24 lg:px-12">
        <p className="mb-8 max-w-xl text-sm text-muted-foreground">
          One floor, two rooms — the exact same navigation as the main Bare Drip, lit brighter
          and beachier, in extended sizing.
        </p>
        <TwoSideStore sides={SIDES[g]} />
      </section>
    </SiteShell>
  );
}
