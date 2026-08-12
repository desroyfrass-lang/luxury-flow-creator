import { PlatformProtectionBanner } from "@/components/founder/platform-protection-banner";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  BadgeDollarSign,
  Banknote,
  ExternalLink,
  FileText,
  Gift,
  Link2,
  Receipt,
  Wallet,
} from "lucide-react";
import { PageFeedback } from "@/components/page-feedback";
import { QuickSellPanel } from "@/components/card/quick-sell";
import { RequestPaymentPanel } from "@/components/card/request-payment";
import { LaunchModeBanner, useLaunchMode } from "@/components/launch-mode-banner";
import { FinancialTimeline } from "@/components/finance/financial-timeline";
import { listMyReceipts } from "@/lib/finance/receipts.functions";


import { getMyCard } from "@/lib/card.functions";
import { getMyProfile } from "@/lib/profiles.functions";
import { listMyCardOrders } from "@/lib/card-commerce.functions";
import { ALLOCATION_NOTE, money, providerLabel } from "@/lib/card-commerce";
import { cardUrl } from "@/lib/card";
import {
  WALLET_PRINCIPLE,
  WALLET_SECTIONS,
  orderKindLabel,
  referenceKind,
  statementCsv,
  summariseWallet,
  type WalletSectionId,
} from "@/lib/card-wallet";
import type { CardOrder } from "@/lib/card-commerce.functions";
import { IdentityGate } from "@/components/security/identity-gate";

