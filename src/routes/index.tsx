import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import archHero from "@/assets/frass-three-doors-arrival-v2.png.asset.json";


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
      <section className="relative mx-auto flex min-h-screen w-full max-w-[1500px] flex-col items-center justify-center gap-5 px-3 py-6 sm:px-6">
        <h1 className="sr-only">Welcome to FrassKicks</h1>

        {/* The archway — always shown complete, never cropped. The FrassKicks
            sign and the three ENTER buttons live inside the artwork itself;
            invisible hotspots sit exactly over them. */}
        <div className="gateway-rise relative w-full overflow-hidden rounded-[1.5rem] shadow-[0_30px_90px_-40px_rgba(90,70,20,0.45)] ring-1 ring-[#d4af37]/30">
          <img
            src={archHero.url}
            alt="The FrassKicks archway in daylight with three entrances: Frass District, Frass Hill and Frass Kids"
            width={1376}
            height={768}
            fetchPriority="high"
            className="block h-auto w-full object-contain"
          />

          <DoorHotspot
            onClick={goShop}
            label="Enter Frass District — Shop. Style. Elevate."
            style={{ left: "7%", width: "22%", top: "26%", height: "71%" }}
          />
          <DoorHotspot
            onClick={goHill}
            label="Enter Frass Hill — Build. Connect. Grow."
            style={{ left: "36.6%", width: "25.6%", top: "26%", height: "71%" }}
          />
          <DoorHotspot
            onClick={goKids}
            label="Enter Frass Kids — Wonder. Adventure. Play."
            style={{ left: "68.8%", width: "22%", top: "26%", height: "71%" }}
          />
        </div>

        <p className="gateway-rise text-center text-[10px] uppercase tracking-[0.35em] text-[#8a7134] sm:text-xs">
          Three doors. One account. Choose the world you want to walk into.
        </p>
      </section>
    </main>
  );
}

/**
 * An invisible, keyboard-reachable control laid over a doorway and its
 * baked-in ENTER button. No second visible button is ever drawn.
 */
function DoorHotspot({
  onClick,
  label,
  style,
}: {
  onClick: () => void;
  label: string;
  style: React.CSSProperties;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      style={style}
      className="absolute cursor-pointer rounded-2xl bg-transparent outline-none transition-all duration-500 ease-out hover:bg-[radial-gradient(ellipse_at_center,rgba(255,224,150,0.22),transparent_70%)] hover:shadow-[0_0_60px_-10px_rgba(212,175,55,0.85)] focus-visible:bg-[radial-gradient(ellipse_at_center,rgba(255,224,150,0.22),transparent_70%)] focus-visible:ring-2 focus-visible:ring-[#f3d27a] motion-reduce:transition-none"
    />
  );
}

