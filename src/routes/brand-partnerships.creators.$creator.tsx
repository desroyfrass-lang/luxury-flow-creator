// FRASS-0410 — Creator media kit.
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, BadgeCheck, EyeOff, Star } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import {
  CERTIFIED_BADGE,
  creatorBySlug,
  meetsCertification,
  recommendedCampaigns,
} from "@/lib/brand-partnerships";

export const Route = createFileRoute("/brand-partnerships/creators/$creator")({
  loader: ({ params }) => {
    const creator = creatorBySlug(params.creator);
    if (!creator) throw notFound();
    return { creator };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Creator unavailable — Frass" }, { name: "robots", content: "noindex" }] };
    }
    const { creator } = loaderData;
    const title = `${creator.name} — Frass Creator Media Kit`;
    return {
      meta: [
        { title },
        { name: "description", content: creator.headline },
        { property: "og:title", content: title },
        { property: "og:description", content: creator.headline },
        { property: "og:type", content: "profile" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  errorComponent: () => <Fallback message="This media kit could not be loaded." />,
  notFoundComponent: () => <Fallback message="This creator is no longer listed." />,
  component: CreatorPage,
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

function CreatorPage() {
  const { creator } = Route.useLoaderData();
  const certified = meetsCertification(creator);
  const matches = recommendedCampaigns(creator);
  const reach = creator.audience.reduce((n, a) => n + a.followers, 0);

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
              <div>
                <h1 className="text-3xl font-light uppercase tracking-[0.14em] sm:text-4xl">
                  {creator.name}
                </h1>
                <p className="mt-4 max-w-2xl text-base text-white/65">{creator.headline}</p>
              </div>
              {certified && (
                <span className="flex items-center gap-2 rounded-full border border-amber-300/45 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-amber-200">
                  <BadgeCheck className="h-4 w-4" /> {CERTIFIED_BADGE}
                </span>
              )}
            </div>
            <div className="mt-6 flex flex-wrap gap-2 text-[11px]">
              {creator.faceless && (
                <Pill tone="emerald">
                  <EyeOff className="mr-1 inline h-3 w-3" /> Faceless creator
                </Pill>
              )}
              <Pill>{creator.available ? "Available now" : "Currently booked"}</Pill>
              {creator.rateFromUsd !== null && <Pill>From US${creator.rateFromUsd}</Pill>}
              {creator.countriesServed.map((c) => (
                <Pill key={c}>{c}</Pill>
              ))}
            </div>
          </header>

          <div className="mt-10 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <div className="space-y-6">
              <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6">
                <h2 className="text-[11px] uppercase tracking-[0.3em] text-white/40">Audience</h2>
                <div className="mt-4 space-y-3">
                  {creator.audience.map((a) => (
                    <div
                      key={a.platform}
                      className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/30 p-4 text-sm"
                    >
                      <span className="text-white/80">{a.platform}</span>
                      <span className="text-white/50">
                        {a.followers.toLocaleString()} followers · {a.engagementPct}% engaged · top {a.topCountry}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-xs text-white/40">
                  Total reach {reach.toLocaleString()} across {creator.audience.length} platforms.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6">
                <h2 className="text-[11px] uppercase tracking-[0.3em] text-white/40">Portfolio</h2>
                <ul className="mt-4 space-y-2 text-sm text-white/65">
                  {creator.portfolio.map((p) => (
                    <li key={p.title}>
                      · {p.title} <span className="text-white/35">({p.type})</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6">
                <h2 className="text-[11px] uppercase tracking-[0.3em] text-white/40">Brand reviews</h2>
                <div className="mt-4 space-y-3">
                  {creator.reviews.map((r) => (
                    <div key={r.brand} className="rounded-2xl border border-white/8 bg-black/30 p-4">
                      <p className="flex items-center gap-2 text-sm text-white/80">
                        {r.brand}
                        <span className="flex items-center gap-0.5 text-amber-300">
                          {Array.from({ length: r.stars }).map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-current" />
                          ))}
                        </span>
                      </p>
                      <p className="mt-1 text-xs text-white/50">&ldquo;{r.quote}&rdquo;</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <aside className="space-y-6">
              <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6">
                <h2 className="text-[11px] uppercase tracking-[0.3em] text-white/40">Performance</h2>
                <dl className="mt-4 space-y-3 text-sm">
                  <Row label="Rating" value={`${creator.rating.toFixed(1)} / 5`} />
                  <Row label="Completed campaigns" value={String(creator.completedCampaigns)} />
                  <Row label="On-time delivery" value={`${creator.onTimePct}%`} />
                  <Row label="Reliability" value={`${creator.reliabilityScore}/100`} />
                  <Row label="Brand safety" value={`${creator.brandSafetyScore}/100`} />
                </dl>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6">
                <h2 className="text-[11px] uppercase tracking-[0.3em] text-white/40">Skills & languages</h2>
                <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
                  {[...creator.skills, ...creator.languages].map((s) => (
                    <Pill key={s}>{s}</Pill>
                  ))}
                </div>
              </div>

              <button
                type="button"
                className="w-full rounded-full bg-amber-300 px-5 py-3 text-[11px] uppercase tracking-[0.3em] text-black transition hover:bg-amber-200"
              >
                Invite to a campaign
              </button>
            </aside>
          </div>

          <section className="mt-14">
            <h2 className="text-xl font-light uppercase tracking-[0.16em]">Campaigns Frassy would suggest</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {matches.map((m) => (
                <Link
                  key={m.campaign.key}
                  to="/brand-partnerships/campaigns/$campaign"
                  params={{ campaign: m.campaign.key }}
                  className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition hover:border-amber-300/40"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm text-white/85">{m.campaign.title}</p>
                    <span className="text-xs text-amber-300">{m.score}%</span>
                  </div>
                  <ul className="mt-3 space-y-1 text-xs text-white/45">
                    {m.reasons.map((r) => (
                      <li key={r}>· {r}</li>
                    ))}
                  </ul>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </SiteShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-white/45">{label}</dt>
      <dd className="text-white/85">{value}</dd>
    </div>
  );
}

function Pill({ children, tone }: { children: React.ReactNode; tone?: "emerald" }) {
  const cls =
    tone === "emerald"
      ? "border-emerald-300/30 text-emerald-100/80"
      : "border-white/12 text-white/55";
  return <span className={`rounded-full border px-3 py-1 ${cls}`}>{children}</span>;
}
