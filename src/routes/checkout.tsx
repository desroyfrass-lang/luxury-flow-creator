import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { useCartStore } from "@/lib/cart-store";
import { Trash2, ArrowLeft, Lock, Gift, Loader2 } from "lucide-react";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { validateCoupon } from "@/lib/rewards.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Frass Kicks" },
      { name: "description", content: "Review your selection before checkout." },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const getCheckoutUrl = useCartStore((s) => s.getCheckoutUrl);
  const isLoading = useCartStore((s) => s.isLoading);

  const subtotal = items.reduce((s, i) => s + parseFloat(i.price.amount) * i.quantity, 0);
  const currency = items[0]?.price.currencyCode ?? "USD";

  const isSaleItem = (i: (typeof items)[number]) =>
    (i.product.node.tags ?? []).some((t) => t.toLowerCase() === "sale");
  const eligibleSubtotal = items
    .filter((i) => !isSaleItem(i))
    .reduce((s, i) => s + parseFloat(i.price.amount) * i.quantity, 0);
  const excludedSubtotal = subtotal - eligibleSubtotal;
  const hasExcluded = excludedSubtotal > 0;

  const [couponInput, setCouponInput] = useState("");
  const [applied, setApplied] = useState<{ code: string; percentOff: number } | null>(null);
  const [checking, setChecking] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const validate = useServerFn(validateCoupon);
  const discount = applied ? eligibleSubtotal * (applied.percentOff / 100) : 0;
  const total = Math.max(0, subtotal - discount);

  const applyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setChecking(true);
    try {
      const res = await validate({ data: { code } });
      if (res.valid) {
        setApplied({ code, percentOff: res.percentOff });
        toast.success(`${res.percentOff}% OFF applied`);
      } else {
        toast.error(res.reason);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign in to apply your reward coupon");
    } finally {
      setChecking(false);
    }
  };

  const handleCheckout = () => {
    const checkoutUrl = getCheckoutUrl();
    if (!checkoutUrl) {
      toast.error("Cart is not ready. Try adding an item again.");
      return;
    }
    setRedirecting(true);
    const url = new URL(checkoutUrl);
    url.searchParams.set("channel", "online_store");
    if (applied?.code) {
      url.searchParams.set("discount", applied.code);
    }
    window.location.href = url.toString();
  };

  return (
    <SiteShell>
      <section className="mx-auto max-w-5xl px-6 lg:px-12 pt-12 pb-24">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> Continue shopping
        </Link>
        <h1 className="mt-6 font-display text-5xl md:text-7xl">Checkout</h1>

        {items.length === 0 ? (
          <div className="mt-16 rounded-3xl border border-dashed border-border p-16 text-center">
            <p className="font-display text-2xl">Your bag is empty.</p>
            <Link
              to="/frass-kicks"
              className="mt-6 inline-block rounded-full bg-foreground px-6 py-3 text-xs uppercase tracking-[0.25em] text-background"
            >
              Shop Frass Kicks
            </Link>
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10">
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.variantId} className="flex gap-5 border-b border-border pb-6">
                  <div className="w-24 h-28 bg-muted rounded-xl overflow-hidden flex-shrink-0">
                    {item.product.node.images?.edges?.[0]?.node && (
                      <img
                        src={item.product.node.images.edges[0].node.url}
                        alt={item.product.node.title}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-xl">{item.product.node.title}</h3>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mt-1">
                      {item.selectedOptions.map((o) => o.value).join(" • ")}
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                      <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Qty</label>
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.variantId, Math.max(1, Number(e.target.value)))}
                        className="w-16 rounded-md border border-border bg-background px-2 py-1 text-sm"
                      />
                      <button
                        onClick={() => removeItem(item.variantId)}
                        className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <Trash2 className="h-3 w-3" /> Remove
                      </button>
                    </div>
                  </div>
                  <div className="text-right font-semibold tabular-nums">
                    {item.price.currencyCode} {(parseFloat(item.price.amount) * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <aside className="rounded-3xl border border-border bg-background/60 backdrop-blur p-6 h-fit lg:sticky lg:top-28">
              <h2 className="font-display text-2xl">Summary</h2>
              <div className="mt-6 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="tabular-nums">
                    {currency} {subtotal.toFixed(2)}
                  </span>
                </div>
                {applied && (
                  <>
                    <div className="flex justify-between text-[color:var(--gold,#c9a24a)]">
                      <span className="inline-flex items-center gap-1">
                        <Gift className="h-3.5 w-3.5" /> {applied.code} ({applied.percentOff}% OFF)
                      </span>
                      <span className="tabular-nums">-{currency} {discount.toFixed(2)}</span>
                    </div>
                    {hasExcluded && (
                      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        Sale items excluded from coupon ({currency} {excludedSubtotal.toFixed(2)})
                      </p>
                    )}
                  </>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-muted-foreground">Calculated at next step</span>
                </div>
                <div className="mt-4 border-t border-border pt-4 flex justify-between text-lg">
                  <span className="font-display">Total</span>
                  <span className="font-display tabular-nums">
                    {currency} {total.toFixed(2)}
                  </span>
                </div>
              </div>

              {!applied ? (
                <div className="mt-5">
                  <label className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                    Reward coupon
                  </label>
                  <div className="mt-2 flex gap-2">
                    <input
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="FRASS40-XXXXXXXX"
                      className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm uppercase tracking-wider"
                    />
                    <button
                      type="button"
                      onClick={applyCoupon}
                      disabled={checking || !couponInput.trim()}
                      className="rounded-md bg-foreground px-4 text-xs uppercase tracking-[0.2em] text-background disabled:opacity-40"
                    >
                      {checking ? "…" : "Apply"}
                    </button>
                  </div>
                  <Link
                    to="/rewards"
                    className="mt-2 inline-flex items-center gap-1 text-[11px] text-[color:var(--gold,#c9a24a)] hover:underline"
                  >
                    <Gift className="h-3 w-3" /> Unlock 40% OFF your first order
                  </Link>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setApplied(null);
                    setCouponInput("");
                  }}
                  className="mt-3 text-[11px] text-muted-foreground hover:text-foreground underline"
                >
                  Remove coupon
                </button>
              )}

              <button
                onClick={handleCheckout}
                disabled={isLoading || redirecting}
                className="mt-6 w-full h-12 inline-flex items-center justify-center gap-2 rounded-full bg-foreground text-background uppercase tracking-[0.2em] text-xs font-medium transition hover:bg-foreground/90 disabled:opacity-60"
              >
                {redirecting || isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Lock className="h-4 w-4" /> Complete purchase
                  </>
                )}
              </button>
              <p className="mt-3 text-[11px] text-center text-muted-foreground uppercase tracking-[0.2em]">
                Secure Shopify Checkout · Taxes & shipping calculated next step
              </p>
            </aside>
          </div>
        )}
      </section>
    </SiteShell>
  );
}
