import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { PageHeader } from "@/components/page-header";
import { ViralProductCard } from "@/components/viral-product-card";
import { getViralCategory } from "@/lib/social-virals";

export const Route = createFileRoute("/social-media-virals/$category")({
  beforeLoad: ({ params }) => {
    if (!getViralCategory(params.category)) throw notFound();
  },
  head: ({ params }) => {
    const cat = getViralCategory(params.category);
    return {
      meta: [
        { title: `${cat?.title ?? "Category"} — Social Media Virals | Frass` },
        { name: "description", content: cat?.tagline ?? "" },
      ],
    };
  },
  notFoundComponent: () => (
    <SiteShell>
      <PageHeader eyebrow="Social Media Virals" title="Category not found" crumbs={[{ label: "Home", to: "/" }]} />
    </SiteShell>
  ),
  component: CategoryPage,
});

function CategoryPage() {
  const { category } = Route.useParams();
  const cat = getViralCategory(category)!;

  return (
    <SiteShell>
      <PageHeader
        eyebrow={`${cat.emoji} TikTok Shop`}
        title={cat.title}
        description={cat.tagline}
        crumbs={[
          { label: "Home", to: "/" },
          { label: "Social Media Virals", to: "/social-media-virals" },
          { label: cat.title },
        ]}
      />

      {/* Sub-category chips */}
      <section className="mx-auto max-w-[1600px] px-6 lg:px-12 pb-6">
        <div className="flex flex-wrap gap-2">
          {cat.subs.map((s) => (
            <Link
              key={s.slug}
              to="/social-media-virals/$category/$sub"
              params={{ category: cat.slug, sub: s.slug }}
              className="rounded-full border border-border/70 bg-background/60 backdrop-blur px-4 py-2 text-xs uppercase tracking-[0.2em] text-muted-foreground hover:border-[color:var(--gold)] hover:text-foreground transition"
            >
              {s.title}
            </Link>
          ))}
        </div>
      </section>

      {/* Each subcategory as its own row */}
      {cat.subs.map((sub) => (
        <section key={sub.slug} className="mx-auto max-w-[1600px] px-6 lg:px-12 mt-16">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <div className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--gold)]">{cat.emoji} {cat.title}</div>
              <h2 className="mt-2 font-display text-3xl md:text-4xl">{sub.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{sub.tagline}</p>
            </div>
            <Link
              to="/social-media-virals/$category/$sub"
              params={{ category: cat.slug, sub: sub.slug }}
              className="shrink-0 text-[11px] uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground"
            >
              View all ({sub.products.length}) →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 lg:gap-7">
            {sub.products.slice(0, 4).map((p) => (
              <ViralProductCard key={p.slug} product={p} category={cat.slug} sub={sub.slug} />
            ))}
          </div>
        </section>
      ))}
    </SiteShell>
  );
}
