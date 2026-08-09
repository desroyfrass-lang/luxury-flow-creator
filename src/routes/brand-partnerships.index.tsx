// FRASS-0410 — Frass Brand Partnerships Network: Creator Sponsorship & Campaign Marketplace.
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Handshake,
  EyeOff,
  Wallet,
  ShieldCheck,
  Globe2,
  Sparkles,
  BadgeCheck,
  Building2,
} from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import {
  BP_AUDIENCES,
  BP_PLACEMENTS,
  BP_PRINCIPLE,
  BP_REVENUE_RULE,
  BP_REVENUE_SOURCES,
  BRANDS,
  CAMPAIGN_LIFECYCLE,
  CAMPAIGN_MARKETS,
  CAMPAIGN_TYPES,
  CERTIFIED_BADGE,
  CERTIFIED_CRITERIA,
  COMPENSATION_MODELS,
  CREATORS,
  ESCROW_FLOW,
  FACELESS_FORMATS,
  FACELESS_RULE,
  FEEDBACK_DIMENSIONS,
  FEEDBACK_RULE,
  INDUSTRIES,
  MATCH_SIGNALS,
  PRODUCTION_MODES,
  RELATIONSHIP_TIERS,
  filterCampaigns,
  meetsCertification,
  settlementPreview,
  type Industry,
  type ProductionMode,
} from "@/lib/brand-partnerships";

