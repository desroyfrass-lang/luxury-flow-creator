import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { useCartStore } from "@/lib/cart-store";
import { Trash2, ArrowLeft, Lock, Gift } from "lucide-react";
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

  const subtotal = items.reduce((s, i) => s + parseFloat(i.price.amount) * i.quantity, 0);
  const currency = items[0]?.price.currencyCode ?? "USD";

  const [couponInput, setCouponInput] = useState("");
  const [applied, setApplied] = useState<{ code: string; percentOff: number } | null>(null);
  const [checking, setChecking] = useState(false);
  const validate = useServerFn(validateCoupon);
  const discount = applied ? subtotal * (applied.percentOff / 100) : 0;
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
                <div
                  key={item.variantId}
                  className="flex gap-5 border-b border-border pb-6"
                >
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
                      <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        Qty
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(item.variantId, Math.max(1, Number(e.target.value)))
                        }
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
                    {item.price.currencyCode}{" "}
                    {(parseFloat(item.price.amount) * item.quantity).toFixed(2)}
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
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-muted-foreground">Calculated at next step</span>
                </div>
                <div className="mt-4 border-t border-border pt-4 flex justify-between text-lg">
                  <span className="font-display">Total</span>
                  <span className="font-display tabular-nums">
                    {currency} {subtotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                disabled
                className="mt-6 w-full h-12 inline-flex items-center justify-center gap-2 rounded-full bg-foreground text-background uppercase tracking-[0.2em] text-xs font-medium opacity-60 cursor-not-allowed"
              >
                <Lock className="h-4 w-4" /> Complete purchase
              </button>
              <p className="mt-3 text-[11px] text-center text-muted-foreground uppercase tracking-[0.2em]">
                Payments coming soon
              </p>
            </aside>
          </div>
        )}
      </section>
    </SiteShell>
  );
}
