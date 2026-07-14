import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { PageHeader } from "@/components/page-header";
import { CollectionCard } from "@/components/collection-card";
import { VIRAL_CATEGORIES } from "@/lib/social-virals";
import { Flame, TrendingUp, Zap } from "lucide-react";

export const Route = createFileRoute("/social-media-virals/")({
  head: () => ({
    meta: [
      { title: "Social Media Virals — TikTok Shop | Frass" },
      { name: "description", content: "The internet's most-wanted — TikTok Shop viral finds across tech, home, beauty, wellness, and pets." },
      { property: "og:title", content: "Social Media Virals — TikTok Shop" },
      { property: "og:description", content: "The viral finds everyone's buying." },
    ],
  }),
  component: SocialViralsIndex,
});

function SocialViralsIndex() {
  const trending = VIRAL_CATEGORIES[0];
  const tiktokMadeMe = trending.subs[0];
  return (
    <SiteShell>
      <PageHeader
        eyebrow="TikTok Shop"
        title="Social Media Virals"
        description="The internet's most-wanted. Curated from your FYP to your cart."
        crumbs={[{ label: "Home", to: "/" }, { label: "Social Media Virals" }]}
      />

      <section className="mx-auto max-w-[1600px] px-6 lg:px-12 pb-14">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Flame, label: "Trending Now", value: "500+ drops" },
            { icon: TrendingUp, label: "Restocked Daily", value: "24/7 fresh" },
            { icon: Zap, label: "Flash Deals", value: "Up to 70% off" },
          ].map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="flex items-center gap-4 rounded-2xl border border-border/70 bg-background/60 backdrop-blur px-5 py-4"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[color:var(--gold)]/10 text-[color:var(--gold)]">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <div className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">{label}</div>
                <div className="font-display text-lg">{value}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {VIRAL_CATEGORIES.map((cat) => (
            <CollectionCard
              key={cat.slug}
              to="/social-media-virals/$category"
              params={{ category: cat.slug }}
              image={cat.image}
              eyebrow={`${cat.emoji} ${cat.subs.length} collections`}
              title={cat.title}
              description={cat.tagline}
              size="md"
              cta="Shop Category"
            />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-6 lg:px-12 mt-24">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--gold)]">🔥 Hot right now</div>
            <h2 className="mt-2 font-display text-3xl md:text-4xl">TikTok Made Me Buy It</h2>
          </div>
          <Link
            to="/social-media-virals/$category/$sub"
            params={{ category: trending.slug, sub: tiktokMadeMe.slug }}
            className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground"
          >
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {tiktokMadeMe.products.slice(0, 4).map((p) => (
            <Link
              key={p.slug}
              to="/social-media-virals/$category/$sub/$product"
              params={{ category: trending.slug, sub: tiktokMadeMe.slug, product: p.slug }}
              className="lux-card group block overflow-hidden rounded-2xl bg-card"
            >
              <div className="aspect-square overflow-hidden bg-muted">
                <img src={p.image} alt={p.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="p-3">
                <div className="text-sm font-medium line-clamp-1">{p.title}</div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-display text-lg tabular-nums">${p.price.toFixed(2)}</span>
                  {p.compareAt && <span className="text-xs text-muted-foreground line-through">${p.compareAt.toFixed(2)}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
