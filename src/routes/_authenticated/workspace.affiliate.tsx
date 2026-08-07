import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { SiteShell } from "@/components/site-shell";
import { PageFeedback } from "@/components/page-feedback";
import {
  BLANK_ECONOMICS,
  CAMPAIGN_KINDS,
  DEFAULT_POLICY,
  analyzeProduct,
  fmt,
  promoActive,
  simulate,
  type ProductEconomics,
} from "@/lib/affiliate-intelligence";
import {
  deleteProductEconomics,
  getAffiliatePolicy,
  listAffiliateCampaigns,
  listProductEconomics,
  saveAffiliateCampaign,
  saveProductEconomics,
  type EconomicsRow,
} from "@/lib/affiliate.functions";

export const Route = createFileRoute("/_authenticated/workspace/affiliate")({
  head: () => ({
    meta: [
      { title: "Affiliate Intelligence — Frass Workspace" },
      {
        name: "description",
        content:
          "Frassy calculates a sustainable affiliate commission range for every product and shows the profit impact before you publish.",
      },
      { property: "og:title", content: "Affiliate Intelligence — Frass Workspace" },
      {
        property: "og:description",
        content: "AI-calculated commission ranges and a live Commission Simulator for Frass Builders.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AffiliateIntelligencePage,
});

const NUMBER_FIELDS: Array<{ key: keyof ProductEconomics; label: string; suffix?: string }> = [
  { key: "selling_price", label: "Selling price" },
  { key: "cost_of_goods", label: "Cost of goods" },
  { key: "packaging_cost", label: "Packaging" },
  { key: "shipping_cost", label: "Shipping" },
  { key: "other_cost", label: "Other costs" },
  { key: "payment_fee_pct", label: "Payment fee", suffix: "%" },
  { key: "payment_fee_fixed", label: "Payment fixed fee" },
  { key: "marketplace_fee_pct", label: "Marketplace fee", suffix: "%" },
  { key: "tax_pct", label: "Tax", suffix: "%" },
  { key: "discount_pct", label: "Discount", suffix: "%" },
  { key: "target_margin_pct", label: "Target profit margin", suffix: "%" },
  { key: "estimated_monthly_units", label: "Est. monthly units" },
];

function Field({
  label,
  value,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  suffix?: string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        {label}
        {suffix ? ` (${suffix})` : ""}
      </span>
      <input
        type="number"
        step="0.01"
        min="0"
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full rounded-sm border border-border bg-background/60 px-3 py-2 text-sm outline-none focus:border-[color:var(--gold)]"
      />
    </label>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "gold" | "warn" }) {
  return (
    <div className="rounded-sm border border-border bg-background/40 p-4">
      <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{label}</div>
      <div
        className={`mt-1 font-display text-xl ${
          tone === "gold"
            ? "text-[color:var(--gold)]"
            : tone === "warn"
              ? "text-destructive"
              : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function AffiliateIntelligencePage() {
  const qc = useQueryClient();
  const loadPolicy = useServerFn(getAffiliatePolicy);
  const loadProducts = useServerFn(listProductEconomics);
  const loadCampaigns = useServerFn(listAffiliateCampaigns);
  const persist = useServerFn(saveProductEconomics);
  const remove = useServerFn(deleteProductEconomics);
  const persistCampaign = useServerFn(saveAffiliateCampaign);

  const { data: policy = DEFAULT_POLICY } = useQuery({
    queryKey: ["affiliate-policy"],
    queryFn: () => loadPolicy(),
  });
  const { data: products = [] } = useQuery({
    queryKey: ["product-economics"],
    queryFn: () => loadProducts(),
  });
  const { data: campaigns = [] } = useQuery({
    queryKey: ["affiliate-campaigns"],
    queryFn: () => loadCampaigns(),
  });

  const [draft, setDraft] = useState<ProductEconomics & { id?: string }>({
    ...BLANK_ECONOMICS,
  });
  const [rate, setRate] = useState(12);
  const [saving, setSaving] = useState(false);
  const [campaignName, setCampaignName] = useState("");
  const [campaignKind, setCampaignKind] = useState<string>("standard");

  const analysis = useMemo(() => analyzeProduct(draft, policy), [draft, policy]);
  const sim = useMemo(() => simulate(draft, rate, policy, analysis), [draft, rate, policy, analysis]);
  const ceiling = promoActive(policy)
    ? Math.max(policy.max_commission_rate, policy.promo_max_commission_rate ?? 0)
    : policy.max_commission_rate;

  function set<K extends keyof ProductEconomics>(key: K, value: ProductEconomics[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function load(row: EconomicsRow) {
    setDraft({ ...row });
    setRate(Number(row.commission_rate ?? analyzeProduct(row, policy).recommendedRate) || 0);
  }

  async function save(enable: boolean) {
    setSaving(true);
    try {
      await persist({
        data: { ...draft, affiliate_enabled: enable, commission_rate: enable ? rate : null },
      });
      await qc.invalidateQueries({ queryKey: ["product-economics"] });
      toast.success(enable ? "Affiliate program saved." : "Product economics saved.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SiteShell>
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
          Profit Protection Engine
        </div>
        <h1 className="mt-3 font-display text-4xl leading-tight">Affiliate Intelligence</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          You never have to guess a commission percentage. Give Frassy the real numbers and she
          calculates the range that grows your business without quietly eroding it. Growth should
          never come at the expense of sustainability.
        </p>

        <div className="mt-4 inline-flex flex-wrap gap-3 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          <span className="rounded-sm border border-border px-3 py-1">
            Platform allocation {policy.platform_allocation_rate}% — constitutional, untouched
          </span>
          <span className="rounded-sm border border-border px-3 py-1">
            Commission ceiling {ceiling}%
          </span>
          {promoActive(policy) && (
            <span className="rounded-sm border border-[color:var(--gold)] px-3 py-1 text-[color:var(--gold)]">
              {policy.promo_label} window open
            </span>
          )}
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          {/* Inputs */}
          <section className="rounded-sm border border-border bg-background/40 p-6">
            <h2 className="font-display text-2xl">The financial picture</h2>
            <p className="mt-2 text-xs text-muted-foreground">
              Every relevant cost is included before a single percent is offered.
            </p>

            <label className="mt-5 block">
              <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Product
              </span>
              <input
                value={draft.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="e.g. Frass Kicks — Harbour Runner"
                className="mt-1 w-full rounded-sm border border-border bg-background/60 px-3 py-2 text-sm outline-none focus:border-[color:var(--gold)]"
              />
            </label>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {NUMBER_FIELDS.map((f) => (
                <Field
                  key={String(f.key)}
                  label={f.label}
                  suffix={f.suffix}
                  value={Number(draft[f.key] ?? 0)}
                  onChange={(v) => set(f.key, v as never)}
                />
              ))}
            </div>
          </section>

          {/* Analysis + simulator */}
          <section className="space-y-6">
            <div className="rounded-sm border border-border bg-background/40 p-6">
              <h2 className="font-display text-2xl">Frassy's analysis</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <Stat label="Effective price" value={fmt(analysis.effectivePrice, draft.currency)} />
                <Stat
                  label="Net before affiliate"
                  value={fmt(analysis.netBeforeAffiliate, draft.currency)}
                />
                <Stat
                  label="Affiliate headroom"
                  value={fmt(analysis.headroom, draft.currency)}
                  tone={analysis.viable ? "gold" : "warn"}
                />
                <Stat label="Minimum meaningful" value={`${analysis.minRate}%`} />
                <Stat label="Recommended" value={`${analysis.recommendedRate}%`} tone="gold" />
                <Stat label="Maximum sustainable" value={`${analysis.maxRate}%`} />
              </div>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {analysis.explanation.map((line) => (
                  <li key={line} className="flex gap-2">
                    <span className="text-[color:var(--gold)]">·</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-sm border border-border bg-background/40 p-6">
              <h2 className="font-display text-2xl">Commission Simulator</h2>
              <p className="mt-2 text-xs text-muted-foreground">
                Move the slider. Watch the money move with it — before you publish anything.
              </p>

              <div className="mt-5 flex items-center gap-4">
                <input
                  type="range"
                  min={0}
                  max={ceiling}
                  step={0.5}
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                  className="w-full accent-[color:var(--gold)]"
                  aria-label="Affiliate commission percentage"
                />
                <span className="min-w-[4.5rem] text-right font-display text-2xl text-[color:var(--gold)]">
                  {rate}%
                </span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Stat label="Affiliate payout" value={fmt(sim.affiliatePayout, draft.currency)} />
                <Stat
                  label="Your payout"
                  value={fmt(sim.builderPayout, draft.currency)}
                  tone={sim.belowTarget ? "warn" : "gold"}
                />
                <Stat
                  label="Platform allocation"
                  value={fmt(sim.platformAllocation, draft.currency)}
                />
                <Stat label="Resulting margin" value={`${sim.marginPct}%`} />
                <Stat label="Break-even commission" value={`${analysis.breakEvenRate}%`} />
                <Stat
                  label="Monthly projection (you)"
                  value={fmt(sim.monthlyBuilderPayout, draft.currency)}
                />
              </div>

              <p
                className={`mt-4 rounded-sm border p-3 text-sm ${
                  sim.belowTarget || sim.aboveCeiling || !analysis.viable
                    ? "border-destructive/50 text-destructive"
                    : "border-border text-muted-foreground"
                }`}
              >
                {sim.advice}
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void save(false)}
                  className="lux-press rounded-sm border border-border px-5 py-3 text-[11px] font-bold uppercase tracking-[0.28em]"
                >
                  Save economics
                </button>
                <button
                  type="button"
                  disabled={saving || !analysis.viable || sim.belowTarget}
                  onClick={() => void save(true)}
                  className="lux-press rounded-sm border border-[color:var(--gold)] bg-[color:var(--gold)] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.28em] text-[color:var(--ink)] disabled:opacity-40"
                >
                  Enable affiliates at {rate}%
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Saved products */}
        <section className="mt-14">
          <h2 className="font-display text-2xl">Your products</h2>
          {products.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Nothing analysed yet. Fill in a product above and save it.
            </p>
          ) : (
            <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => {
                const a = analyzeProduct(p, policy);
                return (
                  <div key={p.id} className="rounded-sm border border-border bg-background/40 p-5">
                    <div className="font-display text-lg">{p.title}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {fmt(Number(p.selling_price), p.currency)} · margin target{" "}
                      {p.target_margin_pct}%
                    </div>
                    <div className="mt-3 text-[10px] uppercase tracking-[0.22em] text-[color:var(--gold)]">
                      {p.affiliate_enabled
                        ? `Affiliates on · ${p.commission_rate}%`
                        : a.viable
                          ? `Affiliates off · up to ${a.maxRate}%`
                          : "No affiliate program recommended"}
                    </div>
                    <div className="mt-4 flex gap-3 text-[10px] font-bold uppercase tracking-[0.22em]">
                      <button
                        type="button"
                        onClick={() => load(p)}
                        className="text-[color:var(--gold)]"
                      >
                        Open
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          await remove({ data: { id: p.id } });
                          await qc.invalidateQueries({ queryKey: ["product-economics"] });
                        }}
                        className="text-muted-foreground"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Campaigns */}
        <section className="mt-14">
          <h2 className="font-display text-2xl">Campaigns</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Launches, holidays, influencer collaborations. Each one carries its own percentage —
            always re-checked against the product's sustainable range.
          </p>

          {draft.id ? (
            <div className="mt-5 flex flex-wrap items-end gap-3">
              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  Campaign name
                </span>
                <input
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  className="mt-1 rounded-sm border border-border bg-background/60 px-3 py-2 text-sm outline-none focus:border-[color:var(--gold)]"
                />
              </label>
              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  Type
                </span>
                <select
                  value={campaignKind}
                  onChange={(e) => setCampaignKind(e.target.value)}
                  className="mt-1 rounded-sm border border-border bg-background/60 px-3 py-2 text-sm outline-none"
                >
                  {CAMPAIGN_KINDS.map((k) => (
                    <option key={k.value} value={k.value}>
                      {k.label}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await persistCampaign({
                      data: {
                        economics_id: draft.id!,
                        name: campaignName,
                        kind: campaignKind,
                        commission_rate: rate,
                      },
                    });
                    setCampaignName("");
                    await qc.invalidateQueries({ queryKey: ["affiliate-campaigns"] });
                    toast.success("Campaign saved.");
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : "Could not save campaign.");
                  }
                }}
                className="lux-press rounded-sm border border-[color:var(--gold)] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.28em] text-[color:var(--gold)]"
              >
                Add at {rate}%
              </button>
            </div>
          ) : (
            <p className="mt-3 text-xs text-muted-foreground">
              Open a saved product above to attach a campaign to it.
            </p>
          )}

          {campaigns.length > 0 && (
            <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {campaigns.map((c) => (
                <div key={c.id} className="rounded-sm border border-border bg-background/40 p-4">
                  <div className="font-display text-lg">{c.name}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {CAMPAIGN_KINDS.find((k) => k.value === c.kind)?.label ?? c.kind} ·{" "}
                    {c.commission_rate}%
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
      <PageFeedback pageTitle="Affiliate Intelligence" />
    </SiteShell>
  );
}
