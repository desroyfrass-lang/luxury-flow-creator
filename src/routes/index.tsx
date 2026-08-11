import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import archHero from "@/assets/frass-gateway-arch.jpg.asset.json";
import frassyGold from "@/assets/frassy-gold.png.asset.json";

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
      { title: "Welcome to Frass — Shop Frass or Enter Frass Hill" },
      {
        name: "description",
        content:
          "The ceremonial entrance to Frass. Built by people, powered by community, driven by execution. Shop the Frass District, or journey into Frass Hill.",
      },
      { property: "og:title", content: "Welcome to Frass" },
      {
        property: "og:description",
        content: "Two ways in: the storefronts of the Frass District, or the living town of Frass Hill.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EntrancePage,
});

const WELCOME_LINES = [
  "Welcome to frasskicks.com.",
  "This is more than a fashion destination. It's a community built by people, powered by purpose, and designed to help everyone build something meaningful.",
  "Would you like to begin by shopping, or would you like to explore Frass Hill?",
];

function EntranceFrassy() {
  const [line, setLine] = useState(0);
  const [seated, setSeated] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setSeated(true);
      return;
    }
    const timers = [
      setTimeout(() => setLine(1), 2600),
      setTimeout(() => setLine(2), 6200),
      setTimeout(() => setSeated(true), 9800),
    ];
    const skip = () => {
      timers.forEach(clearTimeout);
      setSeated(true);
    };
    window.addEventListener("frass-entrance-skip", skip);
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("frass-entrance-skip", skip);
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 z-40 flex flex-col items-center justify-center px-6 text-center transition-opacity duration-1000 ${
        seated ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      role="dialog"
      aria-label="Frassy welcomes you to Frass"
      onClick={() => window.dispatchEvent(new Event("frass-entrance-skip"))}
    >
      <div
        aria-hidden
        className="absolute inset-0 backdrop-blur-[6px]"
        style={{ background: "radial-gradient(70% 55% at 50% 45%, rgba(6,6,8,0.6), rgba(6,6,8,0.9))" }}
      />
      <img
        src={frassyGold.url}
        alt="Frassy, host of the World of Frass"
        className={`relative rounded-full object-cover transition-all duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          seated ? "h-24 w-24" : "h-[min(34vh,60vw)] w-[min(34vh,60vw)]"
        }`}
        style={{ boxShadow: "0 40px 120px -50px rgba(212,175,55,0.85)" }}
        draggable={false}
      />
      <p
        key={line}
        className="relative mt-8 max-w-[min(40rem,88vw)] animate-fade-in text-balance text-base leading-relaxed text-white/90 md:text-lg"
        aria-live="polite"
      >
        {WELCOME_LINES[line]}
      </p>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          window.dispatchEvent(new Event("frass-entrance-skip"));
        }}
        className="relative mt-8 rounded-full border border-[color:var(--hill-gold)]/60 px-5 py-2 text-[10px] font-bold uppercase tracking-[0.3em] text-[color:var(--hill-gold)]"
      >
        Start exploring
      </button>
    </div>
  );
}

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
   * to /welcome, which is the only place that decides first-time vs returning.
   */
  const goHill = () => {
    navigate({ to: signedIn ? "/welcome" : "/join/frass-hill" });
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
          alt="The carved Frass archway opening onto the palm-lined promenade at golden hour"
          width={1920}
          height={1080}
          fetchPriority="high"
          className="gateway-drift absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/75" />
      </div>

      <EntranceFrassy />

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

        <div className="mt-10 grid w-full max-w-3xl gap-4 sm:grid-cols-2">
          <EntranceCard
            onClick={goShop}
            delay="240ms"
            emoji="🛍️"
            title="Shop Frass District"
            copy="Kicks, Drip, Bare Drip, Luxury House, Plus+, Kids, Bridal and the Marketplace. We'll set up your FrassKicks profile first — sizes, fits and orders in one place."
            cta={signedIn ? "Walk the promenade" : "Create my shopping profile"}
            tone="light"
          />
          <EntranceCard
            onClick={goHill}
            delay="320ms"
            emoji="⛰️"
            title="Enter Frass Hill"
            copy="Membership in the town: a Frass Card, a Builder Vault and a Daily. One account covers both — joining the Hill also gives you your FrassKicks profile."
            cta={signedIn ? "Continue into the Hill" : "Begin at the Welcome Hall"}
            tone="dark"
          />
        </div>

        <p className="mt-8 max-w-xl text-[10px] uppercase tracking-[0.25em] text-white/50">
          Two doors. One account. Frassy meets you at whichever one you choose.
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
  tone: "light" | "dark";
  delay: string;
}) {
  const light = tone === "light";
  return (
    <button
      type="button"
      onClick={onClick}
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
    </button>

  );
}
