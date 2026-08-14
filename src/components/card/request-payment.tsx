import { useMemo, useState } from "react";
import { LaunchPending } from "@/components/launch-mode-banner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import QRCode from "qrcode";
import { Copy, QrCode, Send, ShieldCheck, X } from "lucide-react";
import { money } from "@/lib/card-commerce";
import {
  CUSTOMER_CONTROL_PRINCIPLE,
  DELIVERY_METHODS,
  PAYMENT_REQUEST_PRINCIPLE,
  REQUEST_KINDS,
  DEFAULT_EXPIRY_MINUTES,
  DUPLICATE_PROTECTION_PROMISE,
  EXPIRY_OPTIONS,
  REQUEST_STATUS,
  SELLER_NEVER_SEES,
  newIdempotencyKey,
  deliveryLabel,
  paymentRequestUrl,
  requestKindLabel,
  type DeliveryId,
  type RequestKindId,
  type RequestStatus,
} from "@/lib/payment-request";
import {
  cancelPaymentRequest,
  createPaymentRequest,
  listMyPaymentRequests,
  type PaymentRequestRow,
} from "@/lib/payment-request.functions";

const panel = "rounded-2xl border border-border/60 bg-background/60 p-6 backdrop-blur";
const heading = "text-xs uppercase tracking-[0.25em] text-muted-foreground";

/**
 * FRASS-0436 — Request Payment.
 * The seller names the sale. The customer approves it on their own phone.
 */
