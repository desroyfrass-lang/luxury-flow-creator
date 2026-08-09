import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ShoppingBag } from "lucide-react";
import { kindLabel, money, remaining } from "@/lib/card-commerce";
import { startCardCheckout } from "@/lib/card-commerce.functions";
import { SecurityConfirmation } from "@/components/finance/security-confirmation";

export type PublicListing = {
  id: string;
  kind: string;
  title: string;
  description: string | null;
  image_url: string | null;
  price: number;
  currency: string;
  quantity: number | null;
  sold: number;
  status: string;
  is_quick_sell: boolean;
};

/**
 * FRASS-0427 — the public half of Frass Card Commerce.
 * Payment happens on the member's own connected account; Frass records the sale.
 */
export function CardStorefront({
  listings,
  onSale,
}: {
  listings: PublicListing[];
  onSale?: () => void;
}) {
  const live = listings.filter((l) => l.status === "live" || l.status === "sold_out");
  if (live.length === 0) return null;

  return (
    <section className="living-card-block" id="card-shop">
      <h2 className="living-card-block-title">
        <ShoppingBag className="mr-2 inline h-4 w-4" /> Shop
      </h2>
      <p className="living-card-prose text-sm">
        One item or five hundred — same shop. Payments are handled by this member's own payment
        account. Frass records the sale.
      </p>
      <div className="card-shop-grid">
        {live.map((l) => (
          <ListingCard key={l.id} listing={l} onSale={onSale} />
        ))}
      </div>
    </section>
  );
}

function ListingCard({ listing, onSale }: { listing: PublicListing; onSale?: () => void }) {
  const checkoutFn = useServerFn(startCardCheckout);
  const [open, setOpen] = useState(false);
  const [qty, setQty] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [secured, setSecured] = useState<string | null>(null);

  const left = remaining(listing.quantity, listing.sold);
  const soldOut = listing.status === "sold_out" || left === 0;

  const checkout = useMutation({
    mutationFn: () =>
      checkoutFn({
        data: {
          listing_id: listing.id,
          quantity: qty,
          ...(name.trim() ? { buyer_name: name.trim() } : {}),
          ...(email.trim() ? { buyer_email: email.trim() } : {}),
        },
      }),
    onSuccess: (res) => {
      if (!res.ok) {
        setMessage(res.reason);
        return;
      }
      onSale?.();
      setMessage("Opening secure payment…");
      setSecured(res.order_id ?? null);
      window.open(res.pay_url, "_blank", "noopener,noreferrer");
    },
    onError: () => setMessage("Checkout could not be started. Try again in a moment."),
  });

  return (
    <article className="card-shop-item">
      {listing.image_url && <img src={listing.image_url} alt="" />}
      <div className="card-shop-item-body">
        <span className="card-shop-kind">{kindLabel(listing.kind)}</span>
        <h3>{listing.title}</h3>
        {listing.description && <p>{listing.description}</p>}
        <div className="card-shop-price-row">
          <strong>{money(Number(listing.price), listing.currency)}</strong>
          <span>{left == null ? "Available" : soldOut ? "Sold out" : `${left} left`}</span>
        </div>

        {soldOut ? (
          <button className="ws-chip mt-2 w-full opacity-60" type="button" disabled>
            Sold out
          </button>
        ) : !open ? (
          <button className="daily-enter mt-2 w-full" type="button" onClick={() => setOpen(true)}>
            Buy now
          </button>
        ) : (
          <div className="card-shop-checkout">
            <label>
              Quantity
              <input
                type="number"
                min={1}
                max={left ?? 100}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
              />
            </label>
            <input
              placeholder="Your name"
              value={name}
              maxLength={120}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              placeholder="Email for your receipt"
              type="email"
              value={email}
              maxLength={255}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              className="daily-enter w-full"
              type="button"
              disabled={checkout.isPending}
              onClick={() => checkout.mutate()}
            >
              {checkout.isPending
                ? "Preparing…"
                : `Pay ${money(Number(listing.price) * qty, listing.currency)}`}
            </button>
            {message && <p className="card-shop-note">{message}</p>}
            {/* FRASS-0438 — Security Confirmation on every completed payment. */}
            {secured && <SecurityConfirmation className="mt-3" reference={secured} plain={false} />}
          </div>
        )}
      </div>
    </article>
  );
}
