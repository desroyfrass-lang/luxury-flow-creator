import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { PageHeader } from "@/components/page-header";
import { TwoSideStore } from "@/components/two-side-store";
import { SHAPE_EDUCATION } from "@/lib/shape-catalog";
import { ArrowUpRight } from "lucide-react";
import storefront from "@/assets/shape-storefront.jpg";
import womenRoom from "@/assets/shape-room-women.jpg";
import menRoom from "@/assets/shape-room-men.jpg";

const SIDES = [
  {
    to: "/frass-shape/$gender",
    params: { gender: "women" },
    image: womenRoom,
    eyebrow: "West wing",
    title: "Frass Shape — Women",
    description: "Sculpt essentials, everyday smoothing, bridal, postpartum and active support.",
    accent: "oklch(0.88 0.07 70)",
  },
  {
    to: "/frass-shape/$gender",
    params: { gender: "men" },
    image: menRoom,
    eyebrow: "East wing",
    title: "Frass Shape — Men",
    description: "Core compression, posture support, suit layers and recovery.",
    accent: "oklch(0.86 0.06 200)",
  },
] as const;

export const Route = createFileRoute("/frass-shape/")({
  head: () => ({
    meta: [
      { title: "Frass Shape — The Wellness & Sculpting Flagship" },
      {
        name: "description",
        content:
          "Frass Shape: a wellness boutique for shapewear, compression and support — women's and men's wings, shop by goal, and honest fit guidance.",
      },
      { property: "og:title", content: "Frass Shape — The Wellness & Sculpting Flagship" },
      {
        property: "og:description",
        content: "Shapewear, compression and support the Frass way — comfort first, confidence always.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ShapeStorefront,
});

function ShapeStorefront() {
  return (
    <SiteShell>
      {/* Cinematic storefront */}
      <section className="relative overflow-hidden">
        <div className="relative h-[62vh] min-h-[440px] w-full">
          <img
            src={storefront}
            alt="The Frass Shape wellness boutique storefront at dusk"
            className="hero-drift absolute inset-0 h-full w-full object-cover"
            width={1600}
            height={1008}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,oklch(0.10_0.01_80/0.35)_0%,oklch(0.10_0.01_80/0.15)_45%,oklch(0.10_0.01_80/0.88)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1600px] px-6 pb-12 lg:px-12">
            <span className="text-[11px] uppercase tracking-[0.34em] text-[color:var(--gold)]">
              Frass District · Department 12
            </span>
            <h1 className="mt-3 font-display text-5xl leading-[0.95] md:text-7xl">
              Frass Shape<span className="align-super text-2xl md:text-3xl">™</span>
            </h1>
            <p className="mt-4 max-w-xl text-sm text-foreground/80 md:text-base">
              A wellness boutique, not an underwear aisle. Shape, compression and support —
              chosen by how you want to feel, not by what you want to hide.
            </p>
          </div>
        </div>
      </section>

      <PageHeader
        eyebrow="Two wings, one philosophy"
        title="Choose your wing"
        description="Support is personal. Every wing carries its own fit language, its own rooms and its own goals."
        crumbs={[
          { label: "Home", to: "/" },
          { label: "Frass District", to: "/frass-district" },
          { label: "Frass Shape" },
        ]}
      />

      <section className="mx-auto max-w-[1600px] px-6 pb-20 lg:px-12">
        <TwoSideStore sides={SIDES} />
      </section>

      {/* Education centre */}
      <section className="mx-auto max-w-[1600px] px-6 pb-28 lg:px-12">
        <div className="mb-8 flex items-end justify-between gap-6">
          <div>
            <span className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
              The Fit Room
            </span>
            <h2 className="mt-2 font-display text-4xl md:text-5xl">Understand it, then wear it</h2>
          </div>
          <Link
            to="/frass-district"
            className="hidden items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground md:inline-flex"
          >
            Back to the district <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {SHAPE_EDUCATION.map((item) => (
            <article
              key={item.title}
              className="rounded-3xl border border-border bg-card/60 p-7 backdrop-blur"
            >
              <h3 className="font-display text-2xl">{item.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{item.body}</p>
              <p className="mt-4 border-t border-border pt-4 text-sm text-foreground/80">
                {item.plain}
              </p>
            </article>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
