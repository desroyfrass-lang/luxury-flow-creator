import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteShell } from "@/components/site-shell";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { LEDGERS, money } from "@/lib/finance/financial-center";
import {
  DEFAULT_PROVIDER_CONFIG,
  PAYMENT_PROVIDERS,
  PIPELINE_AUDIT,
  PIPELINE_STEPS,
  PROVIDER_COMPARISON_AXES,
  REFUND_RULES,
  UNIVERSAL_RECORDS,
  buildLedgerEntries,
  loadProviderConfig,
  saveProviderConfig,
  type ProviderConfig,
} from "@/lib/finance/payment-pipeline";

export const Route = createFileRoute("/_authenticated/payment-providers")({
  head: () => ({
    meta: [
      { title: "Payment Provider Center — Frass Commerce Pipeline" },
      {
        name: "description",
        content:
          "Configure payment providers, owner compensation and margin floors, and trace the ten-step Frass commerce payment pipeline from checkout to every ledger.",
      },
      { property: "og:title", content: "Frass Payment Provider Center" },
      {
        property: "og:description",
        content: "One transparent payment pipeline: providers, allocations, ledgers, refunds and audit.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PaymentProviderCenter,
});

function PaymentProviderCenter() {
  const isAdmin = useIsAdmin();
  const [config, setConfig] = useState<ProviderConfig>(DEFAULT_PROVIDER_CONFIG);

  useEffect(() => setConfig(loadProviderConfig()), []);

  function update(next: Partial<ProviderConfig>) {
    setConfig((prev) => {
      const merged = { ...prev, ...next };
      saveProviderConfig(merged);
      return merged;
    });
  }

  if (!isAdmin) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-3xl px-6 py-24 text-sm text-muted-foreground">
          The Payment Provider Center is reserved for the Founder.
        </div>
      </SiteShell>
    );
  }

  // A worked example so every line of the pipeline is inspectable. Example
  // figures only — no live money is represented here.
  const example = buildLedgerEntries({
    transactionId: "EXAMPLE-0001",
    gross: 180,
    supplierCost: 62,
    shipping: 12,
    processingFee: 5.52,
    ownerCompensationPct: config.ownerCompensationPct,
  });

  return (
    <SiteShell>
      <div className="mx-auto max-w-[1150px] px-6 py-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-[10px] uppercase tracking-[0.4em] text-[color:var(--gold)]">
            FRASS-0303 · Commerce &amp; Finance
          </span>
          <Link
            to="/financial-center"
            className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground transition hover:text-[color:var(--gold)]"
          >
            Financial Center →
          </Link>
        </div>
        <h1 className="mt-3 font-display text-4xl uppercase leading-tight">Payment Provider Center</h1>
        <p className="mt-3 max-w-3xl text-sm text-muted-foreground">
          One pipeline for every sale on Frass — Kicks, Luxury House, Bridal, Marketplace, Kids Shop,
          digital products, services, courses and gifts. No provider is hard-coded: enable the ones
          that suit each market, and the same accounting runs underneath all of them.
        </p>

        {/* Providers */}
        <Section title="Providers" note="Compare, then enable. Enabling here records your preference; connecting a live account is a separate Founder approval.">
          <div className="grid gap-4 md:grid-cols-2">
            {PAYMENT_PROVIDERS.map((p) => {
              const on = config.enabled.includes(p.id);
              return (
                <article
                  key={p.id}
                  className={`rounded-xl border p-5 transition ${on ? "border-[color:var(--gold)]/60 bg-[color:var(--gold)]/5" : "border-border bg-background/40"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-xl">{p.name}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">{p.summary}</p>
                    </div>
                    <button
                      type="button"
                      disabled={p.availability === "planned"}
                      onClick={() =>
                        update({
                          enabled: on
                            ? config.enabled.filter((id) => id !== p.id)
                            : [...config.enabled, p.id],
                        })
                      }
                      className={`shrink-0 rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.2em] transition disabled:opacity-40 ${
                        on
                          ? "border-[color:var(--gold)] bg-[color:var(--gold)] text-[color:var(--ink)]"
                          : "border-border text-muted-foreground hover:border-[color:var(--gold)]"
                      }`}
                    >
                      {p.availability === "planned" ? "Planned" : on ? "Enabled" : "Enable"}
                    </button>
                  </div>
                  <dl className="mt-4 space-y-1.5 text-[12px]">
                    <Row k="Fees" v={p.fees} />
                    <Row k="Settlement" v={p.settlement} />
                    <Row k="Countries" v={p.countries} />
                    <Row k="Currencies" v={p.currencies} />
                    <Row k="Chargebacks" v={p.chargebacks} />
                    <Row k="Fraud tools" v={p.fraudTools} />
                    <Row k="Best for" v={p.bestFor} />
                  </dl>
                </article>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Compared on: {PROVIDER_COMPARISON_AXES.join(" · ")}.
          </p>
        </Section>

        {/* Routing preferences + engine settings */}
        <Section title="Routing &amp; engine settings" note="Which provider handles which kind of sale, and the two numbers the engine enforces.">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-border p-5">
              <h3 className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Preferred provider</h3>
              <div className="mt-3 space-y-3">
                {(["physical", "digital", "marketplace", "gifts"] as const).map((kind) => (
                  <label key={kind} className="flex items-center justify-between gap-3 text-sm">
                    <span className="capitalize">{kind}</span>
                    <select
                      value={config.preferred[kind] ?? ""}
                      onChange={(e) =>
                        update({ preferred: { ...config.preferred, [kind]: e.target.value || undefined } })
                      }
                      className="rounded-sm border border-border bg-background px-2 py-1 text-xs"
                    >
                      <option value="">Not set</option>
                      {PAYMENT_PROVIDERS.filter((p) => p.availability !== "planned").map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-border p-5">
              <h3 className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Engine rules</h3>
              <NumberField
                label="Owner compensation (% of remaining profit)"
                value={config.ownerCompensationPct}
                onChange={(v) => update({ ownerCompensationPct: v })}
              />
              <NumberField
                label="Minimum margin floor (%)"
                value={config.minMarginPct}
                onChange={(v) => update({ minMarginPct: v })}
              />
              <p className="mt-3 text-xs text-muted-foreground">
                The margin floor is enforced at pricing and publication time. A completed customer
                order is never retroactively blocked.
              </p>
            </div>
          </div>
        </Section>

        {/* FRASS-0303 Amendment B — owner compensation, gifts and distribution */}
        <Section
          title="Owner compensation, gifts &amp; distribution"
          note="Founder-set policy, not constitutional numbers. Compensation is paid per sale from clean profit; distribution is a separate, capped decision made only from genuine surplus."
        >
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-border p-5">
              <h3 className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                Per-sale compensation
              </h3>
              <NumberField
                label="Founder % of clean profit"
                value={policy.founderCompensationPct}
                onChange={(v) => updatePolicy({ founderCompensationPct: v })}
              />
              <NumberField
                label="Co-Founder % of clean profit"
                value={policy.coFounderCompensationPct}
                onChange={(v) => updatePolicy({ coFounderCompensationPct: v })}
              />
              <p className="mt-3 text-xs text-muted-foreground">
                Paid into Available earnings the moment the sale is clean — never into Pending.
              </p>
            </div>
            <div className="rounded-xl border border-border p-5">
              <h3 className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                Community gift allocation
              </h3>
              <NumberField
                label="Founder % of each gift"
                value={policy.founderGiftPct}
                onChange={(v) => updatePolicy({ founderGiftPct: v })}
              />
              <NumberField
                label="Co-Founder % of each gift"
                value={policy.coFounderGiftPct}
                onChange={(v) => updatePolicy({ coFounderGiftPct: v })}
              />
              <p className="mt-3 text-xs text-muted-foreground">
                Total gift allocation {giftAllocationTotal(policy)}% · recipient keeps{" "}
                {gift.recipientPct}% ({money(gift.recipient)} of every {money(gift.gross)}).
              </p>
            </div>
            <div className="rounded-xl border border-border p-5">
              <h3 className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                Distribution gates
              </h3>
              <NumberField
                label="Distribution cap (% of surplus)"
                value={policy.distributionCapPct}
                onChange={(v) => updatePolicy({ distributionCapPct: v })}
              />
              <NumberField
                label="Reserve target"
                value={policy.reserveTarget}
                onChange={(v) => updatePolicy({ reserveTarget: v })}
              />
              <NumberField
                label="Operating budget"
                value={policy.operatingBudget}
                onChange={(v) => updatePolicy({ operatingBudget: v })}
              />
              <NumberField
                label="Expansion budget"
                value={policy.expansionBudget}
                onChange={(v) => updatePolicy({ expansionBudget: v })}
              />
            </div>
          </div>
          <p className="mt-4 rounded-xl border border-[color:var(--gold)]/25 bg-[color:var(--gold)]/5 p-4 text-sm">
            <span className="text-[color:var(--gold)]">What that means is… </span>
            {distributionOffer(distribution)}
          </p>
          <p className="mt-3 text-xs text-muted-foreground">{OWNER_EQUITY_NOTE}</p>
          <ol className="mt-4 space-y-2">
            {FINANCIAL_HIERARCHY.map((s) => (
              <li key={s.n} className="rounded-xl border border-border p-4">
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-lg text-[color:var(--gold)]">
                    {String(s.n).padStart(2, "0")}
                  </span>
                  <h3 className="font-display text-lg">{s.title}</h3>
                </div>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.what}</p>
                <p className="mt-2 text-sm">
                  <span className="text-[color:var(--gold)]">What that means is… </span>
                  {s.plain}
                </p>
              </li>
            ))}
          </ol>
        </Section>

        {/* Pipeline */}
        <Section title="The ten-step pipeline" note="Every sale, regardless of district or product type, follows this exact sequence.">
          <ol className="space-y-3">
            {PIPELINE_STEPS.map((s) => (
              <li key={s.id} className="rounded-xl border border-border p-4">
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-lg text-[color:var(--gold)]">
                    {String(s.n).padStart(2, "0")}
                  </span>
                  <h3 className="font-display text-lg">{s.title}</h3>
                </div>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.what}</p>
                <p className="mt-2 text-sm">
                  <span className="text-[color:var(--gold)]">What that means is… </span>
                  {s.plain}
                </p>
                {s.writes.length > 0 && (
                  <p className="mt-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    Writes to: {s.writes.map((l) => LEDGERS[l].label).join(" · ")}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </Section>

        {/* Worked ledger fan-out */}
        <Section
          title="Ledger fan-out"
          note="Example figures, not live money — shown so every line of the accounting is inspectable before real transactions run through it."
        >
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-left text-[13px]">
              <thead className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="px-4 py-3">Ledger</th>
                  <th className="px-4 py-3">Entry</th>
                  <th className="px-4 py-3">Direction</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {example.entries.map((e, i) => (
                  <tr key={i} className="border-b border-border/50 last:border-0">
                    <td className="px-4 py-2.5">{LEDGERS[e.ledger].label}</td>
                    <td className="px-4 py-2.5">
                      {e.label}
                      <span className="block text-[11px] text-muted-foreground">{e.note}</span>
                    </td>
                    <td className="px-4 py-2.5 capitalize">{e.direction}</td>
                    <td className="px-4 py-2.5">
                      {e.settlement === "pending" ? "Pending settlement" : "Immediate"}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{money(e.amount, e.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Every completed transaction generates: {UNIVERSAL_RECORDS.join(" · ")}. Nothing exists
            without an accounting record.
          </p>
        </Section>

        {/* Refunds */}
        <Section title="Refund engine" note="A refund never rewrites history — it adds reversing entries against the same transaction ID.">
          <ul className="grid gap-3 md:grid-cols-2">
            {REFUND_RULES.map((r) => (
              <li key={r.id} className="rounded-xl border border-border p-4">
                <h3 className="text-sm font-semibold">{r.label}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{r.detail}</p>
              </li>
            ))}
          </ul>
        </Section>

        {/* Audit */}
        <Section title="Implementation audit" note="Anything not built is a Platform Commissioning item awaiting your approval — never duplicated elsewhere.">
          <ul className="grid gap-2 md:grid-cols-2">
            {PIPELINE_AUDIT.map((a) => (
              <li key={a.id} className="flex items-start gap-3 rounded-lg border border-border px-4 py-3">
                <span
                  className={`mt-0.5 rounded-full px-2 py-0.5 text-[9px] uppercase tracking-[0.18em] ${
                    a.state === "built"
                      ? "bg-emerald-400/15 text-emerald-300"
                      : a.state === "structure"
                        ? "bg-amber-400/15 text-amber-300"
                        : "bg-white/10 text-muted-foreground"
                  }`}
                >
                  {a.state}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm">{a.label}</span>
                  <span className="block text-xs text-muted-foreground">{a.note}</span>
                </span>
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </SiteShell>
  );
}

function Section({ title, note, children }: { title: string; note: string; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="font-display text-2xl uppercase">{title}</h2>
      <p className="mb-4 mt-1 max-w-3xl text-xs text-muted-foreground">{note}</p>
      {children}
    </section>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex gap-2">
      <dt className="w-28 shrink-0 text-muted-foreground">{k}</dt>
      <dd className="min-w-0">{v}</dd>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="mt-3 block text-sm">
      <span className="block text-xs text-muted-foreground">{label}</span>
      <input
        type="number"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="mt-1 w-32 rounded-sm border border-border bg-background px-2 py-1 text-sm"
      />
    </label>
  );
}
