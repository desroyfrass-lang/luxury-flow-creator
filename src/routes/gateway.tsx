import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import archHero from "@/assets/frass-gateway-arch.jpg.asset.json";
import frassyGold from "@/assets/frassy-gold.png.asset.json";

export const Route = createFileRoute("/gateway")({
  head: () => ({
    meta: [
      { title: "Welcome to the World of Frass — Frass OS Gateway" },
      {
        name: "description",
        content:
          "Built by people. Powered by community. Driven by execution. Shop Frass or explore the living Frass World ecosystem.",
      },
      { property: "og:title", content: "Welcome to the World of Frass" },
      {
        property: "og:description",
        content: "Choose your way in: fast commercial shopping, or the immersive Frass World ecosystem.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GatewayPage,
});

function GatewayFrassy() {
  const [seated, setSeated] = useState(false);
  useEffect(() => {
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const t = setTimeout(() => setSeated(true), reduced ? 200 : 3200);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="pointer-events-none fixed inset-0 z-30">
      <img
        src={frassyGold.url}
        alt="Frassy, the host of the World of Frass"
        className={`absolute drop-shadow-[0_20px_80px_rgba(0,0,0,0.6)] transition-all duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          seated
            ? "bottom-24 right-5 h-16 w-16 rounded-full object-cover opacity-95"
            : "bottom-[12vh] right-1/2 h-[72vh] w-[72vh] translate-x-1/2 object-contain opacity-100"
        }`}
      />
    </div>
  );
}

function GatewayPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[color:var(--retail-ink)]">
      <div className="absolute inset-0 bg-black">
        <img
          src={archHero.url}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl brightness-50"
        />
        <img
          src={archHero.url}
          alt="The carved JAMAICA Luxury Fashion District archway opening onto the palm-lined Frass Kicks promenade"
          width={1920}
          height={1080}
          className="gateway-drift absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/70" />

        {/* The Frass Kicks mark, mounted on the arch as a gold fixture above JAMAICA */}
        <img
          src={fullLogo.url}
          alt="Frass Kicks"
          className="pointer-events-none absolute left-1/2 top-[1.5%] z-[1] h-[13%] w-auto -translate-x-1/2 object-contain mix-blend-screen"
          style={{
            filter:
              "grayscale(1) brightness(1.2) sepia(1) saturate(4.2) hue-rotate(-12deg) drop-shadow(0 3px 10px rgba(0,0,0,0.75))",
          }}
        />

      </div>


      <GatewayFrassy />

      <section className="gateway-swell relative mx-auto flex min-h-screen max-w-[1400px] flex-col items-center justify-end px-6 pb-14 pt-[62vh] text-center">
        <h1
          className="gateway-rise font-display text-4xl leading-[0.95] text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.55)] sm:text-6xl lg:text-8xl"
          style={{ animationDelay: "80ms" }}
        >
          Welcome to the World of Frass.
        </h1>

        <p
          className="gateway-rise mt-5 max-w-2xl text-sm uppercase tracking-[0.3em] text-white/75 sm:text-base"
          style={{ animationDelay: "160ms" }}
        >
          Built by people. Powered by community. Driven by execution.
        </p>


        <div className="mt-10 grid w-full max-w-3xl gap-4 sm:grid-cols-2">
          <GatewayCard
            to="/shop-frass"
            delay="240ms"
            emoji="🛍️"
            title="Shop Frass"
            copy="Fast, direct access to FrassKicks marketplace drops, luxury releases, and collections."
            cta="Enter the store"
            tone="light"
          />
          <GatewayCard
            to="/frass-world"
            delay="320ms"
            emoji="🌍"
            title="Explore Frass World"
            copy="Enter the living ecosystem map — Frass Hill, Luxury House, Kids Valley, and Builder HQ."
            cta="Enter the world"
            tone="dark"
          />
        </div>
      </section>
    </main>
  );
}

function GatewayCard({
  to,
  emoji,
  title,
  copy,
  cta,
  tone,
  delay,
}: {
  to: string;
  emoji: string;
  title: string;
  copy: string;
  cta: string;
  tone: "light" | "dark";
  delay: string;
}) {
  const light = tone === "light";
  return (
    <Link
      to={to}
      aria-label={`${title} — ${copy}`}
      style={{ animationDelay: delay }}
      className={`gateway-rise group relative overflow-hidden rounded-2xl border p-5 text-left backdrop-blur-xl transition duration-300 will-change-transform hover:-translate-y-1.5 ${
        light
          ? "border-white/70 bg-white/92 text-[color:var(--retail-ink)] hover:shadow-[0_20px_60px_-20px_rgba(255,255,255,0.5)]"
          : "border-[color:var(--hill-gold)]/50 bg-[color:var(--hill-green)]/85 text-[color:var(--luxe-linen)] hover:shadow-[0_20px_60px_-20px_rgba(212,175,55,0.6)]"
      }`}
    >
      <span className="text-2xl">{emoji}</span>
      <h2 className="mt-3 font-display text-2xl uppercase leading-none md:text-3xl">{title}</h2>
      <p className={`mt-2 text-xs ${light ? "text-black/65" : "text-[color:var(--luxe-linen)]/75"}`}>{copy}</p>
      <span
        className={`mt-4 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] ${
          light ? "text-black/70" : "text-[color:var(--hill-gold)]"
        }`}
      >
        {cta}
        <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
      </span>
    </Link>
  );
}
