import { createFileRoute, notFound } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { PageHeader } from "@/components/page-header";
import { ProductGrid } from "@/components/product-grid";
import { findGoal, type ShapeGender } from "@/lib/shape-catalog";

export const Route = createFileRoute("/frass-shape/$gender/goals/$goal")({
  beforeLoad: ({ params }) => {
    const gender = params.gender as ShapeGender;
    if (gender !== "men" && gender !== "women") throw notFound();
    if (!findGoal(gender, params.goal)) throw notFound();
  },
  head: ({ params }) => {
    const goal = findGoal(params.gender as ShapeGender, params.goal);
    return {
      meta: [
        { title: `${goal?.title ?? "Shop by goal"} — Frass Shape` },
        { name: "description", content: goal?.blurb ?? "Frass Shape — shop by goal." },
        { property: "og:title", content: `${goal?.title ?? "Shop by goal"} — Frass Shape` },
        { property: "og:description", content: goal?.blurb ?? "Frass Shape — shop by goal." },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: () => (
    <SiteShell>
      <PageHeader
        eyebrow="Frass Shape"
        title="Goal not found"
        crumbs={[{ label: "Frass Shape", to: "/frass-shape" }]}
      />
    </SiteShell>
  ),
  component: GoalPage,
});

function GoalPage() {
  const { gender: g, goal: slug } = Route.useParams();
  const gender = g as ShapeGender;
  const goal = findGoal(gender, slug)!;

  return (
    <SiteShell>
      <PageHeader
        eyebrow="Shop by goal"
        title={goal.title}
        description={goal.blurb}
        crumbs={[
          { label: "Frass District", to: "/frass-district" },
          { label: "Frass Shape", to: "/frass-shape" },
          { label: gender === "men" ? "Men" : "Women", to: "/frass-shape/$gender" },
          { label: goal.title },
        ]}
      />
      <section className="mx-auto max-w-[1600px] px-6 pb-28 lg:px-12">
        <ProductGrid
          query={`${goal.query} AND tag:${gender}`}
          first={24}
          emptyTitle="Being curated"
          emptyHint="Frassy is still sourcing pieces for this goal. Try another goal, or ask her what's landing next."
        />
      </section>
    </SiteShell>
  );
}
