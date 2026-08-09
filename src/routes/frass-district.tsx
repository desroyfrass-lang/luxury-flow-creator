import { createFileRoute, Link } from "@tanstack/react-router";
import { GatewayNav } from "@/components/gateway-nav";
import { CollectionCard } from "@/components/collection-card";
import { ProductGrid } from "@/components/product-grid";
import { StickyProductRail } from "@/components/sticky-product-rail";
import { StudioEntryCard } from "@/components/studio-entry-card";
import { ArrowUpRight, Sparkles, Shirt, Camera, Flame, Star } from "lucide-react";
import { useSiteImages } from "@/hooks/use-site-images";
import { useSiteText } from "@/hooks/use-site-text";
import { LOOKBOOK_STORIES } from "@/lib/lookbook";
import { BOUNCY_VIRAL_DRESS_IMG } from "@/lib/social-virals";
import marketStreet from "@/assets/district-kicks.jpg";
import storeKicksMen from "@/assets/store-kicks-men.jpg";
import storeKicksWomen from "@/assets/store-kicks-women.jpg";
import storeDripMen from "@/assets/store-drip-men.jpg";
import storeDripWomen from "@/assets/store-drip-women.jpg";
import storeBareMen from "@/assets/store-bare-men.jpg";
import storeBareWomen from "@/assets/store-bare-women.jpg";
import districtLuxury from "@/assets/district-luxury.jpg";
import districtKids from "@/assets/district-kids.jpg";
import cardMen from "@/assets/card-men.jpg";
import cardWomen from "@/assets/card-women.jpg";
import plusWingMen from "@/assets/plus-wing-men.jpg";
import plusWingWomen from "@/assets/plus-wing-women.jpg";
import bridalBoutique from "@/assets/bridal-boutique-storefront.jpg";
import shapeRoomMen from "@/assets/shape-room-men.jpg";
import shapeRoomWomen from "@/assets/shape-room-women.jpg";



