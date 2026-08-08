import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import {
  BRIDAL_PAVILIONS,
  BRIDAL_PRINCIPLE,
  BRIDAL_FEELING,
  CONCIERGE_ROLES,
  CONCIERGE_NOTICES,
  SIZING_EQUITY_RULE,
  WELCOME_HALL_GREETING,
  PRIMARY_EXPERIENCES,
  VISITOR_SEQUENCE,
} from "@/lib/bridal";
import village from "@/assets/district-bridal.jpg";
import gardenPath from "@/assets/bridal-garden-path.jpg";

export const Route = createFileRoute("/bridal/")({
  head: () => ({
    meta: [
      { title: "Frass Bridal — The Wedding District of Frass Hill" },
      {
        name: "description",
        content:
          "An elegant wedding village beside Frass Luxury House: boutiques, marketplace pavilion, the Wedding Vault, dress collaboration and the Wedding Journey.",
      },
      { property: "og:title", content: "Frass Bridal — The Wedding District of Frass Hill" },
      {
        property: "og:description",
        content:
          "Not a bridal store. The complete wedding journey — from the first dress saved to your first anniversary.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BridalDistrict,
});

function BridalDistrict() {
  return (
    <SiteShell>
      <div className="bg-[oklch(0.14_0.01_75)] text-[oklch(0.96_0.01_80)]">
        <section className="relative h-[78vh] min-h-[460px] w-full overflow-hidden">
          <img
            src={village}
            alt="A Caribbean wedding village at golden hour — stone walkways, palms, a fountain and glass bridal boutiques"
            width={1280}
            height={960}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.14_0.01_75)] via-[oklch(0.14_0.01_75)]/50 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1400px] px-6 pb-12 lg:px-10">
            <span className="text-[10px] uppercase tracking-[0.4em] text-[color:var(--hill-gold)]">
              Frass Hill · beside the Luxury House
            </span>
            <h1 className="mt-4 font-display text-4xl uppercase leading-[0.95] md:text-7xl">
              Frass Bridal
            </h1>
            <p className="mt-4 max-w-2xl text-sm text-[oklch(0.88_0.01_80)]">
              An elegant wedding village. Stone walkways, gardens, water features and glass
              boutiques — every building here has a purpose in your wedding.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/bridal/journey"
                className="rounded-full bg-[color:var(--hill-gold)] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.24em] text-black transition hover:scale-[1.03]"
              >
                Begin the Wedding Journey
              </Link>
              <Link
                to="/bridal/vault"
                className="rounded-full border border-[oklch(0.96_0.01_80)]/40 px-6 py-3 text-[10px] font-bold uppercase tracking-[0.24em] transition hover:bg-white/10"
              >
                Open the Wedding Vault
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1400px] px-6 pt-12 lg:px-10">
          <div className="rounded-[1.75rem] border border-[color:var(--hill-gold)]/30 bg-white/[0.03] p-7 md:p-10">
            <span className="text-[10px] uppercase tracking-[0.4em] text-[color:var(--hill-gold)]">
              The Welcome Hall · Frassy, your Wedding Concierge
            </span>
            {WELCOME_HALL_GREETING.map((line, i) => (
              <p
                key={line}
                className={
                  i === 0
                    ? "mt-4 font-display text-2xl uppercase leading-tight md:text-4xl"
                    : "mt-3 max-w-2xl text-sm text-[oklch(0.84_0.01_80)]"
                }
              >
                {line}
              </p>
            ))}

            <h2 className="mt-8 text-[10px] uppercase tracking-[0.3em] text-[color:var(--hill-gold)]">
              Choose your journey
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {PRIMARY_EXPERIENCES.map((e) => {
                const body = (
                  <>
                    <span className="text-lg">{e.icon}</span>
                    <span className="mt-2 block text-sm font-semibold">{e.label}</span>
                    <span className="mt-1 block text-xs text-[oklch(0.7_0.01_80)]">{e.note}</span>
                  </>
                );
                return e.to ? (
                  <Link
                    key={e.label}
                    to={e.to}
                    className="block rounded-xl border border-white/12 bg-black/20 p-4 transition hover:border-[color:var(--hill-gold)]/50 hover:bg-black/30"
                  >
                    {body}
                  </Link>
                ) : (
                  <div
                    key={e.label}
                    className="rounded-xl border border-white/8 bg-black/10 p-4 opacity-80"
                  >
                    {body}
                    <span className="mt-2 block text-[9px] uppercase tracking-[0.2em] text-[oklch(0.55_0.01_80)]">
                      Opening soon
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-8">
              <div className="text-[10px] uppercase tracking-[0.28em] text-[color:var(--hill-gold)]">
                The whole walk, end to end
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {VISITOR_SEQUENCE.map((s, i) => (
                  <span key={s} className="flex items-center gap-2">
                    <span className="rounded-full border border-white/15 px-3 py-1 text-[11px] text-[oklch(0.8_0.01_80)]">
                      {s}
                    </span>
                    {i < VISITOR_SEQUENCE.length - 1 && (
                      <span className="text-[color:var(--hill-gold)]">→</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1400px] px-6 py-12 lg:px-10">
          <p className="border-l-2 border-[color:var(--hill-gold)] pl-4 text-sm italic text-[oklch(0.82_0.01_80)]">
            {BRIDAL_PRINCIPLE}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {BRIDAL_FEELING.map((f) => (
              <span
                key={f}
                className="rounded-full border border-[color:var(--hill-gold)]/30 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-[oklch(0.86_0.01_80)]"
              >
                {f}
              </span>
            ))}
            <span className="rounded-full border border-[oklch(0.96_0.01_80)]/20 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-[oklch(0.7_0.01_80)]">
              Never stressful
            </span>
          </div>
        </section>

        <section className="mx-auto max-w-[1400px] px-6 pb-14 lg:px-10">
          <h2 className="font-display text-2xl uppercase">The village</h2>
          <p className="mt-2 max-w-2xl text-sm text-[oklch(0.78_0.01_80)]">
            You arrive at places, not products. Walk into any building.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {BRIDAL_PAVILIONS.map((p) => {
              const body = (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-display text-lg uppercase leading-tight">{p.name}</span>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] ${
                        p.status === "open"
                          ? "bg-[color:var(--hill-gold)] text-black"
                          : "bg-white/10 text-[oklch(0.8_0.01_80)]"
                      }`}
                    >
                      {p.status === "open" ? "Open" : p.status === "building" ? "Building" : "Planned"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-[oklch(0.8_0.01_80)]">{p.does}</p>
                  <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-[oklch(0.6_0.01_80)]">
                    {p.where}
                  </p>
                </>
              );
              return p.to ? (
                <Link
                  key={p.id}
                  to={p.to}
                  className="block rounded-2xl border border-[oklch(0.96_0.01_80)]/12 bg-white/[0.03] p-5 transition hover:border-[color:var(--hill-gold)]/50 hover:bg-white/[0.06]"
                >
                  {body}
                </Link>
              ) : (
                <div
                  key={p.id}
                  className="rounded-2xl border border-[oklch(0.96_0.01_80)]/8 bg-white/[0.015] p-5"
                >
                  {body}
                </div>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-[1400px] px-6 pb-14 lg:px-10">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
            <div className="overflow-hidden rounded-[1.75rem] border border-[oklch(0.96_0.01_80)]/10">
              <img
                src={gardenPath}
                alt="A stone garden path leading through white flowers toward a glass conservatory"
                loading="lazy"
                width={1600}
                height={912}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="rounded-[1.75rem] border border-[color:var(--hill-gold)]/25 bg-white/[0.03] p-6">
              <div className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--hill-gold)]">
                FRASS-0931 · Frassy, your Wedding Concierge
              </div>
              <ul className="mt-4 space-y-3">
                {CONCIERGE_ROLES.map((r) => (
                  <li key={r.role} className="text-sm">
                    <span className="font-semibold">{r.role}</span>
                    <span className="block text-[oklch(0.76_0.01_80)]">{r.does}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5 rounded-xl border border-[oklch(0.96_0.01_80)]/10 bg-black/20 p-4">
                <div className="text-[10px] uppercase tracking-[0.24em] text-[oklch(0.66_0.01_80)]">
                  She notices things
                </div>
                <ul className="mt-2 space-y-2 text-sm italic text-[oklch(0.82_0.01_80)]">
                  {CONCIERGE_NOTICES.map((n) => (
                    <li key={n}>“{n}”</li>
                  ))}
                </ul>
              </div>
              <p className="mt-4 text-xs text-[oklch(0.68_0.01_80)]">{SIZING_EQUITY_RULE}</p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1400px] px-6 pb-20 lg:px-10">
          <div className="flex flex-wrap gap-3">
            <Link
              to="/bridal/collections"
              className="rounded-full border border-[color:var(--hill-gold)]/40 px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.22em] transition hover:bg-white/10"
            >
              Dress collaboration
            </Link>
            <Link
              to="/bridal/sourcing"
              className="rounded-full border border-[color:var(--hill-gold)]/40 px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.22em] transition hover:bg-white/10"
            >
              Source a dress we don't carry
            </Link>
            <Link
              to="/bridal/marketplace"
              className="rounded-full border border-[color:var(--hill-gold)]/40 px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.22em] transition hover:bg-white/10"
            >
              Wedding marketplace
            </Link>
            <Link
              to="/frass-luxury-house"
              className="rounded-full border border-[oklch(0.96_0.01_80)]/20 px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.22em] text-[oklch(0.78_0.01_80)] transition hover:bg-white/5"
            >
              Next door — Frass Luxury House
            </Link>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
