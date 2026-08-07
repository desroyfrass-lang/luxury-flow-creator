import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { fetchProducts, type ShopifyProduct } from "@/lib/shopify";

export type SaleColumn = {
  id: string;
  label: string;
  caption: string;
  query: string;
};

function SaleRail({ column }: { column: SaleColumn }) {
  const [products, setProducts] = useState<ShopifyProduct[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    setProducts(null);
    fetchProducts({ first: 30, query: column.query })
      .then((p) => !cancelled && setProducts(p))
      .catch(() => !cancelled && setProducts([]));
    return () => {
      cancelled = true;
    };
  }, [column.query]);

  return (
    <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[color:var(--gold)]/25 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--foreground)_8%,transparent),color-mix(in_oklab,var(--foreground)_3%,transparent))] backdrop-blur-sm md:rounded-[2rem]">
      <div className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-3 md:px-4 md:py-4">
        {products === null ? (
          <div className="flex items-center justify-center py-24 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center text-xs text-muted-foreground">
            Restocking the rack.
          </div>
        ) : (
          <div className="space-y-4 md:space-y-6">
            {products.map((p) => {
              const node = p.node;
              const img = node.images.edges[0]?.node;
              const variant = node.variants.edges[0]?.node;
              const compareAt = variant?.compareAtPrice?.amount
                ? Number(variant.compareAtPrice.amount)
                : null;
              const price = Number(node.priceRange.minVariantPrice.amount);
              return (
                <div key={node.id} className="relative">
                  <div className="pointer-events-none absolute -top-1 left-1 right-1 h-5 rounded-full bg-[color:var(--gold)]/25 blur-xl" />
                  <Link
                    to="/product/$handle"
                    params={{ handle: node.handle }}
                    className="group relative block rounded-xl p-1 transition-transform duration-500 hover:-translate-y-1 md:p-2"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-[color-mix(in_oklab,var(--foreground)_6%,transparent)]">
                      {img ? (
                        <img
                          src={img.url}
                          alt={img.altText ?? node.title}
                          loading="lazy"
                          className="absolute inset-0 h-full w-full object-contain p-2 drop-shadow-[0_10px_18px_rgba(0,0,0,0.45)] transition-transform duration-700 group-hover:scale-[1.08]"
                        />
                      ) : (
                        <div className="absolute inset-0 chrome-surface" />
                      )}
                      {compareAt && compareAt > price ? (
                        <span className="absolute left-2 top-2 rounded-full bg-[color:var(--gold)] px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-[color:var(--gold-foreground)]">
                          Sale
                        </span>
                      ) : null}
                      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_60%_at_50%_-10%,color-mix(in_oklab,var(--gold)_22%,transparent),transparent_60%)] opacity-70" />
                    </div>
                    <p className="mt-1.5 truncate text-center text-[10px] uppercase tracking-[0.12em] text-muted-foreground group-hover:text-foreground md:text-[11px] md:tracking-[0.16em]">
                      {node.title}
                    </p>
                    <p className="flex items-center justify-center gap-2 text-center text-[10px] tabular-nums text-foreground/70 md:text-[11px]">
                      {compareAt && compareAt > price ? (
                        <span className="text-muted-foreground line-through">
                          {compareAt.toFixed(2)}
                        </span>
                      ) : null}
                      <span>
                        {price.toFixed(2)} {node.priceRange.minVariantPrice.currencyCode}
                      </span>
                    </p>
                  </Link>
                  <div className="mt-1 h-[3px] w-full rounded-full bg-[linear-gradient(90deg,transparent,color-mix(in_oklab,var(--gold)_65%,transparent),transparent)]" />
                  <div className="h-2 w-full rounded-b-lg bg-[linear-gradient(180deg,color-mix(in_oklab,var(--foreground)_14%,transparent),transparent)] md:h-3" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export function SaleWall({ columns }: { columns: SaleColumn[] }) {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_50%_at_50%_0%,color-mix(in_oklab,var(--gold)_12%,transparent),transparent_70%)]" />
      <div className="relative mx-auto max-w-[1600px] px-2 py-6 md:px-12 md:py-10">
        <div className="flex h-[78vh] min-h-[520px] gap-2 md:h-[85vh] md:gap-6">
          {columns.map((c) => (
            <SaleRail key={c.id} column={c} />
          ))}
        </div>
      </div>
    </div>
  );
}
