// FRASS-0483 — Frass Services Marketplace.
// One marketplace: products already live in the Frass District; services live
// here, under the same architecture, the same Frass Cards and the same
// Financial Center. Categories are configuration (lib/services/marketplace.ts).

import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, ArrowRight, ShieldCheck } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import {
  ORCHESTRATIONS,
  SERVICES_PLAIN_ENGLISH,
  SERVICES_PRINCIPLE,
  SERVICES_RULE,
  SERVICE_CATEGORIES,
  SERVICE_LAUNCH_ROADMAP,
  categoryById,
} from "@/lib/services/marketplace";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Frass Services Marketplace — One Platform. Every Service." },
      {
        name: "description",
        content:
          "Freight brokerage, packing, moving, cleaning, esthetics, photography, tutoring and more — trusted Frass Partners, coordinated by Frassy from first question to final delivery.",
      },
      { property: "og:title", content: "Frass Services Marketplace" },
      {
        property: "og:description",
        content: "Every legitimate service, one trusted ecosystem. Frassy coordinates the whole journey.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ServicesMarketplace,
});

function ServicesMarketplace() {
  const [q, setQ] = useState("");
  const term = q.trim().toLowerCase();

  const categories = useMemo(
    () =>
      term
        ? SERVICE_CATEGORIES.filter((c) =>
            [c.label, c.promise, ...c.offerings, ...(c.corridors ?? [])]
              .join(" ")
              .toLowerCase()
              .includes(term),
          )
        : SERVICE_CATEGORIES,
    [term],
  );

  return (
    <SiteShell>
      <div className="mx-auto w-full max-w-6xl px-4 py-10 md:py-14">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Frass Marketplace · Services</p>
        <h1 className="mt-2 font-display text-3xl uppercase tracking-[0.06em] md:text-5xl">
          One Platform. Every Service.
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-muted-foreground">{SERVICES_PRINCIPLE}</p>
        <p className="mt-2 max-w-3xl text-sm">{SERVICES_PLAIN_ENGLISH}</p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <label className="flex min-w-[260px] flex-1 items-center gap-2 rounded-full border border-white/15 bg-black/25 px-4 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="What do you need done? (packing, barrel to Jamaica, facial, tutor…)"
              className="w-full bg-transparent text-sm outline-none"
            />
          </label>
          <Link
            to="/frass-district"
            className="rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.2em] hover:bg-white/5"
          >
            Shop products
          </Link>
        </div>

        <p className="mt-3 flex items-center gap-2 rounded-2xl border border-[color:var(--gold,#d4af37)]/30 bg-[color:var(--gold,#d4af37)]/[0.05] px-4 py-3 text-xs">
          <ShieldCheck className="h-4 w-4 text-[color:var(--gold,#d4af37)]" />
          {SERVICES_RULE}
        </p>

        {/* Orchestrated journeys — several partners, one experience. */}
        <section className="mt-10">
          <h2 className="font-display text-xl uppercase tracking-[0.08em]">Jobs Frassy coordinates end to end</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Some jobs need more than one person. You speak to Frassy once; she lines up every partner and keeps
            you posted.
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {ORCHESTRATIONS.map((o) => (
              <article key={o.id} className="rounded-3xl border border-white/12 bg-white/[0.04] p-5">
                <p className="text-2xl">{o.emoji}</p>
                <h3 className="mt-2 text-sm font-semibold">{o.label}</h3>
                <p className="mt-1 text-xs italic text-muted-foreground">“{o.need}”</p>
                <ol className="mt-3 space-y-2">
                  {o.steps.map((s, i) => {
                    const cat = categoryById(s.categoryId);
                    return (
                      <li key={`${o.id}-${i}`} className="text-xs">
                        <span className="text-[color:var(--gold,#d4af37)]">{i + 1}.</span> {cat?.emoji}{" "}
                        <span className="font-medium">{cat?.label}</span>
                        <span className="block text-muted-foreground">{s.role}</span>
                      </li>
                    );
                  })}
                </ol>
              </article>
            ))}
          </div>
        </section>

        {/* Categories — configuration, so new ones never need a rebuild. */}
        <section className="mt-12">
          <h2 className="font-display text-xl uppercase tracking-[0.08em]">Service categories</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((c) => (
              <article key={c.id} className="rounded-3xl border border-white/12 bg-white/[0.04] p-5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-2xl">{c.emoji}</p>
                  {c.licensed && (
                    <span className="rounded-full border border-white/20 px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                      Licensed pro
                    </span>
                  )}
                </div>
                <h3 className="mt-2 text-sm font-semibold">{c.label}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{c.promise}</p>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {c.offerings.map((o) => (
                    <li key={o} className="rounded-full bg-black/25 px-2.5 py-1 text-[11px]">
                      {o}
                    </li>
                  ))}
                </ul>
                {c.corridors && (
                  <p className="mt-3 text-[11px] text-muted-foreground">
                    Corridors: {c.corridors.join(" · ")}
                  </p>
                )}
              </article>
            ))}
          </div>
          {categories.length === 0 && (
            <p className="mt-4 text-sm text-muted-foreground">
              Nothing matches that yet. Ask Frassy anyway — if no Frass Partner offers it, she'll point you to the
              best option outside and remember the gap.
            </p>
          )}
        </section>

        {/* Provider side — same vault + Money Moves engines, no new launch system. */}
        <section className="mt-12 rounded-3xl border border-white/12 bg-white/[0.03] p-6">
          <h2 className="font-display text-xl uppercase tracking-[0.08em]">Offer a service on Frass</h2>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            Every service business gets a Business Vault, a launch roadmap in Money Moves and a service-enabled
            Frass Card — quotes, bookings, messages and reviews on one page. Payments run through the Financial
            Center when they switch on; nothing here is a second wallet.
          </p>
          <ol className="mt-4 grid gap-2 md:grid-cols-2">
            {SERVICE_LAUNCH_ROADMAP.map((s, i) => (
              <li key={s.id} className="rounded-2xl border border-white/10 px-4 py-3 text-sm">
                <span className="text-[color:var(--gold,#d4af37)]">{String(i + 1).padStart(2, "0")}</span>{" "}
                {s.label}
                <span className="mt-0.5 block text-xs text-muted-foreground">{s.why}</span>
              </li>
            ))}
          </ol>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/money-moves"
              className="inline-flex items-center gap-2 rounded-full bg-[color:var(--gold,#d4af37)] px-5 py-2 text-sm font-semibold text-black"
            >
              Build my service business <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/business-vaults"
              className="rounded-full border border-white/20 px-5 py-2 text-sm hover:bg-white/5"
            >
              See Business Vaults
            </Link>
            <Link
              to="/workspace/card"
              className="rounded-full border border-white/20 px-5 py-2 text-sm hover:bg-white/5"
            >
              My Frass Card
            </Link>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
