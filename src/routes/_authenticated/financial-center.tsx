import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { SiteShell } from "@/components/site-shell";
import { TrustCenter } from "@/components/trust/trust-center";
import { CommerceHealth } from "@/components/finance/commerce-health";
import { Amount } from "@/components/finance/amount";
import { FinancialTimeline } from "@/components/finance/financial-timeline";
import { AUDIT_PRINCIPLES } from "@/lib/finance/receipts";
import { listMyReceipts } from "@/lib/finance/receipts.functions";
import { useMyRoles } from "@/hooks/use-my-roles";
import {
  CREDIT_PROGRAMS,
  CREDIT_USES,
  IMPLEMENTATION_AUDIT,
  honestSnapshot,
  money,
  PLATFORM_ALLOCATION,
  TAX_PRINCIPLES,
  taxNotice,
  viewerFrom,
  visibleTabs,
  type FinanceTab,
  type FinanceTabId,
  type FinanceViewer,
  type TraceableAmount,
} from "@/lib/finance/financial-center";
import {
  EARNINGS_LEDGER_RULES,
  earningsLedgers,
  type EarningsLedger,
} from "@/lib/finance/earnings-ledgers";
import {
  DEFAULT_OWNER_POLICY,
  FINANCIAL_HIERARCHY,
  OWNER_EQUITY_NOTE,
  allocateGift,
  giftAllocationTotal,
  loadOwnerPolicy,
  type OwnerPolicy,
} from "@/lib/finance/owner-compensation";


