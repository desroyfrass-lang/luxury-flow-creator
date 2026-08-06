import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { GatewayNav } from "@/components/gateway-nav";
import cinematic from "@/assets/frasskicks-cinematic.mp4.asset.json";
import gatewayImg from "@/assets/kicks-gateway.jpg";
import promenadeImg from "@/assets/kicks-promenade.jpg";
import storefrontsImg from "@/assets/kicks-storefronts.jpg";
import nightlifeImg from "@/assets/kicks-nightlife.jpg";
import districtImg from "@/assets/district-kicks.jpg";

export const Route = createFileRoute("/kicks-district")({
  head: () => ({
    meta: [
      { title: "Frass Kicks District — The Fashion Promenade" },
      {
        name: "description",
        content:
          "Walk the Frass Kicks Promenade: an open-air fashion district of storefronts, street life and shoppable collections — Kickz, Sole, Bare, Drip and more.",
      },
      { property: "og:title", content: "Frass Kicks District — The Fashion Promenade" },
      {
        property: "og:description",
        content: "A living, open-air fashion district. Explore by walking, enter any storefront.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: KicksDistrictPage,
});

const STOREFRONTS = [
  { code: "KICKZ", label: "Men", blurb: "Street, classic and casual kicks for men.", to: "/frass-kicks/men" },
  { code: "SOLE", label: "Women", blurb: "Statement steppers and refined daily icons.", to: "/frass-kicks/women" },
  { code: "BARE", label: "Swim & Lingerie", blurb: "Bare Drip — skin, sun and confidence.", to: "/bare-drip" },
  { code: "DRIP", label: "Party", blurb: "Night-out fits built to be photographed.", to: "/frass-drip" },
  { code: "SPORTS", label: "Sports Drip", blurb: "Performance pieces with district attitude.", to: "/shop-frass" },
  { code: "DENIM", label: "Denim Drip", blurb: "Raw, washed, cropped, oversized.", to: "/shop-frass" },
  { code: "ACCESS", label: "Accessories", blurb: "The finishing details of a look.", to: "/shop-frass" },
  { code: "NEW", label: "New Looks", blurb: "What the district is wearing right now.", to: "/social-media-virals" },
];

const MOMENTS = [
  { label: "Sunset Energy", image: promenadeImg },
  { label: "Golden Hour Glow", image: gatewayImg },
  { label: "Night Life", image: nightlifeImg },
  { label: "Weekend Vibes", image: districtImg },
  { label: "Festival Nights", image: storefrontsImg },
];

const PRINCIPLES = [
  { icon: "👥", title: "People First", copy: "The people create the atmosphere." },
  { icon: "🏙️", title: "District, Not Store", copy: "An entire fashion neighbourhood." },
  { icon: "🧭", title: "Discovery", copy: "Walk, explore, experience." },
  { icon: "✨", title: "Always Alive", copy: "The district changes, the vibe evolves." },
];

function KicksDistrictPage() {
  const [moment, setMoment] = useState(0);

  return (
    <div className="min-h-screen bg-background">
      <GatewayNav mode="world" />

      {/* THE GATEWAY */}
      <section className="relative h-[78vh] min-h-[520px] w-full overflow-hidden">
        <video
          src={cinematic.url}
          poster={gatewayImg}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-label="Cinematic walk through the Frass Kicks district at golden hour"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/45 to-background/20" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1600px] px-6 pb-14 lg:px-10">
          <span className="text-[10px] uppercase tracking-[0.35em] text-[color:var(--gold)]">
            The Fashion Promenade
          </span>
          <h1 className="mt-3 font-display text-5xl uppercase leading-[0.9] md:text-8xl">
            Frass Kicks District
          </h1>
          <p className="mt-4 max-w-xl text-sm text-muted-foreground md:text-base">
            Not a page. A living, open-air fashion district filled with people, culture, energy,
            style and story. Everything on FrassKicks.com exists here in the promenade.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="#promenade"
              className="rounded-full bg-foreground px-6 py-3 text-[10px] font-bold uppercase tracking-[0.24em] text-background transition hover:opacity-90"
            >
              Enter the promenade
            </a>
            <Link
              to="/shop-frass"
              className="rounded-full border border-[color:var(--gold)] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.24em] text-[color:var(--gold)] transition hover:bg-foreground/5"
            >
              Shop the district
            </Link>
          </div>
        </div>
      </section>

      {/* PRINCIPLES */}
      <section className="mx-auto max-w-[1600px] px-6 py-14 lg:px-10">
        <div className="grid gap-6 border-y border-border py-10 sm:grid-cols-2 lg:grid-cols-4">
          {PRINCIPLES.map((p) => (
            <div key={p.title}>
              <span className="text-xl">{p.icon}</span>
              <h2 className="mt-3 text-[11px] font-bold uppercase tracking-[0.24em] text-[color:var(--gold)]">
                {p.title}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">{p.copy}</p>
            </div>
          ))}
        </div>
      </section>

      {/* THE PROMENADE */}
      <section id="promenade" className="mx-auto max-w-[1600px] px-6 pb-16 lg:px-10">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="overflow-hidden rounded-[2rem] border border-border">
            <img
              src={promenadeImg}
              alt="Crowded golden-hour promenade lined with glowing boutiques, cafés and a street guitarist"
              loading="lazy"
              width={1280}
              height={864}
              className="h-full w-full object-cover transition-transform duration-[1200ms] hover:scale-105"
            />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
              02 · The heart
            </span>
            <h2 className="mt-3 font-display text-4xl uppercase leading-none md:text-6xl">
              The Promenade
            </h2>
            <p className="mt-4 max-w-lg text-sm text-muted-foreground">
              The central walkway is where the world comes alive — people walking, shopping and
              talking, cafés, performers, art, flowers and fountains. There is always something
              happening.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
              {[
                "Palm trees, flowers and natural greenery",
                "Fountains, seating and cafés",
                "Music, performers and street life",
                "Banners, lanterns and art installations",
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

      {/* STOREFRONTS */}
      <section className="mx-auto max-w-[1600px] px-6 pb-16 lg:px-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
              03 · Destinations
            </span>
            <h2 className="mt-3 font-display text-4xl uppercase leading-none md:text-6xl">
              The Storefronts
            </h2>
          </div>
          <p className="max-w-sm text-sm text-muted-foreground">
            Each collection has its own storefront, its own personality, its own atmosphere. Click
            any door to walk inside.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STOREFRONTS.map((s, i) => (
            <Link
              key={s.code}
              to={s.to}
              className="group relative overflow-hidden rounded-[1.75rem] border border-border bg-card transition duration-500 hover:-translate-y-1.5"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={[storefrontsImg, promenadeImg, nightlifeImg, districtImg][i % 4]}
                  alt={`${s.code} storefront — ${s.label}`}
                  loading="lazy"
                  width={1280}
                  height={864}
                  className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <span className="inline-block rounded-full border border-[color:var(--gold)] px-3 py-1 text-[9px] font-bold uppercase tracking-[0.22em] text-[color:var(--gold)]">
                    {s.code}
                  </span>
                  <h3 className="mt-2 font-display text-2xl uppercase leading-none text-white">
                    {s.label}
                  </h3>
                </div>
              </div>
              <p className="px-5 py-4 text-sm text-muted-foreground">{s.blurb}</p>
              <span className="absolute right-4 top-4 rounded-full bg-background/80 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] opacity-0 transition group-hover:opacity-100">
                Enter →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* LIVING ENVIRONMENT / MOMENTS */}
      <section className="mx-auto max-w-[1600px] px-6 pb-24 lg:px-10">
        <span className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
          05 · Living environment
        </span>
        <h2 className="mt-3 font-display text-4xl uppercase leading-none md:text-6xl">
          Different moments in the district
        </h2>
        <div className="mt-8 overflow-hidden rounded-[2rem] border border-border">
          <img
            src={MOMENTS[moment].image}
            alt={`${MOMENTS[moment].label} in the Frass Kicks district`}
            loading="lazy"
            width={1280}
            height={864}
            className="h-[420px] w-full object-cover md:h-[560px]"
          />
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {MOMENTS.map((m, i) => (
            <button
              key={m.label}
              type="button"
              onClick={() => setMoment(i)}
              aria-pressed={i === moment}
              className={`rounded-full border px-4 py-2 text-[10px] font-bold uppercase tracking-[0.22em] transition ${
                i === moment
                  ? "border-[color:var(--gold)] bg-foreground text-background"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="mt-16 rounded-[2rem] border border-border bg-card p-8 md:p-12">
          <span className="text-[10px] uppercase tracking-[0.35em] text-[color:var(--gold)]">
            The goal
          </span>
          <p className="mt-4 max-w-2xl font-display text-2xl uppercase leading-tight md:text-4xl">
            Build a district people fall in love with. A place they remember. A place they return
            to. A place they want to be part of.
          </p>
          <p className="mt-4 text-sm font-bold uppercase tracking-[0.24em] text-[color:var(--gold)]">
            This is Frass Kicks.
          </p>
        </div>
      </section>
    </div>
  );
}
