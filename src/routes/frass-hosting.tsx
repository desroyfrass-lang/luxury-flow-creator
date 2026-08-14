// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0420 — Frass Hosting.
// The customer buys hosting from Frass. Frass runs the service on mature cloud
// infrastructure underneath and never asks the customer to care who that is.
// ─────────────────────────────────────────────────────────────────────────────

import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Cloud, Globe, Scale, ShieldCheck, Sparkles } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import {
  FRASS_0420_PLAIN,
  FRASS_0420_PRINCIPLE,
  FRASS_HOSTING_PLANS,
  HOSTING_CONSTITUTION,
  HOSTING_LEGAL_READINESS,
  INFRASTRUCTURE_PHASES,
  PUBLISH_OPTIONS,
  TIER_COMPARISON,
  TIER_STORY,
} from "@/lib/hosting";

export const Route = createFileRoute("/frass-hosting")({
  head: () => ({
    meta: [
      { title: "Frass Hosting — Your whole business, live in one click" },
      {
        name: "description",
        content:
          "Build your website inside Frass and publish it with one click. Frass Hosting includes custom domains, SSL, backups, security, analytics and support — one price, paid to Frass.",
      },
      { property: "og:title", content: "Frass Hosting — Your whole business, live in one click" },
      {
        property: "og:description",
        content:
          "Free landing page for every member. Paid hosting for a business that actually trades: domain, store, bookings, memberships, CRM and marketing.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FrassHostingPage,
});

function FrassHostingPage() {
  return (
    <SiteShell>
      <div className="min-h-screen bg-black text-white">
        <header className="relative overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(252,211,77,0.14),transparent_60%)]" />
          <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
            <p className="text-[11px] uppercase tracking-[0.5em] text-amber-300/70">FRASS-0420</p>
            <h1 className="mt-4 text-4xl font-light uppercase tracking-[0.18em] sm:text-6xl">
              Frass
              <span className="block text-amber-300">Hosting</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/70">
              Build your business inside Frass. When it&apos;s ready, click Publish — and it&apos;s
              live. No second company to sign up with, no server to configure.
            </p>
            <p className="mt-3 max-w-2xl text-sm text-white/50">
              <strong className="text-white/75">Here's how it works:</strong> when you
              buy Shopify you never ask who Shopify&apos;s cloud provider is. You just buy Shopify.
              That is exactly how Frass Hosting works.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/business-builder"
                className="rounded-full bg-amber-300/90 px-6 py-3 text-xs font-medium uppercase tracking-[0.25em] text-black"
              >
                Build your business
              </Link>
              <a
                href="#plans"
                className="rounded-full border border-white/20 px-6 py-3 text-xs uppercase tracking-[0.25em] text-white/70 hover:border-amber-300/50"
              >
                See the plans
              </a>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-6xl space-y-20 px-4 py-16 sm:px-6">
          {/* Publish options */}
          <Section eyebrow="When you click Publish" title="Three ways to go live" icon={Globe}>
            <div className="grid gap-4 md:grid-cols-3">
              {PUBLISH_OPTIONS.map((o) => (
                <article
                  key={o.id}
                  className={`rounded-2xl border p-5 ${
                    o.recommended
                      ? "border-amber-300/45 bg-amber-300/[0.05]"
                      : "border-white/10 bg-white/[0.02]"
                  }`}
                >
                  <h3 className="text-lg font-light tracking-wide">
                    {o.emoji} {o.label}
                  </h3>
                  {o.recommended && (
                    <span className="mt-1 inline-block rounded-full border border-amber-300/50 px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] text-amber-200">
                      Recommended
                    </span>
                  )}
                  <p className="mt-2 text-sm text-white/70">{o.tagline}</p>
                  <ul className="mt-3 space-y-1">
                    {o.includes.map((i) => (
                      <li key={i} className="text-[12px] text-white/55">
                        · {i}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-[11px] leading-relaxed text-white/45">{o.plain}</p>
                  <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-white/30">{o.who}</p>
                </article>
              ))}
            </div>
          </Section>

          {/* Plans */}
          <Section eyebrow="The shelf" title="Hosting plans" icon={Cloud} id="plans">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {FRASS_HOSTING_PLANS.map((p) => (
                <article
                  key={p.id}
                  className={`rounded-2xl border p-5 ${
                    p.recommended
                      ? "border-amber-300/45 bg-amber-300/[0.05]"
                      : "border-white/10 bg-white/[0.02]"
                  }`}
                >
                  <h3 className="text-sm uppercase tracking-[0.2em] text-amber-300/80">{p.label}</h3>
                  <p className="mt-3 text-3xl font-light">
                    {p.price === 0 ? "Free" : `$${p.price}`}
                    {p.price > 0 && <span className="text-sm text-white/45"> /month</span>}
                  </p>
                  {p.price > 0 && (
                    <p className="text-[11px] text-white/40">or ${p.yearlyPrice}/year — two months free</p>
                  )}
                  <p className="mt-2 text-[11px] text-white/50">{p.for}</p>
                  <ul className="mt-3 space-y-1">
                    {p.includes.map((i) => (
                      <li key={i} className="flex gap-1.5 text-[12px] text-white/65">
                        <Check className="mt-0.5 h-3 w-3 shrink-0 text-amber-300/80" />
                        {i}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-[11px] text-white/35">{p.limits}</p>
                </article>
              ))}
            </div>
            <p className="mt-4 rounded-xl border border-white/10 bg-black/40 p-4 text-sm text-white/55">
              <strong className="text-white/75">Let's break it down:</strong> one price, paid to Frass.
              Frass keeps the site running and covers whatever the infrastructure costs out of that
              plan. You never get a second bill from somebody you&apos;ve never heard of.
            </p>
          </Section>

          {/* Free vs paid */}
          <Section
            eyebrow="Why pay when the landing page is free"
            title="A page, or a business"
            icon={Sparkles}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                <h3 className="text-sm uppercase tracking-[0.25em] text-white/50">
                  {TIER_STORY.free.title}
                </h3>
                <p className="mt-2 text-sm text-white/65">{TIER_STORY.free.plain}</p>
              </div>
              <div className="rounded-2xl border border-amber-300/30 bg-amber-300/[0.04] p-5">
                <h3 className="text-sm uppercase tracking-[0.25em] text-amber-200/80">
                  {TIER_STORY.paid.title}
                </h3>
                <p className="mt-2 text-sm text-white/70">{TIER_STORY.paid.plain}</p>
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.04] text-[10px] uppercase tracking-[0.2em] text-white/45">
                  <tr>
                    <th className="px-4 py-3">Capability</th>
                    <th className="px-4 py-3 text-center">Free landing page</th>
                    <th className="px-4 py-3 text-center">Business website</th>
                  </tr>
                </thead>
                <tbody>
                  {TIER_COMPARISON.map((r) => (
                    <tr key={r.capability} className="border-t border-white/10">
                      <td className="px-4 py-2.5 text-white/75">{r.capability}</td>
                      <td className="px-4 py-2.5 text-center text-white/45">{r.free ? "✓" : "—"}</td>
                      <td className="px-4 py-2.5 text-center text-emerald-300">{r.paid ? "✓" : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">
                  {TIER_STORY.example.who} — free
                </p>
                <ul className="mt-2 space-y-1">
                  {TIER_STORY.example.free.map((i) => (
                    <li key={i} className="text-xs text-white/60">
                      · {i}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-emerald-300/25 bg-emerald-300/[0.04] p-5">
                <p className="text-[10px] uppercase tracking-[0.25em] text-emerald-200/80">
                  {TIER_STORY.example.who} — business
                </p>
                <ul className="mt-2 space-y-1">
                  {TIER_STORY.example.paid.map((i) => (
                    <li key={i} className="text-xs text-white/70">
                      · {i}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Section>

          {/* Infrastructure philosophy */}
          <Section eyebrow="How Frass runs it" title="Infrastructure philosophy" icon={ShieldCheck}>
            <p className="max-w-3xl text-sm leading-relaxed text-white/65">
              Frass builds experiences, not commodity infrastructure. Where mature, secure and
              scalable infrastructure already exists, Frass uses it — so the years go into Frassy,
              FV Studios, Business Builder, Marketplace and the creator economy, not into firewalls
              and load balancers.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {INFRASTRUCTURE_PHASES.map((p) => (
                <div key={p.phase} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-amber-300/70">{p.phase}</p>
                  <h3 className="mt-2 text-sm text-white/85">{p.title}</h3>
                  <p className="mt-2 text-[12px] leading-relaxed text-white/55">{p.plain}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* Legal readiness */}
          <Section eyebrow="Operating properly" title="What a hosting service needs legally" icon={Scale}>
            <p className="max-w-3xl text-sm text-white/60">
              Nothing here is legal advice — it is the work list to bring to a lawyer before the
              first paid plan is sold.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {HOSTING_LEGAL_READINESS.map((i) => (
                <div key={i.key} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                  <p className="text-sm text-white/85">{i.title}</p>
                  <p className="mt-1 text-[12px] text-white/50">{i.plain}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* Constitution */}
          <section className="rounded-3xl border border-amber-300/30 bg-amber-300/[0.04] p-8">
            <p className="text-[11px] uppercase tracking-[0.35em] text-amber-300/80">
              Constitutional principle — FRASS-0420
            </p>
            <p className="mt-4 max-w-3xl text-lg font-light leading-relaxed text-white/85">
              {FRASS_0420_PRINCIPLE}
            </p>
            <p className="mt-3 max-w-3xl text-sm text-white/55">{FRASS_0420_PLAIN}</p>
            <ul className="mt-6 space-y-1.5">
              {HOSTING_CONSTITUTION.map((c) => (
                <li key={c} className="text-xs text-white/60">
                  · {c}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/business-builder"
                className="rounded-full bg-amber-300/90 px-6 py-3 text-xs font-medium uppercase tracking-[0.25em] text-black"
              >
                Start building
              </Link>
            </div>
          </section>
        </div>
      </div>
    </SiteShell>
  );
}

function Section({
  eyebrow,
  title,
  icon: Icon,
  id,
  children,
}: {
  eyebrow: string;
  title: string;
  icon: typeof Cloud;
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <p className="text-[10px] uppercase tracking-[0.35em] text-white/35">{eyebrow}</p>
      <h2 className="mt-2 flex items-center gap-3 text-2xl font-light tracking-wide sm:text-3xl">
        <Icon className="h-5 w-5 text-amber-300" /> {title}
      </h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}
