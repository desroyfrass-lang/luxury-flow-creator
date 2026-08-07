import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { PageFeedback } from "@/components/page-feedback";
import { PlusBadge } from "@/components/plus-badge";
import {
  BROWSE_RAILS,
  MIRRORED_STORES,
  PLUS_DEPARTMENTS,
  PLUS_WING_IMAGE,
  SIGNATURE_COLLECTIONS,
  signatureHandle,
} from "@/lib/frass-plus";
import hero from "@/assets/plus-store-front.jpg";
import frassSymbol from "@/assets/frass-logo-symbol.asset.json";

const TITLE = "Frass Plus+ — The Same Collections, Extended Sizing";
const DESCRIPTION =
  "Frass Plus+ mirrors the Frass District exactly — Frass Kicks, Frass Drip and Bare Drip, department for department, released on the same day in extended sizing.";


export const Route = createFileRoute("/frass-plus/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PlusHome,
});

function PlusHome() {
  return (
    <SiteShell>
      <section className="relative h-[78vh] min-h-[520px] w-full overflow-hidden">
        <img
          src={hero}
          alt="Three confident models in premium tailoring inside the Frass Plus boutique"
          width={1920}
          height={1088}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,oklch(0.09_0.01_60/0.95),oklch(0.09_0.01_60/0.25)_55%,oklch(0.09_0.01_60/0.45))]" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1600px] px-6 pb-14 lg:px-12">
          <span className="text-[10px] uppercase tracking-[0.42em] text-[color:var(--gold)]">
            Frass District · Flagship
          </span>
          <h1 className="mt-4 flex flex-wrap items-center gap-4 font-display text-5xl uppercase leading-[0.88] text-[color:var(--luxe-linen,#f6f1e7)] md:text-8xl">
            Frass Plus
            <PlusBadge size="lg" className="translate-y-1" />
          </h1>
          <p className="mt-5 max-w-2xl text-sm text-[color:var(--luxe-linen,#f6f1e7)]/80 md:text-lg">
            The exact same collections as the main Frass District — Frass Kicks, Frass Drip and
            Bare Drip — mirrored department for department, released on the same day.
          </p>
          <p className="mt-3 font-script text-lg italic text-[color:var(--gold)] md:text-2xl">
            Style has no size. Confidence has no limits.
          </p>

        </div>
      </section>

      {/* Browse rails — never by size */}
      <nav
        aria-label="Browse Frass Plus"
        className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-3 px-6 py-8 lg:px-12"
      >
        {BROWSE_RAILS.map((r) => (
          <Link
            key={r.handle}
            to="/collection/$handle"
            params={{ handle: r.handle }}
            className="rounded-full border border-[color:var(--gold)]/40 px-5 py-2 text-[10px] font-bold uppercase tracking-[0.26em] text-[color:var(--gold)] transition hover:bg-[color:var(--gold)] hover:text-[color:var(--ink)]"
          >
            {r.label}
          </Link>
        ))}
      </nav>

      {/* Mirrored stores */}
      <section className="mx-auto max-w-[1600px] px-6 pb-16 lg:px-12">
        <header className="mb-8 max-w-2xl">
          <p className="text-[10px] uppercase tracking-[0.38em] text-[color:var(--gold)]">
            One architecture
          </p>
          <h2 className="mt-3 font-display text-3xl uppercase md:text-5xl">
            The same stores, extended
          </h2>
          <p className="mt-4 text-sm text-muted-foreground">
            Frass Plus+ has no separate collection names. Every store, department and
            sub-collection mirrors the main district exactly — the Plus+ badge is the only
            difference.
          </p>
        </header>
        <div className="grid gap-6 md:grid-cols-3">
          {MIRRORED_STORES.map((s) => (
            <article
              key={s.key}
              className="relative overflow-hidden rounded-2xl border border-[color:var(--gold)]/20 bg-card"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden">
                <img src={s.image} alt={s.title} loading="lazy" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-[linear-gradient(to_top,oklch(0.08_0.01_60/0.92),transparent_65%)]" />
              </div>
              <div className="p-6">
                <h3 className="flex flex-wrap items-center gap-2 font-display text-xl uppercase">
                  {s.title}
                  <PlusBadge />
                </h3>
                <p className="mt-2 text-xs text-muted-foreground">{s.blurb}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Two wings */}
      <section className="mx-auto max-w-[1600px] px-6 pb-20 lg:px-12">
        <div className="grid gap-8 md:grid-cols-2">
          <WingCard
            to="/frass-plus/$gender"
            gender="men"
            eyebrow="Men's Frass Plus+"
            title="Men"
            blurb="Frass Kicks, every Drip department and Bare Drip — mirrored exactly, cut with room to move."
            count={PLUS_DEPARTMENTS.men.length}
          />
          <WingCard
            to="/frass-plus/$gender"
            gender="women"
            eyebrow="Women's Frass Plus+"
            title="Women"
            blurb="Frass Kicks, every Drip department and Bare Drip — mirrored exactly, designed to be worn, not endured."
            count={PLUS_DEPARTMENTS.women.length}
          />
        </div>
      </section>


      {/* Signature collections */}
      <section className="mx-auto max-w-[1600px] px-6 pb-24 lg:px-12">
        <header className="mb-10 max-w-2xl">
          <p className="text-[10px] uppercase tracking-[0.38em] text-[color:var(--gold)]">
            Signature Collections
          </p>
          <h2 className="mt-3 font-display text-3xl uppercase md:text-5xl">
            Mirrored, signature-for-signature
          </h2>
          <p className="mt-4 text-sm text-muted-foreground">
            Signature Frass collections, released in extended sizing at the same time, with
            the same styling, photography and campaign.
          </p>
        </header>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SIGNATURE_COLLECTIONS.map((c) => (
            <Link
              key={c.slug}
              to="/collection/$handle"
              params={{ handle: signatureHandle(c.slug) }}
              className="group relative overflow-hidden rounded-2xl border border-[color:var(--gold)]/20 bg-card"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden">
                <img
                  src={c.image}
                  alt={c.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.07]"
                />
                <div className="absolute inset-0 bg-[linear-gradient(to_top,oklch(0.08_0.01_60/0.92),transparent_60%)]" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <h3 className="flex flex-wrap items-center gap-2 font-display text-2xl uppercase leading-none text-[color:var(--luxe-linen,#f6f1e7)]">
                    {c.title}
                    <PlusBadge />
                  </h3>
                  <p className="mt-2 text-xs text-[color:var(--luxe-linen,#f6f1e7)]/75">
                    {c.blurb}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <PageFeedback pageTitle="Frass Plus" />
    </SiteShell>
  );
}

function WingCard({
  to,
  gender,
  title,
  blurb,
  count,
}: {
  to: string;
  gender: "men" | "women";
  eyebrow?: string;
  title: string;
  blurb: string;
  count: number;
}) {
  return (
    <Link
      to={to}
      params={{ gender }}
      aria-label={`${title} — enter the store`}
      className="group relative block overflow-hidden rounded-[26px] border border-[color:var(--gold)]/25 bg-card"
    >
      <div className="relative h-[520px] w-full overflow-hidden md:h-[640px]">
        <img
          src={PLUS_WING_IMAGE[gender]}
          alt={`${title} storefront with extended-size looks in the window`}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-[1600ms] ease-out group-hover:scale-[1.06]"
        />
        {/* the only mark above the store: the Frass symbol on the sign */}
        <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center pt-6 md:pt-9">
          <img
            src={frassSymbol.url}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="h-14 w-auto opacity-95 drop-shadow-[0_6px_18px_rgba(0,0,0,0.6)] md:h-20"
            style={{
              filter:
                "brightness(0) saturate(100%) invert(78%) sepia(56%) saturate(560%) hue-rotate(2deg) brightness(96%) contrast(94%) drop-shadow(0 0 14px rgba(212,175,55,0.55))",
            }}
          />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(to_top,oklch(0.08_0.01_60/0.94),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-4 rounded-[20px] ring-1 ring-[color:var(--gold)]/25" />
        <div className="absolute inset-x-0 bottom-0 p-8 text-center">
          <h2 className="font-display text-2xl uppercase leading-tight text-[color:var(--luxe-linen,#f6f1e7)] md:text-4xl">
            {title}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-[color:var(--luxe-linen,#f6f1e7)]/80">
            {blurb}
          </p>
          <span className="mt-6 inline-flex items-center rounded-sm border border-[color:var(--gold)] px-7 py-3 text-[10px] font-bold uppercase tracking-[0.3em] text-[color:var(--gold)] transition group-hover:bg-[color:var(--gold)] group-hover:text-[color:var(--ink)]">
            Enter · {count} Departments
          </span>
        </div>
      </div>
    </Link>
  );
}

