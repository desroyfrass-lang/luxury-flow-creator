import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import archHero from "@/assets/frass-three-doors-arrival-v3.png";
import { DistrictSymbol, HillSymbol, KidsSymbol } from "@/components/entrance/door-symbols";



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
    <main className="relative min-h-screen overflow-hidden bg-[#faf7f0]">
      <section className="relative mx-auto flex min-h-screen w-full flex-col items-center justify-center gap-6 py-6">
        <h1 className="sr-only">Welcome to FrassKicks</h1>

        {/* The archway — full-bleed edge to edge, always shown complete.
            It breathes: a very slow drift, never enough to hide a door. */}
        <div className="gateway-rise relative w-screen overflow-hidden">
          <img
            src={archHero}
            alt="The FrassKicks archway in daylight with three entrances: Frass District, Frass Hill and Frass Kids"
            width={1376}
            height={768}
            fetchPriority="high"
            className="arrival-breathe block h-auto w-full object-cover"
          />
        </div>

        {/* Visible entrance buttons — the only set. Each carries its marker. */}
        <div className="gateway-rise flex w-full max-w-[1100px] flex-col gap-3 px-4 sm:flex-row sm:justify-center">
          <DoorButton onClick={goShop} tone="district" symbol={<DistrictSymbol />}>
            Enter Frass District
            <span className="block text-[10px] font-normal tracking-[0.3em] text-[#e8c96a] opacity-95 sm:text-xs">
              Shop. Style. Elevate.
            </span>
          </DoorButton>
          <DoorButton onClick={goHill} tone="hill" symbol={<HillSymbol />}>
            Enter Frass Hill
            <span className="block text-[10px] font-normal tracking-[0.3em] text-[#e8c96a] opacity-95 sm:text-xs">
              Build. Connect. Grow.
            </span>
          </DoorButton>
          <DoorButton onClick={goKids} tone="kids" symbol={<KidsSymbol />}>
            <span aria-label="Enter Frass Kids">
              <span aria-hidden="true">
                <span className="text-[#ffd34d]">En</span>
                <span className="text-[#7fe3f0]">ter</span>{" "}
                <span className="text-[#ff8a5c]">Fr</span>
                <span className="text-[#8ce68c]">ass</span>{" "}
                <span className="text-[#ffb3e6]">Ki</span>
                <span className="text-[#ffd34d]">ds</span>
              </span>
            </span>
            <span className="block text-[10px] font-normal tracking-[0.3em] text-[#e8c96a] opacity-95 sm:text-xs">
              Wonder. Adventure. Play.
            </span>
          </DoorButton>
        </div>

        <p className="gateway-rise text-center text-[10px] uppercase tracking-[0.35em] text-[#8a7134] sm:text-xs">
          Three doors. One account. Choose the world you want to walk into.
        </p>
      </section>
    </main>
  );
}

/**
 * A glass entrance button beneath the archway image — translucent ocean-glass
 * with a gold rim, frosted and luminous, carrying its destination marker.
 */
function DoorButton({
  onClick,
  tone,
  symbol,
  children,
}: {
  onClick: () => void;
  tone: "district" | "hill" | "kids";
  symbol: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-tone={tone}
      className="door-glass group relative flex flex-1 flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border border-[#d4af37]/70 bg-[#0e7490]/30 px-5 py-4 text-center font-[var(--font-display,'Archivo_Black',sans-serif)] text-base font-bold uppercase tracking-[0.2em] text-[#f4d35e] drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)] shadow-[0_10px_40px_-16px_rgba(8,80,110,0.65)] backdrop-blur-xl transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-[#f4d35e] hover:bg-[#0e7490]/45 hover:shadow-[0_16px_50px_-16px_rgba(103,232,249,0.7)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4d35e] motion-reduce:transition-none"
    >
      <span className="pointer-events-none absolute inset-0 rounded-2xl bg-[linear-gradient(120deg,transparent_30%,rgba(255,255,255,0.18)_50%,transparent_70%)] opacity-70" />
      <span className="relative flex flex-col items-center">{children}</span>
      <span className="relative">{symbol}</span>
    </button>
  );
}


