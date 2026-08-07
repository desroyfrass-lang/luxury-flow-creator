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

/** One illuminated shelf bay of real products. */
function ShelfBay({ section, gender }: { section: WallSection; gender: "men" | "women" }) {
  const [products, setProducts] = useState<ShopifyProduct[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    setProducts(null);
    fetchProducts({ first: 12, query: section.query })
      .then((p) => !cancelled && setProducts(p))
      .catch(() => !cancelled && setProducts([]));
    return () => {
      cancelled = true;
    };
  }, [section.query]);

  // three shelves, ceiling to floor
  const rows: ShopifyProduct[][] = [[], [], []];
  (products ?? []).forEach((p, i) => rows[i % 3].push(p));

  return (
    <div className="relative flex-1 min-w-0">
      {/* bay backing */}
      <div className="relative overflow-hidden rounded-[2rem] border border-[color:var(--gold)]/25 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--foreground)_8%,transparent),color-mix(in_oklab,var(--foreground)_3%,transparent))] backdrop-blur-sm">
        {/* header sign */}
        <div className="relative z-10 border-b border-[color:var(--gold)]/20 px-6 py-5 text-center">
          <div className="mx-auto mb-3 h-px w-16 bg-[color:var(--gold)]/60" />
          <h3 className="font-display text-2xl md:text-3xl tracking-[0.18em] uppercase text-foreground">
            {section.label}
          </h3>
          <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            {section.caption}
          </p>
        </div>

        <div className="relative z-10 px-4 pb-6 pt-4 md:px-6">
          {products === null ? (
            <div className="flex items-center justify-center py-24 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <div className="py-20 text-center text-sm text-muted-foreground">
              This bay is being restocked.
            </div>
          ) : (
            <div className="space-y-5">
              {rows.map((row, ri) =>
                row.length === 0 ? null : (
                  <div key={ri} className="relative">
                    {/* shelf light */}
                    <div className="pointer-events-none absolute -top-2 left-2 right-2 h-6 rounded-full bg-[color:var(--gold)]/25 blur-xl" />
                    <div className="relative grid grid-cols-2 gap-3 md:gap-4">
                      {row.map((p) => {
                        const node = p.node;
                        const img = node.images.edges[0]?.node;
                        return (
                          <Link
                            key={node.id}
                            to="/product/$handle"
                            params={{ handle: node.handle }}
                            className="group relative block rounded-xl p-2 transition-transform duration-500 hover:-translate-y-1"
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
                              {/* spotlight sweep */}
                              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_60%_at_50%_-10%,color-mix(in_oklab,var(--gold)_22%,transparent),transparent_60%)] opacity-70" />
                            </div>
                            <p className="mt-2 truncate text-center text-[11px] uppercase tracking-[0.16em] text-muted-foreground group-hover:text-foreground">
                              {node.title}
                            </p>
                            <p className="text-center text-[11px] tabular-nums text-foreground/70">
                              {Number(node.priceRange.minVariantPrice.amount).toFixed(2)}{" "}
                              {node.priceRange.minVariantPrice.currencyCode}
                            </p>
                          </Link>
                        );
                      })}
                    </div>
                    {/* shelf plank */}
                    <div className="mt-2 h-[3px] w-full rounded-full bg-[linear-gradient(90deg,transparent,color-mix(in_oklab,var(--gold)_65%,transparent),transparent)]" />
                    <div className="h-3 w-full rounded-b-xl bg-[linear-gradient(180deg,color-mix(in_oklab,var(--foreground)_14%,transparent),transparent)]" />
                  </div>
                ),
              )}
            </div>
          )}

          <div className="mt-6 text-center">
            <Link
              to="/collection/$handle"
              params={{ handle: section.handle }}
              className="inline-flex items-center gap-2 rounded-full border border-[color:var(--gold)]/40 px-5 py-2 text-[10px] uppercase tracking-[0.3em] text-foreground/80 transition hover:border-[color:var(--gold)] hover:text-foreground"
            >
              View all {section.label} {gender === "men" ? "— Men" : "— Women"}
            </Link>
          </div>
        </div>
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
      <div className="relative mx-auto flex max-w-[1600px] flex-col gap-6 px-4 py-10 md:flex-row md:gap-8 md:px-12">
        {sections.map((s) => (
          <ShelfBay key={s.id} section={s} gender={gender} />
        ))}
      </div>
    </div>
  );
}
