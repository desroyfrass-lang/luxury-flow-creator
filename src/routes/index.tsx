import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { CollectionCard } from "@/components/collection-card";
import { ProductGrid } from "@/components/product-grid";
import heroImg from "@/assets/hero-frass.jpg";
import cardKicks from "@/assets/card-kicks.jpg";
import cardDrip from "@/assets/card-drip.jpg";
import cardBare from "@/assets/card-bare.jpg";
import { ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Frass Kicks — Luxury Footwear, Fashion & Swim" },
      {
        name: "description",
        content:
          "Step inside the Frass Kicks showroom. Luxury footwear, Frass Drip apparel, and Bare Drip swim & intimates.",
      },
      { property: "og:title", content: "Frass Kicks — Luxury Fashion Destination" },
      { property: "og:image", content: heroImg },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <SiteShell>
      {/* HERO */}
      <section className="relative">
        <div className="mx-auto max-w-[1600px] px-6 lg:px-12 pt-10 lg:pt-16">
          <div className="relative overflow-hidden rounded-[2rem] lux-card">
            <img
              src={heroImg}
              alt="Frass Kicks luxury showroom"
              className="h-[78vh] min-h-[560px] w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-16 text-white animate-fade-up">
              <div className="mb-6 inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.35em] text-white/85">
                <span className="h-px w-10 bg-[color:var(--gold)]" />
                The Frass Kicks Experience
              </div>
              <h1 className="font-display text-5xl md:text-7xl lg:text-[8rem] leading-[0.9] max-w-5xl">
                Where luxury <span className="gold-text italic">moves</span>.
              </h1>
              <p className="mt-6 max-w-xl text-base md:text-lg text-white/85">
                A cinematic destination for premium footwear, fashion, swim &amp; intimates.
                Step into the showroom.
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link
                  to="/frass-kicks"
                  className="lux-press inline-flex items-center gap-2 rounded-full bg-white text-foreground px-7 py-3.5 text-xs uppercase tracking-[0.25em] hover:bg-[color:var(--gold)] transition"
                >
                  Shop Frass Kicks <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/frass-drip"
                  className="lux-press inline-flex items-center gap-2 rounded-full border border-white/60 text-white px-7 py-3.5 text-xs uppercase tracking-[0.25em] hover:border-[color:var(--gold)] hover:text-[color:var(--gold)] transition"
                >
                  Shop Frass Drip
                </Link>
                <Link
                  to="/bare-drip"
                  className="lux-press inline-flex items-center gap-2 rounded-full border border-white/60 text-white px-7 py-3.5 text-xs uppercase tracking-[0.25em] hover:border-[color:var(--gold)] hover:text-[color:var(--gold)] transition"
                >
                  Shop Bare Drip
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DIVISIONS */}
      <section className="mx-auto max-w-[1600px] px-6 lg:px-12 mt-28">
        <div className="flex items-end justify-between gap-6 mb-10">
          <div>
            <div className="mb-3 inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
              <span className="h-px w-8 bg-[color:var(--gold)]" />
              Three Worlds
            </div>
            <h2 className="font-display text-5xl md:text-7xl leading-[0.95]">
              Choose your <span className="italic">drip</span>.
            </h2>
          </div>
          <p className="hidden md:block max-w-sm text-sm text-muted-foreground">
            Each division is its own universe — explore through imagery, not menus.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          <CollectionCard
            to="/frass-kicks"
            image={cardKicks}
            eyebrow="Division 01"
            title="Frass Kicks"
            description="Premium footwear — casual, street, classic."
          />
          <CollectionCard
            to="/frass-drip"
            image={cardDrip}
            eyebrow="Division 02"
            title="Frass Drip"
            description="Fashion-forward apparel for the everyday icon."
          />
          <CollectionCard
            to="/bare-drip"
            image={cardBare}
            eyebrow="Division 03"
            title="Bare Drip"
            description="Swim, intimates & lifestyle essentials."
          />
        </div>
      </section>

      {/* BEST SELLERS */}
      <section className="mx-auto max-w-[1600px] px-6 lg:px-12 mt-28">
        <div className="flex items-end justify-between gap-6 mb-10">
          <div>
            <div className="mb-3 inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
              <span className="h-px w-8 bg-[color:var(--gold)]" />
              Best Sellers
            </div>
            <h2 className="font-display text-4xl md:text-6xl leading-[0.95]">
              The shelf everyone's reaching for.
            </h2>
          </div>
          <Link
            to="/collection/$handle"
            params={{ handle: "frass-kicks" }}
            className="hidden md:inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] hover:text-[color:var(--gold)] transition"
          >
            View all <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
        <ProductGrid first={8} emptyHint="Add products in Shopify and they'll appear here automatically." />
      </section>

      {/* PROMO BANNER */}
      <section className="mx-auto max-w-[1600px] px-6 lg:px-12 mt-28">
        <div className="relative overflow-hidden rounded-[2rem] p-10 md:p-20 chrome-surface">
          <div className="absolute inset-0 opacity-60"
               style={{ background: "radial-gradient(60% 80% at 50% 50%, oklch(0.95 0.08 85 / 0.55), transparent 70%)" }} />
          <div className="relative max-w-2xl">
            <div className="mb-4 text-[11px] uppercase tracking-[0.3em] text-foreground/70">
              Signature Service
            </div>
            <h2 className="font-display text-4xl md:text-6xl leading-[0.95]">
              Complimentary shipping. Effortless returns.
            </h2>
            <p className="mt-5 max-w-md text-sm md:text-base text-muted-foreground">
              Every order is treated like a private client appointment.
            </p>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
