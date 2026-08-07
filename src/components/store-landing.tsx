import { Link } from "@tanstack/react-router";
import { GatewayNav } from "@/components/gateway-nav";
import { ProductGrid } from "@/components/product-grid";
import { PageFeedback } from "@/components/page-feedback";

type Props = {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  /** Shopify search query for the catalog grid. */
  query: string;
};

/**
 * Shared storefront landing page: cinematic sign-style hero + live catalog.
 * Used by the smaller Frass District stores (Plus Size, Kids, Luxury House).
 */
export function StoreLanding({ eyebrow, title, description, image, query }: Props) {
  return (
    <div className="min-h-screen bg-background">
      <GatewayNav mode="shop" />

      <section className="relative h-[58vh] min-h-[380px] overflow-hidden">
        <img src={image} alt={title} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.94),rgba(0,0,0,0.35)_55%,rgba(0,0,0,0.45))]" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1600px] px-6 pb-12 lg:px-10">
          <span className="text-[10px] uppercase tracking-[0.38em] text-[color:var(--gold)]">
            {eyebrow}
          </span>
          <h1 className="mt-3 font-display text-4xl uppercase leading-[0.9] text-white md:text-7xl">
            {title}
          </h1>
          <p className="mt-4 max-w-xl text-sm text-white/75 md:text-base">{description}</p>
          <Link
            to="/shop-frass"
            className="mt-6 inline-flex rounded-full border border-[color:var(--gold)] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.28em] text-[color:var(--gold)] transition hover:bg-[color:var(--gold)] hover:text-black"
          >
            ← Back to Frass District
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-6 py-16 lg:px-10">
        <div className="mb-10 flex items-end justify-between gap-6">
          <h2 className="font-display text-3xl uppercase md:text-5xl">The collection</h2>
          <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Live catalog
          </span>
        </div>
        <ProductGrid
          query={query}
          first={24}
          emptyTitle="This store is being stocked"
          emptyHint="Pieces are on their way. Check back shortly — or explore another store in the district."
        />
      </section>

      <PageFeedback pageTitle={title} />
    </div>
  );
}
