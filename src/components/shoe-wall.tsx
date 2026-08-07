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

  return (
    <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[color:var(--gold)]/25 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--foreground)_8%,transparent),color-mix(in_oklab,var(--foreground)_3%,transparent))] backdrop-blur-sm md:rounded-[2rem]">
      {/* header sign */}
      <div className="relative z-10 shrink-0 border-b border-[color:var(--gold)]/20 px-2 py-3 text-center md:px-6 md:py-5">
        <div className="mx-auto mb-2 h-px w-8 bg-[color:var(--gold)]/60 md:mb-3 md:w-16" />
        <h3 className="font-display text-sm tracking-[0.14em] uppercase text-foreground md:text-2xl md:tracking-[0.18em]">
          {section.label}
        </h3>
        <p className="mt-1 hidden text-[10px] uppercase tracking-[0.3em] text-muted-foreground md:block">
          {section.caption}
        </p>
      </div>

      {/* scrollable shelf stack */}
      <div className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-3 md:px-4 md:py-4">
        {products === null ? (
          <div className="flex items-center justify-center py-24 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center text-xs text-muted-foreground">Restocking.</div>
        ) : (
          <div className="space-y-4 md:space-y-6">
            {products.map((p) => {
              const node = p.node;
              const img = node.images.edges[0]?.node;
              return (
                <div key={node.id} className="relative">
                  {/* shelf light */}
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
                      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_60%_at_50%_-10%,color-mix(in_oklab,var(--gold)_22%,transparent),transparent_60%)] opacity-70" />
                    </div>
                    <p className="mt-1.5 truncate text-center text-[10px] uppercase tracking-[0.12em] text-muted-foreground group-hover:text-foreground md:text-[11px] md:tracking-[0.16em]">
                      {node.title}
                    </p>
                    <p className="text-center text-[10px] tabular-nums text-foreground/70 md:text-[11px]">
                      {Number(node.priceRange.minVariantPrice.amount).toFixed(2)}{" "}
                      {node.priceRange.minVariantPrice.currencyCode}
                    </p>
                  </Link>
                  {/* shelf plank */}
                  <div className="mt-1 h-[3px] w-full rounded-full bg-[linear-gradient(90deg,transparent,color-mix(in_oklab,var(--gold)_65%,transparent),transparent)]" />
                  <div className="h-2 w-full rounded-b-lg bg-[linear-gradient(180deg,color-mix(in_oklab,var(--foreground)_14%,transparent),transparent)] md:h-3" />
                </div>
              );
            })}
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
      {/* room floor + ambient light */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_50%_at_50%_0%,color-mix(in_oklab,var(--gold)_12%,transparent),transparent_70%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,transparent,color-mix(in_oklab,var(--foreground)_10%,transparent))]" />
      <div className="relative mx-auto max-w-[1600px] px-2 py-6 md:px-12 md:py-10">
        <div className="flex h-[78vh] min-h-[520px] gap-2 md:h-[85vh] md:gap-6">
          {sections.map((s) => (
            <ShelfColumn key={s.id} section={s} gender={gender} />
          ))}
        </div>
      </div>
    </div>
  );
}