export const Route = createFileRoute("/_authenticated/workspace/wallet")({
  head: () => ({
    meta: [
      { title: "Frass Wallet — Balance, Quick Sell, Invoices, Statements" },
      {
        name: "description",
        content:
          "Everything financial in one place: available balance, withdraw, deposit, payment history, Quick Sell, invoices, payment links, gifts, tips, taxes and statements.",
      },
      { property: "og:title", content: "Frass Wallet" },
      {
        property: "og:description",
        content: "Balance, Quick Sell, invoices, payment links, gifts, tips, taxes and statements.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    // FRASS-0488 — money and platform authority sit behind the one identity gate.
    <IdentityGate action="wallet">
      <WalletHub />
    </IdentityGate>
  ),
});

const panel = "rounded-2xl border border-border/60 bg-background/60 p-6 backdrop-blur";
const heading = "text-xs uppercase tracking-[0.25em] text-muted-foreground";

function WalletHub() {
  const cardFn = useServerFn(getMyCard);
  const ordersFn = useServerFn(listMyCardOrders);
  const profileFn = useServerFn(getMyProfile);
  const receiptsFn = useServerFn(listMyReceipts);

  const { data: card } = useQuery({ queryKey: ["my-business-card"], queryFn: () => cardFn() });
  const { data: orders } = useQuery({ queryKey: ["card-orders"], queryFn: () => ordersFn() });
  const { data: profile } = useQuery({ queryKey: ["my-profile"], queryFn: () => profileFn() });
  const { data: receipts } = useQuery({ queryKey: ["financial-receipts"], queryFn: () => receiptsFn() });


  const [section, setSection] = useState<WalletSectionId>("balance");
  const launchMode = useLaunchMode();
  const launchPending = !launchMode.paymentsLive;
  const rows = useMemo(() => orders ?? [], [orders]);
  const s = summariseWallet(rows);
  const handle = profile?.handle ?? null;

  const download = () => {
    const blob = new Blob([statementCsv(rows)], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `frass-wallet-statement-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-5 py-10">
      <header>
        <p className={heading}>
          <Wallet className="mr-2 inline h-3.5 w-3.5" /> Frass Wallet
        </p>
        <h1 className="mt-2 text-3xl font-black uppercase tracking-tight">Your counter</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{WALLET_PRINCIPLE}</p>
        <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
          <strong>What this means in plain English:</strong> your Frass Card is the shopfront window;
          the Wallet is the counter behind it. Everything financial lives here — nothing financial
          lives on the card itself.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link className="ws-chip" to="/workspace/card">
            <ExternalLink className="h-3.5 w-3.5" /> Edit my Frass Card
          </Link>
          <Link className="ws-chip" to="/financial-center">
            <BadgeDollarSign className="h-3.5 w-3.5" /> Financial Center
          </Link>
        </div>
      </header>

      <LaunchModeBanner />

      <nav className="flex flex-wrap gap-2">
        {WALLET_SECTIONS.map((w) => (
          <button
            key={w.id}
            type="button"
            className={`ws-chip${section === w.id ? " is-on" : ""}`}
            onClick={() => setSection(w.id)}
            title={w.plain}
          >
            {w.label}
          </button>
        ))}
      </nav>

      {section === "balance" && (
        <>
          <section className={panel}>
            <h2 className={heading}>
              <Banknote className="mr-2 inline h-3.5 w-3.5" /> Available balance
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Stat label="Settled" value={money(s.settled, s.currency)} note="Marked paid by you." />
              <Stat label="Awaiting payment" value={money(s.pending, s.currency)} note="Started, not yet confirmed." />
              <Stat label="Frass allocation" value={money(s.allocation, s.currency)} note="The constitutional 10%." />
              <Stat label="Estimated to you" value={money(s.net, s.currency)} note="After allocation and processing." />
            </div>
            <p className="mt-4 text-xs text-muted-foreground">{ALLOCATION_NOTE}</p>
          </section>

          <section className={panel}>
            <h2 className={heading}>
              <Gift className="mr-2 inline h-3.5 w-3.5" /> Where it came from
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Stat label="Sales" value={money(s.sales, s.currency)} note="Items sold from your card." />
              <Stat label="Gifts" value={money(s.gifts, s.currency)} note="Sent with a note." />
              <Stat label="Tips" value={money(s.tips, s.currency)} note="Thank-yous for your work." />
            </div>
          </section>
        </>
      )}

      {(section === "sell" || section === "items") && (
        <QuickSellPanel provider={card?.payout_provider ?? null} launchPending={launchPending} />
      )}

      {section === "request" && (
        <RequestPaymentPanel
          enabled={Boolean(card?.commerce_enabled && card?.payout_url)}
          launchPending={launchPending}
        />
      )}

      {section === "history" && (
        <section className={panel}>
          <h2 className={heading}>
            <Receipt className="mr-2 inline h-3.5 w-3.5" /> Financial timeline
          </h2>
          <p className="mt-2 mb-5 text-sm text-muted-foreground">
            FRASS-0433 — every movement carries a receipt. Click any line to see where the money came
            from, what was deducted and why.
          </p>
          <FinancialTimeline receipts={receipts ?? []} />
        </section>
      )}


      {section === "gifts" && (
        <MovementList
          title="Gifts"
          rows={rows.filter((o) => referenceKind(o.reference) === "gift")}
          empty="No gifts yet."
        />
      )}

      {section === "tips" && (
        <MovementList
          title="Tips"
          rows={rows.filter((o) => referenceKind(o.reference) === "tip")}
          empty="No tips yet."
        />
      )}

      {(section === "withdraw" || section === "deposit") && (
        <section className={panel}>
          {section === "withdraw" && <PlatformProtectionBanner domain="withdrawals" className="mb-4" />}
          <h2 className={heading}>
            {section === "withdraw" ? (
              <>
                <ArrowUpFromLine className="mr-2 inline h-3.5 w-3.5" /> Withdraw
              </>
            ) : (
              <>
                <ArrowDownToLine className="mr-2 inline h-3.5 w-3.5" /> Deposit
              </>
            )}
          </h2>
          <p className="mt-2 text-sm">
            Money moves through <strong>{providerLabel(card?.payout_provider)}</strong>
            {card?.payout_display_name ? ` — ${card.payout_display_name}` : ""}.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {section === "withdraw"
              ? "Frass never holds your money, so there is nothing here to release. Payments land in your own account and you withdraw to your bank from there."
              : "Deposits arrive the moment someone uses the Pay, Gift, Tip or Shop doors on your Frass Card. Each one is recorded here as it happens."}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            <strong>What this means in plain English:</strong> Frass is the market stall and the
            receipt book, never the cash box.
          </p>
          <a
            className="ws-chip mt-4 inline-flex"
            href={card?.payout_url || "#"}
            target="_blank"
            rel="noreferrer"
            aria-disabled={!card?.payout_url}
          >
            Open my payment account
          </a>
        </section>
      )}

      {(section === "invoices" || section === "links") && (
        <PaymentLinkPanel handle={handle} enabled={Boolean(card?.commerce_enabled && card?.payout_url) && !launchPending} invoice={section === "invoices"} />
      )}

      {section === "taxes" && (
        <section className={panel}>
          <h2 className={heading}>
            <Receipt className="mr-2 inline h-3.5 w-3.5" /> Taxes
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Gross received" value={money(s.settled, s.currency)} note="Everything paid to you." />
            <Stat label="Frass allocation" value={money(s.allocation, s.currency)} note="Platform 10%." />
            <Stat label="Processing (est.)" value={money(s.processing, s.currency)} note="Card fees, estimated." />
            <Stat label="Net to you (est.)" value={money(s.net, s.currency)} note="What you likely declare." />
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            These are records, not tax advice. Estimates are always labelled as estimates — take the
            CSV in Statements to your accountant.
          </p>
        </section>
      )}

      {section === "statements" && (
        <section className={panel}>
          <h2 className={heading}>
            <FileText className="mr-2 inline h-3.5 w-3.5" /> Statements
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {rows.length === 0
              ? "Nothing to export yet. Zeros stay honest."
              : `${rows.length} movement${rows.length === 1 ? "" : "s"} ready to download for your books.`}
          </p>
          <button type="button" className="ws-chip mt-4" disabled={rows.length === 0} onClick={download}>
            <ArrowDownToLine className="h-3.5 w-3.5" /> Download CSV
          </button>
        </section>
      )}

      {section === "payouts" && (
        <section className={panel}>
          <h2 className={heading}>Payment account</h2>
          <p className="mt-2 text-sm">
            Money is paid into <strong>{providerLabel(card?.payout_provider)}</strong>
            {card?.payout_display_name ? ` — ${card.payout_display_name}` : ""}.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {card?.commerce_enabled && card?.payout_url
              ? "Your card is a working point of sale right now."
              : "Payments are switched off, so the Shop, Pay, Gift and Tip doors stay closed on your card."}
          </p>
          <Link className="ws-chip mt-4 inline-flex" to="/workspace/card">
            Change payment settings
          </Link>
        </section>
      )}

      <PageFeedback pageTitle="Frass Wallet" />
    </main>
  );
}

function MovementList({ title, rows, empty }: { title: string; rows: CardOrder[]; empty: string }) {
  return (
    <section className={panel}>
      <h2 className={heading}>{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">{empty}</p>
      ) : (
        <div className="mt-4 space-y-2">
          {rows.map((o) => (
            <div
              key={o.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 p-3 text-sm"
            >
              <div>
                <p className="font-medium">
                  {orderKindLabel(o.reference)} · {money(Number(o.subtotal), o.currency)}{" "}
                  <span className="text-muted-foreground">{o.status}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(o.created_at).toLocaleDateString()} ·{" "}
                  {o.buyer_name || o.buyer_email || "Buyer not named"}
                </p>
              </div>
              <span className="text-xs text-muted-foreground">
                net {money(Number(o.net_to_seller), o.currency)}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/**
 * FRASS-0429 — invoices and payment links are the same object seen twice:
 * a link that opens the Pay door on your Frass Card with the amount ready.
 */
function PaymentLinkPanel({
  handle,
  enabled,
  invoice,
}: {
  handle: string | null;
  enabled: boolean;
  invoice: boolean;
}) {
  const [amount, setAmount] = useState("50");
  const [note, setNote] = useState("");
  const [copied, setCopied] = useState(false);

  const value = Math.max(0, Number(amount) || 0);
  const url = handle
    ? `${cardUrl(handle)}?pay=${value.toFixed(2)}${note.trim() ? `&for=${encodeURIComponent(note.trim())}` : ""}`
    : "";

  return (
    <section className={panel}>
      <h2 className={heading}>
        <Link2 className="mr-2 inline h-3.5 w-3.5" /> {invoice ? "Invoices" : "Payment links"}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {invoice
          ? "An invoice on Frass is a request with a name on it: an amount, what it is for, and a link that opens your Pay door."
          : "A payment link opens the Pay door on your Frass Card with the amount already filled in."}
      </p>
      {!handle && (
        <p className="mt-3 text-sm text-muted-foreground">
          Choose a handle for your Frass Card first — the link is built from it.
        </p>
      )}
      {!enabled && handle && (
        <p className="mt-3 text-sm text-muted-foreground">
          Payments are switched off, so this link will not open a payment door yet.
        </p>
      )}

      <div className="card-shop-checkout mt-4">
        <label>
          Amount (USD)
          <input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </label>
        <input
          placeholder={invoice ? "What is this invoice for?" : "Note (optional)"}
          maxLength={160}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        {url && (
          <>
            <code className="living-card-url">{url}</code>
            <button
              type="button"
              className="daily-enter w-full"
              onClick={() => {
                void navigator.clipboard.writeText(url);
                setCopied(true);
              }}
            >
              {copied ? "Copied" : invoice ? "Copy invoice link" : "Copy payment link"}
            </button>
          </>
        )}
      </div>
    </section>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-xl border border-border/60 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-black">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{note}</p>
    </div>
  );
}
