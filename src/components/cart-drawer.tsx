import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ShoppingBag, Minus, Plus, Trash2, ExternalLink, Loader2, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useCartStore } from "@/lib/cart-store";

export function CartDrawer() {
  const [open, setOpen] = useState(false);
  const items = useCartStore((s) => s.items);
  const isLoading = useCartStore((s) => s.isLoading);
  const isSyncing = useCartStore((s) => s.isSyncing);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const getCheckoutUrl = useCartStore((s) => s.getCheckoutUrl);
  const syncCart = useCartStore((s) => s.syncCart);

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => s + parseFloat(i.price.amount) * i.quantity, 0);
  const currency = items[0]?.price.currencyCode ?? "USD";

  useEffect(() => {
    if (open) syncCart();
  }, [open, syncCart]);

  const checkout = () => {
    const url = getCheckoutUrl();
    if (url) {
      window.open(url, "_blank");
      setOpen(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/70 backdrop-blur transition hover:border-[color:var(--gold)] hover:shadow-[0_0_0_4px_oklch(0.92_0.08_85_/_0.25)]"
          aria-label="Cart"
        >
          <ShoppingBag className="h-4 w-4" />
          {totalItems > 0 && (
            <Badge className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] bg-[color:var(--gold)] text-foreground">
              {totalItems}
            </Badge>
          )}
        </button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col h-full">
        <SheetHeader>
          <SheetTitle className="font-display text-3xl">Your Selection</SheetTitle>
          <SheetDescription>
            {totalItems === 0
              ? "Your selection is empty."
              : `${totalItems} piece${totalItems !== 1 ? "s" : ""} reserved.`}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col flex-1 pt-6 min-h-0">
          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nothing here yet.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto pr-2 min-h-0">
                <div className="space-y-5">
                  {items.map((item) => (
                    <div key={item.variantId} className="flex gap-4">
                      <div className="w-20 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                        {item.product.node.images?.edges?.[0]?.node && (
                          <img
                            src={item.product.node.images.edges[0].node.url}
                            alt={item.product.node.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{item.product.node.title}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.selectedOptions.map((o) => o.value).join(" • ")}
                        </p>
                        <p className="mt-1 font-semibold tabular-nums">
                          {item.price.currencyCode} {parseFloat(item.price.amount).toFixed(2)}
                        </p>
                        <div className="mt-2 flex items-center gap-1">
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            className="h-7 w-7 inline-flex items-center justify-center rounded-full border border-border hover:border-foreground"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center text-sm tabular-nums">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            className="h-7 w-7 inline-flex items-center justify-center rounded-full border border-border hover:border-foreground"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.variantId)}
                        className="self-start text-muted-foreground hover:text-foreground"
                        aria-label="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-5 mt-4 border-t space-y-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Subtotal</span>
                  <span className="text-xl font-display">
                    {currency} {totalPrice.toFixed(2)}
                  </span>
                </div>
                <Link
                  to="/try-on"
                  onClick={() => setOpen(false)}
                  className="w-full h-12 inline-flex items-center justify-center gap-2 rounded-full border border-[color:var(--gold)] text-[color:var(--gold)] uppercase tracking-[0.2em] text-xs font-medium transition hover:bg-[color:var(--gold)] hover:text-[color:var(--ink)]"
                >
                  <Sparkles className="h-4 w-4" /> Try it on
                </Link>
                <button
                  onClick={checkout}
                  disabled={isLoading || isSyncing}
                  className="w-full h-12 inline-flex items-center justify-center gap-2 rounded-full bg-foreground text-background uppercase tracking-[0.2em] text-xs font-medium transition hover:bg-foreground/90 disabled:opacity-60"
                >
                  {isLoading || isSyncing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <ExternalLink className="h-4 w-4" /> Checkout
                    </>
                  )}
                </button>
                <p className="text-[10px] text-center text-muted-foreground uppercase tracking-[0.2em]">
                  Secure Shopify Checkout · AI Try-On preview
                </p>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