export const Route = createFileRoute("/frass-district")({
  head: () => ({
    meta: [
      { title: "Frass District — Shop Every Frass Store" },
      {
        name: "description",
        content:
          "The Frass District: Frass Kicks, Frass Drip, Bare Drip, Plus Size, Frass Kids and the Luxury House — plus viral drops, the lookbook, the fitting room and the music behind the brand.",
      },
      { property: "og:title", content: "Frass District — Shop Every Frass Store" },
      {
        property: "og:description",
        content:
          "Every Frass store in one district — men's side and women's side — with viral drops, the lookbook and must-have pieces.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FrassDistrictHome,
});

const STORES: { title: string; description: string; image: string; to: string; eyebrow: string }[] = [
  {
    title: "Frass Kicks for Men",
    description: "Premium footwear — casual, classic and street.",
    image: storeKicksMen,
    to: "/frass-kicks/men",
    eyebrow: "Men",
  },
  {
    title: "Frass Kicks for Women",
    description: "Sneakers, heels, sandals and slides.",
    image: storeKicksWomen,
    to: "/frass-kicks/women",
    eyebrow: "Women",
  },
  {
    title: "Frass Drip for Men",
    description: "Streetwear, apparel and complete looks.",
    image: storeDripMen,
    to: "/frass-drip/men",
    eyebrow: "Men",
  },
  {
    title: "Frass Drip for Women",
    description: "Fashion, apparel and complete looks.",
    image: storeDripWomen,
    to: "/frass-drip/women",
    eyebrow: "Women",
  },
  {
    title: "Bare Drip for Men",
    description: "Swimwear, resort wear and essentials.",
    image: storeBareMen,
    to: "/bare-drip/men",
    eyebrow: "Men",
  },
  {
    title: "Bare Drip for Women",
    description: "Swimwear, lingerie and resort collections.",
    image: storeBareWomen,
    to: "/bare-drip/women",
    eyebrow: "Women",
  },
  {
    title: "Frass Plus — Gentlemen",
    description: "Premium fashion, thoughtfully cut. Style has no size.",
    image: plusWingMen,
    to: "/frass-plus/men",
    eyebrow: "Men",
  },
  {
    title: "Frass Plus — Ladies",
    description: "Premium fashion, thoughtfully cut. Confidence has no limits.",
    image: plusWingWomen,
    to: "/frass-plus/women",
    eyebrow: "Women",
  },
  {
    title: "Frass Shape — Men",
    description: "Compression, posture support and suit layers. Support you feel, never see.",
    image: shapeRoomMen,
    to: "/frass-shape/men",
    eyebrow: "Wellness",
  },
  {
    title: "Frass Shape — Women",
    description: "Sculpt, smooth, bridal, postpartum and active support — shop by goal.",
    image: shapeRoomWomen,
    to: "/frass-shape/women",
    eyebrow: "Wellness",
  },
  {
    title: "Frass Kids",

    description: "The children's flagship — eight age & gender stores, one Frass architecture.",
    image: districtKids,
    to: "/frass-kids",
    eyebrow: "Ages 0–3 to 12+",
  },
  {
    title: "Frass Bridal Boutique",
    description: "Where the dream begins — then a garden walk to the Bridal Estate.",
    image: bridalBoutique,
    to: "/bridal-boutique",
    eyebrow: "Weddings",
  },
  {
    title: "Frass Luxury House",
    description: "The estate — timeless craftsmanship, tailoring and investment pieces.",
    image: districtLuxury,
    to: "/frass-luxury-house",
    eyebrow: "The Estate",
  },
];

function FrassDistrictHome() {
  const { data: overrides } = useSiteImages();

  const discountBar = useSiteText("home-hero-discount");
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
    <div className="min-h-screen bg-background">
      <GatewayNav mode="shop" />

      <StickyProductRail
        image="https://cdn.shopify.com/s/files/1/0738/7575/1068/files/1383dd80-1139-4af9-8bae-1b14c7cb8920.jpg?v=1779150092"
        title="Camo High-Steppers"
        eyebrow="Now stepping"
        handle="camo-high-steppers"
      />

      {/* District arrival */}
      <section className="relative h-[62vh] min-h-[420px] overflow-hidden">
        <img
          src={marketStreet}
          alt="Lush Jamaican street opening into a sunlit retail boulevard of boutique storefronts"
          width={1280}
          height={960}
          className="gateway-drift h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/40" />
        <div className="absolute inset-0 mx-auto flex max-w-[1600px] flex-col justify-end px-6 pb-12 lg:px-10">
          <span className="text-[10px] uppercase tracking-[0.35em] text-white/70">
            The FrassKicks Marketplace
          </span>
          <h1 className="gateway-rise mt-3 max-w-3xl font-display text-4xl uppercase leading-[0.95] text-white md:text-7xl">
            Frass District
          </h1>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/sales-clearance"
              className="rounded-full bg-white px-6 py-3 text-[10px] font-bold uppercase tracking-[0.28em] text-black transition hover:scale-[1.03]"
            >
              Shop Sales and Clearance
            </Link>
            <Link
              to="/frass-hill"
              className="rounded-full border border-white/60 px-6 py-3 text-[10px] font-bold uppercase tracking-[0.28em] text-white transition hover:bg-white/10"
            >
              ⛰️ Enter Frass Hill
            </Link>
          </div>
        </div>
      </section>

      {discountBar && (
        <div className="mx-auto max-w-[1600px] px-6 pt-6 lg:px-10">
          <div className="overflow-hidden rounded-sm border border-[color:var(--gold)]/35 bg-background/70 backdrop-blur">
            <div className="px-6 py-3 text-center text-sm font-semibold uppercase tracking-[0.28em] text-[color:var(--gold)]">
              {discountBar}
            </div>
          </div>
        </div>
      )}

      {/* Store directory */}
      <section className="mx-auto max-w-[1100px] px-6 py-20 lg:px-10">
        <header className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-4xl uppercase leading-[0.9] text-[color:var(--gold)] md:text-6xl">
            Choose Your Lane
          </h2>
          <p className="mt-4 text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
            Walk Wid Power · Step Wid Purpose · Move Wid Meaning
          </p>
          <p className="mx-auto mt-5 max-w-xl text-sm text-muted-foreground md:text-base">
            Every Frass store, in one directory — pick your door and start shopping.
          </p>
        </header>

        <div className="mt-16 grid gap-10">
          {STORES.map((s) => (
            <CollectionCard
              key={s.to}
              to={s.to}
              image={s.image}
              eyebrow={s.eyebrow}
              title={s.title}
              description={s.description}
              size="lg"
              cta="Enter Store"
            />
          ))}
        </div>
      </section>

      {/* Going viral */}
      <section className="mx-auto max-w-[1600px] px-6 lg:px-12">
        <div className="mb-6 flex items-end justify-between gap-6">
          <div>
            <div className="mb-3 inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
              <span className="h-px w-8 bg-[color:var(--gold)]" />
              <Flame className="h-3.5 w-3.5 text-[color:var(--gold)]" /> Going Viral · Frass Hill Trending
            </div>
            <h2 className="font-display text-4xl leading-[0.95] text-foreground md:text-6xl">
              Everyone Wants This
            </h2>
          </div>
          <Link
            to="/social-media-virals/$category"
            params={{ category: "main-event" }}
            className="hidden items-center gap-2 text-xs uppercase tracking-[0.25em] transition hover:text-[color:var(--gold)] md:inline-flex"
          >
            Shop all virals <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid items-stretch gap-6 md:grid-cols-[1.15fr_1fr] lg:gap-8">
          <Link
            to="/social-media-virals/$category/$sub/$product"
            params={{ category: "main-event", sub: "bouncy-dresses", product: "bouncy-viral-dress" }}
            className="lux-card group relative block overflow-hidden rounded-[2rem] border border-[color:var(--gold)]/40 bg-[color:var(--ink,#0a0a0a)]"
          >
            <img
              src={BOUNCY_VIRAL_DRESS_IMG}
              alt="Bouncy Viral Dress"
              loading="lazy"
              width={1024}
              height={1280}
              className="h-full max-h-[560px] w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,oklch(0.07_0.005_80_/_0.88)_100%)]" />
            <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-[color:var(--gold)]/60 bg-background/40 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)] backdrop-blur">
              <Flame className="h-3 w-3" /> Viral · 6.2k sold
            </div>
            <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
              <div className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]/90">
                Bouncy Dresses · Main Event
              </div>
              <h3 className="mt-2 font-display text-3xl uppercase leading-[0.95] text-foreground md:text-5xl">
                Bouncy Viral Dress
              </h3>
              <div className="mt-3 flex items-baseline gap-3">
                <span className="font-display text-2xl text-foreground">$78</span>
                <span className="text-sm text-foreground/60 line-through">$128</span>
                <span className="inline-flex items-center gap-1 text-xs text-[color:var(--gold)]">
                  <Star className="h-3 w-3 fill-current" /> 4.9 (1,284)
                </span>
              </div>
            </div>
          </Link>

          <div className="relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-border/60 bg-secondary/40 p-8 md:p-10">
            <div>
              <div className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
                Bouncy Dresses Collection
              </div>
              <h3 className="mt-3 font-display text-3xl leading-[0.95] md:text-5xl">
                The tiered, twirl-ready silhouettes going viral.
              </h3>
              <p className="mt-5 max-w-md text-sm text-muted-foreground md:text-base">
                Champagne satin. Three-tier ruffle. Engineered to move — and to end up on everyone's FYP.
                The Main Event category is where the internet's biggest moments live.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/social-media-virals/$category/$sub"
                params={{ category: "main-event", sub: "bouncy-dresses" }}
                className="lux-press inline-flex items-center gap-2 rounded-sm border border-[color:var(--gold)] bg-[color:var(--gold)] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.28em] text-[color:var(--ink)] transition hover:bg-[color:var(--gold-soft)]"
              >
                Shop Bouncy Dresses <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                to="/social-media-virals/$category"
                params={{ category: "main-event" }}
                className="lux-press inline-flex items-center gap-2 rounded-sm border border-border/80 bg-background/40 px-6 py-3 text-[11px] uppercase tracking-[0.26em] text-foreground backdrop-blur transition hover:border-[color:var(--gold)] hover:text-[color:var(--gold)]"
              >
                Explore Main Event
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Fitting room */}
      <section className="mx-auto mt-20 max-w-[1600px] px-6 lg:px-12">
        <Link
          to="/try-on"
          className="lux-card group relative block overflow-hidden rounded-[2rem] border border-[color:var(--gold)]/40 bg-gradient-to-br from-[color:var(--ink,#0a0a0a)] via-background to-secondary/40 p-8 md:p-12"
        >
          <div
            className="absolute inset-0 opacity-60"
            style={{ background: "radial-gradient(70% 90% at 85% 20%, oklch(0.78 0.14 78 / 0.28), transparent 70%)" }}
          />
          <div className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-[color:var(--gold)]/10 blur-3xl" />
          <div className="relative grid items-center gap-8 md:grid-cols-[1.4fr_1fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--gold)]/50 bg-background/40 px-3 py-1 text-[10px] uppercase tracking-[0.35em] text-[color:var(--gold)] backdrop-blur">
                <Sparkles className="h-3 w-3" /> New · AI Fitting Room
              </div>
              <h2 className="mt-4 font-display text-4xl leading-[0.92] text-foreground md:text-6xl">
                Try it on before you check out.
              </h2>
              <p className="mt-4 max-w-xl text-sm text-muted-foreground md:text-base">
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
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-[color:var(--gold)]/30 bg-gradient-to-br from-[color:var(--ink,#0a0a0a)] via-background to-secondary/40">
                <div className="absolute inset-0 bg-[radial-gradient(70%_90%_at_50%_20%,oklch(0.78_0.14_78_/_0.25),transparent_70%)]" />
                <div className="absolute inset-x-4 bottom-4 rounded-xl border border-[color:var(--gold)]/40 bg-background/70 px-4 py-3 backdrop-blur">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]">Live preview</div>
                  <div className="font-display text-sm text-foreground">Your fit, rendered by AI</div>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </section>

      {/* Lookbook */}
      <section className="mx-auto mt-24 max-w-[1600px] px-6 lg:px-12">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <div className="mb-3 inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
              <span className="h-px w-8 bg-[color:var(--gold)]" />
              {lookbookEyebrow}
            </div>
            <h2 className="font-display text-5xl leading-[0.95] text-foreground md:text-7xl">
              {lookbookTitle}
            </h2>
          </div>
          <Link
            to="/lookbook"
            className="hidden items-center gap-2 text-xs uppercase tracking-[0.25em] transition hover:text-[color:var(--gold)] md:inline-flex"
          >
            {lookbookCta} <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
          {LOOKBOOK_STORIES.slice(0, 4).map((story) => (
            <Link
              key={story.slug}
              to="/lookbook/$story"
              params={{ story: story.slug }}
              className="lux-card group relative block aspect-[3/4] overflow-hidden rounded-2xl bg-card"
            >
              <img
                src={overrides?.get(`lookbook-cover-${story.slug}`)?.url ?? story.cover}
                alt={story.title}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,oklch(0.07_0.005_80_/_0.25)_0%,oklch(0.07_0.005_80_/_0.55)_55%,oklch(0.07_0.005_80_/_0.92)_100%)]" />
              <div className="pointer-events-none absolute inset-3 rounded-xl ring-1 ring-[color:var(--gold)]/25" />
              <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                <div className="mb-2 text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]/90">
                  {story.kicker}
                </div>
                <h3 className="title-glow font-display text-2xl uppercase leading-[0.95] tracking-[0.01em] text-[color:var(--gold-soft,#f0d78c)] md:text-3xl">
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

      {/* Must-have pieces */}
      <section className="mx-auto mt-28 max-w-[1600px] px-6 lg:px-12">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <div className="mb-3 inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
              <span className="h-px w-8 bg-[color:var(--gold)]" />
              {bestEyebrow}
            </div>
            <h2 className="font-display text-4xl leading-[0.95] text-foreground md:text-6xl">
              {bestTitle}
            </h2>
          </div>
          <Link
            to="/collection/$handle"
            params={{ handle: "frass-kicks" }}
            className="hidden items-center gap-2 text-xs uppercase tracking-[0.25em] transition hover:text-[color:var(--gold)] md:inline-flex"
          >
            View all <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
        <ProductGrid first={4} emptyHint={bestEmpty} />
      </section>

      {/* Music & journal */}
      <section className="mx-auto mt-28 max-w-[1600px] px-6 lg:px-12">
        <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:gap-8">
          <Link
            to="/music-media"
            className="group relative flex min-h-[420px] flex-col justify-between overflow-hidden rounded-[2rem] border border-border/60 bg-gradient-to-br from-secondary/60 via-background to-background p-10 md:p-14"
          >
            <div
              className="absolute inset-0 opacity-50"
              style={{ background: "radial-gradient(70% 80% at 80% 20%, oklch(0.78 0.14 78 / 0.22), transparent 70%)" }}
            />
            <div className="relative">
              <div className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--gold)]">{musicEyebrow}</div>
              <h2 className="mt-4 font-display text-4xl leading-[0.92] md:text-6xl">{musicTitle}</h2>
              <p className="mt-5 max-w-md text-sm text-muted-foreground md:text-base">{musicParagraph}</p>
            </div>
            <div className="relative inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-foreground transition group-hover:text-[color:var(--gold)]">
              {musicCta} <ArrowUpRight className="h-4 w-4" />
            </div>
          </Link>

          <div className="relative flex min-h-[420px] flex-col justify-between overflow-hidden rounded-[2rem] border border-border/60 bg-secondary/40 p-10 md:p-14">
            <div className="relative">
              <div className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--gold)]">{journalEyebrow}</div>
              <h2 className="mt-4 font-display text-4xl leading-[0.92] md:text-6xl">{journalTitle}</h2>
              <ul className="mt-8 divide-y divide-border/60">
                {[
                  { tag: "Style", title: "Block letters & chrome: building the Frass identity." },
                  { tag: "Studio", title: "Inside the late-night sessions of Frass Hill." },
                  { tag: "Drop", title: "Behind the lens of the FW lookbook." },
                ].map((post) => (
                  <li key={post.title} className="group flex cursor-pointer items-start gap-4 py-4">
                    <span className="mt-1 rounded border border-[color:var(--gold)]/40 px-2 py-1 text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
                      {post.tag}
                    </span>
                    <span className="flex-1 font-display text-lg leading-snug transition group-hover:text-[color:var(--gold)] md:text-xl">
                      {post.title}
                    </span>
                    <ArrowUpRight className="mt-1 h-4 w-4 text-muted-foreground transition group-hover:text-[color:var(--gold)]" />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FRASS-0421 — The Liquidation Room lives on the shop floor, not the menu bar. */}
      <section className="mx-auto mt-28 max-w-[1600px] px-6 lg:px-12">
        <Link
          to="/sales-clearance"
          className="chrome-glow group relative block overflow-hidden rounded-[2rem] border border-[color:var(--gold)]/35 bg-secondary/40 p-10 md:p-16"
        >
          <div
            aria-hidden
            className="absolute inset-0 opacity-70"
            style={{
              background:
                "radial-gradient(70% 90% at 20% 30%, oklch(0.78 0.14 78 / 0.2), transparent 70%)",
            }}
          />
          <div className="relative">
            <span className="text-[10px] uppercase tracking-[0.35em] text-[color:var(--gold)]">
              Behind the district · Members welcome
            </span>
            <h2 className="mt-3 font-display text-3xl uppercase leading-none md:text-6xl">
              The Liquidation Room
            </h2>
            <p className="mt-4 max-w-xl text-sm text-muted-foreground">
              Sale racks, the Vault, this week's Hidden Gem, the Flash Drop clock and Frassy's Lucky
              Spin — all in one back room.
            </p>
            <span className="mt-8 inline-flex rounded-full bg-[color:var(--gold)] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.28em] text-black transition group-hover:scale-[1.03]">
              Open the room
            </span>
          </div>
        </Link>
      </section>

      {/* Frass Vision Studios portal */}
      <section className="mx-auto mt-28 max-w-[1600px] px-6 lg:px-12">
        <StudioEntryCard />
      </section>

      {/* Service pledge */}
      <section className="mx-auto mb-28 mt-28 max-w-[1600px] px-6 lg:px-12">
        <div className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-secondary/45 p-10 backdrop-blur md:p-20">
          <div
            className="absolute inset-0 opacity-60"
            style={{ background: "radial-gradient(60% 80% at 50% 50%, oklch(0.78 0.14 78 / 0.18), transparent 70%)" }}
          />
          <div className="relative max-w-2xl">
            <div className="mb-4 text-[11px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
              {serviceEyebrow}
            </div>
            <h2 className="font-display text-4xl leading-[0.95] text-foreground md:text-6xl">
              {serviceTitle}
            </h2>
            <p className="mt-5 max-w-md text-sm text-muted-foreground md:text-base">{serviceParagraph}</p>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/60 bg-card/40">
        <div className="mx-auto grid max-w-[1600px] gap-4 px-6 py-8 text-[10px] uppercase tracking-[0.22em] text-muted-foreground sm:grid-cols-2 lg:grid-cols-4 lg:px-10">
          <span className="text-[color:var(--gold)]">★ FrassKicks Quality Guarantee</span>
          <span>Batch dispatch · Sunday &amp; Monday</span>
          <span>14-day return policy</span>
          <span>Landed-cost checkout — no surprise duties</span>
        </div>
      </footer>
    </div>
  );
}
