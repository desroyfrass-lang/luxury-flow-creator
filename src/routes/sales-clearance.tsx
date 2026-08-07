import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { PageFeedback } from "@/components/page-feedback";
import { SaleWall, type SaleColumn } from "@/components/sale-wall";
import { WallSigns, type WallSign } from "@/components/wall-signs";
import { ProductGrid } from "@/components/product-grid";
import { SaleVsVault } from "@/components/liquidation/sale-vs-vault";
import { HiddenGem } from "@/components/liquidation/hidden-gem";
import { FlashDrop } from "@/components/liquidation/flash-drop";
import { LuckySpin } from "@/components/liquidation/lucky-spin";
import { TreasureHunt } from "@/components/liquidation/treasure-hunt";
import { WalkWidPower } from "@/components/liquidation/walk-wid-power";
import { Link } from "@tanstack/react-router";
import heroImage from "@/assets/sale-clearance-hero.jpg";

export const Route = createFileRoute("/sales-clearance")({
  head: () => ({
    meta: [
      { title: "The Liquidation Room — Luxury Finds, Extraordinary Prices" },
      {
        name: "description",
        content:
          "Seasonal promotions, exclusive markdowns and final clearance across the Frass Kicks District. Men's Sale Rack, Women's Sale Rack and the Clearance vault.",
      },
      { property: "og:title", content: "The Liquidation Room — Frass District" },
      {
        property: "og:description",
        content:
          "Luxury finds. Extraordinary prices. The best pieces don't stay here for long.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LiquidationRoomPage,
});

const SALE_QUERY = 'tag:"sale" OR tag:"clearance"';

const COLUMNS: SaleColumn[] = [
  {
    id: "men",
    label: "Men's Sale Rack",
    caption: "Today's best offers",
    query: '(tag:"sale" OR tag:"clearance") AND (tag:"men" OR product_type:Men)',
  },
  {
    id: "women",
    label: "Women's Sale Rack",
    caption: "Special promotional pricing",
    query: '(tag:"sale" OR tag:"clearance") AND (tag:"women" OR product_type:Women)',
  },
  {
    id: "clearance",
    label: "Clearance",
    caption: "Final markdowns — no restocks",
    query: 'tag:"clearance"',
  },
];

const SIGNS: WallSign[] = [
  { label: "Men's Sale Rack", caption: "Premium styles with today's best offers — before they're gone." },
  { label: "Women's Sale Rack", caption: "Fashion favourites now at special promotional prices." },
  { label: "Clearance", accent: true, caption: "Hidden treasures. When they're gone, they're gone." },
];

function LiquidationRoomPage() {
  return (
    <SiteShell>
      <div className="relative">
        <TreasureHunt />

        {/* ---------- Opening ---------- */}
        <section className="mx-auto max-w-[1100px] px-4 pb-10 pt-14 text-center md:px-12 md:pb-14 md:pt-24">
          <nav className="mb-8 flex flex-wrap items-center justify-center gap-2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <Link to="/shop-frass" className="hover:text-foreground">Frass District</Link>
            <span>/</span>
            <span className="text-foreground">The Liquidation Room</span>
          </nav>

          <p className="text-[10px] uppercase tracking-[0.42em] text-[color:var(--gold)]">
            Sales • Limited Offers • Final Clearance
          </p>
          <h1 className="mt-5 font-display text-4xl uppercase leading-[0.95] tracking-[0.04em] md:text-7xl">
            The Liquidation Room
          </h1>
          <p className="mt-6 font-display text-xl uppercase tracking-[0.12em] text-[color:var(--gold-soft)] md:text-3xl">
            Luxury finds. Extraordinary prices.
          </p>
          <p className="mt-4 text-sm italic text-muted-foreground md:text-base">
            The best pieces don't stay here for long.
          </p>
          <div className="mx-auto mt-8 max-w-2xl space-y-4 text-sm leading-relaxed text-muted-foreground md:text-base">
            <p>
              Welcome to the Liquidation Room — where exceptional style meets exceptional value.
              Discover seasonal promotions, exclusive markdowns and final-clearance treasures across
              the Frass Kicks District.
            </p>
            <p className="italic text-foreground/80">
              "Whether you're searching for your next favourite pair or uncovering an unbelievable
              deal, every visit brings something new."
            </p>
          </div>
        </section>

        <FlashDrop />

        {/* ---------- Three shopping zones ---------- */}
        <div className="pt-10 md:pt-16">
          <WallSigns signs={SIGNS} />
        </div>

        <section className="relative mx-auto max-w-[1600px] px-2 md:px-12">
          <div className="relative overflow-hidden rounded-2xl border border-[color:var(--gold)]/25 md:rounded-[2rem]">
            <img
              src={heroImage}
              alt="Frass liquidation floor: men's rack, women's rack and a circular clearance rack"
              width={1920}
              height={768}
              className="h-[34vw] min-h-[180px] w-full object-cover md:h-auto"
            />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.55),transparent_35%,rgba(0,0,0,0.5))]" />
          </div>
        </section>

        <SaleWall columns={COLUMNS} />

        {/* ---------- Clearance note ---------- */}
        <section className="mx-auto max-w-[900px] px-4 pb-4 text-center md:px-12">
          <p className="text-sm italic leading-relaxed text-muted-foreground">
            "Don't say I told you — but this is where the hidden treasures are. When they're gone…
            they're just gone." These are our final markdowns: priced significantly lower than
            regular sale items, inventory extremely limited, many styles will not return.
          </p>
        </section>

        <SaleVsVault />

        <HiddenGem query={SALE_QUERY} />

        {/* ---------- Frassy's recommendations ---------- */}
        <section className="mx-auto max-w-[1600px] px-4 pb-6 md:px-12">
          <p className="text-[10px] uppercase tracking-[0.35em] text-[color:var(--gold)]">
            Frassy says
          </p>
          <h2 className="mt-3 max-w-3xl font-display text-2xl uppercase leading-tight tracking-[0.06em] md:text-4xl">
            "If I were shopping today… these are the ones I'd grab first."
          </h2>
          <div className="mt-8">
            <ProductGrid
              query={SALE_QUERY}
              first={8}
              emptyTitle="Frassy is still pulling her picks"
              emptyHint="Tag products with sale or clearance and they'll appear here first."
            />
          </div>
        </section>

        <LuckySpin />

        <WalkWidPower query={SALE_QUERY} />

        {/* ---------- Closing banner ---------- */}
        <section className="relative overflow-hidden border-y border-[color:var(--gold)]/20 bg-[color-mix(in_oklab,var(--foreground)_6%,transparent)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_120%_at_50%_0%,color-mix(in_oklab,var(--gold)_14%,transparent),transparent_70%)]" />
          <div className="relative mx-auto max-w-3xl px-6 py-16 text-center md:py-24">
            <p className="font-display text-xl uppercase leading-snug tracking-[0.08em] md:text-3xl">
              Great style isn't measured by the price you pay. It's measured by the confidence you
              walk away with.
            </p>
            <p className="mt-6 font-display text-2xl uppercase tracking-[0.3em] text-[color:var(--gold)] md:text-4xl">
              Walk Wid Power
            </p>
          </div>
        </section>

        <PageFeedback pageTitle="The Liquidation Room" />
      </div>
    </SiteShell>
  );
}
