import { createFileRoute, Link } from "@tanstack/react-router";
import heroPeople from "@/assets/gateway-hero-people.jpg";
import fullLogo from "@/assets/frass-logo-full.asset.json";

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

function GatewayPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[color:var(--retail-ink)]">
      <div className="absolute inset-0">
        <img
          src={heroPeople}
          alt="A diverse group of people talking, walking and shopping on a warm Caribbean street"
          width={1920}
          height={1088}
          className="gateway-drift h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/45 to-black/85" />
      </div>

      <section className="relative mx-auto flex min-h-screen max-w-[1400px] flex-col items-center justify-center px-6 py-20 text-center">
        <img
          src={fullLogo.url}
          alt="Frass"
          className="gateway-rise h-10 w-auto object-contain md:h-14"
        />
        <h1
          className="gateway-rise mt-8 font-display text-4xl leading-[0.95] text-white sm:text-6xl lg:text-8xl"
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

        <div className="mt-12 grid w-full max-w-4xl gap-5 sm:grid-cols-2">
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
      className={`gateway-rise group relative overflow-hidden rounded-3xl border p-7 text-left backdrop-blur-xl transition duration-300 will-change-transform hover:-translate-y-1.5 ${
        light
          ? "border-white/70 bg-white/92 text-[color:var(--retail-ink)] hover:shadow-[0_30px_80px_-30px_rgba(255,255,255,0.5)]"
          : "border-[color:var(--hill-gold)]/50 bg-[color:var(--hill-green)]/85 text-[color:var(--luxe-linen)] hover:shadow-[0_30px_80px_-30px_rgba(212,175,55,0.6)]"
      }`}
    >
      <span className="text-3xl">{emoji}</span>
      <h2 className="mt-4 font-display text-3xl uppercase leading-none md:text-4xl">{title}</h2>
      <p className={`mt-3 text-sm ${light ? "text-black/65" : "text-[color:var(--luxe-linen)]/75"}`}>{copy}</p>
      <span
        className={`mt-6 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] ${
          light ? "text-black/70" : "text-[color:var(--hill-gold)]"
        }`}
      >
        {cta}
        <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
      </span>
    </Link>
  );
}
