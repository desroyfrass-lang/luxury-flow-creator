import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { CollectionCard } from "@/components/collection-card";
import { ProductGrid } from "@/components/product-grid";
import heroImg from "@/assets/hero-frass.jpg";
import cardKicks from "@/assets/card-kicks.jpg";
import cardDrip from "@/assets/card-drip.jpg";
import cardBare from "@/assets/card-bare.jpg";
import cardMen from "@/assets/card-men.jpg";
import fullLogo from "@/assets/frass-logo-full.asset.json";
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
      <section className="relative">
        <div className="mx-auto max-w-[1600px] px-6 lg:px-12 pt-10 lg:pt-16">
          <div className="relative overflow-hidden rounded-[2rem] border border-border/60 lux-card">
            <img
              src={heroImg}
              alt="Frass Kicks luxury showroom"
              className="h-[78vh] min-h-[560px] w-full object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,oklch(0.07_0.005_80_/_0.88)_0%,oklch(0.07_0.005_80_/_0.62)_40%,oklch(0.07_0.005_80_/_0.35)_65%,transparent_100%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,oklch(0.07_0.005_80_/_0.32)_0%,transparent_35%,oklch(0.07_0.005_80_/_0.72)_100%)]" />

            <div className="absolute inset-0 flex flex-col justify-between p-8 md:p-12 lg:p-16 animate-fade-up">
              <div className="flex items-start justify-between gap-6">
                <div className="max-w-md">
                  <div className="text-xl md:text-2xl uppercase tracking-[0.35em] text-[color:var(--gold)] font-display">
                    FRASS HILL <span className="font-script normal-case tracking-normal text-2xl md:text-3xl text-foreground/95">presents</span>
                  </div>
                  <div className="mt-4">
                    <img src={fullLogo.url} alt="Frass Kicks logo" className="h-18 md:h-24 w-auto object-contain drop-shadow-[0_0_40px_oklch(1_0_0_/_0.12)]" />
                  </div>
                </div>

                <div className="hidden md:flex flex-col items-end gap-5 text-foreground/90">
                  <div className="flex gap-3">
                    <button className="inline-flex h-11 min-w-11 items-center justify-center rounded-full border border-border/70 bg-background/40 px-4 text-[color:var(--gold)] backdrop-blur transition hover:border-[color:var(--gold)]">Menu</button>
                    <button className="inline-flex h-11 min-w-11 items-center justify-center rounded-full border border-border/70 bg-background/40 px-4 backdrop-blur transition hover:border-[color:var(--gold)]">Account</button>
                    <button className="inline-flex h-11 min-w-11 items-center justify-center rounded-full border border-border/70 bg-background/40 px-4 backdrop-blur transition hover:border-[color:var(--gold)]">Search</button>
                  </div>
                  <div className="flex gap-3 text-xs uppercase tracking-[0.28em] text-muted-foreground">
                    <span>Instagram</span>
                    <span>TikTok</span>
                    <span>Facebook</span>
                    <span>YouTube</span>
                  </div>
                </div>
              </div>

              <div className="max-w-3xl text-foreground">
                <h1 className="max-w-2xl font-display text-6xl md:text-8xl lg:text-[8.5rem] text-foreground leading-[0.88]">
                  Original street luxury.
                </h1>
                <p className="mt-5 max-w-xl text-sm md:text-base tracking-[0.04em] text-foreground/78">
                  Block-letter attitude, chrome identity, and a darker cinematic showroom that stays closer to your original Frass Kicks site.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    to="/frass-kicks"
                    className="lux-press inline-flex items-center gap-2 rounded-sm border border-[color:var(--gold)] bg-[color:var(--gold)] px-7 py-3.5 text-xs font-bold uppercase tracking-[0.32em] text-[color:var(--ink)] transition hover:bg-[color:var(--gold-soft)]"
                  >
                    Shop Frass Kicks <ArrowUpRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/frass-drip"
                    className="lux-press inline-flex items-center gap-2 rounded-sm border border-border/80 bg-background/35 px-7 py-3.5 text-xs uppercase tracking-[0.28em] text-foreground backdrop-blur transition hover:border-[color:var(--gold)] hover:text-[color:var(--gold)]"
                  >
                    Shop Frass Drip
                  </Link>
                  <Link
                    to="/sports-drip"
                    className="lux-press inline-flex items-center gap-2 rounded-sm border border-border/80 bg-background/35 px-7 py-3.5 text-xs uppercase tracking-[0.28em] text-foreground backdrop-blur transition hover:border-[color:var(--gold)] hover:text-[color:var(--gold)]"
                  >
                    Shop Sports Drip
                  </Link>
                  <Link
                    to="/bare-drip"
                    className="lux-press inline-flex items-center gap-2 rounded-sm border border-border/80 bg-background/35 px-7 py-3.5 text-xs uppercase tracking-[0.28em] text-foreground backdrop-blur transition hover:border-[color:var(--gold)] hover:text-[color:var(--gold)]"
                  >
                    Shop Bare Drip
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-sm border border-[color:var(--gold)]/35 bg-background/70 backdrop-blur">
            <div className="px-6 py-3 text-center text-sm font-semibold uppercase tracking-[0.28em] text-[color:var(--gold)]">
              Use code 15FRASS at checkout for your discount
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-6 lg:px-12 mt-20">
        <div className="flex items-end justify-between gap-6 mb-10">
          <div>
            <div className="mb-3 inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
              <span className="h-px w-8 bg-[color:var(--gold)]" />
              Four Worlds
            </div>
            <h2 className="font-display text-5xl md:text-7xl leading-[0.95] text-foreground">
              Choose your lane.
            </h2>
          </div>
          <p className="hidden md:block max-w-sm text-sm text-muted-foreground">
            Each division stays visual, bold, and closer to the editorial streetwear feeling of the original store.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
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
          <CollectionCard
            to="/sports-drip"
            image={cardMen}
            eyebrow="Division 04"
            title="Sports Drip"
            description="Built for performance. Styled for confidence."
          />
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-6 lg:px-12 mt-28">
        <div className="flex items-end justify-between gap-6 mb-10">
          <div>
            <div className="mb-3 inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
              <span className="h-px w-8 bg-[color:var(--gold)]" />
              Best Sellers
            </div>
            <h2 className="font-display text-4xl md:text-6xl leading-[0.95] text-foreground">
              Must-have pieces.
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
        <ProductGrid first={4} emptyHint="Add products in Shopify and they'll appear here automatically." />
      </section>

      <section className="mx-auto max-w-[1600px] px-6 lg:px-12 mt-28">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          <Link
            to="/music-media"
            className="group relative overflow-hidden rounded-[2rem] border border-border/60 bg-gradient-to-br from-secondary/60 via-background to-background p-10 md:p-14 min-h-[420px] flex flex-col justify-between"
          >
            <div className="absolute inset-0 opacity-50" style={{ background: "radial-gradient(70% 80% at 80% 20%, oklch(0.78 0.14 78 / 0.22), transparent 70%)" }} />
            <div className="relative">
              <div className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--gold)]">Frass Hill Sound</div>
              <h2 className="mt-4 font-display text-4xl md:text-6xl leading-[0.92]">
                The music behind the brand.
              </h2>
              <p className="mt-5 max-w-md text-sm md:text-base text-muted-foreground">
                Frass Hill isn't just a wardrobe — it's a sound. Original tracks, mixes and films from the camp soundtrack every drop.
              </p>
            </div>
            <div className="relative inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-foreground group-hover:text-[color:var(--gold)] transition">
              Enter Music &amp; Media <ArrowUpRight className="h-4 w-4" />
            </div>
          </Link>

          <div className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-secondary/40 p-10 md:p-14 min-h-[420px] flex flex-col justify-between">
            <div className="relative">
              <div className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--gold)]">Journal</div>
              <h2 className="mt-4 font-display text-4xl md:text-6xl leading-[0.92]">From the blog.</h2>
              <ul className="mt-8 divide-y divide-border/60">
                {[
                  { tag: "Style", title: "Block letters & chrome: building the Frass identity." },
                  { tag: "Studio", title: "Inside the late-night sessions of Frass Hill." },
                  { tag: "Drop", title: "Behind the lens of the FW lookbook." },
                ].map((post) => (
                  <li key={post.title} className="py-4 flex items-start gap-4 group cursor-pointer">
                    <span className="mt-1 text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)] border border-[color:var(--gold)]/40 px-2 py-1 rounded">
                      {post.tag}
                    </span>
                    <span className="flex-1 font-display text-lg md:text-xl leading-snug group-hover:text-[color:var(--gold)] transition">
                      {post.title}
                    </span>
                    <ArrowUpRight className="h-4 w-4 mt-1 text-muted-foreground group-hover:text-[color:var(--gold)] transition" />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-6 lg:px-12 mt-28">
        <div className="relative overflow-hidden rounded-[2rem] border border-border/60 p-10 md:p-20 bg-secondary/45 backdrop-blur">
          <div
            className="absolute inset-0 opacity-60"
            style={{ background: "radial-gradient(60% 80% at 50% 50%, oklch(0.78 0.14 78 / 0.18), transparent 70%)" }}
          />
          <div className="relative max-w-2xl">
            <div className="mb-4 text-[11px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
              Signature Service
            </div>
            <h2 className="font-display text-4xl md:text-6xl leading-[0.95] text-foreground">
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
