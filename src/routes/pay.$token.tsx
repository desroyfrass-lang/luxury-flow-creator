import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, Lock, ShieldCheck, WifiOff } from "lucide-react";
import { money, providerLabel } from "@/lib/card-commerce";
import { SecurityConfirmation } from "@/components/finance/security-confirmation";
import { SELLER_NEVER_PROMISE } from "@/lib/zero-friction";
import {
  CUSTOMER_CONTROL_PRINCIPLE,
  DUPLICATE_PROTECTION_PROMISE,
  PAYMENT_SUCCESS_REASSURANCE,
  RECOVERY_PROMISE,
  SECURE_CHECKOUT_ASSURANCES,
  requestHeadline,
  requestKindLabel,
  statusLabel,
  statusPlain,
  type RequestStatus,
} from "@/lib/payment-request";
import {
  approvePaymentRequest,
  checkPaymentOutcome,
  declinePaymentRequest,
  getPaymentRequest,
} from "@/lib/payment-request.functions";

export const Route = createFileRoute("/pay/$token")({
  head: () => ({
    meta: [
      { title: "Secure Frass Checkout — Approve your payment request" },
      {
        name: "description",
        content:
          "Review your Frass payment request and approve it on your own device. Encrypted, PCI-compliant processing — the seller never receives your card or banking information.",
      },
      { property: "og:title", content: "Secure Frass Checkout" },
      {
        property: "og:description",
        content: "Approve your payment request on your own trusted device. The seller never sees your payment details.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PaymentRequestScreen,
});

const shell = "mx-auto w-full max-w-md px-5 py-10";
const card = "rounded-3xl border border-border/60 bg-background/70 p-6 backdrop-blur";

type Approved = {
  order_id: string;
  pay_url: string | null;
  provider: string | null;
  total: number;
  currency: string;
  duplicate: boolean;
};

function PaymentRequestScreen() {
  const { token } = Route.useParams();
  const getFn = useServerFn(getPaymentRequest);
  const approveFn = useServerFn(approvePaymentRequest);
  const declineFn = useServerFn(declinePaymentRequest);
  const outcomeFn = useServerFn(checkPaymentOutcome);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["payment-request", token],
    queryFn: () => getFn({ data: { token } }),
  });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<Approved | null>(null);
  const [recovery, setRecovery] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  /** FRASS-0439 — one tap, one payment. The ref survives re-renders. */
  const submitting = useRef(false);

  /** Ask the one true question: what actually happened to this payment? */
  const recheck = useCallback(async () => {
    try {
      const res = await outcomeFn({ data: { token } });
      if (!res.found) return;
      setRecovery(res.message);
      if (res.charged && res.order_id) {
        setDone({
          order_id: res.order_id,
          pay_url: null,
          provider: null,
          total: res.total,
          currency: res.currency,
          duplicate: true,
        });
      }
      void refetch();
    } catch {
      /* still offline — the listener will fire again */
    }
  }, [outcomeFn, refetch, token]);

  // Lost connection recovery: when the device comes back, Frass checks for you.
  useEffect(() => {
    if (typeof window === "undefined") return;
    setOffline(!navigator.onLine);
    const goOffline = () => setOffline(true);
    const goOnline = () => {
      setOffline(false);
      void recheck();
    };
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, [recheck]);

  if (isLoading) {
    return (
      <main className={shell}>
        <p className="text-sm text-muted-foreground">Opening your secure checkout…</p>
      </main>
    );
  }

  if (!data?.ok) {
    return (
      <main className={shell}>
        <div className={card}>
          <h1 className="text-2xl font-black uppercase tracking-tight">Nothing to pay</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {data && "reason" in data ? data.reason : "This payment request could not be found."}
          </p>
        </div>
      </main>
    );
  }

  const r = data.request;
  const total = Math.round(r.amount * r.quantity * 100) / 100;
  const status = r.status as RequestStatus;

  const approve = async () => {
    // Duplicate protection starts on the device and is enforced on the server.
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setError(null);
    try {
      const res = await approveFn({
        data: {
          token,
          buyer_name: name.trim() || undefined,
          buyer_email: email.trim() || undefined,
        },
      });
      if (!res.ok) {
        setError(res.reason);
        submitting.current = false;
        void refetch();
        return;
      }
      setDone({
        order_id: res.order_id,
        pay_url: res.pay_url,
        provider: res.provider,
        total: res.total,
        currency: res.currency,
        duplicate: Boolean(res.duplicate),
      });
      if (res.pay_url) window.location.href = res.pay_url;
    } catch {
      // The connection may have dropped mid-approval — never guess, go and look.
      await recheck();
      submitting.current = false;
      setError(
        "We lost the connection while approving. Frass has re-checked this payment for you — see the status above.",
      );
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <main className={shell}>
        <div className={card}>
          <h1 className="text-2xl font-black uppercase tracking-tight">
            <CheckCircle2 className="mr-2 inline h-5 w-5" />
            {done.duplicate ? "Already paid" : "Approved"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {done.duplicate
              ? `This request was already completed for ${money(done.total, done.currency)}. You have not been charged twice.`
              : `You are being handed to ${providerLabel(done.provider)} to finish paying ${money(done.total, done.currency)}. Your card details stay between you and them.`}
          </p>
          {done.pay_url && (
            <a className="daily-enter mt-5 inline-flex w-full justify-center" href={done.pay_url}>
              Continue to secure payment
            </a>
          )}
          <p className="mt-3 text-xs text-muted-foreground">Order {done.order_id.slice(0, 8).toUpperCase()}</p>

          {/* FRASS-0439 — customer reassurance, every single time. */}
          <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
            {PAYMENT_SUCCESS_REASSURANCE.map((line) => (
              <li key={line}>✓ {line}</li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">{DUPLICATE_PROTECTION_PROMISE}</p>
        </div>
        {/* FRASS-0438 — Security Confirmation, every completed payment. */}
        <SecurityConfirmation className="mt-5" reference={done.order_id} />
      </main>
    );
  }

  return (
    <main className={shell}>
      <header className="mb-5 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          <ShieldCheck className="mr-2 inline h-3.5 w-3.5" /> Secure Frass Checkout
        </p>
        <h1 className="mt-2 text-xl font-black uppercase tracking-tight">Payment request</h1>
      </header>

      {offline && (
        <p className="mb-4 flex items-start gap-2 rounded-2xl border border-amber-500/40 bg-amber-500/5 p-3 text-sm">
          <WifiOff className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>
            You are offline. Nothing has been charged. When you reconnect, Frass will check this
            payment for you automatically.
          </span>
        </p>
      )}
      {recovery && (
        <p className="mb-4 rounded-2xl border border-border/60 bg-background/50 p-3 text-sm text-muted-foreground">
          {recovery}
        </p>
      )}

      <div className={card}>
        <div className="flex items-center gap-3">
          {r.seller_avatar && (
            <img
              src={r.seller_avatar}
              alt={`${r.seller_name} profile picture`}
              className="h-11 w-11 rounded-full object-cover"
              loading="lazy"
            />
          )}
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">From</p>
            <p className="truncate font-semibold">{r.seller_name}</p>
          </div>
        </div>

        <p className="mt-5 text-sm text-muted-foreground">{requestKindLabel(r.kind)}</p>
        <p className="text-lg font-semibold">
          {r.title}
          {r.quantity > 1 ? ` × ${r.quantity}` : ""}
        </p>
        {r.note && <p className="mt-1 text-sm text-muted-foreground">{r.note}</p>}

        <div className="mt-5 rounded-2xl border border-border/60 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Amount due</p>
          <p className="mt-1 text-4xl font-black">{money(total, r.currency)}</p>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">{requestHeadline(r.seller_name, total, r.title, r.currency)}</p>

        {status !== "awaiting_approval" ? (
          <div className="mt-5 rounded-xl border border-border/60 p-3 text-sm text-muted-foreground">
            <p>
              {statusLabel(status)} — {statusPlain(status)}
            </p>
            <button type="button" className="ws-chip mt-3" onClick={() => void recheck()}>
              Check this payment again
            </button>
          </div>
        ) : !r.payments_enabled ? (
          <p className="mt-5 rounded-xl border border-border/60 p-3 text-sm text-muted-foreground">
            This seller has not switched on payments yet, so this request cannot be approved.
          </p>
        ) : (
          <>
            <div className="card-shop-checkout mt-5 grid gap-3">
              <label className="text-sm">
                Your name (optional)
                <input value={name} maxLength={120} onChange={(e) => setName(e.target.value)} />
              </label>
              <label className="text-sm">
                Email for your receipt (optional)
                <input value={email} inputMode="email" maxLength={255} onChange={(e) => setEmail(e.target.value)} />
              </label>
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              Choose how you pay on the next screen — Apple Pay, Google Pay, credit or debit card, or
              another method your provider supports.
            </p>

            <button
              type="button"
              className="daily-enter mt-4 w-full"
              disabled={busy || offline}
              onClick={() => void approve()}
            >
              {busy ? "Approving…" : `Approve payment · ${money(total, r.currency)}`}
            </button>
            <button
              type="button"
              className="ws-chip mt-3 w-full justify-center"
              disabled={busy}
              onClick={async () => {
                await declineFn({ data: { token } });
                void refetch();
              }}
            >
              Decline
            </button>
            {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
            <p className="mt-3 text-xs text-muted-foreground">{DUPLICATE_PROTECTION_PROMISE}</p>
          </>
        )}

        {r.expires_at && status === "awaiting_approval" && (
          <p className="mt-3 text-xs text-muted-foreground">
            This request expires {new Date(r.expires_at).toLocaleString()}. If it runs out, the
            seller can simply send a new one.
          </p>
        )}
      </div>

      <section className="mt-5 rounded-3xl border border-border/60 bg-background/50 p-5 text-sm">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
          <Lock className="mr-2 inline h-3.5 w-3.5" /> Secure Frass Checkout
        </p>
        <ul className="mt-3 space-y-1 text-muted-foreground">
          {SECURE_CHECKOUT_ASSURANCES.map((a) => (
            <li key={a}>· {a}</li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">{CUSTOMER_CONTROL_PRINCIPLE}</p>
        <p className="mt-1 text-xs text-muted-foreground">{SELLER_NEVER_PROMISE}</p>
        <p className="mt-1 text-xs text-muted-foreground">{RECOVERY_PROMISE}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          <strong>What this means in plain English:</strong> you are approving a bill on your own
          phone. Your card never leaves your hands, the seller only ever hears "paid", and if your
          signal drops we go and find out what happened instead of asking you to guess.
        </p>
      </section>
    </main>
  );
}
