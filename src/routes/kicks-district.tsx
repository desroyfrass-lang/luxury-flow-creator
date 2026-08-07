import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { GatewayNav } from "@/components/gateway-nav";
import { DistrictDirectory, type DirectoryColumn } from "@/components/district-directory";
import cinematic from "@/assets/frasskicks-cinematic.mp4.asset.json";
import districtHero from "@/assets/kicks-district-hero.jpg.asset.json";
import storefrontsImg from "@/assets/kicks-storefronts.jpg";
import cardKicks from "@/assets/card-kicks.jpg";
import cardMen from "@/assets/card-men.jpg";
import cardWomen from "@/assets/card-women.jpg";
import cardDrip from "@/assets/card-drip.jpg";
import storeBareMen from "@/assets/store-bare-men.jpg";
import storeBareWomen from "@/assets/store-bare-women.jpg";

export const Route = createFileRoute("/kicks-district")({
  head: () => ({
    meta: [
      { title: "Frass Kicks District — The Store Directory" },
      {
        name: "description",
        content:
          "Cross the arch into the Frass Kicks District, then choose your store: Frass Kicks, Frass Drip and Bare Drip for men and women.",
      },
      { property: "og:title", content: "Frass Kicks District — The Store Directory" },
      {
        property: "og:description",
        content:
          "Walk Wid Power. Six stores in one open-air luxury fashion district — Kicks, Drip and Bare, for men and women.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: KicksDistrictPage,
});

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

const COLUMNS: [DirectoryColumn, DirectoryColumn] = [
  {
    heading: "Men's Stores",
    stores: [
      {
        title: "Frass Kicks for Men",
        description: "Premium sneakers and footwear.",
        image: cardKicks,
        to: "/frass-kicks/men",
      },
      {
        title: "Frass Drip for Men",
        description: "Streetwear, apparel, and complete looks.",
        image: cardMen,
        to: "/frass-drip/men",
      },
      {
        title: "Bare Drip for Men",
        description: "Swimwear, resort wear, and essentials.",
        image: cardBare,
        to: "/bare-drip/men",
      },
    ],
  },
  {
    heading: "Women's Stores",
    stores: [
      {
        title: "Frass Kicks for Women",
        description: "Luxury footwear and sneakers.",
        image: cardWomen,
        to: "/frass-kicks/women",
      },
      {
        title: "Frass Drip for Women",
        description: "Fashion, apparel, and complete looks.",
        image: cardDrip,
        to: "/frass-drip/women",
      },
      {
        title: "Bare Drip for Women",
        description: "Swimwear, lingerie, and resort collections.",
        image: viralDress,
        to: "/bare-drip/women",
      },
    ],
  },
];

function KicksDistrictPage() {
  const [entered, setEntered] = useState(false);
  const [opening, setOpening] = useState(false);
  const [hour, setHour] = useState(0);

  const mood = HOURS[hour];

  function enterDistrict() {
    if (opening) return;
    setOpening(true);
    window.setTimeout(() => {
      setEntered(true);
      document.getElementById("district-directory")?.scrollIntoView({ behavior: "smooth" });
    }, 1150);
  }

  return (
    <div className="min-h-screen bg-background">
      <GatewayNav mode="world" />

      {/* ── THE GATEWAY (unchanged visual identity) ─────────────── */}
      <section className="relative h-[86vh] min-h-[560px] w-full overflow-hidden">
        {!entered ? (
          <>
            <img
              src={districtHero.url}
              alt="Frass Kicks District promenade at golden hour — Frass Kicks, Frass Drip and Bare Drip storefronts under gold-lit arches"
              className="absolute inset-0 h-full w-full object-cover"
              style={{ filter: mood.tint }}
            />
            <div className="absolute inset-0" style={{ background: mood.overlay }} />
          </>
        ) : (
          <>
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
              You are inside the district · {mood.label}
            </span>
            <h1 className="mt-3 font-display text-4xl uppercase leading-[0.9] md:text-7xl">
              Welcome to the Promenade
            </h1>
          </div>
        )}
      </section>

      {/* ── LIGHT / MOOD BAR ────────────────────────────────────── */}
      <section className="border-b border-border/60 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-6 py-3 lg:px-10">
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
          </div>
          <Link
            to="/shop-frass"
            className="shrink-0 rounded-full bg-foreground px-5 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-background transition hover:opacity-90"
          >
            Shop directly
          </Link>
        </div>
      </section>

      {/* ── THE DIRECTORY ───────────────────────────────────────── */}
      <div id="district-directory">
        <DistrictDirectory
          headline="Walk Wid Power"
          lines={["Walk Wid Power", "Step Wid Purpose", "Move Wid Meaning"]}
          intro="You're standing in the Frass Kicks District. Six stores line the promenade — choose your door and begin."
          columns={COLUMNS}
        />
      </div>
    </div>
  );
}
