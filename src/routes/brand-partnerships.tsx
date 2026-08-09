// FRASS-0408 §2 — Brand Partnership Marketplace.
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Handshake, EyeOff, Wallet, Route as RouteIcon } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import {
  BRAND_CAMPAIGNS,
  CAMPAIGN_CATEGORIES,
  CAMPAIGN_LIFECYCLE,
  CAMPAIGN_MONEY_RULES,
  CAMPAIGN_PLACEMENTS,
  COMPENSATION_MODELS,
  FACELESS_FORMATS,
  campaignsByCategory,
  type CampaignCategory,
} from "@/lib/brand-partnerships";

export const Route = createFileRoute("/brand-partnerships")({
  head: () => ({
    meta: [
      { title: "Brand Partnerships — Paid Campaigns for Frass Creators" },
      {
        name: "description",
        content:
          "Paid brand campaigns for Frass creators, including faceless creators. Clear briefs, published compensation, and payment straight into your Frass Wallet.",
      },
      { property: "og:title", content: "Brand Partnerships — Paid Campaigns for Frass Creators" },
      {
        property: "og:description",
        content: "Brands post briefs, creators build them in FV Studios, and the money lands with a full receipt.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BrandPartnershipsPage,
});

function BrandPartnershipsPage() {
  const [cat, setCat] = useState<CampaignCategory | "all">("all");
  const [facelessOnly, setFacelessOnly] = useState(false);
  const campaigns = campaignsByCategory(cat).filter((c) => (facelessOnly ? !c.onCameraRequired : true));

  return (
    <SiteShell>
      <div className="min-h-screen bg-black text-white">
        <header className="relative overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(252,211,77,0.14),transparent_60%)]" />
          <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
            <p className="text-[11px] uppercase tracking-[0.5em] text-amber-300/70">FRASS-0408</p>
            <h1 className="mt-4 text-4xl font-light uppercase tracking-[0.18em] sm:text-5xl">
              Brand
              <span className="block text-amber-300">Partnerships</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/70">
              Businesses post what they need made. Creators build it in FV Studios and get paid. You
              never have to show your face to earn here.
            </p>
            <p className="mt-3 max-w-2xl text-sm text-white/45">
              <strong className="text-white/70">What this means in plain English:</strong> it works like
              a job board for creative work. A brand says &ldquo;make me this, here&rsquo;s what I pay&rdquo;, you
              accept, you deliver, the money lands in your wallet with a receipt.
            </p>
          </div>
        </header>

        <div className="mx-auto max-w-6xl space-y-16 px-4 py-14 sm:px-6">
          {/* Faceless creators */}
          <section className="rounded-3xl border border-emerald-300/25 bg-emerald-300/[0.04] p-6">
            <h2 className="flex items-center gap-3 text-lg font-light tracking-wide">
              <EyeOff className="h-5 w-5 text-emerald-300" /> Faceless creators are first-class here
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/65">
              A campaign can be delivered entirely without appearing on camera. Only a brief that
              explicitly asks for a presenter requires one, and it is labelled before you apply.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {FACELESS_FORMATS.map((f) => (
                <span
                  key={f}
                  className="rounded-full border border-white/15 px-3 py-1 text-[11px] text-white/60"
                >
                  {f}
                </span>
              ))}
            </div>
          </section>

          {/* Filters + campaigns */}
          <section>
            <div className="flex flex-wrap items-center gap-2">
              <FilterChip active={cat === "all"} onClick={() => setCat("all")} label="All campaigns" />
              {CAMPAIGN_CATEGORIES.map((c) => (
                <FilterChip
                  key={c.key}
                  active={cat === c.key}
                  onClick={() => setCat(c.key)}
                  label={`${c.icon} ${c.label}`}
                />
              ))}
              <button
                onClick={() => setFacelessOnly((v) => !v)}
                className={`ml-auto rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.2em] transition ${
                  facelessOnly
                    ? "border-emerald-300/60 bg-emerald-300/10 text-emerald-200"
                    : "border-white/15 text-white/55 hover:border-emerald-300/40"
                }`}
              >
                No camera needed
              </button>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {campaigns.map((c) => (
                <article
                  key={c.key}
                  className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition hover:border-amber-300/40"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.3em] text-amber-300/70">
                        {c.brand}
                      </p>
                      <h3 className="mt-1.5 text-lg font-light tracking-wide">{c.title}</h3>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[9px] uppercase tracking-widest ${
                        c.status === "open"
                          ? "bg-emerald-400/15 text-emerald-300"
                          : c.status === "reviewing"
                            ? "bg-amber-300/15 text-amber-200"
                            : "bg-white/10 text-white/40"
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-white/60">{c.brief}</p>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.25em] text-white/35">Guidelines</p>
                      <ul className="mt-2 space-y-1">
                        {c.guidelines.map((g) => (
                          <li key={g} className="text-[11px] text-white/55">
                            · {g}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.25em] text-white/35">Deliverables</p>
                      <ul className="mt-2 space-y-1">
                        {c.deliverables.map((d) => (
                          <li key={d} className="text-[11px] text-white/55">
                            · {d}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-4 space-y-1.5 rounded-xl border border-white/10 bg-black/40 p-4">
                    {c.compensation.map((m) => (
                      <p key={m.model} className="text-[11px] text-white/65">
                        <span className="text-amber-200">
                          {COMPENSATION_MODELS.find((x) => x.key === m.model)?.label}
                        </span>{" "}
                        — {m.detail}
                      </p>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] text-white/40">
                    <span>Deadline: {c.deadlineDays} days from acceptance</span>
                    <span>·</span>
                    <span className={c.onCameraRequired ? "text-amber-200" : "text-emerald-300"}>
                      {c.onCameraRequired ? "On camera required" : "Faceless friendly"}
                    </span>
                  </div>

                  <Link
                    to="/studio"
                    className="mt-5 inline-block rounded-full bg-amber-300/90 px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.25em] text-black"
                  >
                    Apply in FV Studios
                  </Link>
                </article>
              ))}
              {campaigns.length === 0 && (
                <p className="text-sm text-white/45">No campaigns match that filter right now.</p>
              )}
            </div>
          </section>

          {/* Lifecycle */}
          <Section eyebrow="How it works" title="Brief to payment" icon={RouteIcon}>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {CAMPAIGN_LIFECYCLE.map((s) => (
                <div key={s.step} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-amber-300/70">
                    Step {s.step}
                  </p>
                  <h4 className="mt-1.5 text-sm text-white/85">{s.title}</h4>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-white/50">{s.plain}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* Money rules */}
          <Section eyebrow="The money" title="Same wallet, same rules" icon={Wallet}>
            <ul className="grid gap-2 sm:grid-cols-2">
              {CAMPAIGN_MONEY_RULES.map((r) => (
                <li
                  key={r}
                  className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-xs leading-relaxed text-white/60"
                >
                  {r}
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-wrap gap-2">
              {CAMPAIGN_PLACEMENTS.map((p) => (
                <Link
                  key={p.to}
                  to={p.to}
                  className="rounded-full border border-white/15 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-white/60 hover:border-amber-300/50 hover:text-amber-200"
                >
                  {p.label}
                </Link>
              ))}
            </div>
          </Section>

          <section className="rounded-3xl border border-amber-300/30 bg-amber-300/[0.04] p-8">
            <h2 className="flex items-center gap-3 text-lg font-light tracking-wide">
              <Handshake className="h-5 w-5 text-amber-300" /> Are you a brand?
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/70">
              Post a brief, set your compensation, and choose from creators already producing
              professional work inside FV Studios. You approve before anything is paid.
            </p>
          </section>
        </div>
      </div>
    </SiteShell>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.2em] transition ${
        active
          ? "border-amber-300/60 bg-amber-300/10 text-amber-200"
          : "border-white/15 text-white/55 hover:border-amber-300/40"
      }`}
    >
      {label}
    </button>
  );
}

function Section({
  eyebrow,
  title,
  icon: Icon,
  children,
}: {
  eyebrow: string;
  title: string;
  icon: typeof Wallet;
  children: React.ReactNode;
}) {
  return (
    <section>
      <p className="text-[10px] uppercase tracking-[0.35em] text-white/35">{eyebrow}</p>
      <h2 className="mt-2 flex items-center gap-3 text-2xl font-light tracking-wide sm:text-3xl">
        <Icon className="h-5 w-5 text-amber-300" /> {title}
      </h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}
