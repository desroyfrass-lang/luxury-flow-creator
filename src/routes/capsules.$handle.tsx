import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, ShoppingBag, Sparkles, Wand2 } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { fetchCapsuleByHandle, type CapsuleDetail, type CapsuleItem } from "@/lib/capsules";
import { useCartStore, type CartItem } from "@/lib/cart-store";
import { toast } from "sonner";

export const Route = createFileRoute("/capsules/$handle")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.handle.replace(/-/g, " ")} — Capsule` },
      { name: "description", content: "A complete Frass Kicks look, curated head-to-toe." },
    ],
  }),
  component: CapsuleDetailPage,
});

function CapsuleDetailPage() {
  const { handle } = Route.useParams();
  const navigate = useNavigate();
  const [capsule, setCapsule] = useState<CapsuleDetail | null | undefined>(undefined);
  const addManyItems = useCartStore((s) => s.addManyItems);
  const isLoading = useCartStore((s) => s.isLoading);

  useEffect(() => {
    fetchCapsuleByHandle(handle).then(setCapsule).catch(() => setCapsule(null));
  }, [handle]);

  function toCartInput(i: CapsuleItem): Omit<CartItem, "lineId"> | null {
    if (!i.default_variant) return null;
    return {
      product: {
        node: {
          id: i.product.id,
          title: i.product.title,
          description: i.product.description,
          handle: i.product.handle,
          vendor: i.product.vendor ?? undefined,
          productType: i.product.product_type ?? undefined,
          tags: [],
          priceRange: { minVariantPrice: { amount: String(i.product.min_price), currencyCode: i.product.currency } },
          images: { edges: i.primary_image ? [{ node: { url: i.primary_image, altText: i.product.title } }] : [] },
          variants: { edges: [] },
          options: [],
        },
      },
      variantId: i.default_variant.id,
      variantTitle: i.default_variant.title,
      price: { amount: String(i.default_variant.price), currencyCode: i.default_variant.currency },
      quantity: 1,
      selectedOptions: i.default_variant.selected_options ?? [],
    };
  }

  const tryOnItem = async (i: CapsuleItem) => {
    const input = toCartInput(i);
    if (!input) return toast.error("This piece has no variant configured yet.");
    await addManyItems([input]);
    toast.success("Added — heading to the Fitting Room.");
    navigate({ to: "/try-on" });
  };

  const tryOnAll = async () => {
    if (!capsule) return;
    const inputs = capsule.items.map(toCartInput).filter((x): x is Omit<CartItem, "lineId"> => !!x);
    if (inputs.length === 0) return toast.error("No default variants configured for this capsule yet.");
    await addManyItems(inputs);
    toast.success(`${inputs.length} pieces added — try on your full look.`);
    navigate({ to: "/try-on" });
  };

  if (capsule === undefined) {
    return (
      <SiteShell>
        <div className="min-h-[60vh] flex items-center justify-center text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </SiteShell>
    );
  }

  if (!capsule) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-2xl py-32 px-6 text-center">
          <h1 className="font-display text-5xl">Capsule not found</h1>
          <p className="mt-4 text-muted-foreground">This look isn't in the studio.</p>
          <Link to="/capsules" className="mt-8 inline-block underline">Browse capsules</Link>
        </div>
      </SiteShell>
    );
  }

  const buyAll = async () => {
    const inputs = capsule.items.map(toCartInput).filter((x): x is Omit<CartItem, "lineId"> => !!x);
    if (inputs.length === 0) return toast.error("No default variants configured for this capsule yet.");
    await addManyItems(inputs);
    toast.success(`${inputs.length} pieces added to your bag.`);
  };

  const hasDiscount = capsule.bundle_discount_pct > 0;

  return (
    <SiteShell>
      {/* Hero */}
      <section className="relative">
        <div className="relative h-[55vh] min-h-[420px] w-full overflow-hidden">
          {capsule.hero_image ? (
            <img src={capsule.hero_image} alt={capsule.name} className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 chrome-surface" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>
        <div className="mx-auto max-w-[1600px] px-6 lg:px-12 -mt-40 relative">
          <nav className="mb-4 flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <span className="opacity-40">/</span>
            <Link to="/capsules" className="hover:text-foreground">Lookbooks & Capsules</Link>
            <span className="opacity-40">/</span>
            <span className="text-foreground">{capsule.name}</span>
          </nav>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-end">
            <div>
              <div className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
                {[capsule.collection, capsule.style, capsule.occasion, capsule.season].filter(Boolean).join(" · ")}
              </div>
              <h1 className="mt-2 font-display text-5xl md:text-7xl leading-[0.9]">{capsule.name}</h1>
              {capsule.description && (
                <p className="mt-5 max-w-2xl text-base text-muted-foreground">{capsule.description}</p>
              )}
            </div>
            <div className="rounded-2xl border border-border/60 bg-background/80 backdrop-blur p-6 lg:min-w-[300px]">
              <div className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Complete look</div>
              <div className="mt-2 flex items-baseline gap-3">
                {hasDiscount && (
                  <span className="text-lg text-muted-foreground line-through tabular-nums">
                    {capsule.currency} {capsule.total_price.toFixed(2)}
                  </span>
                )}
                <span className="font-display text-4xl tabular-nums">
                  {capsule.currency} {capsule.discounted_price.toFixed(2)}
                </span>
              </div>
              {hasDiscount && (
                <div className="mt-1 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-[color:var(--gold)]">
                  <Sparkles className="h-3 w-3" /> Save {capsule.bundle_discount_pct}%
                </div>
              )}
              <button
                onClick={buyAll}
                disabled={isLoading || capsule.items.length === 0}
                className="lux-press mt-5 w-full h-13 py-3.5 inline-flex items-center justify-center gap-2 rounded-full bg-foreground text-background uppercase tracking-[0.25em] text-xs font-medium disabled:opacity-60"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><ShoppingBag className="h-4 w-4" /> Buy entire capsule</>}
              </button>
              <p className="mt-3 text-center text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                {capsule.items.length} piece{capsule.items.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Items */}
      <section className="mx-auto max-w-[1600px] px-6 lg:px-12 mt-20 pb-24">
        <div className="mb-10 flex items-end justify-between">
          <h2 className="font-display text-3xl md:text-4xl">The pieces</h2>
          <span className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Head to toe</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {capsule.items.map((it) => <ItemCard key={it.id} item={it} currency={capsule.currency} />)}
        </div>
      </section>
    </SiteShell>
  );
}

function ItemCard({ item, currency }: { item: CapsuleItem; currency: string }) {
  const price = item.default_variant?.price ?? item.product.min_price;
  return (
    <Link
      to="/product/$handle"
      params={{ handle: item.product.handle }}
      className="lux-card group block overflow-hidden rounded-2xl bg-card"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        {item.primary_image ? (
          <img
            src={item.primary_image}
            alt={item.product.title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="absolute inset-0 chrome-surface" />
        )}
        <div className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-background/80 backdrop-blur px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em]">
          {item.slot}
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-display text-xl leading-tight">{item.product.title}</h3>
        <div className="mt-1 flex items-baseline justify-between text-sm">
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {item.product.product_type ?? item.product.vendor ?? "Piece"}
          </span>
          <span className="tabular-nums font-medium">
            {currency} {price.toFixed(2)}
          </span>
        </div>
      </div>
    </Link>
  );
}
