import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { PageFeedback } from "@/components/page-feedback";
import {
  BROWSE_RAILS,
  PLUS_DEPARTMENTS,
  PLUS_WING_IMAGE,
  SIGNATURE_COLLECTIONS,
} from "@/lib/frass-plus";
import hero from "@/assets/plus-hero.jpg";

const TITLE = "Frass Plus — Premium Fashion, Extended Sizing";
const DESCRIPTION =
  "Frass Plus is a flagship fashion boutique in the Frass District — premium footwear, apparel, occasion and resort collections thoughtfully cut for extended sizing.";

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
          <h1 className="mt-4 font-display text-5xl uppercase leading-[0.88] text-[color:var(--luxe-linen,#f6f1e7)] md:text-8xl">
            Frass Plus
          </h1>
          <p className="mt-5 max-w-2xl text-sm text-[color:var(--luxe-linen,#f6f1e7)]/80 md:text-lg">
            Premium fashion thoughtfully designed for extended sizing — without compromising
            style, craftsmanship, or confidence.
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

      {/* Two wings */}
      <section className="mx-auto max-w-[1600px] px-6 pb-20 lg:px-12">
        <div className="grid gap-8 md:grid-cols-2">
          <WingCard
            to="/frass-plus/$gender"
            gender="men"
            eyebrow="The Gentlemen's Collection"
            title="Gentlemen"
            blurb="Tailoring, streetwear, resort and activewear — cut with room to move and lines that hold."
            count={PLUS_DEPARTMENTS.men.length}
          />
          <WingCard
            to="/frass-plus/$gender"
            gender="women"
            eyebrow="The Ladies' Collection"
            title="Ladies"
            blurb="Dresses, sets, tailoring, swim and intimates — designed to be worn, not endured."
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
            Shop the confidence, not the size
          </h2>
          <p className="mt-4 text-sm text-muted-foreground">
            Every collection is styled as a complete look — fit notes, coordinated accessories
            and outfit inspiration included.
          </p>
        </header>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SIGNATURE_COLLECTIONS.map((c) => (
            <Link
              key={c.slug}
              to="/collection/$handle"
              params={{ handle: `frass-plus-${c.slug}` }}
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
                  <h3 className="font-display text-2xl uppercase leading-none text-[color:var(--luxe-linen,#f6f1e7)]">
                    {c.title}
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
  eyebrow,
  title,
  blurb,
  count,
}: {
  to: string;
  gender: "men" | "women";
  eyebrow: string;
  title: string;
  blurb: string;
  count: number;
}) {
  return (
    <Link
      to={to}
      params={{ gender }}
      className="group relative block overflow-hidden rounded-[26px] border border-[color:var(--gold)]/25 bg-card"
    >
      <div className="relative h-[520px] w-full overflow-hidden md:h-[640px]">
        <img
          src={PLUS_WING_IMAGE[gender]}
          alt={`${title} collection`}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-[1600ms] ease-out group-hover:scale-[1.06]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,oklch(0.08_0.01_60/0.94),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-4 rounded-[20px] ring-1 ring-[color:var(--gold)]/25" />
        <div className="absolute inset-x-0 bottom-0 p-8">
          <span className="text-[10px] uppercase tracking-[0.34em] text-[color:var(--gold)]">
            {eyebrow}
          </span>
          <h2 className="mt-3 font-display text-4xl uppercase leading-none text-[color:var(--luxe-linen,#f6f1e7)] md:text-6xl">
            {title}
          </h2>
          <p className="mt-3 max-w-md text-sm text-[color:var(--luxe-linen,#f6f1e7)]/80">
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
