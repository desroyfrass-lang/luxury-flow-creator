import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, ShieldCheck, Truck, Sparkles, Undo2 } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { fetchProductByHandle, type ShopifyProductNode, type ShopifyVariant } from "@/lib/shopify";
import { useCartStore } from "@/lib/cart-store";

export const Route = createFileRoute("/product/$handle")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.handle.replace(/-/g, " ")} — Frass Kicks` },
      { name: "description", content: "Premium product from the Frass Kicks collection." },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { handle } = Route.useParams();
  const [product, setProduct] = useState<ShopifyProductNode | null | undefined>(undefined);
  const [activeImg, setActiveImg] = useState(0);
  const [variantId, setVariantId] = useState<string | null>(null);
  const addItem = useCartStore((s) => s.addItem);
  const isLoading = useCartStore((s) => s.isLoading);

  useEffect(() => {
    fetchProductByHandle(handle).then((p) => {
      setProduct(p);
      const first = p?.variants.edges[0]?.node.id ?? null;
      setVariantId(first);
    }).catch(() => setProduct(null));
  }, [handle]);

  if (product === undefined) {
    return (
      <SiteShell>
        <div className="min-h-[60vh] flex items-center justify-center text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </SiteShell>
    );
  }

  if (!product) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-2xl py-32 px-6 text-center">
          <h1 className="font-display text-5xl">Not found</h1>
          <p className="mt-4 text-muted-foreground">This piece isn't in the showroom.</p>
          <Link to="/" className="mt-8 inline-block underline">Return home</Link>
        </div>
      </SiteShell>
    );
  }

  const images = product.images.edges;
  const variants = product.variants.edges.map((e) => e.node);
  const variant = variants.find((v) => v.id === variantId) ?? variants[0];
  const price = variant?.price ?? product.priceRange.minVariantPrice;

  const grouped = groupByOption(variants);

  const handleAdd = async () => {
    if (!variant) return;
    await addItem({
      product: { node: product },
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions ?? [],
    });
  };

  return (
    <SiteShell>
      <section className="mx-auto max-w-[1600px] px-6 lg:px-12 pt-10 pb-24">
        <nav className="mb-8 flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span className="opacity-40">/</span>
          <Link to="/frass-kicks" className="hover:text-foreground">Shop</Link>
          <span className="opacity-40">/</span>
          <span className="text-foreground">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20">
          {/* Gallery */}
          <div>
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-muted lux-card">
              {images[activeImg] ? (
                <img
                  src={images[activeImg].node.url}
                  alt={images[activeImg].node.altText ?? product.title}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 chrome-surface" />
              )}
            </div>
            {images.length > 1 && (
              <div className="mt-4 grid grid-cols-5 gap-3">
                {images.slice(0, 5).map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`aspect-square overflow-hidden rounded-xl ring-1 ring-inset transition ${
                      activeImg === i ? "ring-[color:var(--gold)]" : "ring-border hover:ring-foreground"
                    }`}
                  >
                    <img src={img.node.url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            {product.productType && (
              <div className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                {product.productType}
              </div>
            )}
            <h1 className="mt-3 font-display text-4xl md:text-6xl leading-[0.95]">{product.title}</h1>
            <p className="mt-4 text-2xl tabular-nums">
              {price.currencyCode} {parseFloat(price.amount).toFixed(2)}
            </p>

            <div className="mt-8 space-y-6">
              {Object.entries(grouped).map(([optName, values]) => (
                <div key={optName}>
                  <div className="mb-2 text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                    {optName}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {values.map((v) => {
                      const isActive = variant?.selectedOptions.some(
                        (o) => o.name === optName && o.value === v.value,
                      );
                      return (
                        <button
                          key={v.value}
                          onClick={() => v.variantId && setVariantId(v.variantId)}
                          disabled={!v.available}
                          className={`px-4 py-2 text-xs uppercase tracking-[0.2em] rounded-full border transition ${
                            isActive
                              ? "bg-foreground text-background border-foreground"
                              : "border-border hover:border-foreground"
                          } ${!v.available ? "opacity-40 line-through" : ""}`}
                        >
                          {v.value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-col gap-3">
              <button
                onClick={handleAdd}
                disabled={isLoading || !variant?.availableForSale}
                className="lux-press h-14 inline-flex items-center justify-center gap-2 rounded-full bg-foreground text-background uppercase tracking-[0.25em] text-xs font-medium disabled:opacity-60"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add to bag"}
              </button>
              <p className="text-[11px] text-center uppercase tracking-[0.2em] text-muted-foreground">
                {variant?.availableForSale ? "In stock — ships within 48h" : "Currently unavailable"}
              </p>
            </div>

            {product.description && (
              <div className="mt-10 prose prose-sm max-w-none text-muted-foreground whitespace-pre-line">
                {product.description}
              </div>
            )}

            <div className="mt-12 grid grid-cols-2 gap-4 border-t border-border pt-8">
              {[
                { Icon: ShieldCheck, label: "Secure Checkout" },
                { Icon: Truck, label: "Fast Shipping" },
                { Icon: Undo2, label: "Easy Returns" },
                { Icon: Sparkles, label: "Quality Guarantee" },
              ].map(({ Icon, label }) => (
                <div key={label} className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  <Icon className="h-4 w-4 text-[color:var(--gold)]" />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

function groupByOption(variants: ShopifyVariant[]) {
  const out: Record<string, { value: string; variantId: string | null; available: boolean }[]> = {};
  for (const v of variants) {
    for (const opt of v.selectedOptions) {
      out[opt.name] = out[opt.name] ?? [];
      const existing = out[opt.name].find((x) => x.value === opt.value);
      if (!existing) {
        out[opt.name].push({ value: opt.value, variantId: v.id, available: v.availableForSale });
      } else if (v.availableForSale) {
        existing.available = true;
        existing.variantId = v.id;
      }
    }
  }
  return out;
}
