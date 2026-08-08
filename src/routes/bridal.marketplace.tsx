import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteShell } from "@/components/site-shell";
import { MARKETPLACE_GROUPS, PRICING_LENSES, VENDOR_CAPABILITIES } from "@/lib/bridal";

export const Route = createFileRoute("/bridal/marketplace")({
  head: () => ({
    meta: [
      { title: "Wedding Marketplace — Frass Bridal" },
      {
        name: "description",
        content:
          "Attire, flowers, photography, cake, music, transport and travel — every wedding category and vendor, searchable in one pavilion.",
      },
      { property: "og:title", content: "Wedding Marketplace — Frass Bridal" },
      {
        property: "og:description",
        content: "Appointment vendors, wedding pricing intelligence and everything the day needs.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MarketplacePage,
});

function MarketplacePage() {
  const [q, setQ] = useState("");
  const term = q.trim().toLowerCase();

  const groups = MARKETPLACE_GROUPS.map((g) => ({
    ...g,
    items: term ? g.items.filter((i) => i.toLowerCase().includes(term)) : g.items,
  })).filter((g) => g.items.length);

  return (
    <SiteShell>
      <div className="min-h-screen bg-[oklch(0.14_0.01_75)] px-6 py-12 text-[oklch(0.96_0.01_80)]">
        <div className="mx-auto max-w-[1100px]">
          <span className="text-[10px] uppercase tracking-[0.4em] text-[color:var(--hill-gold)]">
            Frass Bridal · the open-air pavilion
          </span>
          <h1 className="mt-3 font-display text-3xl uppercase md:text-5xl">Wedding Marketplace</h1>
          <p className="mt-3 max-w-2xl text-sm text-[oklch(0.8_0.01_80)]">
            Everything the wedding needs, in one place — not just fashion. Bridal vendors are
            appointment vendors: portfolios, availability, quotes and contracts, professionally
            managed.
          </p>

          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search the marketplace — florists, veils, videography…"
            className="mt-6 w-full rounded-full border border-white/15 bg-white/[0.03] px-5 py-3 text-sm outline-none placeholder:text-white/30 focus:border-[color:var(--hill-gold)]/60"
          />

          <div className="mt-8 space-y-6">
            {groups.map((g) => (
              <div key={g.group}>
                <div className="text-[10px] uppercase tracking-[0.28em] text-[color:var(--hill-gold)]">
                  {g.group}
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-3 lg:grid-cols-4">
                  {g.items.map((i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-white/12 bg-white/[0.02] p-3 text-sm transition hover:border-[color:var(--hill-gold)]/45 hover:bg-white/[0.05]"
                    >
                      {i}
                      <span className="mt-1 block text-[10px] uppercase tracking-[0.18em] text-[oklch(0.58_0.01_80)]">
                        Vendors coming
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {!groups.length && (
              <p className="rounded-xl border border-white/10 bg-white/[0.02] p-5 text-sm text-[oklch(0.72_0.01_80)]">
                Nothing matches “{q}” yet — bring it to the Sourcing Desk and we'll go find it.
              </p>
            )}
          </div>

          <div className="mt-12 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-[color:var(--hill-gold)]/25 bg-white/[0.03] p-6">
              <div className="text-[10px] uppercase tracking-[0.28em] text-[color:var(--hill-gold)]">
                Wedding pricing intelligence
              </div>
              <p className="mt-2 text-sm text-[oklch(0.78_0.01_80)]">
                Wedding buying isn't ordinary shopping. Every product is compared across:
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {PRICING_LENSES.map((p) => (
                  <span key={p} className="rounded-full border border-white/15 px-3 py-1 text-xs">
                    {p}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-white/12 bg-white/[0.02] p-6">
              <div className="text-[10px] uppercase tracking-[0.28em] text-[color:var(--hill-gold)]">
                Every vendor storefront includes
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {VENDOR_CAPABILITIES.map((v) => (
                  <span key={v} className="rounded-full border border-white/15 px-3 py-1 text-xs">
                    {v}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/bridal/sourcing"
              className="rounded-full bg-[color:var(--hill-gold)] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.24em] text-black"
            >
              Request something we don't carry
            </Link>
            <Link
              to="/bridal"
              className="rounded-full border border-white/25 px-6 py-3 text-[10px] font-bold uppercase tracking-[0.24em]"
            >
              Back to the village
            </Link>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
