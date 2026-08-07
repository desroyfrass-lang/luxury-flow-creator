import { Link } from "@tanstack/react-router";
import { Loader2, Plus } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import type { ShopifyProduct } from "@/lib/shopify";

export function ProductCard({ product }: { product: ShopifyProduct }) {
  const addItem = useCartStore((s) => s.addItem);
  const isLoading = useCartStore((s) => s.isLoading);
  const node = product.node;
  const variant = node.variants.edges[0]?.node;
  const primary = node.images.edges[0]?.node;
  const secondary = node.images.edges[1]?.node ?? primary;

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!variant) return;
    await addItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions ?? [],
    });
  };

  const isSale = node.tags?.some((t) => t.toLowerCase() === "sale");
  const isClearance = node.tags?.some((t) => t.toLowerCase() === "clearance");
  const badge = isClearance ? "Clearance" : isSale ? "Sale" : null;

  return (
    <Link
      to="/product/$handle"
      params={{ handle: node.handle }}
      className="lux-card group relative block overflow-hidden rounded-2xl bg-card"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        {badge && (
          <span className="absolute left-3 top-3 z-20 rounded-full bg-[color:var(--gold)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[color:var(--gold-foreground)]">
            {badge}
          </span>
        )}
        {primary ? (
          <>
            <img
              src={primary.url}
              alt={primary.altText ?? node.title}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700 group-hover:opacity-0"
            />
            <img
              src={secondary.url}
              alt={secondary.altText ?? node.title}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover scale-[1.04] opacity-0 transition-opacity duration-700 group-hover:opacity-100"
            />
          </>
        ) : (
          <div className="absolute inset-0 chrome-surface" />
        )}
        <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-2xl pointer-events-none" />

        <button
          onClick={handleAdd}
          disabled={isLoading || !variant}
          className="absolute bottom-4 right-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-background/90 text-foreground shadow-[var(--shadow-luxury)] backdrop-blur transition-all duration-300 hover:bg-[color:var(--gold)] hover:scale-110 disabled:opacity-60"
          aria-label="Quick add"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-5 w-5" />}
        </button>
      </div>

      <div className="px-1 pt-5 pb-2">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-display text-xl leading-tight">{node.title}</h3>
          <span className="shrink-0 text-right text-sm tabular-nums">
            {variant?.compareAtPrice && Number(variant.compareAtPrice.amount) > Number(variant.price.amount) ? (
              <>
                <span className="block text-xs text-muted-foreground line-through">
                  {Number(variant.compareAtPrice.amount).toFixed(2)} {variant.compareAtPrice.currencyCode}
                </span>
                <span className="block text-foreground/80">
                  {Number(variant.price.amount).toFixed(2)}{" "}
                  <span className="text-muted-foreground">{variant.price.currencyCode}</span>
                </span>
              </>
            ) : (
              <span className="text-foreground/80">
                {Number(node.priceRange.minVariantPrice.amount).toFixed(2)}{" "}
                <span className="text-muted-foreground">{node.priceRange.minVariantPrice.currencyCode}</span>
              </span>
            )}
          </span>
        </div>
        {node.productType && (
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">{node.productType}</p>
        )}
      </div>
    </Link>
  );
}
