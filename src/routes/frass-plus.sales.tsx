import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { PageFeedback } from "@/components/page-feedback";
import { PlusBadge } from "@/components/plus-badge";
import { SaleWall, type SaleColumn } from "@/components/sale-wall";
import { WallSigns, type WallSign } from "@/components/wall-signs";
import { ProductGrid } from "@/components/product-grid";
import { SaleVsVault } from "@/components/liquidation/sale-vs-vault";
import { HiddenGem } from "@/components/liquidation/hidden-gem";
import { FlashDrop } from "@/components/liquidation/flash-drop";
import { LuckySpin } from "@/components/liquidation/lucky-spin";
import { TreasureHunt } from "@/components/liquidation/treasure-hunt";
import { WalkWidPower } from "@/components/liquidation/walk-wid-power";
import heroImage from "@/assets/sale-clearance-hero.jpg";

const TITLE = "Frass Plus+ Sales & Clearance — The Extended Liquidation Room";
const DESCRIPTION =
  "Seasonal promotions, exclusive markdowns and final clearance across Frass Plus+. Men's Sale Rack, Women's Sale Rack and the Plus+ clearance vault.";

export const Route = createFileRoute("/frass-plus/sales")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PlusLiquidationRoom,
});

/** Everything on this floor is scoped to the extended-sizing catalogue. */
const SALE_QUERY = 'tag:"plus" AND (tag:"sale" OR tag:"clearance")';

const COLUMNS: SaleColumn[] = [
  {
    id: "men",
    label: "Men's Sale Rack Plus+",
    caption: "Today's best offers",
    query: `${SALE_QUERY} AND (tag:"men" OR product_type:Men)`,
  },
  {
    id: "women",
    label: "Women's Sale Rack Plus+",
    caption: "Special promotional pricing",
    query: `${SALE_QUERY} AND (tag:"women" OR product_type:Women)`,
  },
  {
    id: "clearance",
    label: "Clearance Plus+",
    caption: "Final markdowns — no restocks",
    query: 'tag:"plus" AND tag:"clearance"',
  },
];

const SIGNS: WallSign[] = [
  {
    label: "Men's Sale Rack Plus+",
    caption: "Extended-fit premium styles with today's best offers — before they're gone.",
  },
  {
    label: "Women's Sale Rack Plus+",
    caption: "Extended-fit favourites now at special promotional prices.",
  },
  {
    label: "Clearance Plus+",
    accent: true,
    caption: "Hidden treasures in extended sizing. When they're gone, they're gone.",
  },
];

function PlusLiquidationRoom() {
  return (
    <SiteShell>
      <div className="relative">
        <TreasureHunt />

        <section className="mx-auto max-w-[1100px] px-4 pb-10 pt-14 text-center md:px-12 md:pb-14 md:pt-24">
          <nav className="mb-8 flex flex-wrap items-center justify-center gap-2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <Link to="/frass-plus" className="hover:text-foreground">Frass Plus</Link>
            <span>/</span>
            <span className="text-foreground">Sales &amp; Clearance</span>
          </nav>

          <p className="text-[10px] uppercase tracking-[0.42em] text-[color:var(--gold)]">
            Sales • Limited Offers • Final Clearance
          </p>
          <h1 className="mt-5 flex flex-wrap items-center justify-center gap-4 font-display text-4xl uppercase leading-[0.95] tracking-[0.04em] md:text-7xl">
            The Liquidation Room
            <PlusBadge size="lg" />
          </h1>
          <p className="mt-6 font-display text-xl uppercase tracking-[0.12em] text-[color:var(--gold-soft)] md:text-3xl">
            Luxury finds. Extraordinary prices.
          </p>
          <p className="mt-4 text-sm italic text-muted-foreground md:text-base">
            The best pieces don't stay here for long.
          </p>
          <div className="mx-auto mt-8 max-w-2xl space-y-4 text-sm leading-relaxed text-muted-foreground md:text-base">
            <p>
              The same liquidation floor as the main district, mirrored for Frass Plus+ — seasonal
              promotions, exclusive markdowns and final-clearance treasures, every piece cut in
              extended sizing.
            </p>
            <p className="italic text-foreground/80">
              "Whether you're searching for your next favourite fit or uncovering an unbelievable
              deal, every visit brings something new."
            </p>
          </div>
        </section>

        <FlashDrop />

        <div className="pt-10 md:pt-16">
          <WallSigns signs={SIGNS} />
        </div>

        <section className="relative mx-auto max-w-[1600px] px-2 md:px-12">
          <div className="relative overflow-hidden rounded-2xl border border-[color:var(--gold)]/25 md:rounded-[2rem]">
            <img
              src={heroImage}
              alt="Frass Plus+ liquidation floor: men's rack, women's rack and a circular clearance rack"
              width={1920}
              height={768}
              className="h-[34vw] min-h-[180px] w-full object-cover md:h-auto"
            />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.55),transparent_35%,rgba(0,0,0,0.5))]" />
            <div className="absolute left-5 top-5">
              <PlusBadge size="lg" />
            </div>
          </div>
        </section>

        <SaleWall columns={COLUMNS} />

        <section className="mx-auto max-w-[900px] px-4 pb-4 text-center md:px-12">
          <p className="text-sm italic leading-relaxed text-muted-foreground">
            "Don't say I told you — but this is where the hidden treasures are. When they're gone…
            they're just gone." These are our final Plus+ markdowns: priced significantly lower
            than regular sale items, inventory extremely limited, many styles will not return.
          </p>
        </section>

        <SaleVsVault />

        <HiddenGem query={SALE_QUERY} />

        <section className="mx-auto max-w-[1600px] px-4 pb-6 md:px-12">
          <p className="text-[10px] uppercase tracking-[0.35em] text-[color:var(--gold)]">
            Frassy says
          </p>
          <h2 className="mt-3 max-w-3xl font-display text-2xl uppercase leading-tight tracking-[0.06em] md:text-4xl">
            "If I were shopping Plus+ today… these are the ones I'd grab first."
          </h2>
          <div className="mt-8">
            <ProductGrid
              query={SALE_QUERY}
              first={8}
              emptyTitle="Frassy is still pulling her Plus+ picks"
              emptyHint="Tag extended-size products with plus and sale or clearance and they'll appear here first."
            />
          </div>
        </section>

        <LuckySpin />

        <WalkWidPower query={SALE_QUERY} />

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

        <PageFeedback pageTitle="Frass Plus+ Liquidation Room" />
      </div>
    </SiteShell>
  );
}
