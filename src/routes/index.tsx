import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import archHero from "@/assets/frass-three-doors-arrival-v3.png";
import { DistrictSymbol, HillSymbol, ExploreSymbol, KidsSymbol } from "@/components/entrance/door-symbols";
import { Button } from "@/components/ui/button";



/**
 * FRASS-0923 / FRASS-0471 — The Frass Entrance Experience.
 *
 * The ceremonial gateway into the Frass ecosystem: one daylight archway, four
 * choices — shop, make money, explore the town, or enter the children's world.
 * This page never auto-redirects: frasskicks.com
 * is always "Welcome to FrassKicks".
 *
 * Brand lock: the FrassKicks mark is the exact approved logo asset overlaid on
 * the artwork — never an AI reproduction.
 */

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Welcome to FrassKicks — Shop, Build, Explore or Kids" },
      {
        name: "description",
        content:
          "The daylight entrance to FrassKicks. Shop Frass Kicks, make money in Frass Hill, explore the town or discover Frass Kids.",
      },
      { property: "og:title", content: "Welcome to FrassKicks" },
      {
        property: "og:description",
        content:
          "Four ways in: shop, make money, explore Frass Hill or enter Frass Kids. One account connects them.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EntrancePage,
});

function EntrancePage() {
  const navigate = useNavigate();
  const [enteringHill, setEnteringHill] = useState(false);

  /** Shopping door: a customer profile comes first, then the district. */
  const goShop = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      navigate({ to: data.session ? "/frass-district" : "/join/frasskicks" });
    } catch {
      navigate({ to: "/join/frasskicks" });
    }
  };

  /**
   * Make Money door: a signed-in member opens the existing Opportunity Center.
   * Signed-out visitors use the existing sign-in/arrival continuation, which
   * preserves the first-arrival interview for new members.
   */
  const goMakeMoney = async () => {
    if (enteringHill) return;
    setEnteringHill(true);
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate({ to: "/auth", search: { next: "/opportunity" } });
        return;
      }
      navigate({ to: "/opportunity" });
    } catch {
      navigate({ to: "/auth", search: { next: "/opportunity" } });
    } finally {
      setEnteringHill(false);
    }
  };

  /** Kids door: the children's world has its own welcome and its own passport. */
  const goKids = () => {
    navigate({ to: "/kids-world" });
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <section className="relative mx-auto flex min-h-screen w-full flex-col items-center justify-center gap-5 py-5">
        <h1 className="sr-only">Welcome to FrassKicks</h1>

        {/* The archway — full-bleed edge to edge, always shown complete.
            It breathes: a very slow drift, never enough to hide a door. */}
        <div className="gateway-rise relative w-screen overflow-hidden">
          <img
            src={archHero}
            alt="The FrassKicks archway in daylight"
            width={1376}
            height={768}
            fetchPriority="high"
            className="arrival-breathe mx-auto block h-auto max-h-[min(54vh,580px)] w-full object-contain"
          />
        </div>

        {/* Visible entrance buttons — the only set. Each carries its marker. */}
        <div className="gateway-rise grid w-full max-w-[1280px] grid-cols-1 gap-3 px-4 sm:grid-cols-2 xl:grid-cols-4">
          <DoorButton onClick={() => void goShop()} tone="district" symbol={<DistrictSymbol />}>
            Enter Frass Kicks
            <span className="block text-[10px] font-normal text-gold-soft opacity-95 sm:text-xs">
              Shop
            </span>
          </DoorButton>
          <DoorButton onClick={() => void goMakeMoney()} tone="hill" symbol={<HillSymbol />}>
            {enteringHill ? "Opening Frass Hill…" : "Enter Frass Hill"}
            <span className="block text-[10px] font-normal text-gold-soft opacity-95 sm:text-xs">
              Make Money
            </span>
          </DoorButton>
          <DoorButton onClick={() => navigate({ to: "/frass-hill" })} tone="explore" symbol={<ExploreSymbol />}>
            Explore Frass Hill
            <span className="block text-[10px] font-normal text-gold-soft opacity-95 sm:text-xs">
              Explore the Town
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
            <span className="block text-[10px] font-normal text-gold-soft opacity-95 sm:text-xs">
              Wonder. Adventure. Play.
            </span>
          </DoorButton>
        </div>

        <p className="gateway-rise text-center text-[10px] uppercase tracking-[0.35em] text-[#8a7134] sm:text-xs">
          Four doors. One account. Choose where you want to go.
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
  tone: "district" | "hill" | "explore" | "kids";
  symbol: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      onClick={onClick}
      data-tone={tone}
      className="door-glass group relative flex h-[126px] min-w-0 flex-col gap-2 overflow-hidden rounded-md border border-gold/70 bg-secondary/80 px-3 py-3 text-center font-display text-base font-bold uppercase text-gold shadow-luxury backdrop-blur-xl transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-gold-soft hover:bg-secondary focus-visible:ring-2 focus-visible:ring-gold motion-reduce:transition-none whitespace-normal [&_svg]:size-10 sm:[&_svg]:size-12"
    >
      <span className="relative flex flex-col items-center leading-tight">{children}</span>
      <span className="relative">{symbol}</span>
    </Button>
  );
}