export const Route = createFileRoute("/brand-partnerships/")({
  head: () => ({
    meta: [
      { title: "Frass Brand Partnerships Network — Paid Creator Campaigns" },
      {
        name: "description",
        content:
          "Brands post funded campaigns, creators deliver, and Frass handles matching, production, escrow payments and reporting. Faceless creators fully welcome.",
      },
      { property: "og:title", content: "Frass Brand Partnerships Network" },
      {
        property: "og:description",
        content:
          "A full-service creator sponsorship marketplace: briefs, escrow-held budgets, FV Studios production and wallet payouts.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BrandPartnershipsPage,
});

type Tab = "campaigns" | "creators" | "brands" | "how" | "revenue";

const TABS: { key: Tab; label: string }[] = [
  { key: "campaigns", label: "Campaigns" },
  { key: "creators", label: "Creators" },
  { key: "brands", label: "Brand Directory" },
  { key: "how", label: "How it works" },
  { key: "revenue", label: "Platform revenue" },
];

function BrandPartnershipsPage() {
  const [tab, setTab] = useState<Tab>("campaigns");

  return (
    <SiteShell>
      <div className="min-h-screen bg-black text-white">
        <header className="relative overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(252,211,77,0.14),transparent_60%)]" />
          <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
            <p className="text-[11px] uppercase tracking-[0.5em] text-amber-300/70">FRASS-0410</p>
            <h1 className="mt-4 text-4xl font-light uppercase tracking-[0.18em] sm:text-5xl">
              Brand Partnerships
              <span className="block text-amber-300">Network</span>
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-relaxed text-white/70">{BP_PRINCIPLE}</p>
            <p className="mt-3 max-w-3xl text-sm text-white/45">
              <strong className="text-white/70">What this means in plain English:</strong> think of a
              talent agency, a production house, an accountant and a job board living in one building.
              A brand puts money on the table, you make the work, Frass makes sure everybody keeps
              their word and gets paid.
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              {BP_AUDIENCES.map((a) => (
                <span
                  key={a}
                  className="rounded-full border border-white/12 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/55"
                >
                  {a}
                </span>
              ))}
            </div>
          </div>
        </header>

        <nav className="sticky top-0 z-20 border-b border-white/10 bg-black/85 backdrop-blur">
          <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 sm:px-6">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`whitespace-nowrap px-4 py-4 text-[11px] uppercase tracking-[0.3em] transition ${
                  tab === t.key
                    ? "border-b-2 border-amber-300 text-amber-300"
                    : "border-b-2 border-transparent text-white/45 hover:text-white/80"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </nav>

        <div className="mx-auto max-w-6xl space-y-16 px-4 py-14 sm:px-6">
          {tab === "campaigns" && <CampaignsTab />}
          {tab === "creators" && <CreatorsTab />}
          {tab === "brands" && <BrandsTab />}
          {tab === "how" && <HowTab />}
          {tab === "revenue" && <RevenueTab />}

          <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-6">
            <h2 className="text-lg font-light tracking-wide">Where this lives</h2>
            <p className="mt-2 text-sm text-white/50">
              One network, many doors. The same campaigns and the same money show up everywhere you
              already work.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {BP_PLACEMENTS.map((p) => (
                <Link
                  key={p.to}
                  to={p.to}
                  className="rounded-full border border-white/12 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/65 transition hover:border-amber-300/50 hover:text-amber-200"
                >
                  {p.label}
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </SiteShell>
  );
}

// ── Campaigns ────────────────────────────────────────────────────────────────
function CampaignsTab() {
  const [industry, setIndustry] = useState<Industry | "all">("all");
  const [market, setMarket] = useState<string>("all");
  const [production, setProduction] = useState<ProductionMode | "all">("all");
  const [facelessOnly, setFacelessOnly] = useState(false);

  const campaigns = filterCampaigns({ industry, market, production, facelessOnly });

  return (
    <>
      <section className="rounded-3xl border border-emerald-300/25 bg-emerald-300/[0.04] p-6">
        <h2 className="flex items-center gap-3 text-lg font-light tracking-wide">
          <EyeOff className="h-5 w-5 text-emerald-300" />
          Faceless creators fully welcome
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/65">{FACELESS_RULE}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {FACELESS_FORMATS.map((f) => (
            <span
              key={f}
              className="rounded-full border border-emerald-300/25 px-3 py-1 text-xs text-emerald-100/80"
            >
              {f}
            </span>
          ))}
        </div>
      </section>

      <section>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-2xl font-light uppercase tracking-[0.16em]">Open campaigns</h2>
          <label className="flex cursor-pointer items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/55">
            <input
              type="checkbox"
              checked={facelessOnly}
              onChange={(e) => setFacelessOnly(e.target.checked)}
              className="h-4 w-4 accent-emerald-400"
            />
            No camera required
          </label>
        </div>

        <div className="mt-6 space-y-3">
          <FilterRow label="Industry">
            <Chip active={industry === "all"} onClick={() => setIndustry("all")}>
              All
            </Chip>
            {INDUSTRIES.map((i) => (
              <Chip key={i.key} active={industry === i.key} onClick={() => setIndustry(i.key)}>
                {i.icon} {i.label}
              </Chip>
            ))}
          </FilterRow>
          <FilterRow label="Market">
            <Chip active={market === "all"} onClick={() => setMarket("all")}>
              All
            </Chip>
            {CAMPAIGN_MARKETS.map((m) => (
              <Chip key={m.key} active={market === m.key} onClick={() => setMarket(m.key)}>
                {m.flag} {m.label}
              </Chip>
            ))}
          </FilterRow>
          <FilterRow label="Production">
            <Chip active={production === "all"} onClick={() => setProduction("all")}>
              All
            </Chip>
            {PRODUCTION_MODES.map((p) => (
              <Chip key={p.key} active={production === p.key} onClick={() => setProduction(p.key)}>
                {p.label}
              </Chip>
            ))}
          </FilterRow>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {campaigns.map((c) => {
            const brand = BRANDS.find((b) => b.slug === c.brandSlug);
            const money = settlementPreview(c.budgetUsd);
            return (
              <Link
                key={c.key}
                to="/brand-partnerships/campaigns/$campaign"
                params={{ campaign: c.key }}
                className="group rounded-3xl border border-white/10 bg-white/[0.02] p-6 transition hover:border-amber-300/40 hover:bg-white/[0.04]"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-amber-300/70">
                    {brand?.name}
                  </p>
                  <span className="rounded-full border border-white/12 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-white/45">
                    {c.status.replace("-", " ")}
                  </span>
                </div>
                <h3 className="mt-3 text-lg font-light tracking-wide group-hover:text-amber-200">
                  {c.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{c.brief}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
                  <Tag>{c.type}</Tag>
                  {!c.onCameraRequired && <Tag tone="emerald">Faceless welcome</Tag>}
                  {c.production === "fv-produced" && <Tag tone="amber">FV Studios produced</Tag>}
                  <Tag>{c.markets.join(" · ")}</Tag>
                </div>
                <div className="mt-5 flex items-end justify-between border-t border-white/8 pt-4">
                  <div>
                    <p className="text-2xl font-light text-amber-200">
                      US${c.budgetUsd.toLocaleString()}
                    </p>
                    <p className="text-[11px] text-white/40">
                      You keep US${money.creatorNet.toLocaleString()} after the {money.feePct}% service fee
                    </p>
                  </div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">
                    {c.deadlineDays} days
                  </p>
                </div>
              </Link>
            );
          })}
          {campaigns.length === 0 && (
            <p className="text-sm text-white/45">No campaigns match those filters yet.</p>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-light uppercase tracking-[0.16em]">Campaign types brands can post</h2>
        <div className="mt-5 flex flex-wrap gap-2">
          {CAMPAIGN_TYPES.map((t) => (
            <span
              key={t}
              className="rounded-full border border-white/12 px-3 py-1 text-xs text-white/60"
            >
              {t}
            </span>
          ))}
        </div>
      </section>
    </>
  );
}

// ── Creators ─────────────────────────────────────────────────────────────────
function CreatorsTab() {
  return (
    <>
      <section>
        <h2 className="text-2xl font-light uppercase tracking-[0.16em]">Creator media kits</h2>
        <p className="mt-3 max-w-3xl text-sm text-white/55">
          Every creator carries a professional media kit: audience, engagement, languages, delivery
          record and brand safety. Brands hire from evidence, not guesswork.
        </p>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {CREATORS.map((c) => (
            <Link
              key={c.slug}
              to="/brand-partnerships/creators/$creator"
              params={{ creator: c.slug }}
              className="group rounded-3xl border border-white/10 bg-white/[0.02] p-6 transition hover:border-amber-300/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-light tracking-wide group-hover:text-amber-200">
                    {c.name}
                  </h3>
                  <p className="mt-1 text-sm text-white/55">{c.headline}</p>
                </div>
                {meetsCertification(c) && (
                  <span className="flex shrink-0 items-center gap-1 rounded-full border border-amber-300/40 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-amber-200">
                    <BadgeCheck className="h-3 w-3" /> Certified
                  </span>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
                {c.faceless && <Tag tone="emerald">Faceless</Tag>}
                {c.categories.map((cat) => (
                  <Tag key={cat}>{cat}</Tag>
                ))}
              </div>
              <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-white/8 pt-4 text-center">
                <Stat label="Rating" value={c.rating.toFixed(1)} />
                <Stat label="Campaigns" value={String(c.completedCampaigns)} />
                <Stat label="On time" value={`${c.onTimePct}%`} />
              </dl>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-amber-300/25 bg-amber-300/[0.04] p-6">
        <h2 className="flex items-center gap-3 text-lg font-light tracking-wide">
          <BadgeCheck className="h-5 w-5 text-amber-300" />
          {CERTIFIED_BADGE}
        </h2>
        <p className="mt-2 text-sm text-white/60">
          A badge you earn by delivering, not by paying. Brands can filter for it.
        </p>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {CERTIFIED_CRITERIA.map((c) => (
            <li key={c.label} className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="text-sm text-white/80">{c.label}</p>
              <p className="mt-1 text-xs text-white/45">{c.threshold}</p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="flex items-center gap-3 text-2xl font-light uppercase tracking-[0.16em]">
          <Sparkles className="h-5 w-5 text-amber-300" /> Smart matching
        </h2>
        <p className="mt-3 max-w-3xl text-sm text-white/55">
          Frassy matches creators to campaigns on these signals, and always shows the reason for the
          match in plain language.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {MATCH_SIGNALS.map((s) => (
            <span key={s} className="rounded-full border border-white/12 px-3 py-1 text-xs text-white/60">
              {s}
            </span>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-6">
        <h2 className="text-lg font-light tracking-wide">Coaching after every campaign</h2>
        <p className="mt-2 max-w-3xl text-sm text-white/55">{FEEDBACK_RULE}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {FEEDBACK_DIMENSIONS.map((d) => (
            <span key={d} className="rounded-full border border-white/12 px-3 py-1 text-xs text-white/60">
              {d}
            </span>
          ))}
        </div>
      </section>
    </>
  );
}

// ── Brands ───────────────────────────────────────────────────────────────────
function BrandsTab() {
  return (
    <>
      <section>
        <h2 className="text-2xl font-light uppercase tracking-[0.16em]">Brand directory</h2>
        <p className="mt-3 max-w-3xl text-sm text-white/55">
          Verified businesses currently working with Frass creators. Creators can see a brand&rsquo;s
          history and rating before they ever apply.
        </p>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {BRANDS.map((b) => (
            <Link
              key={b.slug}
              to="/brand-partnerships/brands/$brand"
              params={{ brand: b.slug }}
              className="group rounded-3xl border border-white/10 bg-white/[0.02] p-6 transition hover:border-amber-300/40"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="flex items-center gap-2 text-lg font-light tracking-wide group-hover:text-amber-200">
                  <Building2 className="h-4 w-4 text-white/40" />
                  {b.name}
                </h3>
                {b.verified && (
                  <span className="flex items-center gap-1 rounded-full border border-emerald-300/35 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-emerald-200">
                    <ShieldCheck className="h-3 w-3" /> Verified
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-white/55">{b.about}</p>
              <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-white/8 pt-4 text-center">
                <Stat label="Active" value={String(b.activeCampaigns)} />
                <Stat label="Completed" value={String(b.pastCampaigns)} />
                <Stat label="Creator rating" value={b.creatorRating.toFixed(1)} />
              </dl>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="flex items-center gap-3 text-2xl font-light uppercase tracking-[0.16em]">
          <Globe2 className="h-5 w-5 text-amber-300" /> Markets we run campaigns in
        </h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {CAMPAIGN_MARKETS.map((m) => (
            <div
              key={m.key}
              className="rounded-2xl border border-white/10 bg-white/[0.02] p-4"
            >
              <p className="text-sm text-white/80">
                {m.flag} {m.label}
              </p>
              <p className="mt-1 text-xs text-white/40">
                {m.currency} · {m.tier === "primary" ? "Primary market" : "Expansion market"}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

// ── How it works ─────────────────────────────────────────────────────────────
function HowTab() {
  const example = settlementPreview(1000);
  return (
    <>
      <section>
        <h2 className="text-2xl font-light uppercase tracking-[0.16em]">Campaign lifecycle</h2>
        <ol className="mt-6 space-y-3">
          {CAMPAIGN_LIFECYCLE.map((s) => (
            <li key={s.step} className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <span className="text-sm text-amber-300/70">{String(s.step).padStart(2, "0")}</span>
              <div>
                <p className="text-sm text-white/85">{s.title}</p>
                <p className="mt-1 text-xs text-white/45">{s.plain}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-3xl border border-amber-300/25 bg-amber-300/[0.04] p-6">
        <h2 className="flex items-center gap-3 text-lg font-light tracking-wide">
          <Wallet className="h-5 w-5 text-amber-300" /> Money held safely until the work is approved
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-white/60">
          <strong className="text-white/80">Plain English:</strong> escrow is a locked drawer. The brand
          puts the money in before you start, so the funds are proven to exist. Nobody can take it out
          until the brand approves your work — then it opens automatically.
        </p>
        <ol className="mt-6 grid gap-3 sm:grid-cols-2">
          {ESCROW_FLOW.map((s) => (
            <li key={s.step} className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="text-[11px] uppercase tracking-[0.24em] text-amber-300/60">Step {s.step}</p>
              <p className="mt-2 text-sm text-white/85">{s.title}</p>
              <p className="mt-1 text-xs text-white/45">{s.plain}</p>
            </li>
          ))}
        </ol>
        <div className="mt-6 rounded-2xl border border-white/10 bg-black/40 p-5">
          <p className="text-[11px] uppercase tracking-[0.24em] text-white/40">Worked example</p>
          <p className="mt-3 text-sm text-white/70">
            A US${example.gross.toLocaleString()} campaign: Frass deducts the published{" "}
            {example.feePct}% service fee (US${example.fee.toLocaleString()}), and{" "}
            <strong className="text-amber-200">US${example.creatorNet.toLocaleString()}</strong> lands in
            the creator&rsquo;s Frass Wallet with a line-by-line receipt.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-light uppercase tracking-[0.16em]">How creators get paid</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {COMPENSATION_MODELS.map((m) => (
            <div key={m.key} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <p className="text-sm text-white/85">{m.label}</p>
              <p className="mt-1 text-xs text-white/45">{m.plain}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="flex items-center gap-3 text-2xl font-light uppercase tracking-[0.16em]">
          <Handshake className="h-5 w-5 text-amber-300" /> Long-term relationships
        </h2>
        <p className="mt-3 max-w-3xl text-sm text-white/55">
          One campaign should be able to become a career. Brands can move creators into ongoing
          arrangements without leaving the platform.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {RELATIONSHIP_TIERS.map((t) => (
            <div key={t.key} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <p className="text-sm text-white/85">{t.label}</p>
              <p className="mt-1 text-xs text-white/45">{t.plain}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

// ── Revenue ──────────────────────────────────────────────────────────────────
function RevenueTab() {
  return (
    <section>
      <h2 className="text-2xl font-light uppercase tracking-[0.16em]">How the platform earns</h2>
      <p className="mt-3 max-w-3xl text-sm text-white/55">{BP_REVENUE_RULE}</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {BP_REVENUE_SOURCES.map((s) => (
          <div key={s.key} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <p className="text-sm text-white/85">{s.label}</p>
            <p className="mt-1 text-xs text-white/45">{s.plain}</p>
          </div>
        ))}
      </div>
      <p className="mt-8 max-w-3xl text-sm text-white/45">
        <strong className="text-white/70">Plain English:</strong> Frass never earns in the dark. If a
        percentage is taken, it is printed on the receipt both sides can read.
      </p>
    </section>
  );
}

// ── Small pieces ─────────────────────────────────────────────────────────────
function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-[10px] uppercase tracking-[0.3em] text-white/30">{label}</span>
      {children}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] transition ${
        active
          ? "border-amber-300/60 bg-amber-300/10 text-amber-200"
          : "border-white/12 text-white/50 hover:text-white/80"
      }`}
    >
      {children}
    </button>
  );
}

function Tag({ children, tone }: { children: React.ReactNode; tone?: "emerald" | "amber" }) {
  const cls =
    tone === "emerald"
      ? "border-emerald-300/30 text-emerald-100/80"
      : tone === "amber"
        ? "border-amber-300/35 text-amber-200/85"
        : "border-white/12 text-white/55";
  return <span className={`rounded-full border px-2.5 py-1 ${cls}`}>{children}</span>;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-[0.2em] text-white/35">{label}</dt>
      <dd className="mt-1 text-sm text-white/80">{value}</dd>
    </div>
  );
}
