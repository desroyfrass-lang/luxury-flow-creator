import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteShell } from "@/components/site-shell";
import { useIsAdmin } from "@/hooks/use-is-admin";
import {
  AUDIENCES,
  CAPABILITY_GROUPS,
  GLOBAL_COMMERCE_PRINCIPLE,
  MARKETS,
  PRIMARY_CURRENCIES,
  PRIMARY_MARKETS,
  REGIONAL_CAPABILITIES,
  findMarket,
  loadMarketConfigs,
  marketConfig,
  reachOnlyRegions,
  saveMarketConfigs,
  type AudienceId,
  type Capability,
  type Market,
  type MarketConfig,
  type MarketConfigMap,
  type MarketId,
} from "@/lib/commerce/global-markets";
import {
  CAMPAIGN_KINDS,
  campaignPlain,
  campaignSummary,
  loadCampaigns,
  marketMetrics,
  newCampaign,
  reachRows,
  saveCampaigns,
  type Campaign,
} from "@/lib/commerce/campaigns";

export const Route = createFileRoute("/_authenticated/global-operations")({
  head: () => ({
    meta: [
      { title: "Global Operations — Frass Regional Commerce" },
      {
        name: "description",
        content:
          "Run Frass as a global platform: Primary Operating Markets in Canada, the UK and the US, regional capability, campaign origin versus audience reach, and market analytics.",
      },
      { property: "og:title", content: "Frass Global Operations" },
      {
        property: "og:description",
        content: "Primary Operating Markets, regional capability, and campaigns that know where they started and where they landed.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GlobalOperations,
});

type TabId = "markets" | "capability" | "campaigns" | "analytics";

const TABS: { id: TabId; label: string; blurb: string }[] = [
  { id: "markets", label: "Regional operations", blurb: "Every market Frass can operate in, and how each one is configured." },
  { id: "capability", label: "Capability register", blurb: "What is genuinely live, what needs an integration, and what is still planned." },
  { id: "campaigns", label: "Campaigns", blurb: "Every campaign stores where it is managed from and where it is meant to reach — separately." },
  { id: "analytics", label: "Market analytics", blurb: "Revenue, orders, conversion, marketplace, affiliate and growth by market. Honest zeros until real orders land." },
];

function GlobalOperations() {
  const isAdmin = useIsAdmin();
  const [tab, setTab] = useState<TabId>("markets");
  const [marketId, setMarketId] = useState<MarketId>("GB");
  const [configs, setConfigs] = useState<MarketConfigMap>({});
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => setConfigs(loadMarketConfigs()), []);
  useEffect(() => setCampaigns(loadCampaigns()), []);

  const market = findMarket(marketId);
  const cfg = marketConfig(configs, market);
  const active = TABS.find((t) => t.id === tab)!;

  function updateConfig(next: Partial<MarketConfig>) {
    setConfigs((prev) => {
      const merged: MarketConfigMap = { ...prev, [market.id]: { ...marketConfig(prev, market), ...next } };
      saveMarketConfigs(merged);
      return merged;
    });
  }

  function updateCampaigns(list: Campaign[]) {
    setCampaigns(list);
    saveCampaigns(list);
  }

  if (!isAdmin) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-3xl px-6 py-24 text-sm text-muted-foreground">
          Global Operations is reserved for the Founder.
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <div className="mx-auto max-w-[1150px] px-6 py-12">
        <span className="text-[10px] uppercase tracking-[0.4em] text-[color:var(--gold)]">
          FRASS-0305 / 0306 · Global Commerce
        </span>
        <h1 className="mt-3 font-display text-3xl uppercase md:text-5xl">Global Operations</h1>
        <p className="mt-3 max-w-3xl text-sm text-muted-foreground">{GLOBAL_COMMERCE_PRINCIPLE}</p>

        <div className="mt-6 flex flex-wrap items-center gap-2" role="group" aria-label="Market">
          {MARKETS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMarketId(m.id)}
              aria-pressed={m.id === marketId}
              className={`rounded-full border px-3.5 py-1.5 text-[11px] uppercase tracking-[0.18em] transition ${
                m.id === marketId
                  ? "border-[color:var(--gold)] bg-[color:var(--gold)] text-black"
                  : "border-border text-muted-foreground hover:border-[color:var(--gold)]"
              }`}
            >
              <span aria-hidden className="mr-1.5">{m.flag}</span>
              {m.short}
              <span className="ml-2 opacity-60">{m.currency}</span>
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Primary Operating Markets: {PRIMARY_MARKETS.map((m) => `${m.flag} ${m.name}`).join(" · ")} ·
          Primary currencies: {PRIMARY_CURRENCIES.join(" · ")}
        </p>

        <nav className="mt-8 flex flex-wrap gap-2" aria-label="Global Operations sections">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-full border px-3.5 py-1.5 text-[11px] uppercase tracking-[0.18em] transition ${
                t.id === tab
                  ? "border-[color:var(--gold)] bg-[color:var(--gold)] text-black"
                  : "border-border text-muted-foreground hover:bg-muted/40"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
        <p className="mt-3 text-xs text-muted-foreground">{active.blurb}</p>

        <div className="mt-6 space-y-10">
          {tab === "markets" && <MarketsTab market={market} cfg={cfg} update={updateConfig} />}
          {tab === "capability" && <CapabilityTab market={market} />}
          {tab === "campaigns" && (
            <CampaignsTab market={market} campaigns={campaigns} onChange={updateCampaigns} />
          )}
          {tab === "analytics" && <AnalyticsTab market={market} campaigns={campaigns} />}
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link
            to="/payment-providers"
            className="rounded-sm border border-border px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground transition hover:border-[color:var(--gold)]"
          >
            Payment Provider Center
          </Link>
          <Link
            to="/financial-center"
            className="rounded-sm border border-border px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground transition hover:border-[color:var(--gold)]"
          >
            Financial Center
          </Link>
        </div>
      </div>
    </SiteShell>
  );
}

/* ── Regional operations ─────────────────────────────────────────────────── */

function MarketsTab({
  market,
  cfg,
  update,
}: {
  market: Market;
  cfg: MarketConfig;
  update: (n: Partial<MarketConfig>) => void;
}) {
  return (
    <>
      <Section
        title={`${market.flag} ${market.name}`}
        note={`${tierLabel(market)} · ${market.currencyName} (${market.currency}) · ${market.taxLabel}`}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-border p-5">
            <h3 className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Operations</h3>
            <label className="mt-3 flex items-center justify-between gap-3 text-sm">
              <span>Market enabled</span>
              <input
                type="checkbox"
                checked={cfg.enabled}
                onChange={(e) => update({ enabled: e.target.checked })}
                className="h-4 w-4 accent-[color:var(--gold)]"
              />
            </label>
            <TextField label="Selling currency" value={cfg.currency} onChange={(v) => update({ currency: v })} />
            <TextField
              label="Regional pricing note"
              value={cfg.priceNote}
              onChange={(v) => update({ priceNote: v })}
              placeholder={`e.g. round ${market.symbol} prices to the nearest 5`}
            />
            <TextField
              label="Customer support hours"
              value={cfg.supportHours}
              onChange={(v) => update({ supportHours: v })}
              placeholder="e.g. 09:00–17:00 local"
            />
          </div>
          <div className="rounded-xl border border-border p-5">
            <h3 className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
              Tax, shipping &amp; payments
            </h3>
            <label className="mt-3 flex items-center justify-between gap-3 text-sm">
              <span>Registered for {market.taxLabel}</span>
              <input
                type="checkbox"
                checked={cfg.taxRegistered}
                onChange={(e) => update({ taxRegistered: e.target.checked })}
                className="h-4 w-4 accent-[color:var(--gold)]"
              />
            </label>
            <TextField
              label={`${market.taxLabel} registration number`}
              value={cfg.taxNumber}
              onChange={(v) => update({ taxNumber: v })}
              placeholder="Not set"
            />
            <NumberField
              label={`Free shipping threshold (${cfg.currency})`}
              value={cfg.freeShippingThreshold}
              onChange={(v) => update({ freeShippingThreshold: v })}
            />
            <TextField
              label="Preferred payment provider"
              value={cfg.provider}
              onChange={(v) => update({ provider: v })}
              placeholder="Set in the Payment Provider Center"
            />
            <p className="mt-3 text-xs text-muted-foreground">{market.taxNote}</p>
            <p className="mt-1 text-xs text-muted-foreground">{market.shippingNote}</p>
          </div>
        </div>
        <div className="mt-4 rounded-xl border border-border p-5">
          <h3 className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
            Territories the Founder can target
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {market.territories.map((t) => (
              <span key={t} className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                {t}
              </span>
            ))}
          </div>
        </div>
        <p className="mt-4 rounded-xl border border-[color:var(--gold)]/25 bg-[color:var(--gold)]/5 p-4 text-sm">
          <span className="text-[color:var(--gold)]">What that means is… </span>
          {market.tier === "primary"
            ? `${market.name} is one of the three places Frass actually runs a business from. Prices, tax, shipping and payouts here are managed on their own terms, and money earned here reports home to ${market.short} in ${market.currency}.`
            : `${market.name} can be sold to and marketed to, but the sale is accounted for through a primary market until you promote it. Nothing breaks when you do — it becomes a Primary Operating Market with the same framework.`}
        </p>
      </Section>

      <Section
        title="Marketplace seller scope"
        note="Partner and curated brands choose their own reach; the customer still sees one Frass."
      >
        <ul className="grid gap-3 md:grid-cols-3">
          {[
            { t: "Sell globally", d: "Available in every market Frass ships to." },
            { t: `Sell in ${market.short} only`, d: "Listed for this market and hidden everywhere else." },
            { t: `Exclude ${market.short}`, d: "Available everywhere except this market." },
            { t: "Region-specific pricing", d: `A separate price in ${market.currency}.` },
            { t: "Region-specific shipping", d: "Own rates and lead times for this market." },
            { t: "Region-specific inventory", d: "Stock allocated to this market only. Awaiting warehouse allocation." },
          ].map((o) => (
            <li key={o.t} className="rounded-xl border border-border p-4">
              <h3 className="text-sm font-semibold">{o.t}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{o.d}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Future markets" note="The framework is reusable — promotion is a Founder decision, not a rebuild.">
        <div className="flex flex-wrap gap-2">
          {MARKETS.filter((m) => m.tier !== "primary").map((m) => (
            <span key={m.id} className="rounded-full border border-border px-3 py-1 text-xs">
              {m.flag} {m.name} · {m.currency} · {tierLabel(m)}
            </span>
          ))}
          {reachOnlyRegions().map((r) => (
            <span key={r.code} className="rounded-full border border-border/60 px-3 py-1 text-xs text-muted-foreground">
              {r.flag} {r.name} · reach only
            </span>
          ))}
        </div>
      </Section>
    </>
  );
}

/* ── Capability register ─────────────────────────────────────────────────── */

function CapabilityTab({ market }: { market: Market }) {
  return (
    <>
      <p className="rounded-xl border border-border p-4 text-sm text-muted-foreground">
        Frassy reads this register before she answers "can we do that in {market.short}?". Live means
        built and usable. Configurable means the platform supports it but a provider or integration
        must be connected first. Planned means approved architecture awaiting your commissioning.
      </p>
      {CAPABILITY_GROUPS.map((g) => (
        <Section key={g} title={g} note={`${market.flag} ${market.name}`}>
          <ul className="grid gap-3 md:grid-cols-2">
            {REGIONAL_CAPABILITIES.filter((c) => c.group === g).map((c) => (
              <li key={c.id} className="rounded-xl border border-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-semibold">{c.label}</h3>
                  <StatusChip c={c} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{c.note}</p>
              </li>
            ))}
          </ul>
        </Section>
      ))}
    </>
  );
}

function StatusChip({ c }: { c: Capability }) {
  const map = {
    live: { label: "Live", cls: "border-[color:var(--gold)]/60 text-[color:var(--gold)]" },
    configurable: { label: "Configurable", cls: "border-border text-muted-foreground" },
    planned: { label: "Planned", cls: "border-border/60 text-muted-foreground/70" },
  } as const;
  const s = map[c.status];
  return (
    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] ${s.cls}`}>
      {s.label}
    </span>
  );
}

/* ── Campaigns ───────────────────────────────────────────────────────────── */

function CampaignsTab({
  market,
  campaigns,
  onChange,
}: {
  market: Market;
  campaigns: Campaign[];
  onChange: (list: Campaign[]) => void;
}) {
  const [draft, setDraft] = useState<Campaign>(() => newCampaign(market.tier === "primary" ? market.id : "GB"));

  useEffect(() => {
    if (market.tier === "primary") setDraft((d) => ({ ...d, origin: market.id }));
  }, [market]);

  const mine = useMemo(() => campaigns.filter((c) => c.origin === draft.origin), [campaigns, draft.origin]);

  function patch(n: Partial<Campaign>) {
    setDraft((d) => ({ ...d, ...n }));
  }

  function toggleAudience(id: AudienceId) {
    patch({
      audiences: draft.audiences.includes(id)
        ? draft.audiences.filter((a) => a !== id)
        : [...draft.audiences, id],
    });
  }

  function toggleTerritory(t: string) {
    patch({
      territories: draft.territories.includes(t)
        ? draft.territories.filter((x) => x !== t)
        : [...draft.territories, t],
    });
  }

  function save(status: Campaign["status"]) {
    if (!draft.name.trim()) return;
    onChange([{ ...draft, status }, ...campaigns]);
    setDraft(newCampaign(draft.origin));
  }

  const originMarket = findMarket(draft.origin);

  return (
    <>
      <Section
        title="New campaign"
        note="Origin is where the campaign is managed and accounted from. Audience is where it is meant to land. The two are never merged."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-border p-5">
            <h3 className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Campaign origin</h3>
            <TextField label="Campaign name" value={draft.name} onChange={(v) => patch({ name: v })} placeholder="e.g. UK Autumn Kicks Drop" />
            <label className="mt-3 block text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Managed from
              <select
                value={draft.origin}
                onChange={(e) => patch({ origin: e.target.value as MarketId, territories: [] })}
                className="mt-1 w-full rounded-sm border border-border bg-background px-2 py-1.5 text-sm normal-case tracking-normal"
              >
                {PRIMARY_MARKETS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.flag} {m.name} · {m.currency}
                  </option>
                ))}
              </select>
            </label>
            <label className="mt-3 block text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Campaign type
              <select
                value={draft.kind}
                onChange={(e) => patch({ kind: e.target.value as Campaign["kind"] })}
                className="mt-1 w-full rounded-sm border border-border bg-background px-2 py-1.5 text-sm normal-case tracking-normal"
              >
                {CAMPAIGN_KINDS.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <TextField label="Starts" type="date" value={draft.startsOn} onChange={(v) => patch({ startsOn: v })} />
              <TextField label="Ends" type="date" value={draft.endsOn} onChange={(v) => patch({ endsOn: v })} />
            </div>
            <div className="mt-4">
              <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Territories inside {originMarket.short}
              </span>
              <div className="mt-2 flex flex-wrap gap-2">
                {originMarket.territories.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTerritory(t)}
                    aria-pressed={draft.territories.includes(t)}
                    className={`rounded-full border px-3 py-1 text-xs transition ${
                      draft.territories.includes(t)
                        ? "border-[color:var(--gold)] bg-[color:var(--gold)]/10 text-[color:var(--gold)]"
                        : "border-border text-muted-foreground hover:border-[color:var(--gold)]"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border p-5">
            <h3 className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Audience reach</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              A campaign is not fenced in by where it was launched. Choose everywhere it is meant to travel.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {AUDIENCES.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => toggleAudience(a.id)}
                  aria-pressed={draft.audiences.includes(a.id)}
                  title={a.examples.join(", ")}
                  className={`rounded-full border px-3 py-1 text-xs transition ${
                    draft.audiences.includes(a.id)
                      ? "border-[color:var(--gold)] bg-[color:var(--gold)]/10 text-[color:var(--gold)]"
                      : "border-border text-muted-foreground hover:border-[color:var(--gold)]"
                  }`}
                >
                  <span aria-hidden className="mr-1">{a.flag}</span>
                  {a.label}
                </button>
              ))}
            </div>
            <label className="mt-4 block text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Notes
              <textarea
                value={draft.notes}
                onChange={(e) => patch({ notes: e.target.value })}
                rows={3}
                className="mt-1 w-full rounded-sm border border-border bg-background px-2 py-1.5 text-sm normal-case tracking-normal"
                placeholder="Creators involved, products featured, budget intent…"
              />
            </label>
          </div>
        </div>

        <p className="mt-4 rounded-xl border border-border p-4 text-sm">
          {campaignSummary(draft)}
          <span className="mt-2 block text-muted-foreground">{campaignPlain(draft)}</span>
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => save("draft")}
            disabled={!draft.name.trim()}
            className="rounded-sm border border-border px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground transition hover:border-[color:var(--gold)] disabled:opacity-40"
          >
            Save draft
          </button>
          <button
            type="button"
            onClick={() => save("scheduled")}
            disabled={!draft.name.trim()}
            className="rounded-sm border border-[color:var(--gold)]/60 px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.3em] text-[color:var(--gold)] transition hover:bg-[color:var(--gold)]/10 disabled:opacity-40"
          >
            Schedule campaign
          </button>
        </div>
      </Section>

      <Section title={`Campaigns managed from ${originMarket.flag} ${originMarket.short}`} note="Origin and reach stay separate in every record.">
        {mine.length === 0 ? (
          <p className="rounded-xl border border-border p-4 text-sm text-muted-foreground">
            No campaigns yet from {originMarket.name}. That is a true zero, not a loading state.
          </p>
        ) : (
          <ul className="space-y-3">
            {mine.map((c) => (
              <li key={c.id} className="rounded-xl border border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-display text-lg">{c.name}</h3>
                  <span className="rounded-full border border-border px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                    {c.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{campaignSummary(c)}</p>
                {c.notes && <p className="mt-2 text-xs text-muted-foreground">{c.notes}</p>}
                <button
                  type="button"
                  onClick={() => onChange(campaigns.filter((x) => x.id !== c.id))}
                  className="mt-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground underline-offset-4 hover:underline"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}

/* ── Analytics ───────────────────────────────────────────────────────────── */

function AnalyticsTab({ market, campaigns }: { market: Market; campaigns: Campaign[] }) {
  const metrics = marketMetrics(market.id);
  const audiences = Array.from(new Set(campaigns.filter((c) => c.origin === market.id).flatMap((c) => c.audiences)));
  const rows = reachRows(market.id, audiences as AudienceId[]);

  return (
    <>
      <Section title={`${market.flag} ${market.short} performance`} note={`Reported in ${market.currency}. Zeros here are honest — nothing is hidden behind a spinner.`}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {metrics.map((m) => (
            <div key={m.id} className="rounded-xl border border-border p-4">
              <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{m.label}</div>
              <div className="mt-1 font-display text-2xl">{m.value}</div>
              <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
                {m.provenance === "live" ? "Live data" : m.provenance === "awaiting-data" ? "Awaiting first transaction" : "Needs integration"}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{m.plain}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Campaign origin vs audience reach"
        note={`Everything above is where the money reports home. This is where the campaigns from ${market.short} actually landed.`}
      >
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-[13px]">
            <thead className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              <tr className="border-b border-border">
                <th className="px-4 py-3">Audience reached</th>
                <th className="px-4 py-3 text-right">Sessions</th>
                <th className="px-4 py-3 text-right">Orders</th>
                <th className="px-4 py-3 text-right">Revenue ({market.currency})</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.audience} className="border-b border-border/50 last:border-0">
                  <td className="px-4 py-2.5">
                    <span aria-hidden className="mr-2">{r.flag}</span>
                    {r.audience}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{r.sessions}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{r.orders}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{r.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 rounded-xl border border-[color:var(--gold)]/25 bg-[color:var(--gold)]/5 p-4 text-sm">
          <span className="text-[color:var(--gold)]">What that means is… </span>
          a campaign you run from {market.name} can be loved in Japan, Nigeria or India. The sale
          still reports home to {market.short} in {market.currency}, and the reach is reported on its
          own line — so you always know where it started and where it made an impact.
        </p>
      </Section>
    </>
  );
}

/* ── Small building blocks ───────────────────────────────────────────────── */

function tierLabel(m: Market) {
  return m.tier === "primary"
    ? "Primary Operating Market"
    : m.tier === "supported"
      ? "Supported market"
      : "Reach market";
}

function Section({ title, note, children }: { title: string; note: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-display text-2xl uppercase">{title}</h2>
        <p className="mt-1 text-xs text-muted-foreground">{note}</p>
      </div>
      {children}
    </section>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="mt-3 block text-xs uppercase tracking-[0.2em] text-muted-foreground">
      {label}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-sm border border-border bg-background px-2 py-1.5 text-sm normal-case tracking-normal"
      />
    </label>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="mt-3 block text-xs uppercase tracking-[0.2em] text-muted-foreground">
      {label}
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="mt-1 w-full rounded-sm border border-border bg-background px-2 py-1.5 text-sm normal-case tracking-normal"
      />
    </label>
  );
}
