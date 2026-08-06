import { createFileRoute, Link } from "@tanstack/react-router";
import { GatewayNav } from "@/components/gateway-nav";
import marketStreet from "@/assets/district-kicks.jpg";

export const Route = createFileRoute("/shop-frass")({
  head: () => ({
    meta: [
      { title: "Shop Frass — FrassKicks Marketplace & Department Store" },
      {
        name: "description",
        content:
          "Footwear and limited drops, apparel and streetwear, music and audio, digital goods. The FrassKicks commercial marketplace.",
      },
      { property: "og:title", content: "Shop Frass — FrassKicks Marketplace" },
      {
        property: "og:description",
        content: "Signature footwear, limited drops, Frass Drip apparel, independent music and creator assets.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ShopFrassPage,
});

const DEPARTMENTS = [
  {
    title: "Footwear & Drops",
    copy: "Frass Kicks flagship footwear and limited releases.",
    to: "/frass-kicks",
    accent: "var(--gold)",
  },
  {
    title: "Apparel & Streetwear",
    copy: "Frass Drip, Bare Drip, Party Drip, Sports Drip, Denim Drip, New Looks.",
    to: "/frass-drip",
    accent: "var(--chrome)",
  },
  {
    title: "Music & Audio",
    copy: "Independent artist drops, stems, and audio packs.",
    to: "/music-media",
    accent: "var(--hill-gold)",
  },
  {
    title: "Digital Goods & Templates",
    copy: "Creator assets, workflows, and templates.",
    to: "/capsules",
    accent: "var(--kids-turquoise)",
  },
];

function ShopFrassPage() {
  return (
    <div className="min-h-screen bg-background">
      <GatewayNav mode="shop" />

      <section className="relative h-[62vh] min-h-[420px] overflow-hidden">
        <img
          src={marketStreet}
          alt="Lush Jamaican street opening into a sunlit retail boulevard of boutique storefronts"
          width={1280}
          height={960}
          className="gateway-drift h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/40" />
        <div className="absolute inset-0 mx-auto flex max-w-[1600px] flex-col justify-end px-6 pb-12 lg:px-10">
          <span className="text-[10px] uppercase tracking-[0.35em] text-white/70">
            The FrassKicks Marketplace
          </span>
          <h1 className="gateway-rise mt-3 max-w-3xl font-display text-4xl uppercase leading-[0.95] text-white md:text-7xl">
            Signature Footwear & Limited Drops
          </h1>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/frass-kicks"
              className="rounded-full bg-white px-6 py-3 text-[10px] font-bold uppercase tracking-[0.28em] text-black transition hover:scale-[1.03]"
            >
              Shop the drop
            </Link>
            <Link
              to="/frass-world"
              className="rounded-full border border-white/60 px-6 py-3 text-[10px] font-bold uppercase tracking-[0.28em] text-white transition hover:bg-white/10"
            >
              🌍 Explore Frass World
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-6 py-16 lg:px-10">
        <h2 className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
          Department store
        </h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {DEPARTMENTS.map((d) => (
            <Link
              key={d.title}
              to={d.to}
              aria-label={`${d.title} — ${d.copy}`}
              className="group relative overflow-hidden rounded-3xl border border-border bg-card p-6 transition duration-300 hover:-translate-y-1.5 hover:border-[color:var(--gold)]"
            >
              <span
                className="block h-1 w-12 rounded-full"
                style={{ background: `var(--${""}${d.accent.replace("var(--", "").replace(")", "")})` }}
              />
              <h3 className="mt-5 font-display text-2xl uppercase leading-none">{d.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{d.copy}</p>
              <span className="mt-6 inline-block text-[10px] uppercase tracking-[0.28em] text-muted-foreground transition group-hover:text-[color:var(--gold)]">
                Enter →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <footer className="border-t border-border/60 bg-card/40">
        <div className="mx-auto grid max-w-[1600px] gap-4 px-6 py-8 text-[10px] uppercase tracking-[0.22em] text-muted-foreground sm:grid-cols-2 lg:grid-cols-4 lg:px-10">
          <span className="text-[color:var(--gold)]">★ FrassKicks Quality Guarantee</span>
          <span>Batch dispatch · Sunday & Monday</span>
          <span>14-day return policy</span>
          <span>Landed-cost checkout — no surprise duties</span>
        </div>
      </footer>
    </div>
  );
}
