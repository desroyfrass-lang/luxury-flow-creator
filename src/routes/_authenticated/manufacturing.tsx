// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0516 — Frass Creator Manufacturing Network
//
// One shared network for every Business Vault. Frass is not the manufacturer;
// Frass connects the creator to approved partners and keeps one product,
// one catalog, one inventory across the whole platform.
// ─────────────────────────────────────────────────────────────────────────────

import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteShell } from "@/components/site-shell";
import {
  CREATOR_CATEGORIES,
  MANUFACTURING_PRINCIPLE,
  PRODUCT_PIPELINE,
  recommendPartners,
  type CreatorCategoryKey,
} from "@/lib/manufacturing/network";
import { vaultByKey } from "@/lib/business/vault-family";

export const Route = createFileRoute("/_authenticated/manufacturing")({
  head: () => ({
    meta: [
      { title: "Creator Manufacturing Network — Frass" },
      {
        name: "description",
        content:
          "Design it, sample it, approve it, sell it. Frass connects creators to approved manufacturing partners across fashion, footwear, bags, jewelry, home, beauty, art and more — with no inventory and no factory.",
      },
      { property: "og:title", content: "Creator Manufacturing Network — Frass" },
      {
        property: "og:description",
        content: "From idea to first sale without owning inventory, a factory or a logistics team.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ManufacturingPage,
});

function ManufacturingPage() {
  const [category, setCategory] = useState<CreatorCategoryKey>("fashion");
  const [startingSmall, setStartingSmall] = useState(true);

  const active = useMemo(
    () => CREATOR_CATEGORIES.find((c) => c.key === category)!,
    [category],
  );
  const partners = useMemo(
    () => recommendPartners(category, { startingSmall }),
    [category, startingSmall],
  );
  const vault = active.vaultKey ? vaultByKey(active.vaultKey) : undefined;

  return (
    <SiteShell>
      <div className="mx-auto max-w-6xl px-5 py-12">
        <p className="text-[11px] uppercase tracking-[0.4em] text-muted-foreground">
          FRASS-0516 · Shared Platform Network
        </p>
        <h1 className="mt-3 text-4xl font-black uppercase tracking-tight md:text-5xl">
          Creator Manufacturing Network
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {MANUFACTURING_PRINCIPLE.headline}
        </p>
        <p className="mt-3 max-w-3xl rounded-2xl border border-border bg-muted/40 p-4 text-sm leading-relaxed">
          {MANUFACTURING_PRINCIPLE.plain}
        </p>

        {/* Pipeline */}
        <section className="mt-12">
          <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground">
            The Frass Product Pipeline
          </h2>
          <ol className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PRODUCT_PIPELINE.map((s, i) => (
              <li key={s.key} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg" aria-hidden>
                    {s.emoji}
                  </span>
                  <span className="text-sm font-semibold">
                    {i + 1}. {s.label}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{s.plain}</p>
                {s.to ? (
                  <Link
                    to={s.to as never}
                    className="mt-3 inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-primary"
                  >
                    Open
                  </Link>
                ) : null}
              </li>
            ))}
          </ol>
        </section>

        {/* Categories */}
        <section className="mt-14">
          <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground">
            What can be made
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {CREATOR_CATEGORIES.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setCategory(c.key)}
                aria-pressed={c.key === category}
                className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                  c.key === category
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card hover:border-primary/50"
                }`}
              >
                <span aria-hidden>{c.emoji}</span> {c.label}
              </button>
            ))}
          </div>

          <div className="mt-6 rounded-3xl border border-border bg-card p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h3 className="text-2xl font-bold">
                <span aria-hidden>{active.emoji}</span> {active.label}
              </h3>
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={startingSmall}
                  onChange={(e) => setStartingSmall(e.target.checked)}
                  className="h-4 w-4 accent-[hsl(var(--primary))]"
                />
                I'm starting small — no inventory
              </label>
            </div>

            <p className="mt-3 text-sm text-muted-foreground">{active.items.join(" · ")}</p>

            {active.compliance ? (
              <p className="mt-4 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs leading-relaxed">
                ⚠ {active.compliance}
              </p>
            ) : null}

            <div className="mt-5 flex flex-wrap gap-3">
              {vault ? (
                <Link
                  to="/business-vaults"
                  className="rounded-full bg-primary px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-primary-foreground"
                >
                  {vault.emoji} Build the business — {vault.label}
                </Link>
              ) : null}
              {active.showcase ? (
                <Link
                  to={active.showcase.to as never}
                  className="rounded-full border border-border px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em]"
                >
                  Show it in {active.showcase.label}
                </Link>
              ) : null}
            </div>

            {/* Partners */}
            <h4 className="mt-8 text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground">
              Approved partners Frassy suggests
            </h4>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {partners.map(({ partner, reason }) => (
                <div key={partner.key} className="rounded-2xl border border-border bg-background p-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-semibold">{partner.name}</span>
                    <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                      {partner.region}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {partner.specialties.join(" · ")}
                  </p>
                  <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <dt className="text-muted-foreground">Minimum</dt>
                      <dd className="font-medium">{partner.minimumOrder}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Sample</dt>
                      <dd className="font-medium">~{partner.sampleDays} days</dd>
                    </div>
                  </dl>
                  <p className="mt-3 text-xs leading-relaxed">{reason}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{partner.notes}</p>
                </div>
              ))}
              {partners.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No partner in the network covers this category yet. Tell Frassy what you need and it
                  goes on the sourcing list — nothing is invented in the meantime.
                </p>
              ) : null}
            </div>
          </div>
        </section>

        <p className="mt-12 rounded-2xl border border-border bg-muted/40 p-4 text-xs leading-relaxed text-muted-foreground">
          {MANUFACTURING_PRINCIPLE.ip} Nothing is produced without your approval, and every product
          stays a single product across the Marketplace, your Frass Card and the Financial Center.
        </p>
      </div>
    </SiteShell>
  );
}
