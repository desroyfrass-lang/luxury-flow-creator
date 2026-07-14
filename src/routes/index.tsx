import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { CollectionCard } from "@/components/collection-card";
import { FeaturedDrop } from "@/components/featured-drop";
import { ProductGrid } from "@/components/product-grid";
import { StickyProductRail } from "@/components/sticky-product-rail";
import heroImg from "@/assets/hero-frass.jpg";
import cardKicks from "@/assets/card-kicks.jpg";
import cardDrip from "@/assets/card-drip.jpg";
import cardBare from "@/assets/card-bare.jpg";
import fullLogo from "@/assets/frass-logo-full.asset.json";
import chromeText from "@/assets/frass-kicks-chrome-text.asset.json";
import symbolLogo from "@/assets/frass-logo-symbol.asset.json";
import { ArrowUpRight, Sparkles, Shirt, Camera } from "lucide-react";
import { useSiteImageUrl, useSiteImages } from "@/hooks/use-site-images";
import { useSiteText } from "@/hooks/use-site-text";
import { LOOKBOOK_STORIES } from "@/lib/lookbook";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Frass Kicks — Luxury Footwear, Fashion & Swim" },
      {
        name: "description",
        content:
          "Step inside the Frass Kicks showroom. Luxury footwear, Frass Drip apparel, and Bare Drip swim & intimates.",
      },
      { property: "og:title", content: "Frass Kicks — Luxury Fashion Destination" },
      { property: "og:image", content: heroImg },
    ],
  }),
  component: Home,
});

