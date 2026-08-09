import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
  ArrowDownToLine,
  BadgeDollarSign,
  Banknote,
  ExternalLink,
  Gift,
  Wallet,
} from "lucide-react";
import { PageFeedback } from "@/components/page-feedback";
import { QuickSellPanel } from "@/components/card/quick-sell";
import { getMyCard } from "@/lib/card.functions";
import { listMyCardOrders } from "@/lib/card-commerce.functions";
import { ALLOCATION_NOTE, money, providerLabel } from "@/lib/card-commerce";
import {
  WALLET_PRINCIPLE,
  WALLET_SECTIONS,
  orderKindLabel,
  statementCsv,
  summariseWallet,
  type WalletSectionId,
} from "@/lib/card-wallet";

export const Route = createFileRoute("/_authenticated/workspace/wallet")({
  head: () => ({
    meta: [
      { title: "Frass Card Wallet — Sell, Get Paid, Keep the Record" },
      {
        name: "description",
        content:
          "One hub for your Frass Card money: Quick Sell, live items, sales, gifts, tips, your payment account and downloadable statements.",
      },
      { property: "og:title", content: "Frass Card Wallet" },
      {
        property: "og:description",
        content: "Quick Sell, sales, gifts, tips, payouts and statements in one place.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: WalletHub,
});

const panel = "rounded-2xl border border-border/60 bg-background/60 p-6 backdrop-blur";
const heading = "text-xs uppercase tracking-[0.25em] text-muted-foreground";

function WalletHub() {
  const cardFn = useServerFn(getMyCard);
  const ordersFn = useServerFn(listMyCardOrders);

  const { data: card } = useQuery({ queryKey: ["my-business-card"], queryFn: () => cardFn() });
  const { data: orders } = useQuery({ queryKey: ["card-orders"], queryFn: () => ordersFn() });

  const [section, setSection] = useState<WalletSectionId>("balance");
  const rows = orders ?? [];
  const s = summariseWallet(rows);

  const download = () => {
    const blob = new Blob([statementCsv(rows)], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `frass-card-statement-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-5 py-10">
      <header>
        <p className={heading}>
          <Wallet className="mr-2 inline h-3.5 w-3.5" /> Frass Card Wallet
        </p>
        <h1 className="mt-2 text-3xl font-black uppercase tracking-tight">Your counter</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{WALLET_PRINCIPLE}</p>
        <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
          <strong>What this means in plain English:</strong> your card is the shopfront window; this
          is the counter behind it. Same building, two doors.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link className="ws-chip" to="/workspace/card">
            <ExternalLink className="h-3.5 w-3.5" /> Edit my card
          </Link>
          <Link className="ws-chip" to="/financial-center">
            <BadgeDollarSign className="h-3.5 w-3.5" /> Financial Center
          </Link>
        </div>
      </header>

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
              <Banknote className="mr-2 inline h-3.5 w-3.5" /> Balance
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

      {(section === "sell" || section === "items" || section === "activity") && (
        <QuickSellPanel provider={card?.payout_provider ?? null} />
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
              : "Payments are switched off, so the Buy, Send money, Gift and Tip doors stay closed on your card."}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            <strong>What this means in plain English:</strong> Frass is the market stall and the
            receipt book, never the cash box. The money goes straight to you.
          </p>
          <Link className="ws-chip mt-4 inline-flex" to="/workspace/card">
            Change payment settings
          </Link>
        </section>
      )}

      {section === "statements" && (
        <section className={panel}>
          <h2 className={heading}>Statements</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {rows.length === 0
              ? "Nothing to export yet. Zeros stay honest."
              : `${rows.length} movement${rows.length === 1 ? "" : "s"} ready to download for your books.`}
          </p>
          <button type="button" className="ws-chip mt-4" disabled={rows.length === 0} onClick={download}>
            <ArrowDownToLine className="h-3.5 w-3.5" /> Download CSV
          </button>

          {rows.length > 0 && (
            <div className="mt-5 space-y-2">
              {rows.slice(0, 12).map((o) => (
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
      )}

      <PageFeedback pageTitle="Frass Card Wallet" />
    </main>
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
