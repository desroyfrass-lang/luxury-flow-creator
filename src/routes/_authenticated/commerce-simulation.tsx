import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { CheckCircle2, ShieldCheck, XCircle } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { SecurityConfirmation } from "@/components/finance/security-confirmation";
import { money } from "@/lib/finance/financial-center";
import { reconciliationStatement } from "@/lib/finance/receipts";
import { runDayInTheLife } from "@/lib/commerce-simulation";
import {
  AUTOMATIC_ON_APPROVAL,
  CUSTOMER_STEPS,
  SELLER_NEVER_ACTIONS,
  SELLER_ONLY_SEES,
  SELLER_STEPS,
  ZERO_FRICTION_PRINCIPLE,
} from "@/lib/zero-friction";

export const Route = createFileRoute("/_authenticated/commerce-simulation")({
  head: () => ({
    meta: [
      { title: "Zero-Friction Commerce Simulation — Frass" },
      {
        name: "description",
        content:
          "A day-in-the-life walkthrough of every Frass sale: farmer, artist, musician, gift, Quick Sell, Frass Card, recruitment bonus, founder allocation and withdrawal.",
      },
      { property: "og:title", content: "Zero-Friction Commerce Simulation" },
      {
        property: "og:description",
        content: "Nine everyday sales, checked end to end for receipts, wallets, audit trail and customer safety.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: CommerceSimulationPage,
});

const panel = "rounded-3xl border border-border/60 bg-background/60 p-6 backdrop-blur";
const label = "text-xs uppercase tracking-[0.25em] text-muted-foreground";

function CommerceSimulationPage() {
  const report = useMemo(() => runDayInTheLife(), []);

  return (
    <SiteShell>
      <main className="mx-auto w-full max-w-5xl px-5 py-12">
        <header>
          <p className={label}>FRASS-0438 · Zero-Friction Commerce Constitution</p>
          <h1 className="mt-2 text-4xl font-black uppercase tracking-tight">Day-in-the-life simulation</h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{ZERO_FRICTION_PRINCIPLE}</p>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            <strong>Here's the practical version:</strong> we walked nine ordinary sales all the
            way through — a watermelon, a painting, a tour tee, a gift, a bonus, a payout — and
            checked that the money, the receipt and the customer's privacy all landed where they
            should. Like a dress rehearsal with real staging instead of a checklist.
          </p>
        </header>

        <div className={`${panel} mt-8`}>
          <p className={label}>Result</p>
          <p className="mt-2 flex items-center gap-2 text-lg font-semibold">
            {report.passed ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-500" aria-hidden />
            ) : (
              <XCircle className="h-5 w-5 text-destructive" aria-hidden />
            )}
            {report.statement}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">{reconciliationStatement(report.totals)}</p>
        </div>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <div className={panel}>
            <p className={label}>Seller · three taps</p>
            <ul className="mt-3 space-y-2 text-sm">
              {SELLER_STEPS.map((s) => (
                <li key={s.step}>
                  <strong>{s.step}</strong>
                  <span className="block text-muted-foreground">{s.plain}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className={panel}>
            <p className={label}>Customer · one screen</p>
            <ul className="mt-3 space-y-2 text-sm">
              {CUSTOMER_STEPS.map((s) => (
                <li key={s.step}>
                  <strong>{s.step}</strong>
                  <span className="block text-muted-foreground">{s.plain}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className={panel}>
            <p className={label}>Automatic on approval</p>
            <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
              {AUTOMATIC_ON_APPROVAL.map((a) => (
                <li key={a}>· {a}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-4 grid gap-4 md:grid-cols-2">
          <div className={panel}>
            <p className={label}>
              <ShieldCheck className="mr-2 inline h-3.5 w-3.5" /> The seller never
            </p>
            <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
              {SELLER_NEVER_ACTIONS.map((a) => (
                <li key={a}>· {a}</li>
              ))}
            </ul>
          </div>
          <div className={panel}>
            <p className={label}>The seller only sees</p>
            <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
              {SELLER_ONLY_SEES.map((a) => (
                <li key={a}>· {a}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-8 space-y-4">
          {report.results.map((r) => (
            <article key={r.input.id} className={panel}>
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h2 className="text-lg font-bold">{r.input.title}</h2>
                <span className={r.passed ? "text-sm text-emerald-500" : "text-sm text-destructive"}>
                  {r.passed ? "Passed" : "Needs attention"}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {r.input.seller} · {r.input.item} · {money(r.receipt.gross)} →{" "}
                {r.receipt.direction === "in" ? `${money(r.receipt.net)} net` : "paid out"}
              </p>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <p className={label}>Customer</p>
                  <ol className="mt-2 space-y-1 text-sm text-muted-foreground">
                    {r.customerJourney.map((s) => (
                      <li key={s}>· {s}</li>
                    ))}
                  </ol>
                </div>
                <div>
                  <p className={label}>Seller</p>
                  <ol className="mt-2 space-y-1 text-sm text-muted-foreground">
                    {r.sellerJourney.map((s) => (
                      <li key={s}>· {s}</li>
                    ))}
                  </ol>
                </div>
              </div>

              <ul className="mt-4 space-y-1 text-sm">
                {r.checks.map((c) => (
                  <li key={c.label} className="flex gap-2">
                    {c.pass ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden />
                    ) : (
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden />
                    )}
                    <span>
                      <strong>{c.label}.</strong>{" "}
                      <span className="text-muted-foreground">{c.detail}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <SecurityConfirmation className="mt-8" />

        <p className="mt-6 text-sm text-muted-foreground">
          <Link to="/financial-center">Open the Financial Center</Link> to see the real receipts
          behind live payments.
        </p>
      </main>
    </SiteShell>
  );
}
