// FRASS-0410 — Brand profile.
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import {
  CAMPAIGN_MARKETS,
  INDUSTRIES,
  brandBySlug,
  campaignsForBrand,
  settlementPreview,
} from "@/lib/brand-partnerships";

export const Route = createFileRoute("/brand-partnerships/brands/$brand")({
  loader: ({ params }) => {
    const brand = brandBySlug(params.brand);
    if (!brand) throw notFound();
    return { brand, campaigns: campaignsForBrand(brand.slug) };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Brand unavailable — Frass" }, { name: "robots", content: "noindex" }] };
    }
    const { brand } = loaderData;
    const title = `${brand.name} — Frass Brand Partnerships`;
    return {
      meta: [
        { title },
        { name: "description", content: brand.about },
        { property: "og:title", content: title },
        { property: "og:description", content: brand.about },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  errorComponent: () => <Fallback message="This brand could not be loaded." />,
  notFoundComponent: () => <Fallback message="This brand is no longer listed." />,
  component: BrandPage,
});

function Fallback({ message }: { message: string }) {
  return (
    <SiteShell>
      <div className="mx-auto max-w-3xl px-6 py-32 text-center text-white/60">
        <p>{message}</p>
        <Link to="/brand-partnerships" className="mt-6 inline-block text-amber-300">
          Back to the marketplace
        </Link>
      </div>
    </SiteShell>
  );
}

function BrandPage() {
  const { brand, campaigns } = Route.useLoaderData();

  return (
    <SiteShell>
      <div className="min-h-screen bg-black text-white">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
          <Link
            to="/brand-partnerships"
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-white/40 hover:text-amber-300"
          >
            <ArrowLeft className="h-3 w-3" /> Marketplace
          </Link>

          <header className="mt-8 border-b border-white/10 pb-10">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <h1 className="text-3xl font-light uppercase tracking-[0.14em] sm:text-4xl">
                {brand.name}
              </h1>
              {brand.verified && (
                <span className="flex items-center gap-2 rounded-full border border-emerald-300/40 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-emerald-200">
                  <ShieldCheck className="h-4 w-4" /> Verified brand
                </span>
              )}
            </div>
            <p className="mt-5 max-w-3xl text-base text-white/65">{brand.about}</p>
            <div className="mt-6 flex flex-wrap gap-2 text-[11px]">
              {brand.industries.map((i) => {
                const meta = INDUSTRIES.find((x) => x.key === i);
                return (
                  <span key={i} className="rounded-full border border-white/12 px-3 py-1 text-white/55">
                    {meta?.icon} {meta?.label ?? i}
                  </span>
                );
              })}
              {brand.countries.map((c) => {
                const m = CAMPAIGN_MARKETS.find((x) => x.key === c);
                return (
                  <span key={c} className="rounded-full border border-white/12 px-3 py-1 text-white/55">
                    {m?.flag} {m?.label ?? c}
                  </span>
                );
              })}
            </div>
          </header>

          <dl className="mt-8 grid gap-4 sm:grid-cols-3">
            <Card label="Active campaigns" value={String(brand.activeCampaigns)} />
            <Card label="Completed campaigns" value={String(brand.pastCampaigns)} />
            <Card label="Creator rating" value={`${brand.creatorRating.toFixed(1)} / 5`} />
          </dl>

          <section className="mt-14">
            <h2 className="text-xl font-light uppercase tracking-[0.16em]">Campaigns from this brand</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {campaigns.map((c) => {
                const money = settlementPreview(c.budgetUsd);
                return (
                  <Link
                    key={c.key}
                    to="/brand-partnerships/campaigns/$campaign"
                    params={{ campaign: c.key }}
                    className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition hover:border-amber-300/40"
                  >
                    <p className="text-sm text-white/85">{c.title}</p>
                    <p className="mt-2 text-xs text-white/45">{c.brief}</p>
                    <p className="mt-4 text-lg font-light text-amber-200">
                      US${c.budgetUsd.toLocaleString()}
                      <span className="ml-2 text-[11px] text-white/40">
                        creator keeps US${money.creatorNet.toLocaleString()}
                      </span>
                    </p>
                  </Link>
                );
              })}
              {campaigns.length === 0 && (
                <p className="text-sm text-white/45">No live campaigns from this brand right now.</p>
              )}
            </div>
          </section>

          <p className="mt-12 text-xs text-white/35">Partnership contact: {brand.contact}</p>
        </div>
      </div>
    </SiteShell>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <dt className="text-[10px] uppercase tracking-[0.24em] text-white/35">{label}</dt>
      <dd className="mt-2 text-2xl font-light text-white/85">{value}</dd>
    </div>
  );
}
