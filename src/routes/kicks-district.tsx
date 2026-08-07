import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { GatewayNav } from "@/components/gateway-nav";
import cinematic from "@/assets/frasskicks-cinematic.mp4.asset.json";
import districtHero from "@/assets/kicks-district-hero.jpg.asset.json";
import promenadeImg from "@/assets/kicks-promenade.jpg";
import storefrontsImg from "@/assets/kicks-storefronts.jpg";
import nightlifeImg from "@/assets/kicks-nightlife.jpg";
import districtImg from "@/assets/district-kicks.jpg";
import cardMen from "@/assets/card-men.jpg";

import cardKicks from "@/assets/card-kicks.jpg";
import storeKicksMen from "@/assets/store-kicks-men.jpg";
import storeKicksWomen from "@/assets/store-kicks-women.jpg";
import storeDripMen from "@/assets/store-drip-men.jpg";
import storeDripWomen from "@/assets/store-drip-women.jpg";
import storeBareMen from "@/assets/store-bare-men.jpg";
import storeBareWomen from "@/assets/store-bare-women.jpg";

export const Route = createFileRoute("/kicks-district")({
  head: () => ({
    meta: [
      { title: "Frass Kicks District — The Fashion Promenade" },
      {
        name: "description",
        content:
          "Walk the Frass Promenade: an open-air luxury fashion district of storefronts, street life and shoppable collections — Kicks, Drip, Bare, Party, Sports, Denim and more.",
      },
      { property: "og:title", content: "Frass Kicks District — The Fashion Promenade" },
      {
        property: "og:description",
        content:
          "Not a page — a living fashion neighborhood. Cross the arch, walk the promenade, enter any storefront.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: KicksDistrictPage,
});

type Storefront = {
  sign: string;
  label: string;
  blurb: string;
  featured: string[];
  image: string;
  to: string;
  accent: string;
  side: "Men's side" | "Women's side" | "Both sides";
};

const STOREFRONTS: Storefront[] = [
  {
    sign: "SOLE",
    label: "Frass Kicks — Women",
    blurb: "Statement steppers, refined icons and everyday essentials.",
    featured: ["Street", "Classic", "Casual"],
    image: storeKicksWomen,
    to: "/frass-kicks/women",
    accent: "var(--gold)",
    side: "Women's side",
  },
  {
    sign: "KICKZ",
    label: "Frass Kicks — Men",
    blurb: "The flagship. Street, classic and casual silhouettes, lit like jewellery.",
    featured: ["Street Kicks", "Classic Kicks", "Casual Kicks"],
    image: storeKicksMen,
    to: "/frass-kicks/men",
    accent: "var(--gold)",
    side: "Men's side",
  },
  {
    sign: "DRIP",
    label: "Frass Drip — Women",
    blurb: "Full looks under gold light — the house of silhouette and shine.",
    featured: ["Dresses", "Sets", "Night Looks"],
    image: storeDripWomen,
    to: "/frass-drip/women",
    accent: "var(--hill-gold)",
    side: "Women's side",
  },
  {
    sign: "DRIP",
    label: "Frass Drip — Men",
    blurb: "Tailoring, texture and attitude, cut for the men's side of the walk.",
    featured: ["Sets", "Outerwear", "Capsules"],
    image: storeDripMen,
    to: "/frass-drip/men",
    accent: "var(--hill-gold)",
    side: "Men's side",
  },
  {
    sign: "BARE",
    label: "Bare Drip — Women",
    blurb: "Swim, resort and lingerie — sun, salt and confidence.",
    featured: ["Swim", "Resort", "Lingerie"],
    image: storeBareWomen,
    to: "/bare-drip/women",
    accent: "var(--kids-coral)",
    side: "Women's side",
  },
  {
    sign: "BARE",
    label: "Bare Drip — Men",
    blurb: "Resort, swim and sun-ready essentials built for the men's side.",
    featured: ["Swim", "Resort", "Shorts"],
    image: storeBareMen,
    to: "/bare-drip/men",
    accent: "var(--kids-coral)",
    side: "Men's side",
  },
  {
    sign: "SPORTS",
    label: "Sports Drip",
    blurb: "Performance pieces carrying district attitude off the court.",
    featured: ["Trainers", "Tracksuits", "Layers"],
    image: cardMen,
    to: "/shop-frass",
    accent: "var(--hill-green)",
    side: "Both sides",
  },
  {
    sign: "PARTY",
    label: "Party Drip",
    blurb: "Night-out fits built to be photographed under lanterns.",
    featured: ["Night Looks", "Sequins", "Heels"],
    image: nightlifeImg,
    to: "/frass-drip/women",
    accent: "var(--kids-turquoise)",
    side: "Both sides",
  },
  {
    sign: "DENIM",
    label: "Denim Drip",
    blurb: "Raw, washed, cropped, oversized — denim in every dialect.",
    featured: ["Jeans", "Jackets", "Sets"],
    image: districtImg,
    to: "/shop-frass",
    accent: "var(--luxe-linen)",
    side: "Both sides",
  },
  {
    sign: "ACCESS",
    label: "Accessories",
    blurb: "The finishing details — the part people remember.",
    featured: ["Bags", "Chains", "Eyewear"],
    image: cardKicks,
    to: "/shop-frass",
    accent: "var(--gold)",
    side: "Both sides",
  },
  {
    sign: "NEW",
    label: "New Looks",
    blurb: "What the district is wearing right now. Restocked constantly.",
    featured: ["Virals", "Drops", "Trending"],
    image: promenadeImg,
    to: "/social-media-virals",
    accent: "var(--kids-sun)",
    side: "Both sides",
  },
];


const HOURS = [
  {
    id: "golden",
    label: "Golden Hour",
    overlay:
      "linear-gradient(to top, rgba(20,8,0,0.88), rgba(255,166,64,0.18) 45%, rgba(255,204,128,0.12))",
    tint: "saturate(1.08) contrast(1.03)",
  },
  {
    id: "sunset",
    label: "Sunset Energy",
    overlay:
      "linear-gradient(to top, rgba(24,6,0,0.9), rgba(255,94,58,0.24) 40%, rgba(255,163,102,0.1))",
    tint: "saturate(1.18) contrast(1.05)",
  },
  {
    id: "night",
    label: "Night Life",
    overlay:
      "linear-gradient(to top, rgba(2,4,16,0.94), rgba(12,18,60,0.5) 45%, rgba(80,40,140,0.22))",
    tint: "saturate(1.05) brightness(0.72) contrast(1.12)",
  },
] as const;

const SEASONS = [
  { id: "spring", label: "Spring", note: "Fresh flowers, colour returning to the displays." },
  { id: "summer", label: "Summer", note: "Outdoor fashion shows and music down the promenade." },
  { id: "autumn", label: "Autumn", note: "Warmer light, new seasonal collections in the windows." },
  { id: "winter", label: "Winter", note: "Holiday installations and the luxury night market." },
] as const;

function KicksDistrictPage() {
  const [entered, setEntered] = useState(false);
  const [opening, setOpening] = useState(false);
  const [hour, setHour] = useState(0);
  const [season, setSeason] = useState(0);
  const [active, setActive] = useState<number | null>(null);
  const [zoomedIndex, setZoomedIndex] = useState<number | null>(null);
  const promenadeRef = useRef<HTMLDivElement>(null);
  const walkRef = useRef<HTMLDivElement>(null);

  const mood = HOURS[hour];
  const zoomed = zoomedIndex !== null ? STOREFRONTS[zoomedIndex] : null;

  useEffect(() => {
    if (!entered) return;
    promenadeRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [entered]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (zoomedIndex === null) return;
      if (e.key === "Escape") setZoomedIndex(null);
      if (e.key === "ArrowRight") setZoomedIndex((i) => (i === null ? null : (i + 1) % STOREFRONTS.length));
      if (e.key === "ArrowLeft") setZoomedIndex((i) => (i === null ? null : (i - 1 + STOREFRONTS.length) % STOREFRONTS.length));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomedIndex]);

  function enterDistrict() {
    if (opening) return;
    setOpening(true);
    window.setTimeout(() => setEntered(true), 1150);
  }

  function scrollToDoor(index: number) {
    const walk = walkRef.current;
    if (!walk) return;
    const child = walk.children[index] as HTMLElement | undefined;
    if (!child) return;
    child.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }

  return (
    <div className="min-h-screen bg-background">
      <GatewayNav mode="world" />

      {/* ── THE GATEWAY ─────────────────────────────────────────── */}
      <section className="relative h-[86vh] min-h-[560px] w-full overflow-hidden">
        {!entered ? (
          <>
            {/* first entry: the Jamaica gateway infographic */}
            <img
              src={districtHero.url}
              alt="Frass Kicks District promenade at golden hour — KICKZ Men, SOLE Women and BARE storefronts under gold-lit arches"
              className="absolute inset-0 h-full w-full object-cover"
              style={{ filter: mood.tint }}
            />
            <div className="absolute inset-0" style={{ background: mood.overlay }} />
          </>
        ) : (
          <>
            {/* inside the district: the original labeled storefront cinematic */}
            <video
              src={cinematic.url}
              poster={storefrontsImg}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              aria-label="Cinematic walk beneath the stone arch into the Frass Kicks District"
              className="absolute inset-0 h-full w-full object-cover"
              style={{ filter: mood.tint }}
            />
            <div className="absolute inset-0" style={{ background: mood.overlay }} />
          </>
        )}

        {/* ambient life */}
        <span
          aria-hidden
          className="district-bird pointer-events-none absolute left-0 top-[18%] text-lg opacity-40"
        >
          𓅯
        </span>
        <span
          aria-hidden
          className="district-shimmer pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[color:var(--gold)]/20 to-transparent"
        />

        {/* the arch itself — crossing it opens the district */}
        {!entered && (
          <div
            className={`absolute inset-0 grid place-items-center px-6 text-center ${
              opening ? "district-arch-open" : ""
            }`}
          >
            <div className="max-w-2xl">
              <span className="text-[10px] uppercase tracking-[0.4em] text-[color:var(--gold)]">
                The Gateway
              </span>
              <h1 className="mt-4 font-display text-5xl uppercase leading-[0.88] md:text-8xl">
                Frass Kicks District
              </h1>
              <p className="mx-auto mt-5 max-w-lg text-sm text-white/75 md:text-base">
                Not a storefront. An outdoor luxury fashion district. Cross beneath the arch and
                you are somewhere else.
              </p>
              <button
                type="button"
                onClick={enterDistrict}
                className="district-glow mt-8 rounded-full border border-[color:var(--gold)] bg-black/40 px-9 py-4 text-[10px] font-bold uppercase tracking-[0.3em] text-[color:var(--gold)] backdrop-blur transition hover:bg-[color:var(--gold)] hover:text-black"
              >
                Cross the arch
              </button>
              <p className="mt-5 text-[10px] uppercase tracking-[0.28em] text-white/45">
                Or{" "}
                <Link to="/shop-frass" className="underline underline-offset-4 hover:text-white">
                  skip straight to shopping
                </Link>
              </p>
            </div>
          </div>
        )}

        {entered && (
          <div className="gateway-rise absolute inset-x-0 bottom-0 mx-auto max-w-[1600px] px-6 pb-12 lg:px-10">
            <span className="text-[10px] uppercase tracking-[0.4em] text-[color:var(--gold)]">
              You are inside the district · {mood.label} · {SEASONS[season].label}
            </span>
            <h1 className="mt-3 font-display text-4xl uppercase leading-[0.9] md:text-7xl">
              Welcome to the Promenade
            </h1>
            <p className="mt-3 max-w-xl text-sm text-white/75">{SEASONS[season].note}</p>
          </div>
        )}
      </section>

      {/* ── ATMOSPHERE CONTROLS ─────────────────────────────────── */}
      <section className="sticky top-[68px] z-40 border-b border-border/60 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto grid max-w-[1600px] grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-6 py-3 lg:px-10">
          <div className="flex min-w-0 items-center gap-2 overflow-x-auto">
            {HOURS.map((h, i) => (
              <button
                key={h.id}
                type="button"
                onClick={() => setHour(i)}
                aria-pressed={i === hour}
                className={`shrink-0 rounded-full border px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] transition ${
                  i === hour
                    ? "border-[color:var(--gold)] bg-foreground text-background"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {h.label}
              </button>
            ))}
            <span aria-hidden className="mx-2 h-4 w-px shrink-0 bg-border" />
            {SEASONS.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSeason(i)}
                aria-pressed={i === season}
                className={`shrink-0 rounded-full border px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] transition ${
                  i === season
                    ? "border-[color:var(--hill-gold)] text-[color:var(--hill-gold)]"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <Link
            to="/shop-frass"
            className="shrink-0 rounded-full bg-foreground px-5 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-background transition hover:opacity-90"
          >
            Shop directly
          </Link>
        </div>
      </section>

      {/* ── THE PROMENADE ───────────────────────────────────────── */}
      <section ref={promenadeRef} className="mx-auto max-w-[1600px] px-6 py-14 lg:px-10">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-6 sm:flex sm:justify-between">
          <div className="min-w-0">
            <span className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
              The heart of the district
            </span>
            <h2 className="mt-3 font-display text-4xl uppercase leading-none md:text-6xl">
              The Frass Promenade
            </h2>
            <p className="mt-4 max-w-xl text-sm text-muted-foreground">
              Trees, cafés, fountains, flowers, music and public art. Every collection keeps a
              storefront along this walk. Wander it — or step straight through any door.
            </p>
          </div>
          <span className="hidden shrink-0 text-[10px] uppercase tracking-[0.24em] text-muted-foreground sm:block">
            Scroll the walk →
          </span>
        </div>

        {/* the walk: horizontal street of storefronts */}
        <div
          ref={walkRef}
          className="mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-6"
          role="list"
          aria-label="Storefronts along the Frass Promenade"
        >
          {STOREFRONTS.map((s, i) => (
            <button
              key={s.sign}
              type="button"
              role="listitem"
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              onClick={() => {
                setZoomedIndex(i);
                scrollToDoor(i);
              }}
              className="group relative w-[76vw] shrink-0 cursor-zoom-in snap-start overflow-hidden rounded-t-[7rem] rounded-b-3xl border border-border bg-card text-left transition duration-500 hover:-translate-y-2 sm:w-[46vw] lg:w-[27vw]"
              style={{ boxShadow: `0 40px 90px -60px ${s.accent}` }}
            >
              <div className="relative h-[440px] overflow-hidden">
                <img
                  src={s.image}
                  alt={`${s.sign} storefront on the Frass Promenade — ${s.label}`}
                  loading="lazy"
                  width={1280}
                  height={864}
                  className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-110"
                  style={{ filter: mood.tint }}
                />
                <div className="absolute inset-0" style={{ background: mood.overlay }} />

                {/* the sign above the door */}
                <span
                  className="district-sway absolute left-1/2 top-6 -translate-x-1/2 rounded-full border px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.28em] backdrop-blur"
                  style={{ borderColor: s.accent, color: s.accent, background: "rgba(0,0,0,0.35)" }}
                >
                  {s.sign}
                </span>

                <span className="absolute left-4 top-6 rounded-full border border-white/25 bg-black/40 px-3 py-1 text-[9px] uppercase tracking-[0.2em] text-white/75 backdrop-blur">
                  {s.side}
                </span>

                {/* window display reveal */}
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <h3 className="font-display text-2xl uppercase leading-none text-white">
                    {s.label}
                  </h3>
                  <div
                    className={`overflow-hidden transition-all duration-500 ${
                      active === i ? "mt-3 max-h-40 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <p className="text-sm text-white/75">{s.blurb}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {s.featured.map((f) => (
                        <span
                          key={f}
                          className="rounded-full border border-white/25 px-3 py-1 text-[9px] uppercase tracking-[0.2em] text-white/80"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                    <span className="mt-4 inline-block text-[10px] font-bold uppercase tracking-[0.26em] text-white">
                      Zoom in →
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* door progress / mini-map */}
        <div className="mt-6 flex items-center gap-3 overflow-x-auto pb-2">
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Doors
          </span>
          {STOREFRONTS.map((s, i) => (
            <button
              key={`dot-${s.sign}`}
              type="button"
              onClick={() => {
                setZoomedIndex(i);
                scrollToDoor(i);
              }}
              aria-label={`Open ${s.label}`}
              className={`relative h-10 w-10 shrink-0 overflow-hidden rounded-full border transition hover:scale-110 ${
                active === i ? "border-[color:var(--gold)]" : "border-border"
              }`}
            >
              <img
                src={s.image}
                alt=""
                className="h-full w-full object-cover opacity-70"
                style={{ filter: mood.tint }}
              />
              <span
                className="absolute inset-0 flex items-center justify-center text-[9px] font-bold uppercase tracking-[0.1em] text-white"
                style={{ textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}
              >
                {i + 1}
              </span>
            </button>
          ))}
        </div>

        {/* quick doors for people who know what they want */}
        <div className="mt-4 flex flex-wrap gap-2">
          {STOREFRONTS.map((s) => (
            <Link
              key={`quick-${s.sign}`}
              to={s.to}
              className="rounded-full border border-border px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground transition hover:border-foreground hover:text-foreground"
            >
              {s.label}
            </Link>
          ))}
        </div>
      </section>

      {/* ── ZOOMED DOOR OVERLAY ───────────────────────────────────── */}
      {zoomed && zoomedIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-xl animate-fade-in"
          onClick={() => setZoomedIndex(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`${zoomed.label} storefront`}
        >
          <button
            type="button"
            onClick={() => setZoomedIndex(null)}
            className="absolute right-5 top-5 z-10 rounded-full border border-white/20 bg-black/40 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white backdrop-blur transition hover:bg-white/10"
          >
            Close
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setZoomedIndex((i) => (i === null ? null : (i - 1 + STOREFRONTS.length) % STOREFRONTS.length));
            }}
            className="absolute left-4 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-white/20 bg-black/40 p-4 text-white backdrop-blur transition hover:bg-white/10 md:block"
            aria-label="Previous door"
          >
            ←
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setZoomedIndex((i) => (i === null ? null : (i + 1) % STOREFRONTS.length));
            }}
            className="absolute right-4 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-white/20 bg-black/40 p-4 text-white backdrop-blur transition hover:bg-white/10 md:block"
            aria-label="Next door"
          >
            →
          </button>

          <div
            className="relative w-full max-w-5xl overflow-hidden rounded-t-[7rem] rounded-b-3xl border border-white/10 bg-card shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-[60vh] min-h-[420px] overflow-hidden">
              <img
                src={zoomed.image}
                alt={`${zoomed.sign} storefront — ${zoomed.label}`}
                className="h-full w-full object-cover transition-transform duration-[2000ms] ease-out scale-110"
                style={{ filter: mood.tint }}
              />
              <div className="absolute inset-0" style={{ background: mood.overlay }} />

              <span
                className="district-sway absolute left-1/2 top-8 -translate-x-1/2 rounded-full border px-6 py-2 text-xs font-bold uppercase tracking-[0.3em] backdrop-blur"
                style={{ borderColor: zoomed.accent, color: zoomed.accent, background: "rgba(0,0,0,0.4)" }}
              >
                {zoomed.sign}
              </span>

              <span className="absolute left-6 top-8 rounded-full border border-white/25 bg-black/40 px-4 py-1.5 text-[10px] uppercase tracking-[0.2em] text-white/75 backdrop-blur">
                {zoomed.side}
              </span>
            </div>

            <div className="border-t border-white/10 bg-black/60 p-8 backdrop-blur-xl md:p-12">
              <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div>
                  <h3 className="font-display text-3xl uppercase leading-none text-white md:text-5xl">
                    {zoomed.label}
                  </h3>
                  <p className="mt-3 max-w-xl text-sm text-white/75 md:text-base">{zoomed.blurb}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {zoomed.featured.map((f) => (
                      <span
                        key={f}
                        className="rounded-full border border-white/25 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white/80"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
                <Link
                  to={zoomed.to}
                  onClick={() => setZoomedIndex(null)}
                  className="shrink-0 rounded-full bg-[color:var(--gold)] px-8 py-4 text-center text-[10px] font-bold uppercase tracking-[0.25em] text-black transition hover:opacity-90"
                >
                  Step inside →
                </Link>
              </div>

              {/* door counter */}
              <div className="mt-8 flex items-center justify-center gap-2">
                {STOREFRONTS.map((_, i) => (
                  <button
                    key={`zoom-dot-${i}`}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setZoomedIndex(i);
                    }}
                    aria-label={`Go to door ${i + 1}`}
                    className={`h-2 rounded-full transition-all ${
                      i === zoomedIndex ? "w-8 bg-[color:var(--gold)]" : "w-2 bg-white/30 hover:bg-white/50"
                    }`}
                  />
                ))}
              </div>
              <p className="mt-3 text-center text-[10px] uppercase tracking-[0.2em] text-white/40">
                Door {zoomedIndex + 1} of {STOREFRONTS.length} · Use ← → keys
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── PEOPLE MAKE THE ATMOSPHERE ──────────────────────────── */}
      <section className="mx-auto max-w-[1600px] px-6 pb-16 lg:px-10">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="relative overflow-hidden rounded-[2rem] border border-border">
            <img
              src={promenadeImg}
              alt="Friends walking the golden-hour promenade with shopping bags while a guitarist plays outside a boutique"
              loading="lazy"
              width={1280}
              height={864}
              className="h-full w-full object-cover"
              style={{ filter: mood.tint }}
            />
            <div className="absolute inset-0" style={{ background: mood.overlay, opacity: 0.55 }} />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
              People first
            </span>
            <h2 className="mt-3 font-display text-4xl uppercase leading-none md:text-6xl">
              The people make the district
            </h2>
            <p className="mt-4 max-w-lg text-sm text-muted-foreground">
              Friends shopping together. Families. Couples. Someone carrying bags, someone with a
              coffee, someone taking photos. Fashion here is lived, not posed.
            </p>
            <ul className="mt-6 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
              {[
                "Palm trees in the breeze",
                "Flowing banners",
                "Water fountains",
                "Tropical flowers",
                "Café seating",
                "Street musicians",
                "Public art",
                "Birds, reflections, movement",
              ].map((l) => (
                <li key={l} className="flex gap-3">
                  <span className="text-[color:var(--gold)]">—</span>
                  {l}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── LONG-TERM VISION ────────────────────────────────────── */}
      <section className="mx-auto max-w-[1600px] px-6 pb-24 lg:px-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { t: "Fashion pop-ups", c: "Temporary storefronts appear along the walk." },
            { t: "Designer launches", c: "A whole evening built around one release." },
            { t: "Live music & culture", c: "The promenade becomes a stage." },
            { t: "Seasonal festivals", c: "Winter markets, summer shows, spring blooms." },
          ].map((x) => (
            <div key={x.t} className="rounded-3xl border border-border bg-card p-6">
              <h3 className="font-display text-xl uppercase leading-none">{x.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{x.c}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-[2rem] border border-border bg-card p-8 md:p-12">
          <span className="text-[10px] uppercase tracking-[0.35em] text-[color:var(--gold)]">
            The emotional goal
          </span>
          <p className="mt-4 max-w-3xl font-display text-2xl uppercase leading-tight md:text-4xl">
            “I wish this place existed in real life.”
          </p>
          <p className="mt-5 max-w-2xl text-sm text-muted-foreground">
            The visitor is not navigating a website. They are walking through the Frass Kicks
            District.
          </p>
        </div>
      </section>
    </div>
  );
}
