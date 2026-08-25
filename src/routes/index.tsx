import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import archHero from "@/assets/frass-three-doors-daylight.png.asset.json";
import frassLogo from "@/assets/frass-logo-full.asset.json";

/**
 * FRASS-0923 / FRASS-0471 — The Frass Entrance Experience.
 *
 * The ceremonial gateway into the Frass ecosystem: one daylight archway, three
 * equal doors — Frass District (shopping), Frass Hill (community) and Frass
 * Kids (the children's world). This page never auto-redirects: frasskicks.com
 * is always "Welcome to FrassKicks".
 *
 * Brand lock: the FrassKicks mark is the exact approved logo asset overlaid on
 * the artwork — never an AI reproduction.
 */

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Welcome to FrassKicks — District, Hill or Kids" },
      {
        name: "description",
        content:
          "The daylight entrance to FrassKicks. Three doors under one Caribbean archway: the storefronts of the Frass District, the living town of Frass Hill, and Kids Valley in Frass Kids.",
      },
      { property: "og:title", content: "Welcome to FrassKicks" },
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
    <main className="relative min-h-screen overflow-hidden bg-[#0b0a08]">
      {/* Soft, warm backdrop so the artwork can always be shown whole. */}
      <img
        src={archHero.url}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full scale-125 object-cover blur-3xl brightness-[0.55] saturate-125"
      />

      <section className="relative mx-auto flex min-h-screen w-full max-w-[1500px] flex-col items-center justify-center gap-6 px-4 py-8 sm:px-6 lg:gap-8">
        {/* The archway — always shown complete, never cropped. */}
        <div className="gateway-rise relative w-full overflow-hidden rounded-[1.5rem] shadow-[0_40px_120px_-40px_rgba(0,0,0,0.8)] ring-1 ring-[#d4af37]/25">
          <img
            src={archHero.url}
            alt="The FrassKicks archway in daylight with three entrances: Frass District, Frass Hill and Frass Kids"
            width={1656}
            height={936}
            fetchPriority="high"
            className="block h-auto w-full object-contain"
          />

          {/* Brand lock — the exact approved FrassKicks mark, warmly lit. */}
          <div className="pointer-events-none absolute inset-x-0 top-[4.2%] flex justify-center">
            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute -inset-x-10 -inset-y-8 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,224,150,0.55),transparent_70%)] blur-xl"
              />
              <img
                src={frassLogo.url}
                alt="FrassKicks"
                className="relative w-[54%] max-w-[840px] drop-shadow-[0_6px_18px_rgba(60,35,0,0.55)]"
              />
            </div>
          </div>
        </div>

        <h1 className="gateway-rise sr-only">Welcome to FrassKicks</h1>
        <p
          className="gateway-rise text-center text-[10px] uppercase tracking-[0.35em] text-[#f4e3b8]/80 sm:text-xs"
          style={{ animationDelay: "120ms" }}
        >
          Three doors. One account. Choose the world you want to walk into.
        </p>

        {/* One transparent gold button beneath each doorway. */}
        <div className="grid w-full gap-3 sm:grid-cols-3 sm:gap-5">
          <DoorButton
            onClick={goShop}
            delay="200ms"
            label="Enter Frass District"
            hint="Shop. Style. Elevate."
          />
          <DoorButton
            onClick={goHill}
            delay="280ms"
            label="Enter Frass Hill"
            hint="Build. Connect. Grow."
          />
          <DoorButton
            onClick={goKids}
            delay="360ms"
            label="Enter Frass Kids"
            hint="Wonder. Adventure. Play."
          />
        </div>
      </section>
    </main>
  );
}

function DoorButton({
  onClick,
  label,
  hint,
  delay,
}: {
  onClick: () => void;
  label: string;
  hint: string;
  delay: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ animationDelay: delay }}
      className="gateway-rise group relative overflow-hidden rounded-xl border border-[#d4af37]/70 bg-black/25 px-5 py-4 text-center backdrop-blur-[2px] transition-all duration-500 ease-out outline-none hover:-translate-y-0.5 hover:border-[#f3d27a] hover:bg-black/35 hover:shadow-[0_0_38px_-6px_rgba(212,175,55,0.65)] focus-visible:-translate-y-0.5 focus-visible:border-[#f3d27a] focus-visible:shadow-[0_0_38px_-6px_rgba(212,175,55,0.65)] motion-reduce:transform-none motion-reduce:transition-none"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(110deg,transparent,rgba(255,240,200,0.22),transparent)] transition-transform duration-[900ms] ease-out group-hover:translate-x-full group-focus-visible:translate-x-full motion-reduce:hidden"
      />
      <span className="relative block font-display text-lg uppercase leading-none tracking-[0.14em] text-[#f7ead0] transition-colors duration-300 group-hover:text-white sm:text-xl">
        {label}
      </span>
      <span className="relative mt-2 block text-[9px] uppercase tracking-[0.3em] text-[#e7cf95]/75">
        {hint}
      </span>
    </button>
  );
}
