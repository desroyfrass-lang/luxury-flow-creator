import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { PageHeader } from "@/components/page-header";
import { StorePortalCard } from "@/components/store-portal-card";
import { ProductGrid } from "@/components/product-grid";
import {
  SHAPE_GOALS,
  SHAPE_EDUCATION,
  shapeCategories,
  getShapeTheme,
  type ShapeGender,
} from "@/lib/shape-catalog";
import { Sparkles } from "lucide-react";
import womenHero from "@/assets/shape-women-hero.jpg";
import menHero from "@/assets/shape-men-hero.jpg";
import doorImg from "@/assets/shape-door.jpg";
import womenRoom from "@/assets/shape-room-women.jpg";
import menRoom from "@/assets/shape-room-men.jpg";

export const Route = createFileRoute("/frass-shape/$gender/")({
  head: ({ params }) => {
    const label = params.gender === "men" ? "Men" : "Women";
    return {
      meta: [
        { title: `Frass Shape for ${label} — Shape, Compression & Support` },
        {
          name: "description",
          content: `Frass Shape for ${label.toLowerCase()}: shop by goal, browse the sculpting showrooms and get honest fit guidance before you buy.`,
        },
        { property: "og:title", content: `Frass Shape for ${label}` },
        {
          property: "og:description",
          content: "Shop by goal, not by insecurity — the Frass Shape wellness boutique.",
        },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ShapeWing,
});

function ShapeWing() {
  const gender = Route.useParams().gender as ShapeGender;
  const label = gender === "men" ? "Men" : "Women";
  const hero = gender === "men" ? menHero : womenHero;
  const room = gender === "men" ? menRoom : womenRoom;
  const theme = getShapeTheme(gender);
  const categories = shapeCategories(gender);
  const goals = SHAPE_GOALS[gender];

  return (
    <SiteShell>
      <section className="relative overflow-hidden">
        <div className="relative h-[58vh] min-h-[400px] w-full">
          <img
            src={hero}
            alt={`Frass Shape for ${label} campaign`}
            className="hero-drift absolute inset-0 h-full w-full object-cover"
            width={1408}
            height={1008}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,oklch(0.10_0.01_80/0.20)_50%,oklch(0.10_0.01_80/0.88)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1600px] px-6 pb-10 lg:px-12">
            <span
              className="text-[11px] uppercase tracking-[0.34em]"
              style={{ color: theme.accent }}
            >
              {theme.room}
            </span>
            <h1 className="mt-3 font-display text-5xl leading-[0.95] md:text-7xl">
              Frass Shape — {label}
            </h1>
            <p className="mt-3 max-w-xl text-sm text-foreground/80">{theme.mood}</p>
          </div>
        </div>
      </section>

      <PageHeader
        eyebrow="Start here"
        title="Shop by goal"
        description="Tell us the outcome you want. We'll show the support level that gets you there."
        crumbs={[
          { label: "Frass District", to: "/frass-district" },
          { label: "Frass Shape", to: "/frass-shape" },
          { label: `Frass Shape — ${label}` },
        ]}
      />

      <section className="mx-auto max-w-[1600px] px-6 pb-20 lg:px-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => (
            <Link
              key={goal.slug}
              to="/frass-shape/$gender/goals/$goal"
              params={{ gender, goal: goal.slug }}
              className="group relative overflow-hidden rounded-3xl border border-border bg-card/60 p-7 backdrop-blur transition hover:border-[color:var(--gold)]/60"
            >
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-[2px] opacity-70"
                style={{ background: theme.accent }}
              />
              <h3 className="font-display text-2xl group-hover:text-[color:var(--gold-soft,#f0d78c)]">
                {goal.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">{goal.blurb}</p>
              <span className="mt-5 inline-block text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
                See the pieces
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Collection storefronts */}
      <section className="mx-auto max-w-[1600px] px-6 pb-24 lg:px-12">
        <div className="mb-10">
          <span className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            The floor
          </span>
          <h2 className="mt-2 font-display text-4xl md:text-5xl">Collections</h2>
        </div>
        <div className="grid gap-x-8 gap-y-16 sm:grid-cols-2 xl:grid-cols-3">
          {Object.entries(categories).map(([slug, cat], i) => (
            <StorePortalCard
              key={slug}
              to="/frass-shape/$gender/$category"
              params={{ gender, category: slug }}
              image={i % 2 === 0 ? doorImg : room}
              title={cat.title.replace(/^(Men's|Women's)\s/, "")}
              description={cat.tagline}
              eyebrow={`Room ${String(i + 1).padStart(2, "0")}`}
            />
          ))}
        </div>
      </section>

      {/* Frassy fit assistant */}
      <section className="mx-auto max-w-[1600px] px-6 pb-24 lg:px-12">
        <div className="rounded-[28px] border border-[color:var(--gold)]/40 bg-card/60 p-8 backdrop-blur md:p-12">
          <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
            <Sparkles className="h-4 w-4" /> Frassy · Fit Assistant
          </div>
          <h2 className="mt-4 font-display text-3xl md:text-5xl">
            Not sure which level of support you need?
          </h2>
          <p className="mt-4 max-w-2xl text-sm text-muted-foreground md:text-base">
            Ask Frassy in the corner of any page. Tell her the occasion, the outfit and how long
            you'll be wearing it — she'll suggest a compression level and a size, and she'll tell
            you honestly when you don't need shapewear at all.
          </p>
        </div>
      </section>

      {/* Bestsellers */}
      <section className="mx-auto max-w-[1600px] px-6 pb-24 lg:px-12">
        <div className="mb-8">
          <span className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            Most reached for
          </span>
          <h2 className="mt-2 font-display text-4xl md:text-5xl">Frass Shape favourites</h2>
        </div>
        <ProductGrid
          query={`tag:shape AND tag:${gender}`}
          first={12}
          emptyTitle="This floor is being stocked"
          emptyHint="Frass Shape pieces are being curated right now. Check the collections above or ask Frassy what's landing next."
        />
      </section>

      {/* Education */}
      <section className="mx-auto max-w-[1600px] px-6 pb-28 lg:px-12">
        <h2 className="mb-8 font-display text-4xl md:text-5xl">Before you buy</h2>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {SHAPE_EDUCATION.map((item) => (
            <article key={item.title} className="rounded-3xl border border-border bg-card/60 p-7">
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
