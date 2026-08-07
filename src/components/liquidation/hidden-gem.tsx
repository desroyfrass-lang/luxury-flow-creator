import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Gift, Loader2 } from "lucide-react";
import { fetchProducts, type ShopifyProduct } from "@/lib/shopify";
import { Countdown } from "./countdown";

/** End of the current week (Sunday 23:59 local) — the gem rotates weekly. */
function endOfWeek() {
  const d = new Date();
  d.setDate(d.getDate() + ((7 - d.getDay()) % 7));
  d.setHours(23, 59, 59, 0);
  return d.getTime();
}

export function HiddenGem({ query }: { query: string }) {
  const [product, setProduct] = useState<ShopifyProduct | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    fetchProducts({ first: 20, query })
      .then((list) => {
        if (cancelled) return;
        if (!list.length) return setProduct(null);
        // Deterministic per-week pick.
        const week = Math.floor(Date.now() / (7 * 86400000));
        setProduct(list[week % list.length]);
      })
      .catch(() => !cancelled && setProduct(null));
    return () => {
      cancelled = true;
    };
  }, [query]);

  const node = product?.node;

  return (
    <section className="mx-auto max-w-[1400px] px-4 py-14 md:px-12 md:py-20">
      <div className="relative overflow-hidden rounded-[1.5rem] border border-[color:var(--gold)]/25 bg-[color-mix(in_oklab,var(--foreground)_6%,transparent)] backdrop-blur-sm md:rounded-[2rem]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_80%_at_80%_0%,color-mix(in_oklab,var(--gold)_14%,transparent),transparent_70%)]" />
        <div className="relative grid gap-8 p-6 md:grid-cols-2 md:gap-12 md:p-12">
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-[color-mix(in_oklab,var(--foreground)_8%,transparent)]">
            {product === undefined ? (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : node?.images.edges[0]?.node ? (
              <img
                src={node.images.edges[0].node.url}
                alt={node.images.edges[0].node.altText ?? node.title}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-contain p-8 drop-shadow-[0_24px_40px_rgba(0,0,0,0.5)]"
              />
            ) : (
              <div className="flex h-full items-center justify-center px-6 text-center text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Frassy is still choosing this week's gem
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center">
            <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.35em] text-[color:var(--gold)]">
              <Gift className="h-3.5 w-3.5" /> This Week's Hidden Gem
            </p>
            <h2 className="mt-4 font-display text-3xl uppercase leading-tight tracking-[0.06em] md:text-5xl">
              Frassy's Pick of the Week
            </h2>
            <p className="mt-4 text-lg italic text-[color:var(--gold-soft)]">
              "I couldn't let this one hide."
            </p>
            {node ? (
              <>
                <p className="mt-5 font-display text-xl uppercase tracking-[0.12em]">{node.title}</p>
                <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-muted-foreground">
                  {node.description ||
                    "One of those quiet pieces that carries a whole fit. Frassy pulled it off the rack before anyone else could."}
                </p>
                <p className="mt-4 font-display text-2xl tabular-nums text-[color:var(--gold)]">
                  {Number(node.priceRange.minVariantPrice.amount).toFixed(2)}{" "}
                  {node.priceRange.minVariantPrice.currencyCode}
                </p>
                <Link
                  to="/product/$handle"
                  params={{ handle: node.handle }}
                  className="mt-6 inline-flex w-fit items-center rounded-full border border-[color:var(--gold)]/50 px-7 py-3 text-[11px] uppercase tracking-[0.28em] text-[color:var(--gold)] transition-colors hover:bg-[color:var(--gold)] hover:text-[color:var(--gold-foreground)]"
                >
                  See the pick
                </Link>
              </>
            ) : null}
            <div className="mt-8">
              <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                Gem changes in
              </p>
              <Countdown target={endOfWeek()} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
