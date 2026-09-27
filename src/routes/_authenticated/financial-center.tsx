import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { SiteShell } from "@/components/site-shell";
import { TrustCenter } from "@/components/trust/trust-center";
import { CommerceHealth } from "@/components/finance/commerce-health";
import { FinancialTimeline } from "@/components/finance/financial-timeline";
import { TaxIntelligencePanel } from "@/components/finance/tax-intelligence-panel";
import { listMyReceipts } from "@/lib/finance/receipts.functions";
import { useMyRoles } from "@/hooks/use-my-roles";
import { money } from "@/lib/finance/financial-center";
import type { Receipt } from "@/lib/finance/receipts";
import { IdentityGate } from "@/components/security/identity-gate";

export const Route = createFileRoute("/_authenticated/financial-center")({
  head: () => ({
    meta: [
      { title: "Frass Financial Center — Your Receipts & Money Records" },
      { name: "description", content: "Review your own receipts, recorded activity, tax records and payment safety in the Frass Financial Center." },
      { property: "og:title", content: "Frass Financial Center" },
      { property: "og:description", content: "Your own financial records and payment history, with clear payment verification states." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <IdentityGate action="financial_center">
      <FinancialCenter />
    </IdentityGate>
  ),
});

type Section = "overview" | "audit" | "taxes" | "trust" | "health";
const sections: { id: Section; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "audit", label: "Receipts & Audit" },
  { id: "taxes", label: "Taxes" },
  { id: "trust", label: "Trust Center" },
];

function FinancialCenter() {
  const { roles, loading: rolesLoading } = useMyRoles();
  const founder = !rolesLoading && (roles.includes("admin") || roles.includes("super_admin"));
  const [section, setSection] = useState<Section>("overview");
  const receiptsFn = useServerFn(listMyReceipts);
  const { data: receipts, isPending, isError } = useQuery({
    queryKey: ["financial-receipts"],
    queryFn: () => receiptsFn(),
  });
  const visible = founder ? [...sections, { id: "health" as const, label: "Commerce Health" }] : sections;
  const active = visible.some((item) => item.id === section) ? section : "overview";

  return (
    <SiteShell>
      <main className="min-h-screen bg-background px-5 py-12 text-foreground">
        <div className="mx-auto max-w-5xl">
          <h1 className="font-display text-3xl uppercase md:text-5xl">Frass Financial Center</h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            Your recorded money activity, receipts and payment checks in one place. A recorded amount is not automatically verified or available to withdraw.
          </p>
          <nav className="mt-8 flex flex-wrap gap-2" aria-label="Financial Center sections">
            {visible.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSection(item.id)}
                aria-current={active === item.id ? "page" : undefined}
                className={`rounded border px-3.5 py-2 text-xs transition ${active === item.id ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:bg-muted"}`}
              >
                {item.label}
              </button>
            ))}
          </nav>
          {founder && (
            <Link to="/payment-providers" className="mt-4 inline-flex text-sm text-primary underline">
              Payment Provider Center
            </Link>
          )}
          <div className="mt-8">
            {active === "trust" ? <TrustCenter /> : active === "health" && founder ? <CommerceHealth /> : (
              isPending ? <p role="status" className="text-sm text-muted-foreground">Gathering your financial records…</p> :
              isError || !receipts ? <p role="alert" className="text-sm text-destructive">Your records could not be confirmed. Please try again later.</p> :
              active === "overview" ? <MoneyOverview receipts={receipts} /> :
              active === "audit" ? <FinancialTimeline receipts={receipts} /> :
              <TaxIntelligencePanel receipts={receipts} />
            )}
          </div>
        </div>
      </main>
    </SiteShell>
  );
}

function MoneyOverview({ receipts }: { receipts: Receipt[] }) {
  const recorded = receipts.filter((r) => r.status === "pending" && r.direction === "in" && r.verification?.state !== "verified");
  const verified = receipts.filter((r) => r.status === "pending" && r.direction === "in" && r.verification?.state === "verified");
  const settled = receipts.filter((r) => r.status === "settled" && r.direction === "in");
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-semibold">Balance</h2>
        <p className="mt-2 text-sm text-muted-foreground">No verified available balance can be confirmed here yet. A payment check does not mean settlement or payout.</p>
      </section>
      <section>
        <h2 className="text-lg font-semibold">Your activity</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <Activity label="Recorded, not verified" rows={recorded} note="Includes seller-marked paid and member-submitted records. Neither proves payment." />
          <Activity label="Payment verified, not settled" rows={verified} note="Confirmed by the provider, but not available or paid out." />
          <Activity label="Recorded as settled" rows={settled} note="Receipt status only; a withdrawable balance is not confirmed here." />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">These are record counts, not balances. View each receipt for its source, amount and payment status.</p>
      </section>
      <section>
        <h2 className="text-lg font-semibold">Recent receipts</h2>
        {receipts.length ? (
          <ul className="mt-3 divide-y divide-border border-y border-border">
            {receipts.slice(0, 5).map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <span>{r.title} <span className="text-muted-foreground">· {r.verification?.label ?? (r.status === "pending" ? r.derived ? "Recorded — pending verification" : "Member submitted — pending verification" : r.status)}</span></span>
                <span className="tabular-nums">{money(r.net, r.currency)} <span className="text-muted-foreground">recorded</span></span>
              </li>
            ))}
          </ul>
        ) : <p className="mt-3 text-sm text-muted-foreground">No receipts recorded yet.</p>}
      </section>
    </div>
  );
}

function Activity({ label, rows, note }: { label: string; rows: Receipt[]; note: string }) {
  return (
    <div className="rounded border border-border p-4">
      <h3 className="text-sm font-medium">{label}</h3>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{rows.length} <span className="text-sm font-normal text-muted-foreground">record{rows.length === 1 ? "" : "s"}</span></p>
      <p className="mt-1 text-xs text-muted-foreground">{note}</p>
    </div>
  );
}