function CinematicTitleCard() {
  const presents = useSiteText("home-title-presents");
  const tagline = useSiteText("home-title-tagline");
  const logoSrc = useSiteImageUrl("logo-full", fullLogo.url);
  return (
    <div className="relative overflow-hidden border-b border-[color:var(--gold)]/25 bg-[color:var(--ink,#0a0a0a)]">
      {/* film-grain / vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_-20%,oklch(0.78_0.14_78_/_0.18),transparent_60%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--gold)]/60 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[color:var(--gold)]/40 to-transparent" />

      <div className="relative mx-auto max-w-[1600px] px-6 lg:px-12 py-7 md:py-10 flex flex-col items-center text-center">
        <div className="font-display uppercase text-[10px] md:text-[11px] tracking-[0.55em] text-[color:var(--gold)] animate-fade-up">
          {presents}
        </div>
        <div className="mt-3 md:mt-4 animate-fade-up [animation-delay:120ms]">
          <img
            src={logoSrc}
            alt="Frass logo"
            className="h-12 md:h-16 w-auto object-contain drop-shadow-[0_0_30px_oklch(0.78_0.14_78_/_0.35)]"
          />
        </div>
        {tagline && (
          <div className="mt-3 md:mt-4 text-[10px] md:text-[11px] uppercase tracking-[0.4em] text-foreground/60 animate-fade-up [animation-delay:240ms]">
            {tagline}
          </div>
        )}
      </div>
    </div>
  );
}

function Home() {
  const heroSrc = useSiteImageUrl("hero-home", heroImg);
  const { data: overrides } = useSiteImages();

  const heroEyebrow = useSiteText("home-hero-eyebrow");
  const heroHeadline = useSiteText("home-hero-headline");
  const heroParagraph = useSiteText("home-hero-paragraph");
  const ctaKicks = useSiteText("home-hero-cta-kicks");
  const ctaDrip = useSiteText("home-hero-cta-drip");
  const ctaBare = useSiteText("home-hero-cta-bare");
  const discountBar = useSiteText("home-hero-discount");

  const worldsEyebrow = useSiteText("home-worlds-eyebrow");
  const worldsTitle = useSiteText("home-worlds-title");
  const worldsParagraph = useSiteText("home-worlds-paragraph");
  const cardKicksTitle = useSiteText("home-card-kicks-title");
  const cardKicksDesc = useSiteText("home-card-kicks-desc");
  const cardDripTitle = useSiteText("home-card-drip-title");
  const cardDripDesc = useSiteText("home-card-drip-desc");
  const cardBareTitle = useSiteText("home-card-bare-title");
  const cardBareDesc = useSiteText("home-card-bare-desc");

  const lookbookEyebrow = useSiteText("home-lookbook-eyebrow");
  const lookbookTitle = useSiteText("home-lookbook-title");
  const lookbookCta = useSiteText("home-lookbook-cta");

  const bestEyebrow = useSiteText("home-best-eyebrow");
  const bestTitle = useSiteText("home-best-title");
  const bestEmpty = useSiteText("home-best-empty");

  const musicEyebrow = useSiteText("home-music-eyebrow");
  const musicTitle = useSiteText("home-music-title");
  const musicParagraph = useSiteText("home-music-paragraph");
  const musicCta = useSiteText("home-music-cta");
  const journalEyebrow = useSiteText("home-journal-eyebrow");
  const journalTitle = useSiteText("home-journal-title");

  const serviceEyebrow = useSiteText("home-service-eyebrow");
  const serviceTitle = useSiteText("home-service-title");
  const serviceParagraph = useSiteText("home-service-paragraph");

  return (
    <SiteShell preHeader={<CinematicTitleCard />}>
      <StickyProductRail
        image="https://cdn.shopify.com/s/files/1/0738/7575/1068/files/1383dd80-1139-4af9-8bae-1b14c7cb8920.jpg?v=1779150092"
        title="Camo High-Steppers"
        eyebrow="Now stepping"
        handle="camo-high-steppers"
      />

      <section className="relative">
        <div className="mx-auto max-w-[1600px] px-6 lg:px-12 pt-10 lg:pt-16">
          <div className="relative overflow-hidden rounded-[2rem] border border-border/60 lux-card">
            <img
              src={heroSrc}
              alt="Frass Kicks luxury showroom"
              className="h-[78vh] min-h-[560px] w-full object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,oklch(0.07_0.005_80_/_0.88)_0%,oklch(0.07_0.005_80_/_0.62)_40%,oklch(0.07_0.005_80_/_0.35)_65%,transparent_100%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,oklch(0.07_0.005_80_/_0.32)_0%,transparent_35%,oklch(0.07_0.005_80_/_0.72)_100%)]" />

            <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12 lg:p-16 animate-fade-up">
              <div className="max-w-3xl text-foreground">
                <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-2 font-display uppercase">
                  <img
                    src={chromeText.url}
                    alt="Frass Kicks"
                    className="h-8 md:h-11 lg:h-14 w-auto object-contain drop-shadow-[0_0_18px_oklch(0.78_0.14_78_/_0.35)]"
                  />
                  <span className="text-sm md:text-lg lg:text-xl tracking-[0.3em] text-[color:var(--gold)]">
                    Original Luxury Streetwear
                  </span>
                  <img
                    src={symbolLogo.url}
                    alt=""
                    aria-hidden
                    className="h-9 md:h-12 lg:h-16 w-auto object-contain drop-shadow-[0_0_18px_oklch(0.78_0.14_78_/_0.35)]"
                  />
                </div>
                <h1 className="max-w-2xl font-display text-6xl md:text-8xl lg:text-[8.5rem] text-foreground leading-[0.88]">
                  {heroHeadline}
                </h1>
                <p className="mt-5 max-w-xl text-sm md:text-base tracking-[0.04em] text-foreground/78">
                  {heroParagraph}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    to="/frass-kicks"
                    className="lux-press inline-flex items-center gap-2 rounded-sm border border-[color:var(--gold)] bg-[color:var(--gold)] px-7 py-3.5 text-xs font-bold uppercase tracking-[0.32em] text-[color:var(--ink)] transition hover:bg-[color:var(--gold-soft)]"
                  >
                    {ctaKicks} <ArrowUpRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/frass-drip"
                    className="lux-press inline-flex items-center gap-2 rounded-sm border border-border/80 bg-background/35 px-7 py-3.5 text-xs uppercase tracking-[0.28em] text-foreground backdrop-blur transition hover:border-[color:var(--gold)] hover:text-[color:var(--gold)]"
                  >
                    {ctaDrip}
                  </Link>
                  <Link
                    to="/bare-drip"
                    className="lux-press inline-flex items-center gap-2 rounded-sm border border-border/80 bg-background/35 px-7 py-3.5 text-xs uppercase tracking-[0.28em] text-foreground backdrop-blur transition hover:border-[color:var(--gold)] hover:text-[color:var(--gold)]"
                  >
                    {ctaBare}
                  </Link>
                  <Link
                    to="/capsules"
                    className="lux-press inline-flex items-center gap-2 rounded-sm border border-[color:var(--gold)] bg-[color:var(--gold)] px-7 py-3.5 text-xs font-bold uppercase tracking-[0.32em] text-[color:var(--ink)] transition hover:bg-[color:var(--gold-soft)]"
                  >
                    Shop Capsules <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-sm border border-[color:var(--gold)]/35 bg-background/70 backdrop-blur">
            <div className="px-6 py-3 text-center text-sm font-semibold uppercase tracking-[0.28em] text-[color:var(--gold)]">
              {discountBar}
            </div>
          </div>
        </div>
      </section>

      <FeaturedDrop />

      <section className="mx-auto max-w-[1600px] px-6 lg:px-12 mt-20">
        <Link
          to="/try-on"
          className="lux-card group relative block overflow-hidden rounded-[2rem] border border-[color:var(--gold)]/40 bg-gradient-to-br from-[color:var(--ink,#0a0a0a)] via-background to-secondary/40 p-8 md:p-12"
        >
          <div
            className="absolute inset-0 opacity-60"
            style={{ background: "radial-gradient(70% 90% at 85% 20%, oklch(0.78 0.14 78 / 0.28), transparent 70%)" }}
          />
          <div className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-[color:var(--gold)]/10 blur-3xl" />
          <div className="relative grid md:grid-cols-[1.4fr_1fr] gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--gold)]/50 bg-background/40 backdrop-blur px-3 py-1 text-[10px] uppercase tracking-[0.35em] text-[color:var(--gold)]">
                <Sparkles className="h-3 w-3" /> New · AI Fitting Room
              </div>
              <h2 className="mt-4 font-display text-4xl md:text-6xl leading-[0.92] text-foreground">
                Try it on before you check out.
              </h2>
              <p className="mt-4 max-w-xl text-sm md:text-base text-muted-foreground">
                Drop anything from Frass Kicks, Drip, or Bare into your cart, upload a photo, and our AI styles the look on you in seconds. See the fit, share the drip, then buy with confidence.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-foreground/80">
                  <Camera className="h-4 w-4 text-[color:var(--gold)]" /> Upload a photo
                </span>
                <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-foreground/80">
                  <Shirt className="h-4 w-4 text-[color:var(--gold)]" /> Pick cart items
                </span>
                <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-foreground/80">
                  <Sparkles className="h-4 w-4 text-[color:var(--gold)]" /> See the fit
                </span>
              </div>
              <div className="mt-8 inline-flex items-center gap-2 rounded-sm border border-[color:var(--gold)] bg-[color:var(--gold)] px-7 py-3.5 text-xs font-bold uppercase tracking-[0.32em] text-[color:var(--ink)] transition group-hover:bg-[color:var(--gold-soft)]">
                Enter the Fitting Room <ArrowUpRight className="h-4 w-4" />
              </div>
            </div>
            <div className="relative hidden md:block">
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-[color:var(--gold)]/30 bg-background/50">
                <img
                  src={heroSrc}
                  alt="AI try-on preview"
                  className="absolute inset-0 h-full w-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_30%,oklch(0.07_0.005_80_/_0.85)_100%)]" />
                <div className="absolute inset-x-4 bottom-4 rounded-xl border border-[color:var(--gold)]/40 bg-background/70 backdrop-blur px-4 py-3">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]">Live preview</div>
                  <div className="text-sm font-display text-foreground">Your fit, rendered by AI</div>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </section>

      <section className="mx-auto max-w-[1600px] px-6 lg:px-12 mt-20">
        <div className="flex items-end justify-between gap-6 mb-10">
          <div>
            <div className="mb-3 inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
              <span className="h-px w-8 bg-[color:var(--gold)]" />
              {worldsEyebrow}
            </div>
            <h2 className="font-display text-5xl md:text-7xl leading-[0.95] text-foreground">
              {worldsTitle}
            </h2>
          </div>
          <p className="hidden md:block max-w-sm text-sm text-muted-foreground">
            {worldsParagraph}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          <CollectionCard
            to="/frass-kicks"
            slot="card-frass-kicks"
            image={cardKicks}
            eyebrow="Division 01"
            title={cardKicksTitle}
            description={cardKicksDesc}
          />
          <CollectionCard
            to="/frass-drip"
            slot="card-frass-drip"
            image={cardDrip}
            eyebrow="Division 02"
            title={cardDripTitle}
            description={cardDripDesc}
          />
          <CollectionCard
            to="/bare-drip"
            slot="card-bare-drip"
            image={cardBare}
            eyebrow="Division 03"
            title={cardBareTitle}
            description={cardBareDesc}
          />
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-6 lg:px-12 mt-24">
        <div className="flex items-end justify-between gap-6 mb-10">
          <div>
            <div className="mb-3 inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
              <span className="h-px w-8 bg-[color:var(--gold)]" />
              {lookbookEyebrow}
            </div>
            <h2 className="font-display text-5xl md:text-7xl leading-[0.95] text-foreground">
              {lookbookTitle}
            </h2>
          </div>
          <Link
            to="/lookbook"
            className="hidden md:inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] hover:text-[color:var(--gold)] transition"
          >
            {lookbookCta} <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
          {LOOKBOOK_STORIES.slice(0, 4).map((story) => (
            <Link
              key={story.slug}
              to="/lookbook/$story"
              params={{ story: story.slug }}
              className="lux-card group relative block overflow-hidden rounded-2xl bg-card aspect-[3/4]"
            >
              <img
                src={overrides?.get(`lookbook-cover-${story.slug}`)?.url ?? story.cover}
                alt={story.title}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,oklch(0.07_0.005_80_/_0.25)_0%,oklch(0.07_0.005_80_/_0.55)_55%,oklch(0.07_0.005_80_/_0.92)_100%)]" />
              <div className="absolute inset-3 ring-1 ring-[color:var(--gold)]/25 rounded-xl pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                <div className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]/90 mb-2">
                  {story.kicker}
                </div>
                <h3 className="title-glow font-display uppercase text-2xl md:text-3xl leading-[0.95] tracking-[0.01em] text-[color:var(--gold-soft,#f0d78c)]">
                  {story.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-6 md:hidden">
          <Link
            to="/lookbook"
            className="lux-press inline-flex items-center gap-2 rounded-sm border border-[color:var(--gold)] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.32em] text-[color:var(--gold)]"
          >
            {lookbookCta} <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-6 lg:px-12 mt-28">
        <div className="flex items-end justify-between gap-6 mb-10">
          <div>
            <div className="mb-3 inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
              <span className="h-px w-8 bg-[color:var(--gold)]" />
              {bestEyebrow}
            </div>
            <h2 className="font-display text-4xl md:text-6xl leading-[0.95] text-foreground">
              {bestTitle}
            </h2>
          </div>
          <Link
            to="/collection/$handle"
            params={{ handle: "frass-kicks" }}
            className="hidden md:inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] hover:text-[color:var(--gold)] transition"
          >
            View all <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
        <ProductGrid first={4} emptyHint={bestEmpty} />
      </section>

      <section className="mx-auto max-w-[1600px] px-6 lg:px-12 mt-28">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          <Link
            to="/music-media"
            className="group relative overflow-hidden rounded-[2rem] border border-border/60 bg-gradient-to-br from-secondary/60 via-background to-background p-10 md:p-14 min-h-[420px] flex flex-col justify-between"
          >
            <div className="absolute inset-0 opacity-50" style={{ background: "radial-gradient(70% 80% at 80% 20%, oklch(0.78 0.14 78 / 0.22), transparent 70%)" }} />
            <div className="relative">
              <div className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--gold)]">{musicEyebrow}</div>
              <h2 className="mt-4 font-display text-4xl md:text-6xl leading-[0.92]">
                {musicTitle}
              </h2>
              <p className="mt-5 max-w-md text-sm md:text-base text-muted-foreground">
                {musicParagraph}
              </p>
            </div>
            <div className="relative inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-foreground group-hover:text-[color:var(--gold)] transition">
              {musicCta} <ArrowUpRight className="h-4 w-4" />
            </div>
          </Link>

          <div className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-secondary/40 p-10 md:p-14 min-h-[420px] flex flex-col justify-between">
            <div className="relative">
              <div className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--gold)]">{journalEyebrow}</div>
              <h2 className="mt-4 font-display text-4xl md:text-6xl leading-[0.92]">{journalTitle}</h2>
              <ul className="mt-8 divide-y divide-border/60">
                {[
                  { tag: "Style", title: "Block letters & chrome: building the Frass identity." },
                  { tag: "Studio", title: "Inside the late-night sessions of Frass Hill." },
                  { tag: "Drop", title: "Behind the lens of the FW lookbook." },
                ].map((post) => (
                  <li key={post.title} className="py-4 flex items-start gap-4 group cursor-pointer">
                    <span className="mt-1 text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)] border border-[color:var(--gold)]/40 px-2 py-1 rounded">
                      {post.tag}
                    </span>
                    <span className="flex-1 font-display text-lg md:text-xl leading-snug group-hover:text-[color:var(--gold)] transition">
                      {post.title}
                    </span>
                    <ArrowUpRight className="h-4 w-4 mt-1 text-muted-foreground group-hover:text-[color:var(--gold)] transition" />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-6 lg:px-12 mt-28">
        <div className="relative overflow-hidden rounded-[2rem] border border-border/60 p-10 md:p-20 bg-secondary/45 backdrop-blur">
          <div
            className="absolute inset-0 opacity-60"
            style={{ background: "radial-gradient(60% 80% at 50% 50%, oklch(0.78 0.14 78 / 0.18), transparent 70%)" }}
          />
          <div className="relative max-w-2xl">
            <div className="mb-4 text-[11px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
              {serviceEyebrow}
            </div>
            <h2 className="font-display text-4xl md:text-6xl leading-[0.95] text-foreground">
              {serviceTitle}
            </h2>
            <p className="mt-5 max-w-md text-sm md:text-base text-muted-foreground">
              {serviceParagraph}
            </p>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
