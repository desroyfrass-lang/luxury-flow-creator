// FRASS-0410 — Campaign brief & dashboard.
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck, EyeOff } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import {
  CAMPAIGN_LIFECYCLE,
  ESCROW_FLOW,
  brandBySlug,
  campaignByKey,
  recommendedCreators,
  settlementPreview,
} from "@/lib/brand-partnerships";

export const Route = createFileRoute("/brand-partnerships/campaigns/$campaign")({
  loader: ({ params }) => {
    const campaign = campaignByKey(params.campaign);
    if (!campaign) throw notFound();
    return { campaign };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Campaign unavailable — Frass" }, { name: "robots", content: "noindex" }] };
    }
    const { campaign } = loaderData;
    const title = `${campaign.title} — Frass Brand Partnerships`;
    return {
      meta: [
        { title },
        { name: "description", content: campaign.brief },
        { property: "og:title", content: title },
        { property: "og:description", content: campaign.brief },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  errorComponent: () => <Fallback message="This campaign could not be loaded." />,
  notFoundComponent: () => <Fallback message="This campaign is no longer listed." />,
  component: CampaignPage,
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

function CampaignPage() {
  const { campaign } = Route.useLoaderData();
  const brand = brandBySlug(campaign.brandSlug);
  const money = settlementPreview(campaign.budgetUsd);
  const matches = recommendedCreators(campaign);

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
            <p className="text-[11px] uppercase tracking-[0.4em] text-amber-300/70">{brand?.name}</p>
            <h1 className="mt-4 text-3xl font-light uppercase tracking-[0.14em] sm:text-4xl">
              {campaign.title}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-relaxed text-white/65">{campaign.brief}</p>
            <div className="mt-6 flex flex-wrap gap-2 text-[11px]">
              <Pill>{campaign.type}</Pill>
              <Pill>{campaign.markets.join(" · ")}</Pill>
              <Pill>{campaign.languages.join(" · ")}</Pill>
              {!campaign.onCameraRequired && (
                <Pill tone="emerald">
                  <EyeOff className="mr-1 inline h-3 w-3" /> No camera required
                </Pill>
              )}
              {campaign.production === "fv-produced" && <Pill tone="amber">FV Studios produced</Pill>}
            </div>
          </header>

          <div className="mt-10 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <div className="space-y-6">
              <Block title="Objectives" items={campaign.objectives} />
              <Block title="Deliverables" items={campaign.deliverables} />
              <Block title="Brand guidelines" items={campaign.guidelines} />
              <Block title="Brand assets provided" items={campaign.brandAssets} />
            </div>

            <aside className="space-y-6">
              <div className="rounded-3xl border border-amber-300/30 bg-amber-300/[0.05] p-6">
                <p className="text-[11px] uppercase tracking-[0.3em] text-amber-300/70">Compensation</p>
                <p className="mt-3 text-3xl font-light text-amber-200">
                  US${campaign.budgetUsd.toLocaleString()}
                </p>
                <ul className="mt-4 space-y-2 text-sm text-white/65">
                  {campaign.compensation.map((c) => (
                    <li key={c.detail}>· {c.detail}</li>
                  ))}
                </ul>
                <div className="mt-5 border-t border-white/10 pt-4 text-xs text-white/50">
                  <p>Platform service fee ({money.feePct}%): US${money.fee.toLocaleString()}</p>
                  <p className="mt-1 text-white/80">
                    You receive US${money.creatorNet.toLocaleString()} in your Frass Wallet.
                  </p>
                </div>
                <button
                  type="button"
                  className="mt-6 w-full rounded-full bg-amber-300 px-5 py-3 text-[11px] uppercase tracking-[0.3em] text-black transition hover:bg-amber-200"
                >
                  Apply to this campaign
                </button>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 text-sm text-white/60">
                <p className="flex items-center gap-2 text-white/80">
                  <ShieldCheck className="h-4 w-4 text-emerald-300" /> Funds held in escrow
                </p>
                <p className="mt-2 text-xs text-white/45">
                  The budget is paid up front and released the moment the brand approves your work.
                </p>
                <ul className="mt-4 space-y-1 text-xs text-white/45">
                  {ESCROW_FLOW.slice(0, 4).map((s) => (
                    <li key={s.step}>
                      {s.step}. {s.title}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 text-sm text-white/60">
                <p className="text-white/80">Terms</p>
                <ul className="mt-3 space-y-1 text-xs text-white/45">
                  <li>Deadline: {campaign.deadlineDays} days from acceptance</li>
                  <li>Revisions included: {campaign.revisionsIncluded}</li>
                  <li>Status: {campaign.status.replace("-", " ")}</li>
                </ul>
              </div>
            </aside>
          </div>

          <section className="mt-14">
            <h2 className="text-xl font-light uppercase tracking-[0.16em]">Frassy&rsquo;s suggested creators</h2>
            <p className="mt-2 text-sm text-white/45">
              Matching is explainable — every suggestion shows its reasons.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {matches.map((m) => (
                <Link
                  key={m.creator.slug}
                  to="/brand-partnerships/creators/$creator"
                  params={{ creator: m.creator.slug }}
                  className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition hover:border-amber-300/40"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-white/85">{m.creator.name}</p>
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

          <section className="mt-14">
            <h2 className="text-xl font-light uppercase tracking-[0.16em]">What happens after you apply</h2>
            <ol className="mt-6 space-y-2">
              {CAMPAIGN_LIFECYCLE.slice(2).map((s) => (
                <li key={s.step} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                  <p className="text-sm text-white/80">{s.title}</p>
                  <p className="mt-1 text-xs text-white/45">{s.plain}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </SiteShell>
  );
}

function Block({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6">
      <h2 className="text-[11px] uppercase tracking-[0.3em] text-white/40">{title}</h2>
      <ul className="mt-4 space-y-2 text-sm text-white/65">
        {items.map((i) => (
          <li key={i}>· {i}</li>
        ))}
      </ul>
    </div>
  );
}

function Pill({ children, tone }: { children: React.ReactNode; tone?: "emerald" | "amber" }) {
  const cls =
    tone === "emerald"
      ? "border-emerald-300/30 text-emerald-100/80"
      : tone === "amber"
        ? "border-amber-300/35 text-amber-200/85"
        : "border-white/12 text-white/55";
  return <span className={`rounded-full border px-3 py-1 ${cls}`}>{children}</span>;
}
