import { createFileRoute, notFound } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { PageHeader } from "@/components/page-header";
import { ViralProductCard } from "@/components/viral-product-card";
import { getViralSub } from "@/lib/social-virals";
import { useMergedSubProducts } from "@/hooks/use-merged-sub-products";

export const Route = createFileRoute("/social-media-virals/$category/$sub")({
  beforeLoad: ({ params }) => {
    const { sub } = getViralSub(params.category, params.sub);
    if (!sub) throw notFound();
  },
  head: ({ params }) => {
    const { cat, sub } = getViralSub(params.category, params.sub);
    return {
      meta: [
        { title: `${sub?.title ?? "Collection"} — ${cat?.title ?? ""} | Frass` },
        { name: "description", content: sub?.tagline ?? "" },
      ],
    };
  },
  notFoundComponent: () => (
    <SiteShell>
      <PageHeader eyebrow="Social Media Virals" title="Collection not found" crumbs={[{ label: "Home", to: "/" }]} />
    </SiteShell>
  ),
  component: SubPage,
});

function SubPage() {
  const { category, sub: subSlug } = Route.useParams();
  const { cat, sub } = getViralSub(category, subSlug);
  const { products } = useMergedSubProducts(category, subSlug);
  if (!cat || !sub) return null;

  return (
    <SiteShell>
      <PageHeader
        eyebrow={`${cat.emoji} ${cat.title}`}
        title={sub.title}
        description={sub.tagline}
        crumbs={[
          { label: "Home", to: "/" },
          { label: "Social Media Virals", to: "/social-media-virals" },
          { label: cat.title, to: "/social-media-virals/$category" as never },
          { label: sub.title },
        ]}
      />

      <section className="mx-auto max-w-[1600px] px-6 lg:px-12 pb-24">
        <div className="mb-6 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <span>{products.length} products</span>
          <span>Sort · Best selling</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 lg:gap-7">
          {products.map((p) => (
            <ViralProductCard key={p.slug} product={p} category={cat.slug} sub={sub.slug} />
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