export const Route = createFileRoute("/_authenticated/financial-center")({
  head: () => ({
    meta: [
      { title: "Frass Financial Center — Wallet, Gifts, Credits & Earnings" },
      {
        name: "description",
        content:
          "One financial home for every Frass member: available balance, pending settlement, credits, community gifts, marketplace and affiliate earnings, taxes and withdrawals.",
      },
      { property: "og:title", content: "Frass Financial Center" },
      {
        property: "og:description",
        content: "Every dollar, credit and gift on Frass — traceable, explainable, and in one place.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FinancialCenter,
});

function FinancialCenter() {
  const { roles } = useMyRoles();
  const viewer = viewerFrom(roles);
  const tabs = visibleTabs(viewer);
  const [tab, setTab] = useState<FinanceTabId>("overview");
  const active = tabs.find((t) => t.id === tab) ?? tabs[0]!;
  const snap = honestSnapshot(viewer);
  const ledgers = earningsLedgers(viewer);
  const [policy, setPolicy] = useState<OwnerPolicy>(DEFAULT_OWNER_POLICY);

  useEffect(() => setPolicy(loadOwnerPolicy()), []);



  return (
    <SiteShell>
      <div className="min-h-screen bg-[oklch(0.14_0.01_75)] px-6 py-12 text-[oklch(0.96_0.01_80)]">
        <div className="mx-auto max-w-[1150px]">
          <span className="text-[10px] uppercase tracking-[0.4em] text-[color:var(--hill-gold)]">
            FRASS-0302 · Commerce &amp; Finance
          </span>
          <h1 className="mt-3 font-display text-3xl uppercase md:text-5xl">Frass Financial Center</h1>
          <p className="mt-3 max-w-2xl text-sm text-[oklch(0.8_0.01_80)]">
            One financial home for every member. Available balance is yours to withdraw right now —
            settlement timing only ever applies to pending money. Click any number to see exactly
            where it came from.
          </p>

          <nav className="mt-8 flex flex-wrap gap-2" aria-label="Financial Center sections">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`rounded-full border px-3.5 py-1.5 text-[11px] uppercase tracking-[0.18em] transition ${
                  t.id === active.id
                    ? "border-[color:var(--hill-gold)] bg-[color:var(--hill-gold)] text-black"
                    : "border-white/20 text-[oklch(0.8_0.01_80)] hover:bg-white/5"
                }`}
              >
                <span aria-hidden className="mr-1.5">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </nav>

          <p className="mt-3 text-xs text-[oklch(0.66_0.01_80)]">{active.blurb}</p>

          {viewer.founder && (
            <Link
              to="/payment-providers"
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-[color:var(--hill-gold)]/50 px-4 py-1.5 text-[11px] uppercase tracking-[0.2em] text-[color:var(--hill-gold)] transition hover:bg-[color:var(--hill-gold)]/10"
            >
              FRASS-0303 · Payment Provider Center &amp; pipeline →
            </Link>
          )}

          <div className="mt-6">
            <TabBody tab={active} viewer={viewer} snap={snap} ledgers={ledgers} policy={policy} />
          </div>
        </div>
      </div>
    </SiteShell>
  );
}

function AuditTimeline() {
  const receiptsFn = useServerFn(listMyReceipts);
  const { data, isLoading } = useQuery({ queryKey: ["financial-receipts"], queryFn: () => receiptsFn() });
  if (isLoading) return <p className="text-sm text-[oklch(0.7_0.01_80)]">Gathering your receipts…</p>;
  return (
    <div className="rounded-2xl border border-white/12 bg-white/[0.02] p-4">
      <FinancialTimeline receipts={data ?? []} />
    </div>
  );
}

function TabBody({
  tab,
  viewer,
  snap,
  ledgers,
  policy,
}: {
  tab: FinanceTab;
  viewer: FinanceViewer;
  snap: ReturnType<typeof honestSnapshot>;
  ledgers: EarningsLedger[];
  policy: OwnerPolicy;
}) {
  switch (tab.id) {
    case "overview":
      return (
        <>
          <Heading>Available now — by where it came from</Heading>
          <AvailableNow ledgers={ledgers} />
          <Heading>Wallet totals</Heading>
          <Grid items={[snap.pending, snap.lifetime, snap.credits, snap.foundation]} />
          {viewer.founder && (
            <>
              <Heading>Owner compensation, distribution &amp; equity</Heading>
              <Grid items={snap.owner} />
              <Note>{OWNER_EQUITY_NOTE}</Note>
              <Heading>Business</Heading>
              <Grid items={snap.business.slice(0, 6)} />
              <Heading>The Frass Financial Hierarchy</Heading>
              <Hierarchy />
            </>
          )}
          <Audit />
        </>
      );
    case "wallet":
      return (
        <>
          <Heading>Available now — never merged</Heading>
          <AvailableNow ledgers={ledgers} />
          <Heading>Every ledger, in full</Heading>
          <LedgerTable ledgers={ledgers} />
          <Heading>Wallet totals</Heading>
          <Grid items={[snap.pending, snap.lifetime]} />
          <Note>
            Available means available. Nothing in that balance is held, reviewed, or waiting — it can
            leave the platform today. Pending is the only place settlement language belongs, and it
            moves itself into Available the moment it clears.
          </Note>
          <Heading>Universal Earnings Ledger rules</Heading>
          <ul className="space-y-2">
            {EARNINGS_LEDGER_RULES.map((r) => (
              <li key={r} className="rounded-xl border border-white/12 bg-white/[0.02] p-3 text-sm">
                {r}
              </li>
            ))}
          </ul>
        </>
      );
    case "credits":
      return (
        <>
          <Grid items={[snap.credits]} />
          <Note>
            Credits are a payment mechanism, never a discount on someone else's payout. A gift sent
            with credits pays the recipient exactly what a card gift would.
          </Note>
          <Heading>How credits are earned</Heading>
          <ul className="grid gap-2 sm:grid-cols-2">
            {CREDIT_PROGRAMS.map((p) => (
              <li key={p.id} className="rounded-xl border border-white/12 bg-white/[0.02] p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm">{p.label}</span>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] ${
                      p.approved
                        ? "border-[color:var(--hill-gold)]/50 text-[color:var(--hill-gold)]"
                        : "border-white/18 text-[oklch(0.62_0.01_80)]"
                    }`}
                  >
                    {p.approved ? "Active" : "Awaiting Founder approval"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[oklch(0.7_0.01_80)]">{p.how}</p>
              </li>
            ))}
          </ul>
          <Heading>What credits can be used for</Heading>
          <Chips items={CREDIT_USES} />
        </>
      );
    case "gifts":
      return (
        <>
          <Grid items={[snap.gifts, snap.pending]} />
          <Heading>How a gift becomes earnings</Heading>
          <GiftMath policy={policy} />
          <Note>
            Every gift shows its sender (privacy permitting), date, gross amount, platform
            allocation, net payout and status. Milestone gifts may appear in the For Us feed only
            with the recipient's permission.
          </Note>
        </>
      );
    case "marketplace":
      return <Empty label="Marketplace earnings" note="Seller ledger opens as marketplace orders begin settling." />;
    case "affiliate":
      return <Empty label="Affiliate earnings" note="Commission history appears here as attributed sales settle." />;
    case "taxes": {
      const notice = taxNotice(undefined);
      return (
        <>
          <Grid items={[snap.taxes]} />
          <Note>{notice.message}</Note>
          <Heading>How tax is handled</Heading>
          <ul className="space-y-2">
            {TAX_PRINCIPLES.map((p) => (
              <li key={p} className="rounded-xl border border-white/12 bg-white/[0.02] p-3 text-sm">
                {p}
              </li>
            ))}
          </ul>
        </>
      );
    }
    case "withdrawals":
      return (
        <>
          <Grid items={[snap.available, snap.pending]} />
          <Note>
            Only Available balance can be withdrawn. Payout rails and bank verification are in the
            Platform Commissioning queue awaiting Founder approval.
          </Note>
        </>
      );
    case "business":
      return (
        <>
          <Grid items={snap.business} />
          <Heading>Owner compensation</Heading>
          <Grid items={snap.owner} />
          <Note>
            Owner compensation is allocated only after product cost, shipping, processing, taxes,
            the constitutional allocation and every other obligation is satisfied. Only funds that
            genuinely exist may be allocated.
          </Note>
        </>
      );
    case "statements":
      return <Empty label="Statements & reports" note="Monthly, annual, CSV, PDF and audit exports generate once ledgers hold transactions." />;
    case "audit":
      return (
        <>
          <Heading>The Financial Integrity Constitution</Heading>
          <ul className="grid gap-2 sm:grid-cols-2">
            {AUDIT_PRINCIPLES.map((p) => (
              <li key={p.id} className="rounded-xl border border-white/12 bg-white/[0.02] p-3">
                <p className="text-sm">{p.title}</p>
                <p className="mt-1 text-xs text-[oklch(0.72_0.01_80)]">{p.explain}</p>
                <p className="mt-1 text-xs text-[oklch(0.62_0.01_80)]">
                  <strong>In plain English:</strong> {p.plain}
                </p>
              </li>
            ))}
          </ul>
          <Heading>Your financial timeline</Heading>
          <AuditTimeline />
        </>
      );
    case "trust":

      return (
        <>
          <Heading>Trust Center</Heading>
          <TrustCenter />
        </>
      );
    case "health":
      return (
        <>
          <Heading>Commerce health</Heading>
          <CommerceHealth />
        </>
      );
    case "settings":
      return (
        <>
          <Heading>Financial settings</Heading>
          <Chips items={tab.sections} />
          <Note>Adding a tax country here is what allows obligations to be estimated correctly.</Note>
        </>
      );
    default:
      return null;
  }
}

/** FRASS-0302 Amendment B — one card per income source, never merged. */
function AvailableNow({ ledgers }: { ledgers: EarningsLedger[] }) {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ledgers.map((l) => (
          <div key={l.source.id}>
            <div className="mb-1 flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-[oklch(0.66_0.01_80)]">
              <span aria-hidden>{l.source.icon}</span>
              {l.source.label}
            </div>
            <Amount item={l.available} compact />
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-[oklch(0.66_0.01_80)]">
        Earnings are never merged into one total. Knowing which source is growing is the point.
      </p>
    </>
  );
}

function LedgerTable({ ledgers }: { ledgers: EarningsLedger[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/12 bg-white/[0.02]">
      <table className="w-full text-left text-sm">
        <thead className="text-[10px] uppercase tracking-[0.2em] text-[oklch(0.62_0.01_80)]">
          <tr>
            <th className="px-4 py-3">Ledger</th>
            <th className="px-4 py-3 text-right">Available</th>
            <th className="px-4 py-3 text-right">Pending</th>
            <th className="px-4 py-3 text-right">Lifetime</th>
          </tr>
        </thead>
        <tbody>
          {ledgers.map((l) => (
            <tr key={l.source.id} className="border-t border-white/8">
              <td className="px-4 py-3">
                <span aria-hidden className="mr-2">{l.source.icon}</span>
                {l.source.label}
                <span className="mt-0.5 block text-[11px] text-[oklch(0.62_0.01_80)]">{l.source.plain}</span>
              </td>
              <td className="px-4 py-3 text-right tabular-nums">{money(l.available.amount)}</td>
              <td className="px-4 py-3 text-right tabular-nums text-amber-200/80">{money(l.pending.amount)}</td>
              <td className="px-4 py-3 text-right tabular-nums text-[oklch(0.72_0.01_80)]">{money(l.lifetime.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** FRASS-0303 Amendment B — the five ordered steps of every completed sale. */
function Hierarchy() {
  return (
    <ol className="space-y-2">
      {FINANCIAL_HIERARCHY.map((s) => (
        <li key={s.n} className="rounded-xl border border-white/12 bg-white/[0.02] p-4">
          <div className="flex items-baseline gap-3">
            <span className="font-display text-lg text-[color:var(--hill-gold)]">
              {String(s.n).padStart(2, "0")}
            </span>
            <h3 className="font-display text-lg">{s.title}</h3>
          </div>
          <p className="mt-1.5 text-sm text-[oklch(0.76_0.01_80)]">{s.what}</p>
          <p className="mt-2 text-sm">
            <span className="text-[color:var(--hill-gold)]">What that means is… </span>
            {s.plain}
          </p>
        </li>
      ))}
    </ol>
  );
}

function GiftMath({ policy }: { policy: OwnerPolicy }) {
  const a = allocateGift(100, policy);
  const total = giftAllocationTotal(policy);
  return (
    <div className="rounded-xl border border-white/12 bg-white/[0.02] p-4 text-sm">
      <div className="flex items-center justify-between">
        <span>Gift amount</span>
        <span className="tabular-nums">{money(a.gross)}</span>
      </div>
      <div className="mt-2 space-y-1 border-t border-white/10 pt-2 text-[13px] text-[oklch(0.74_0.01_80)]">
        <Row label={`Infrastructure (${PLATFORM_ALLOCATION.infrastructure}%)`} value={money(a.infrastructure)} />
        <Row label={`Reserve vault (${PLATFORM_ALLOCATION.reserve}%)`} value={money(a.reserve)} />
        <Row label={`Foundation (${PLATFORM_ALLOCATION.foundation}%)`} value={money(a.foundation)} />
        <Row label={`Founder allocation (${policy.founderGiftPct}%)`} value={money(a.founder)} />
        <Row label={`Co-Founder allocation (${policy.coFounderGiftPct}%)`} value={money(a.coFounder)} />
      </div>
      <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-2 text-[color:var(--hill-gold)]">
        <span>Recipient payout ({a.recipientPct}%)</span>
        <span className="tabular-nums">{money(a.recipient)}</span>
      </div>
      <p className="mt-3 text-[13px] text-[oklch(0.8_0.01_80)]">
        <span className="text-[color:var(--hill-gold)]">What that means is… </span>
        for every $100 someone sends you, {money(a.platformTotal)} ({total}%) keeps the platform
        running, funds the Foundation and pays the two owners who maintain the place, and{" "}
        {money(a.recipient)} lands in your Gift Earnings as real money you can withdraw. The owner
        shares are Founder-set policy, not a fixed constitutional number.
      </p>
    </div>
  );
}

function Audit() {
  return (
    <>
      <Heading>Implementation audit</Heading>
      <ul className="grid gap-2 sm:grid-cols-2">
        {IMPLEMENTATION_AUDIT.map((i) => (
          <li key={i.id} className="rounded-xl border border-white/12 bg-white/[0.02] p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm">{i.label}</span>
              <span
                className={`rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] ${
                  i.state === "built"
                    ? "border-emerald-400/40 text-emerald-300"
                    : i.state === "structure"
                      ? "border-amber-400/40 text-amber-300"
                      : "border-white/18 text-[oklch(0.62_0.01_80)]"
                }`}
              >
                {i.state === "built" ? "Built" : i.state === "structure" ? "Structure only" : "Commissioning queue"}
              </span>
            </div>
            <p className="mt-1 text-xs text-[oklch(0.7_0.01_80)]">{i.note}</p>
          </li>
        ))}
      </ul>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

function Grid({ items }: { items: TraceableAmount[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((i) => (
        <Amount key={i.id} item={i} />
      ))}
    </div>
  );
}

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-8 mb-3 text-[10px] uppercase tracking-[0.3em] text-[color:var(--hill-gold)]">{children}</h2>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-4 rounded-xl border border-[color:var(--hill-gold)]/25 bg-white/[0.03] p-4 text-sm text-[oklch(0.84_0.01_80)]">
      {children}
    </p>
  );
}

function Chips({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((s) => (
        <span key={s} className="rounded-full border border-white/15 px-3 py-1 text-xs text-[oklch(0.82_0.01_80)]">
          {s}
        </span>
      ))}
    </div>
  );
}

function Empty({ label, note }: { label: string; note: string }) {
  return (
    <div className="rounded-xl border border-white/12 bg-white/[0.02] p-6">
      <div className="text-[10px] uppercase tracking-[0.22em] text-[oklch(0.66_0.01_80)]">{label}</div>
      <div className="mt-1 font-display text-2xl">{money(0)}</div>
      <p className="mt-2 text-sm text-[oklch(0.74_0.01_80)]">{note}</p>
    </div>
  );
}
