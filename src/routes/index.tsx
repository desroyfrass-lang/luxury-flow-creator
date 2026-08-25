import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import archHero from "@/assets/frass-three-doors.jpg.asset.json";

/**
 * FRASS-0923 / FRASS-0471 — The Frass Entrance Experience.
 *
 * The ceremonial gateway into the Frass ecosystem. Every visitor arrives
 * beneath the arch, Frassy welcomes them, and the visitor chooses commerce
 * (Frass District) or community (Frass Hill). This page never auto-redirects:
 * frasskicks.com is always "Welcome to FrassKicks".
 */


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Welcome to Frass — Frass District, Frass Hill or Frass Kids" },
      {
        name: "description",
        content:
          "The ceremonial entrance to Frass. Three doors under one arch: the storefronts of the Frass District, the living town of Frass Hill, and the children's world of Frass Kids.",
      },
      { property: "og:title", content: "Welcome to Frass" },
      {
        property: "og:description",
        content:
          "Three ways in: the Frass District, Frass Hill and Frass Kids. One account covers all three.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EntrancePage,
});

function EntrancePage() {
  const navigate = useNavigate();
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  // FRASS-0471: the entrance never redirects on its own. Typing frasskicks.com
  // always shows this welcome — first visit, tenth visit, signed in or not.
  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (alive) setSignedIn(Boolean(data.session));
    });
    return () => {
      alive = false;
    };
  }, []);

  /** Shopping door: a customer profile comes first, then the district. */
  const goShop = () => {
    navigate({ to: signedIn ? "/frass-district" : "/join/frasskicks" });
  };

  /**
   * Hill door: a stranger goes to the Welcome Hall registration; a member goes
   * to the Hall's first-arrival state, which decides first-time vs returning.
   */
  const goHill = () => {
    if (signedIn) navigate({ to: "/welcome-hall", search: { arrival: "first" as const } });
    else navigate({ to: "/join/frass-hill" });
  };

  /** Kids door: the children's world has its own welcome and its own passport. */
  const goKids = () => {
    navigate({ to: "/kids-world" });
  };


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
          alt="Three doors under the Frass archway at golden hour: Frass Hill, Frass District and Frass Kids"
          width={1920}
          height={1080}
          fetchPriority="high"
          className="gateway-drift absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/75" />
      </div>

      <section className="gateway-swell relative mx-auto flex min-h-screen max-w-[1400px] flex-col items-center justify-end px-6 pb-14 pt-[58vh] text-center">
        <h1
          className="gateway-rise font-display text-4xl leading-[0.95] text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.55)] sm:text-6xl lg:text-8xl"
          style={{ animationDelay: "80ms" }}
        >
          Welcome to FrassKicks
        </h1>

        <p
          className="gateway-rise mt-5 max-w-2xl text-sm uppercase tracking-[0.3em] text-white/75 sm:text-base"
          style={{ animationDelay: "160ms" }}
        >
          Built by people. Powered by community. Driven by execution.
        </p>

        <div className="mt-10 grid w-full max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <EntranceCard
            onClick={goShop}
            delay="240ms"
            emoji="🛍️"
            title="Frass District"
            copy="Kicks, Drip, Bare Drip, Luxury House, Plus+, Bridal and the Marketplace. We'll set up your FrassKicks profile first — sizes, fits and orders in one place."
            cta={signedIn ? "Walk the promenade" : "Create my shopping profile"}
            tone="light"
          />
          <EntranceCard
            onClick={goHill}
            delay="320ms"
            emoji="⛰️"
            title="Frass Hill"
            copy="Membership in the town: a Frass Card, a Builder Vault and a Daily. One account covers all three doors — joining the Hill also gives you your FrassKicks profile."
            cta={signedIn ? "Continue into the Hill" : "Begin at the Welcome Hall"}
            tone="dark"
          />
          <EntranceCard
            onClick={goKids}
            delay="400ms"
            emoji="🌈"
            title="Frass Kids"
            copy="The children's world: learning villages, creative studios, music gardens and young-builder spaces, ages 0–3 through 12+, behind a parent-issued passport."
            cta="Enter Frass Kids"
            tone="kids"
          />
        </div>

        <p className="mt-8 max-w-xl text-[10px] uppercase tracking-[0.25em] text-white/50">
          Three doors. One account. Frassy meets you at whichever one you choose.
        </p>

      </section>
    </main>
  );
}


function EntranceCard({
  onClick,
  emoji,
  title,
  copy,
  cta,
  tone,
  delay,
}: {
  onClick: () => void;
  emoji: string;
  title: string;
  copy: string;
  cta: string;
  tone: "light" | "dark" | "kids";
  delay: string;
}) {
  const light = tone === "light";
  const kids = tone === "kids";
  const surface = light
    ? "border-white/70 bg-white/92 text-[color:var(--retail-ink)] hover:shadow-[0_20px_60px_-20px_rgba(255,255,255,0.5)]"
    : kids
      ? "border-[color:var(--kids-sun,#f6c945)]/60 bg-[color:var(--kids-sky,#1b4f7a)]/85 text-white hover:shadow-[0_20px_60px_-20px_rgba(246,201,69,0.6)]"
      : "border-[color:var(--hill-gold)]/50 bg-[color:var(--hill-green)]/85 text-[color:var(--luxe-linen)] hover:shadow-[0_20px_60px_-20px_rgba(212,175,55,0.6)]";
  const body = light ? "text-black/65" : kids ? "text-white/80" : "text-[color:var(--luxe-linen)]/75";
  const action = light
    ? "text-black/70"
    : kids
      ? "text-[color:var(--kids-sun,#f6c945)]"
      : "text-[color:var(--hill-gold)]";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${title} — ${copy}`}
      style={{ animationDelay: delay }}
      className={`gateway-rise group relative overflow-hidden rounded-2xl border p-5 text-left backdrop-blur-xl transition duration-300 will-change-transform hover:-translate-y-1.5 ${surface}`}
    >
      <span className="text-2xl">{emoji}</span>
      <h2 className="mt-3 font-display text-2xl uppercase leading-none md:text-3xl">{title}</h2>
      <p className={`mt-2 text-xs ${body}`}>{copy}</p>
      <span
        className={`mt-4 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] ${action}`}
      >
        {cta}
        <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
      </span>
    </button>


  );
}
