import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { fetchProducts, type ShopifyProduct } from "@/lib/shopify";

export type WallSection = {
  id: string;
  label: string;
  caption: string;
  query: string;
  handle: string;
};

/** One illuminated, independently scrollable column of the shoe wall. */
function ShelfColumn({ section, gender }: { section: WallSection; gender: "men" | "women" }) {
  const [products, setProducts] = useState<ShopifyProduct[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    setProducts(null);
    fetchProducts({ first: 30, query: section.query })
      .then((p) => !cancelled && setProducts(p))
      .catch(() => !cancelled && setProducts([]));
    return () => {
      cancelled = true;
    };
  }, [section.query]);

  const rows: ShopifyProduct[][] = [];
  if (products) {
    for (let i = 0; i < products.length; i += 3) rows.push(products.slice(i, i + 3));
  }

  return (
    <div className="relative flex min-w-0 flex-col overflow-hidden border-x border-[color:var(--gold)]/20 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--foreground)_8%,transparent),color-mix(in_oklab,var(--foreground)_3%,transparent))] backdrop-blur-sm">
      {/* scrollable shelf stack */}
      <div className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-1.5 py-3 md:px-3 md:py-4">
        {products === null ? (
          <div className="flex items-center justify-center py-24 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center text-xs text-muted-foreground">Restocking.</div>
        ) : (
          <div className="space-y-3 md:space-y-5">
            {rows.map((row, ri) => (
              <div key={ri} className="relative">
                {/* shelf light */}
                <div className="pointer-events-none absolute -top-1 left-1 right-1 h-4 rounded-full bg-[color:var(--gold)]/20 blur-lg" />
                <div className="grid grid-cols-3 gap-1 md:gap-2">
                  {row.map((p) => {
                    const node = p.node;
                    const img = node.images.edges[0]?.node;
                    return (
                      <Link
                        key={node.id}
                        to="/product/$handle"
                        params={{ handle: node.handle }}
                        className="group relative block rounded-md p-0.5 transition-transform duration-500 hover:-translate-y-1"
                      >
                        <div className="relative aspect-square overflow-hidden rounded bg-[color-mix(in_oklab,var(--foreground)_6%,transparent)]">
                          {img ? (
                            <img
                              src={img.url}
                              alt={img.altText ?? node.title}
                              loading="lazy"
                              className="absolute inset-0 h-full w-full object-contain p-1 drop-shadow-[0_8px_14px_rgba(0,0,0,0.45)] transition-transform duration-700 group-hover:scale-[1.1]"
                            />
                          ) : (
                            <div className="absolute inset-0 chrome-surface" />
                          )}
                          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_60%_at_50%_-10%,color-mix(in_oklab,var(--gold)_18%,transparent),transparent_60%)] opacity-70" />
                        </div>
                        <p className="mt-1 truncate text-center text-[8px] uppercase tracking-[0.08em] text-muted-foreground group-hover:text-foreground md:text-[9px]">
                          {node.title}
                        </p>
                        <p className="text-center text-[8px] tabular-nums text-foreground/70 md:text-[9px]">
                          {Number(node.priceRange.minVariantPrice.amount).toFixed(2)}
                        </p>
                      </Link>
                    );
                  })}
                </div>
                {/* shelf plank */}
                <div className="mt-1 h-[2px] w-full rounded-full bg-[linear-gradient(90deg,transparent,color-mix(in_oklab,var(--gold)_65%,transparent),transparent)]" />
                <div className="h-1.5 w-full rounded-b bg-[linear-gradient(180deg,color-mix(in_oklab,var(--foreground)_14%,transparent),transparent)] md:h-2" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* footer link */}
      <div className="relative z-10 shrink-0 border-t border-[color:var(--gold)]/20 px-2 py-3 text-center">
        <Link
          to="/collection/$handle"
          params={{ handle: section.handle }}
          className="inline-flex items-center gap-2 rounded-full border border-[color:var(--gold)]/40 px-3 py-1.5 text-[9px] uppercase tracking-[0.2em] text-foreground/80 transition hover:border-[color:var(--gold)] hover:text-foreground md:px-5 md:py-2 md:text-[10px] md:tracking-[0.3em]"
        >
          <span className="md:hidden">View all</span>
          <span className="hidden md:inline">
            View all {section.label} {gender === "men" ? "— Men" : "— Women"}
          </span>
        </Link>
      </div>
    </div>
  );
}

export function ShoeWall({
  sections,
  gender,
}: {
  sections: WallSection[];
  gender: "men" | "women";
}) {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,transparent,color-mix(in_oklab,var(--foreground)_10%,transparent))]" />
      <div className="relative mx-auto max-w-[1600px] px-2 pb-6 md:px-12 md:pb-10">
        <div className="grid h-[78vh] min-h-[520px] grid-cols-3 overflow-hidden rounded-b-2xl border-b border-[color:var(--gold)]/25 md:h-[85vh] md:rounded-b-[2rem]">
          {sections.map((s) => (
            <ShelfColumn key={s.id} section={s} gender={gender} />
          ))}
        </div>
      </div>
    </div>
  );
}