export function RequestPaymentPanel({
  enabled,
  launchPending = false,
}: {
  enabled: boolean;
  /** FRASS-0462 — payments are intentionally off until Frass launches. */
  launchPending?: boolean;
}) {
  const qc = useQueryClient();
  const listFn = useServerFn(listMyPaymentRequests);
  const createFn = useServerFn(createPaymentRequest);
  const cancelFn = useServerFn(cancelPaymentRequest);

  const { data: requests } = useQuery({
    queryKey: ["payment-requests"],
    queryFn: () => listFn(),
  });

  const [kind, setKind] = useState<RequestKindId>("sale");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [note, setNote] = useState("");
  const [delivery, setDelivery] = useState<DeliveryId>("qr");
  const [expiresIn, setExpiresIn] = useState<number>(DEFAULT_EXPIRY_MINUTES);
  /** FRASS-0439 — one key per draft, so a double tap makes one request. */
  const [idemKey, setIdemKey] = useState<string>(() => newIdempotencyKey());
  const [live, setLive] = useState<PaymentRequestRow | null>(null);
  const [qr, setQr] = useState<string | null>(null);

  const value = Math.max(0, Number(amount) || 0);
  const qty = Math.max(1, Number(quantity) || 1);
  const total = Math.round(value * qty * 100) / 100;

  const create = useMutation({
    mutationFn: async () =>
      createFn({
        data: {
          kind,
          title: title.trim(),
          amount: value,
          quantity: qty,
          note: note.trim() || undefined,
          delivery,
          expires_in_minutes: expiresIn,
          idempotency_key: idemKey,
        },
      }),
    onSuccess: async (row) => {
      setLive(row);
      setQr(
        await QRCode.toDataURL(paymentRequestUrl(row.token), {
          margin: 1,
          width: 480,
          color: { dark: "#0b0b0bff", light: "#ffffffff" },
        }),
      );
      setTitle("");
      setAmount("");
      setQuantity("1");
      setNote("");
      setIdemKey(newIdempotencyKey());
      void qc.invalidateQueries({ queryKey: ["payment-requests"] });
      toast.success("Payment request ready. Hand them their own screen.");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "That request could not be created."),
  });

  const cancel = useMutation({
    mutationFn: (id: string) => cancelFn({ data: { id } }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["payment-requests"] }),
  });

  const url = live ? paymentRequestUrl(live.token) : "";
  const open = useMemo(() => (requests ?? []).filter((r) => ["preparing", "awaiting_approval", "processing"].includes(r.status)), [requests]);

  return (
    <div className="space-y-6">
      <section className={panel}>
        <h2 className={heading}>
          <Send className="mr-2 inline h-3.5 w-3.5" /> Request payment
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">{PAYMENT_REQUEST_PRINCIPLE}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          <strong>Here's what this means:</strong> you never ask to borrow their phone and
          they never type a card into yours. You name the sale, they approve it on their own device —
          like approving a bill that pops up on their screen.
        </p>

        {launchPending && (
          <div className="mt-4 rounded-xl border border-[color:var(--gold,#d4af37)]/35 bg-[color:var(--gold,#d4af37)]/[0.07] p-3 text-sm">
            <LaunchPending />
            <p className="mt-2 text-muted-foreground">
              Nothing is broken. Payment requests activate the day Frass launches — build your
              listings and pricing now so the first one goes out that morning.
            </p>
          </div>
        )}

        {!launchPending && !enabled && (
          <p className="mt-4 rounded-xl border border-border/60 p-3 text-sm text-muted-foreground">
            Payments are switched off on your Frass Card, so a request cannot be approved yet. Turn
            them on in Payment account.
          </p>
        )}

        <div className="card-shop-checkout mt-5 grid gap-3">
          <label className="text-sm">
            What is this for?
            <input
              value={title}
              maxLength={120}
              placeholder="6 lbs fresh watermelon"
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="text-sm">
              Amount (USD)
              <input inputMode="decimal" value={amount} placeholder="18.00" onChange={(e) => setAmount(e.target.value)} />
            </label>
            <label className="text-sm">
              Quantity
              <input inputMode="numeric" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            </label>
            <label className="text-sm">
              Kind
              <select
                className="w-full rounded-md border border-border/60 bg-background/60 p-2 text-sm"
                value={kind}
                onChange={(e) => setKind(e.target.value as RequestKindId)}
              >
                {REQUEST_KINDS.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="text-sm">
            Note (optional)
            <input value={note} maxLength={240} onChange={(e) => setNote(e.target.value)} />
          </label>

          <div>
            <p className={heading}>How it reaches them</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {DELIVERY_METHODS.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  title={d.plain}
                  disabled={d.id === "push"}
                  className={`ws-chip${delivery === d.id ? " is-on" : ""}`}
                  onClick={() => setDelivery(d.id)}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>


          <div>
            <p className={heading}>How long it stays open</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {EXPIRY_OPTIONS.map((o) => (
                <button
                  key={o.minutes}
                  type="button"
                  className={`ws-chip${expiresIn === o.minutes ? " is-on" : ""}`}
                  onClick={() => setExpiresIn(o.minutes)}
                >
                  {o.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              After that it expires on its own. Nothing is ever charged on an expired request — you
              simply send a fresh one.
            </p>
          </div>

          <p className="text-sm">
            Total requested: <strong>{money(total)}</strong>
          </p>
          <p className="text-xs text-muted-foreground">{DUPLICATE_PROTECTION_PROMISE}</p>


          <button
            type="button"
            className="daily-enter w-full"
            disabled={launchPending || !title.trim() || total <= 0 || create.isPending}
            onClick={() => create.mutate()}
          >
            {launchPending ? "Available at Launch" : create.isPending ? "Creating…" : "Request payment"}
          </button>
        </div>
      </section>

      {live && (
        <section className={panel}>
          <h2 className={heading}>
            <QrCode className="mr-2 inline h-3.5 w-3.5" /> Hand them their own screen
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Delivery chosen: <strong>{deliveryLabel(live.delivery)}</strong>. However it travels, the
            customer sees the same secure screen on their own device.
          </p>
          <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            {qr && (
              <img
                src={qr}
                alt={`QR code opening the payment request for ${live.title}`}
                className="h-44 w-44 rounded-xl border border-border/60 bg-white p-2"
              />
            )}
            <div className="min-w-0 flex-1 space-y-3">
              <p className="text-lg font-black">
                {live.title} · {money(Number(live.amount) * live.quantity, live.currency)}
              </p>
              <code className="living-card-url block break-all">{url}</code>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="ws-chip"
                  onClick={() => {
                    void navigator.clipboard.writeText(url);
                    toast.success("Link copied.");
                  }}
                >
                  <Copy className="h-3.5 w-3.5" /> Copy link
                </button>
                {live.delivery === "sms" && (
                  <a className="ws-chip" href={`sms:?&body=${encodeURIComponent(`${live.title} — ${url}`)}`}>
                    Open messages
                  </a>
                )}
                {live.delivery === "email" && (
                  <a
                    className="ws-chip"
                    href={`mailto:?subject=${encodeURIComponent(`Payment request — ${live.title}`)}&body=${encodeURIComponent(url)}`}
                  >
                    Open email
                  </a>
                )}
                <a className="ws-chip" href={url} target="_blank" rel="noreferrer">
                  Preview their screen
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className={panel}>
        <h2 className={heading}>Open requests</h2>
        {open.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">Nothing waiting on a customer.</p>
        ) : (
          <div className="mt-4 space-y-2">
            {open.map((r) => (
              <div
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 p-3 text-sm"
              >
                <div className="min-w-0">
                  <p className="font-medium">
                    {r.title} · {money(Number(r.amount) * r.quantity, r.currency)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {requestKindLabel(r.kind)} · {deliveryLabel(r.delivery)} ·{" "}
                    {REQUEST_STATUS[r.status as RequestStatus]?.label ?? r.status}
                  </p>
                </div>
                <button type="button" className="ws-chip" onClick={() => cancel.mutate(r.id)}>
                  <X className="h-3.5 w-3.5" /> Cancel
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className={panel}>
        <h2 className={heading}>
          <ShieldCheck className="mr-2 inline h-3.5 w-3.5" /> What you never see
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">{CUSTOMER_CONTROL_PRINCIPLE}</p>
        <ul className="mt-3 grid gap-1 text-sm text-muted-foreground sm:grid-cols-2">
          {SELLER_NEVER_SEES.map((x) => (
            <li key={x}>· {x}</li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">
          You are told the payment succeeded, the order number, the customer name where appropriate,
          and anything you need to fulfil the order. Nothing else — that protects you as much as them.
        </p>
      </section>
    </div>
  );
}
