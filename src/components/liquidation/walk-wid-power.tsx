import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Crown } from "lucide-react";
import { fetchProducts, type ShopifyProduct } from "@/lib/shopify";

/** Monthly signature promotion — one iconic pair. */
export function WalkWidPower({ query }: { query: string }) {
  const [product, setProduct] = useState<ShopifyProduct | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchProducts({ first: 20, query })
      .then((list) => {
        if (cancelled || !list.length) return;
        const month = new Date().getFullYear() * 12 + new Date().getMonth();
        setProduct(list[month % list.length]);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [query]);

  const node = product?.node;
  const img = node?.images.edges[0]?.node;

  return (
    <section className="mx-auto max-w-[1400px] px-4 pb-16 md:px-12 md:pb-24">
      <div className="relative overflow-hidden rounded-[1.5rem] border border-[color:var(--gold)]/25 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--foreground)_10%,transparent),transparent)] md:rounded-[2rem]">
        <div className="grid gap-8 p-6 md:grid-cols-[1.1fr_1fr] md:items-center md:gap-14 md:p-14">
          <div>
            <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.35em] text-[color:var(--gold)]">
              <Crown className="h-3.5 w-3.5" /> Walk Wid Power Pick
            </p>
            <h2 className="mt-4 font-display text-3xl uppercase leading-tight tracking-[0.06em] md:text-5xl">
              {node?.title ?? "This month's icon"}
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-relaxed text-muted-foreground">
              {node?.description ||
                "Every month one pair earns the badge. Not the loudest, not the newest — the one that changes how you carry yourself down the road."}
            </p>
            {node ? (
              <Link
                to="/product/$handle"
                params={{ handle: node.handle }}
                className="mt-7 inline-flex items-center rounded-full bg-[color:var(--gold)] px-8 py-3 text-[11px] uppercase tracking-[0.28em] text-[color:var(--gold-foreground)] transition-opacity hover:opacity-90"
              >
                Claim the pick
              </Link>
            ) : null}
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[color-mix(in_oklab,var(--foreground)_8%,transparent)]">
            {img ? (
              <img
                src={img.url}
                alt={img.altText ?? node?.title ?? "Walk Wid Power pick"}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-contain p-8 drop-shadow-[0_24px_40px_rgba(0,0,0,0.5)]"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Being polished
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
