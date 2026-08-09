// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0410 — Frass Vision Studios: the public face of the Creator Company.
// FV Studios (everyday) and Frass Vision Studios (the big work) are one house.
// ─────────────────────────────────────────────────────────────────────────────

import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Clapperboard,
  Music4,
  Mic,
  Film,
  Scale,
  Wallet,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import {
  AGREEMENT_MODULES,
  DIVISIONS,
  FVS_PRINCIPLE,
  LEGAL_READINESS,
  MONEY_FLOW,
  NO_ROYALTY_WORK,
  PARTICIPATION,
  PARTNER_TERM,
  TWO_EXPRESSIONS,
  WHAT_ARE_WE_CREATING,
} from "@/lib/studio/vision-network";

export const Route = createFileRoute("/fv-studios")({
  head: () => ({
    meta: [
      { title: "Frass Vision Studios — The Creator Company" },
      {
        name: "description",
        content:
          "Frass Vision Studios is the record label, film studio and publishing network of Frass. No advances, no debt, no ownership of people — a transparent share of what we help you earn.",
      },
      { property: "og:title", content: "Frass Vision Studios — The Creator Company" },
      {
        property: "og:description",
        content:
          "FV Studios is where you work. Frass Vision Studios is where the work gets published, licensed and paid.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FvStudiosPage,
});

function FvStudiosPage() {
  const [openModule, setOpenModule] = useState<string | null>(null);

  return (
    <SiteShell>
      <div className="min-h-screen bg-black text-white">
        {/* Hero */}
        <header className="relative overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(252,211,77,0.14),transparent_60%)]" />
          <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
            <p className="text-[11px] uppercase tracking-[0.5em] text-amber-300/70">FRASS-0410</p>
            <h1 className="mt-4 text-4xl font-light uppercase tracking-[0.18em] sm:text-6xl">
              Frass Vision
              <span className="block text-amber-300">Studios</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/70">
              A record label, a film studio, a publishing house and a production company — built
              inside Frass, running on our own software.
            </p>
            <p className="mt-3 max-w-2xl text-sm text-white/45">
              <strong className="text-white/70">What this means in plain English:</strong> it is one
              company with two ways of saying its name. Like Kentucky Fried Chicken and KFC. On the
              poster it says Frass Vision Studios. In the workshop we say FV Studios.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/studio"
                className="rounded-full bg-amber-300/90 px-6 py-3 text-xs font-medium uppercase tracking-[0.25em] text-black"
              >
                Enter FV Studios
              </Link>
              <a
                href="#network"
                className="rounded-full border border-white/20 px-6 py-3 text-xs uppercase tracking-[0.25em] text-white/70 hover:border-amber-300/50"
              >
                How we both get paid
              </a>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-6xl space-y-20 px-4 py-16 sm:px-6">
          {/* Two expressions, one house */}
          <Section
            eyebrow="One company"
            title="FV Studios and Frass Vision Studios are the same place"
            icon={Clapperboard}
          >
            <div className="grid gap-4 md:grid-cols-2">
              {TWO_EXPRESSIONS.map((e) => (
                <div
                  key={e.key}
                  className="rounded-2xl border border-white/10 bg-white/[0.02] p-6"
                >
                  <h3 className="text-sm uppercase tracking-[0.25em] text-amber-300/80">
                    {e.heading}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/70">{e.plain}</p>
                  <ul className="mt-4 space-y-1.5">
                    {e.examples.map((x) => (
                      <li key={x} className="text-[12px] text-white/45">
                        · {x}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p className="mt-4 rounded-xl border border-white/10 bg-black/40 p-4 text-sm text-white/55">
              <strong className="text-white/75">Plain English:</strong> nothing is being split into
              two businesses. Same owner, same logo, same building. One name is for the world, one
              name is for us.
            </p>
          </Section>

          {/* Divisions */}
          <Section eyebrow="The studio floor" title="Our divisions" icon={Film}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {DIVISIONS.map((d) => (
                <article
                  key={d.key}
                  className="group rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition hover:border-amber-300/40"
                >
                  <p className="text-[10px] uppercase tracking-[0.3em] text-amber-300/70">
                    {d.label}
                  </p>
                  <h3 className="mt-2 text-lg font-light tracking-wide">{d.name}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-white/55">{d.line}</p>
                  <ul className="mt-3 space-y-1">
                    {d.services.map((s) => (
                      <li key={s} className="text-[11px] text-white/40">
                        · {s}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </Section>

          {/* The network / money */}
          <Section
            eyebrow="The business model"
            title="Where Frass actually makes money"
            icon={Wallet}
            id="network"
          >
            <p className="max-w-3xl text-sm leading-relaxed text-white/65">
              Using the editor never creates a royalty. Publishing through the Frass Vision Network
              does. The moment your work goes out through us — distributed, licensed, administered,
              marketed — we take an agreed, published share of what it earns. Not a hidden one.
            </p>

            <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.04] text-[10px] uppercase tracking-[0.2em] text-white/45">
                  <tr>
                    <th className="px-4 py-3">Revenue stream</th>
                    <th className="px-4 py-3 text-right">Frass</th>
                    <th className="px-4 py-3 text-right">Creator</th>
                  </tr>
                </thead>
                <tbody>
                  {PARTICIPATION.map((p) => (
                    <tr key={p.key} className="border-t border-white/10 align-top">
                      <td className="px-4 py-3">
                        <span className="text-white/80">{p.stream}</span>
                        <span className="mt-1 block text-[11px] text-white/40">{p.note}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-amber-200">{p.platform}%</td>
                      <td className="px-4 py-3 text-right text-emerald-300">{p.creator}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-emerald-300/25 bg-emerald-300/[0.04] p-5">
                <h3 className="text-xs uppercase tracking-[0.25em] text-emerald-200/80">
                  Never charged a royalty
                </h3>
                <ul className="mt-3 space-y-1.5">
                  {NO_ROYALTY_WORK.map((n) => (
                    <li key={n} className="text-xs text-white/60">
                      · {n}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                <h3 className="text-xs uppercase tracking-[0.25em] text-white/45">
                  Worked example — a song earns $100
                </h3>
                <ol className="mt-3 space-y-1.5 text-xs text-white/60">
                  <li>$100 arrives from the streaming services.</li>
                  <li>−$8 processing and distribution costs.</li>
                  <li>−$10 to a featured artist, split set by the creator.</li>
                  <li>−$12.30 Frass Vision Network participation (15%).</li>
                  <li className="text-emerald-300">$69.70 lands in the creator&apos;s Frass Wallet.</li>
                </ol>
                <p className="mt-3 text-[11px] text-white/40">
                  Every line visible on the receipt. Inside the Frass share the Foundation
                  allocation and Owner Compensation run exactly as they do everywhere else in Frass.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {MONEY_FLOW.map((m) => (
                <div key={m.step} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-amber-300/70">
                    Step {m.step}
                  </p>
                  <h4 className="mt-1.5 text-sm text-white/85">{m.title}</h4>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-white/50">{m.plain}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* Agreement */}
          <Section
            eyebrow="One relationship"
            title="The Frass Vision Studios Creator Agreement"
            icon={Scale}
          >
            <p className="max-w-3xl text-sm leading-relaxed text-white/65">
              Not ten contracts. One agreement with modules — only the parts that match what you
              make apply to you. We call the people who join {PARTNER_TERM}, not signed artists.
            </p>
            <div className="mt-6 space-y-2">
              {AGREEMENT_MODULES.map((m) => {
                const open = openModule === m.key;
                return (
                  <div key={m.key} className="rounded-xl border border-white/10 bg-white/[0.02]">
                    <button
                      onClick={() => setOpenModule(open ? null : m.key)}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                    >
                      <span>
                        <span className="block text-sm text-white/85">{m.title}</span>
                        <span className="block text-[11px] text-white/40">{m.appliesTo}</span>
                      </span>
                      <span className="text-amber-300/70">{open ? "−" : "+"}</span>
                    </button>
                    {open && (
                      <div className="grid gap-4 border-t border-white/10 px-5 py-4 sm:grid-cols-2">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">
                            You grant
                          </p>
                          <ul className="mt-2 space-y-1">
                            {m.grants.map((g) => (
                              <li key={g} className="text-[11px] text-white/60">
                                · {g}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">
                            Frass provides
                          </p>
                          <ul className="mt-2 space-y-1">
                            {m.frassProvides.map((g) => (
                              <li key={g} className="text-[11px] text-emerald-200/70">
                                · {g}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Section>

          {/* Intake */}
          <Section eyebrow="Every project starts here" title="What are we creating today?" icon={Sparkles}>
            <p className="max-w-3xl text-sm text-white/60">
              When you open FV Studios, Frassy asks one question and the whole studio reconfigures
              around your answer — timeline, presets, delivery specs, paperwork and, if you choose
              to publish with us, the right agreement module.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {WHAT_ARE_WE_CREATING.map((w) => (
                <Link
                  key={w}
                  to="/studio"
                  className="rounded-full border border-white/15 px-4 py-2 text-xs text-white/65 transition hover:border-amber-300/50 hover:text-amber-200"
                >
                  {w}
                </Link>
              ))}
            </div>
          </Section>

          {/* Legal readiness */}
          <Section
            eyebrow="Becoming legitimate"
            title="What a real label and film studio needs"
            icon={ShieldCheck}
          >
            <p className="max-w-3xl text-sm text-white/60">
              This is the checklist that turns the idea into a company that platforms, broadcasters
              and collecting societies will actually pay. Nothing here is legal advice — it is the
              work list to bring to a lawyer.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {LEGAL_READINESS.map((group) => (
                <div key={group.group} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                  <h3 className="text-xs uppercase tracking-[0.25em] text-amber-300/75">
                    {group.group}
                  </h3>
                  <ul className="mt-3 space-y-3">
                    {group.items.map((i) => (
                      <li key={i.key}>
                        <p className="text-sm text-white/80">{i.title}</p>
                        <p className="text-[11px] text-white/45">{i.plain}</p>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">
                          {i.owner}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Section>

          {/* Principle */}
          <section className="rounded-3xl border border-amber-300/30 bg-amber-300/[0.04] p-8">
            <p className="text-[11px] uppercase tracking-[0.35em] text-amber-300/80">
              Constitutional principle
            </p>
            <p className="mt-4 max-w-3xl text-lg font-light leading-relaxed text-white/85">
              {FVS_PRINCIPLE}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/studio"
                className="rounded-full bg-amber-300/90 px-6 py-3 text-xs font-medium uppercase tracking-[0.25em] text-black"
              >
                Start creating
              </Link>
              <Link
                to="/financial-center"
                className="rounded-full border border-white/20 px-6 py-3 text-xs uppercase tracking-[0.25em] text-white/70 hover:border-amber-300/50"
              >
                See your wallet
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
  icon: typeof Music4 | typeof Mic;
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
