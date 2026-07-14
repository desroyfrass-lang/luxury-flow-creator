import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Star, Flame, Truck, ShieldCheck, RotateCcw, Plus, Minus } from "lucide-react";
import { toast } from "sonner";
import { SiteShell } from "@/components/site-shell";
import { PageHeader } from "@/components/page-header";
import { ViralProductCard } from "@/components/viral-product-card";
import { getViralProduct } from "@/lib/social-virals";

export const Route = createFileRoute("/social-media-virals/$category/$sub/$product")({
  beforeLoad: ({ params }) => {
    const { product } = getViralProduct(params.category, params.sub, params.product);
    if (!product) throw notFound();
  },
  head: ({ params }) => {
    const { product } = getViralProduct(params.category, params.sub, params.product);
    return {
      meta: [
        { title: `${product?.title ?? "Product"} — Frass` },
        { name: "description", content: product?.blurb ?? "" },
        { property: "og:image", content: product?.image ?? "" },
      ],
    };
  },
  notFoundComponent: () => (
    <SiteShell>
      <PageHeader eyebrow="Social Media Virals" title="Product not found" crumbs={[{ label: "Home", to: "/" }]} />
    </SiteShell>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { category, sub: subSlug, product: prodSlug } = Route.useParams();
  const { cat, sub, product } = getViralProduct(category, subSlug, prodSlug);
  const [qty, setQty] = useState(1);
  if (!cat || !sub || !product) return null;

  const discount = product.compareAt
    ? Math.round(((product.compareAt - product.price) / product.compareAt) * 100)
    : 0;

  const related = sub.products.filter((p) => p.slug !== product.slug).slice(0, 4);

  return (
    <SiteShell>
      <div className="mx-auto max-w-[1600px] px-6 lg:px-12 pt-8">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span className="opacity-40">/</span>
          <Link to="/social-media-virals" className="hover:text-foreground">Social Media Virals</Link>
          <span className="opacity-40">/</span>
          <Link to="/social-media-virals/$category" params={{ category: cat.slug }} className="hover:text-foreground">{cat.title}</Link>
          <span className="opacity-40">/</span>
          <Link to="/social-media-virals/$category/$sub" params={{ category: cat.slug, sub: sub.slug }} className="hover:text-foreground">{sub.title}</Link>
          <span className="opacity-40">/</span>
          <span className="text-foreground">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          <div className="relative overflow-hidden rounded-2xl bg-muted aspect-square">
            <img src={product.image} alt={product.title} className="h-full w-full object-cover" />
            {product.badge && (
              <span className="absolute top-4 left-4 inline-flex items-center gap-1 rounded-full bg-[color:var(--gold)] px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[color:var(--ink)]">
                <Flame className="h-3.5 w-3.5" /> {product.badge}
              </span>
            )}
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
              {cat.emoji} {sub.title}
            </div>
            <h1 className="mt-3 font-display text-4xl md:text-5xl leading-tight">{product.title}</h1>
            <p className="mt-3 text-muted-foreground">{product.blurb}</p>

            <div className="mt-5 flex items-center gap-3 text-sm">
              <span className="inline-flex items-center gap-1 text-[color:var(--gold)]">
                <Star className="h-4 w-4 fill-current" />
                <span className="font-medium tabular-nums text-foreground">{product.rating.toFixed(1)}</span>
              </span>
              <span className="text-muted-foreground">({product.reviews} reviews)</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">{product.sold}</span>
            </div>

            <div className="mt-6 flex items-baseline gap-3">
              <span className="font-display text-4xl tabular-nums">${product.price.toFixed(2)}</span>
              {product.compareAt && (
                <>
                  <span className="text-lg tabular-nums text-muted-foreground line-through">${product.compareAt.toFixed(2)}</span>
                  <span className="rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-bold text-red-600">-{discount}%</span>
                </>
              )}
            </div>

            <div className="mt-8 flex items-center gap-4">
              <div className="inline-flex items-center rounded-full border border-border">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="h-11 w-11 inline-flex items-center justify-center hover:text-[color:var(--gold)]" aria-label="Decrease">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center tabular-nums">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="h-11 w-11 inline-flex items-center justify-center hover:text-[color:var(--gold)]" aria-label="Increase">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <button
                onClick={() => toast.success(`${qty} × ${product.title} added to cart`)}
                className="lux-press flex-1 rounded-sm border border-[color:var(--gold)] bg-[color:var(--gold)] px-6 py-3.5 text-xs font-bold uppercase tracking-[0.32em] text-[color:var(--ink)]"
              >
                Add to Cart
              </button>
            </div>

            <button
              onClick={() => toast.success("Redirecting to checkout…")}
              className="lux-press mt-3 w-full rounded-sm border border-foreground px-6 py-3.5 text-xs font-bold uppercase tracking-[0.32em]"
            >
              Buy It Now
            </button>

            <div className="mt-8 grid grid-cols-3 gap-3 text-xs">
              {[
                { icon: Truck, label: "Free shipping" },
                { icon: ShieldCheck, label: "Buyer protection" },
                { icon: RotateCcw, label: "Easy returns" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 rounded-xl border border-border/70 bg-background/60 backdrop-blur px-3 py-3">
                  <Icon className="h-4 w-4 text-[color:var(--gold)]" />
                  <span className="text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-24">
            <h2 className="font-display text-3xl mb-6">You might also like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 lg:gap-7">
              {related.map((p) => (
                <ViralProductCard key={p.slug} product={p} category={cat.slug} sub={sub.slug} />
              ))}
            </div>
          </section>
        )}
      </div>
    </SiteShell>
  );
}
