// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0419 / 0419A — Frass Business Builder.
// One architecture, two doors: FV Studios and My Workspace both open this page.
// Frassy asks one question at a time and builds the business alongside you.
// ─────────────────────────────────────────────────────────────────────────────

import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Globe, Info, Sparkles } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import {
  AI_ARCHITECT_ROLES,
  BUILDER_STEPS,
  BUILD_MODES,
  BUILD_PATHS,
  BUSINESS_DELIVERABLES,
  BUSINESS_MODULES,
  BUSINESS_TYPES,
  COST_CONSTITUTION,
  HOSTING_PLANS,
  PRE_LAUNCH_REVIEW,
  moduleById,
  quotePublish,
} from "@/lib/business-builder";
import { PUBLISH_OPTIONS, type PublishOptionId } from "@/lib/hosting";


export const Route = createFileRoute("/_authenticated/business-builder")({
  head: () => ({
    meta: [
      { title: "Frass Business Builder — Build a business, not just a website" },
      {
        name: "description",
        content:
          "Tell Frassy what business you're building and she assembles the whole thing: website, marketplace, bookings, payments, brand kit, CRM, affiliate program and Financial Center.",
      },
      { property: "og:title", content: "Frass Business Builder" },
      {
        property: "og:description",
        content: "Other builders ask what website you want. Frassy asks what business you're building.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: BusinessBuilderPage,
});

function BusinessBuilderPage() {
  const [step, setStep] = useState(0);
  const [idea, setIdea] = useState("");
  const [mode, setMode] = useState("conversation");
  const [typeId, setTypeId] = useState<string | null>(null);
  const [path, setPath] = useState<BuildPathId>("inside");
  const [modules, setModules] = useState<string[]>([]);
  const [planId, setPlanId] = useState("frass-starter");
  const [customDomain, setCustomDomain] = useState(false);
  const [approved, setApproved] = useState(false);

  const type = BUSINESS_TYPES.find((t) => t.id === typeId) ?? null;
  const quote = useMemo(() => quotePublish(planId, { customDomain, modules }), [planId, customDomain, modules]);

  const chooseType = (id: string) => {
    setTypeId(id);
    const t = BUSINESS_TYPES.find((b) => b.id === id);
    if (t) setModules(t.modules);
    setStep(2);
  };

  const toggleModule = (id: string) =>
    setModules((m) => (m.includes(id) ? m.filter((x) => x !== id) : [...m, id]));

  const canAdvance =
    (step === 0 && idea.trim().length > 2) ||
    (step === 1 && !!typeId) ||
    step === 2 ||
    step === 3 ||
    step === 4 ||
    (step === 5 && approved);

  const current = BUILDER_STEPS[step]!;

  return (
    <SiteShell>
      <div className="min-h-screen bg-[oklch(0.14_0.01_75)] px-6 py-12 text-[oklch(0.96_0.01_80)]">
        <div className="mx-auto max-w-[1000px]">
          <span className="text-[10px] uppercase tracking-[0.4em] text-[color:var(--gold)]">
            Frass Business Builder · powered by Frass Vision Studios
          </span>
          <h1 className="mt-3 font-display text-3xl uppercase leading-none md:text-5xl">
            Build a business.
            <br />
            Not just a website.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[oklch(0.8_0.01_80)]">
            Everyone else asks what website you want. Frassy asks what business you're trying to
            build — then assembles the website, the storefront, the bookings, the payments, the
            brand, the customers and the money in one place.
          </p>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[oklch(0.66_0.01_80)]">
            What this means in plain English: you describe the business the way you'd describe it to
            a friend, and Frassy opens the doors, prints the signs and sets up the till.
          </p>

          {/* What gets built */}
          <div className="mt-6 flex flex-wrap gap-1.5">
            {BUSINESS_DELIVERABLES.map((d) => (
              <span
                key={d}
                className="rounded-full border border-white/12 px-3 py-1 text-[11px] text-[oklch(0.78_0.01_80)]"
              >
                {d}
              </span>
            ))}
          </div>

          {/* Step rail */}
          <ol className="mt-10 flex flex-wrap items-center gap-2">
            {BUILDER_STEPS.map((s, i) => (
              <li key={s.id} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => i <= step && setStep(i)}
                  className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] transition ${
                    i === step
                      ? "bg-[color:var(--gold)] text-black"
                      : i < step
                        ? "border border-[color:var(--gold)]/40 text-[color:var(--gold)]"
                        : "border border-white/12 text-white/40"
                  }`}
                >
                  {s.title}
                </button>
                {i < BUILDER_STEPS.length - 1 && <span className="text-white/20">→</span>}
              </li>
            ))}
          </ol>

          <section className="mt-6 rounded-3xl border border-white/12 bg-white/[0.03] p-6 md:p-8">
            <p className="font-display text-xl uppercase tracking-[0.06em]">{current.ask}</p>

            {/* 1 — the idea */}
            {step === 0 && (
              <div className="mt-5">
                <textarea
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  rows={3}
                  placeholder="I want a luxury bridal business serving Canada and Jamaica."
                  className="w-full rounded-2xl border border-white/12 bg-black/30 p-4 text-sm outline-none placeholder:text-white/25 focus:border-[color:var(--gold)]"
                />
                <div className="mt-4 text-[10px] uppercase tracking-[0.24em] text-[color:var(--gold)]">
                  How would you like to build?
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {BUILD_MODES.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      title={m.note}
                      onClick={() => setMode(m.id)}
                      className={`rounded-full px-3 py-1.5 text-xs transition ${
                        mode === m.id
                          ? "bg-[color:var(--gold)] text-black"
                          : "border border-white/15 text-[oklch(0.8_0.01_80)] hover:border-[color:var(--gold)]/50"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
                <p className="mt-4 text-xs text-[oklch(0.66_0.01_80)]">
                  While she builds, Frassy works as {AI_ARCHITECT_ROLES.join(", ")}.
                </p>
              </div>
            )}

            {/* 2 — the kind of business */}
            {step === 1 && (
              <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {BUSINESS_TYPES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => chooseType(t.id)}
                    className={`rounded-2xl border p-4 text-left transition ${
                      typeId === t.id
                        ? "border-[color:var(--gold)] bg-[color:var(--gold)]/10"
                        : "border-white/12 bg-white/[0.02] hover:border-[color:var(--gold)]/50"
                    }`}
                  >
                    <span aria-hidden className="text-lg">
                      {t.emoji}
                    </span>
                    <div className="mt-1 font-display text-sm uppercase tracking-[0.08em]">{t.label}</div>
                    <p className="mt-1 text-xs text-[oklch(0.7_0.01_80)]">{t.summary}</p>
                  </button>
                ))}
              </div>
            )}

            {/* 3 — where it lives */}
            {step === 2 && (
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {BUILD_PATHS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPath(p.id)}
                    className={`rounded-2xl border p-5 text-left transition ${
                      path === p.id
                        ? "border-[color:var(--gold)] bg-[color:var(--gold)]/10"
                        : "border-white/12 bg-white/[0.02] hover:border-[color:var(--gold)]/50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-[color:var(--gold)]" />
                      <span className="font-display text-base uppercase tracking-[0.06em]">{p.label}</span>
                    </div>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-[color:var(--gold)]">
                      {p.tagline}
                    </p>
                    <p className="mt-3 text-sm text-[oklch(0.8_0.01_80)]">{p.detail}</p>
                    <p className="mt-2 text-xs text-[oklch(0.62_0.01_80)]">{p.plain}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {p.connects.map((c) => (
                        <span key={c} className="rounded-full border border-white/12 px-2 py-0.5 text-[10px]">
                          {c}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* 4 — the systems */}
            {step === 3 && (
              <div className="mt-5">
                <p className="text-sm text-[oklch(0.7_0.01_80)]">
                  {type ? `Frassy pre-selected what a ${type.label.toLowerCase()} usually needs.` : ""} Add or
                  remove anything — modules can change at any point in your business's life.
                </p>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {BUSINESS_MODULES.map((m) => {
                    const on = modules.includes(m.id);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => toggleModule(m.id)}
                        className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${
                          on
                            ? "border-[color:var(--gold)] bg-[color:var(--gold)]/10"
                            : "border-white/12 bg-white/[0.02] hover:border-[color:var(--gold)]/40"
                        }`}
                      >
                        <span
                          className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border ${
                            on ? "border-[color:var(--gold)] bg-[color:var(--gold)]" : "border-white/30"
                          }`}
                        >
                          {on && <Check className="h-3 w-3 text-black" />}
                        </span>
                        <span>
                          <span className="block text-sm">{m.question}</span>
                          <span className="mt-0.5 block text-xs text-[oklch(0.66_0.01_80)]">{m.plain}</span>
                          {m.externalCost && (
                            <span className="mt-1 inline-block text-[10px] uppercase tracking-[0.16em] text-[color:var(--gold)]">
                              May carry a provider cost — shown before you publish
                            </span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 5 — business intelligence review */}
            {step === 4 && (
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {PRE_LAUNCH_REVIEW.map((r) => (
                  <div key={r.id} className="rounded-2xl border border-white/12 bg-white/[0.02] p-4">
                    <div className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-[color:var(--gold)]" />
                      <span className="text-sm">{r.label}</span>
                    </div>
                    <p className="mt-1 text-xs text-[oklch(0.66_0.01_80)]">{r.plain}</p>
                  </div>
                ))}
              </div>
            )}

            {/* 6 — the honest bill */}
            {step === 5 && (
              <div className="mt-5">
                <div className="rounded-2xl border border-[color:var(--gold)]/30 bg-[color:var(--gold)]/[0.06] p-4">
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-[color:var(--gold)]">
                    <Info className="h-3.5 w-3.5" />
                    FRASS-0419A · Hosting & Cost Constitution
                  </div>
                  <ul className="mt-2 space-y-1 text-xs text-[oklch(0.8_0.01_80)]">
                    {COST_CONSTITUTION.map((c) => (
                      <li key={c}>· {c}</li>
                    ))}
                  </ul>
                </div>

                {/* FRASS-0420 — what happens when you click Publish */}
                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  {PUBLISH_OPTIONS.map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => {
                        setPublishOption(o.id);
                        setPlanId(o.id === "frass" ? "frass-starter" : "external");
                        setApproved(false);
                      }}
                      className={`rounded-2xl border p-4 text-left transition ${
                        publishOption === o.id
                          ? "border-[color:var(--gold)] bg-[color:var(--gold)]/10"
                          : "border-white/12 bg-white/[0.02] hover:border-[color:var(--gold)]/40"
                      }`}
                    >
                      <div className="font-display text-sm uppercase tracking-[0.06em]">
                        {o.emoji} {o.label}
                        {o.recommended && (
                          <span className="ml-2 rounded-full border border-[color:var(--gold)]/50 px-2 py-0.5 text-[9px] tracking-[0.16em] text-[color:var(--gold)]">
                            Recommended
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-[oklch(0.78_0.01_80)]">{o.tagline}</p>
                      <ul className="mt-2 space-y-0.5 text-xs text-[oklch(0.72_0.01_80)]">
                        {o.includes.map((i) => (
                          <li key={i}>· {i}</li>
                        ))}
                      </ul>
                      <p className="mt-2 text-[11px] text-[oklch(0.6_0.01_80)]">{o.plain}</p>
                    </button>
                  ))}
                </div>

                {publishOption === "frass" ? (
                  <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    {HOSTING_PLANS.filter((p) => p.frassService).map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setPlanId(p.id);
                          setApproved(false);
                        }}
                        className={`rounded-2xl border p-4 text-left transition ${
                          planId === p.id
                            ? "border-[color:var(--gold)] bg-[color:var(--gold)]/10"
                            : "border-white/12 bg-white/[0.02] hover:border-[color:var(--gold)]/40"
                        }`}
                      >
                        <div className="font-display text-sm uppercase tracking-[0.06em]">{p.label}</div>
                        <div className="mt-1 text-lg">
                          {p.price === 0 ? "Free, always" : `$${p.price.toFixed(2)} / month`}
                        </div>
                        <p className="mt-1 text-[11px] text-[oklch(0.62_0.01_80)]">
                          {p.price === 0
                            ? "Every Frass member keeps a landing page at no cost."
                            : "One price, paid to Frass. Frass runs the service and covers the infrastructure."}
                        </p>
                        <ul className="mt-2 space-y-0.5 text-xs text-[oklch(0.76_0.01_80)]">
                          {p.includes.map((i) => (
                            <li key={i}>· {i}</li>
                          ))}
                        </ul>
                        <p className="mt-2 text-[11px] text-[oklch(0.6_0.01_80)]">{p.limits}</p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="mt-5 rounded-2xl border border-white/12 bg-white/[0.02] p-4 text-sm text-[oklch(0.76_0.01_80)]">
                    Frass charges nothing for this route. You either point the site at hosting you
                    already pay for, or export everything and run it yourself — no lock-in.{" "}
                    <Link to="/frass-hosting" className="text-[color:var(--gold)] underline">
                      Compare with Frass Hosting
                    </Link>
                    .
                  </div>
                )}


                <label className="mt-4 flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={customDomain}
                    onChange={(e) => {
                      setCustomDomain(e.target.checked);
                      setApproved(false);
                    }}
                  />
                  Register a custom domain in my name
                </label>

                <div className="mt-5 rounded-2xl border border-white/12 bg-black/25 p-5">
                  <div className="text-[10px] uppercase tracking-[0.24em] text-[color:var(--gold)]">
                    What publishing costs
                  </div>
                  <div className="mt-3 space-y-2">
                    {quote.lines.map((l) => (
                      <div key={l.label} className="flex flex-wrap items-baseline justify-between gap-2 border-b border-white/8 pb-2">
                        <div>
                          <div className="text-sm">{l.label}</div>
                          <div className="text-[11px] text-[oklch(0.62_0.01_80)]">
                            Paid to {l.payee}
                            {l.note ? ` · ${l.note}` : ""}
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          ${(l.providerCost + l.frassFee).toFixed(2)}
                          <span className="text-[11px] text-[oklch(0.62_0.01_80)]">
                            {" "}
                            /{l.period === "once" ? "one-off" : l.period}
                          </span>
                          {!l.frassService && (
                            <div className="text-[11px] text-[oklch(0.62_0.01_80)]">
                              ${l.providerCost.toFixed(2)} provider + ${l.frassFee.toFixed(2)} Frass fee
                            </div>
                          )}
                        </div>

                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-sm">Estimated total</span>
                    <span className="font-display text-xl">
                      ${quote.monthlyTotal.toFixed(2)}/mo · ${quote.yearlyTotal.toFixed(2)} first year
                    </span>
                  </div>
                  {quote.alternative && (
                    <p className="mt-2 text-xs text-[color:var(--gold)]">Lower-cost option: {quote.alternative}</p>
                  )}
                  <label className="mt-4 flex items-start gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={approved}
                      onChange={(e) => setApproved(e.target.checked)}
                      className="mt-1"
                    />
                    I understand these costs and approve them. Nothing publishes until I do.
                  </label>
                </div>
              </div>
            )}

            {/* Movement */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.24em]"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back
                </button>
              )}
              {step < BUILDER_STEPS.length - 1 ? (
                <button
                  type="button"
                  disabled={!canAdvance}
                  onClick={() => setStep((s) => s + 1)}
                  className="inline-flex items-center gap-2 rounded-full bg-[color:var(--gold)] px-6 py-2.5 text-[10px] font-bold uppercase tracking-[0.24em] text-black disabled:opacity-40"
                >
                  Continue
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!approved}
                  className="inline-flex items-center gap-2 rounded-full bg-[color:var(--gold)] px-6 py-2.5 text-[10px] font-bold uppercase tracking-[0.24em] text-black disabled:opacity-40"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Publish my business
                </button>
              )}
              <span className="text-xs text-[oklch(0.6_0.01_80)]">
                Building, previewing and planning are always free.
              </span>
            </div>
          </section>

          {/* Summary of the business so far */}
          {(type || idea) && (
            <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.02] p-6">
              <div className="text-[10px] uppercase tracking-[0.24em] text-[color:var(--gold)]">
                Your business so far
              </div>
              {idea && <p className="mt-2 text-sm text-[oklch(0.84_0.01_80)]">“{idea}”</p>}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {type && (
                  <span className="rounded-full bg-[color:var(--gold)] px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-black">
                    {type.emoji} {type.label}
                  </span>
                )}
                <span className="rounded-full border border-white/15 px-3 py-1 text-[11px]">
                  {BUILD_PATHS.find((p) => p.id === path)?.label}
                </span>
                {modules.map((m) => (
                  <span key={m} className="rounded-full border border-white/12 px-3 py-1 text-[11px]">
                    {moduleById(m)?.label ?? m}
                  </span>
                ))}
              </div>
            </section>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/studio"
              className="rounded-full border border-white/25 px-6 py-3 text-[10px] font-bold uppercase tracking-[0.24em]"
            >
              Back to FV Studios
            </Link>
            <Link
              to="/room"
              className="rounded-full border border-white/25 px-6 py-3 text-[10px] font-bold uppercase tracking-[0.24em]"
            >
              My Workspace
            </Link>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
