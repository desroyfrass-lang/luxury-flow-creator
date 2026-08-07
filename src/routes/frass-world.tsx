import { createFileRoute, Link } from "@tanstack/react-router";
import { GatewayNav } from "@/components/gateway-nav";
import kicksImg from "@/assets/district-kicks.jpg";
import kicksCinematic from "@/assets/frasskicks-cinematic.mp4.asset.json";
import hillImg from "@/assets/district-hill.jpg";
import luxuryImg from "@/assets/district-luxury.jpg";
import kidsImg from "@/assets/district-kids.jpg";

export const Route = createFileRoute("/frass-world")({
  head: () => ({
    meta: [
      { title: "Explore Frass World — The Living Ecosystem Map" },
      {
        name: "description",
        content:
          "Enter FrassKicks District, Frass Hill, Frass Luxury House and Kids Valley — the four entrances of the Frass ecosystem.",
      },
      { property: "og:title", content: "Explore Frass World" },
      {
        property: "og:description",
        content: "Four district entrances: FrassKicks, Frass Hill, Luxury House and Kids Valley.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FrassWorldPage,
});

function FrassWorldPage() {
  return (
    <div className="min-h-screen bg-background">
      <GatewayNav mode="world" />

      <section className="mx-auto max-w-[1600px] px-6 pt-12 lg:px-10">
        <span className="text-[10px] uppercase tracking-[0.35em] text-[color:var(--hill-gold)]">
          The living ecosystem map
        </span>
        <h1 className="mt-3 font-display text-4xl uppercase leading-[0.95] md:text-7xl">
          Choose your entrance.
        </h1>
        <p className="mt-4 max-w-xl text-sm text-muted-foreground">
          Four districts. One world. Every door opens onto people first.
        </p>
      </section>

      <div className="mx-auto grid max-w-[1600px] gap-6 px-6 py-12 lg:grid-cols-2 lg:px-10">
        <District
          id="kicks"
          image={kicksImg}
          video={kicksCinematic.url}
          alt="Street-fashion boulevard lined with gold-trimmed doorways: men's kicks, women's kicks and Bare Drip entrances"
          emoji="🌲"
          title="FrassKicks District"
          copy="Walk the boulevard. Kicks for men on the left, kicks for women beside it, Bare Drip across the way — pick your door."
          meta="Retail marketplace & department store · the fashion promenade"
          to="/shop-frass"
          accent="var(--gold)"
          portals={[
            { label: "🚪 Enter the District", to: "/shop-frass" },
            { label: "🚪 Kicks — Men", to: "/frass-kicks/men" },
            { label: "🚪 Kicks — Women", to: "/frass-kicks/women" },
            { label: "🚪 Bare Drip", to: "/bare-drip" },
          ]}
        />
        <District
          id="hill"
          image={hillImg}
          alt="Hill path past an outdoor cafe, a domino game in the shade and an acoustic guitarist"
          emoji="🏛️"
          title="Frass Hill"
          copy="Up the hill path — the café, the domino table, the guitar under the lantern light."
          meta="Community Square · For Us · Workspaces · Opportunity · Foundation · Vault"
          to="/welcome-hall"
          accent="var(--hill-gold)"
          badge="Builder HQ live"
        />
        <District
          id="luxury"
          image={luxuryImg}
          alt="Colossal oceanfront mansion with a gold and chrome drive-through and a crystal ice-sculpture waterfall fountain"
          emoji="🌸"
          title="Frass Luxury House"
          copy="One house on the ocean. Through the gates, around the drive, past the ice-sculpture waterfall — gold and chrome all the way to the doors."
          meta="Bespoke apparel · high-end footwear · leather goods"
          to="/capsules"
          accent="var(--luxe-linen)"
          portals={[
            { label: "Men's Luxury Entrance", to: "/frass-drip/men" },
            { label: "Women's Luxury Entrance", to: "/frass-drip/women" },
          ]}
        />
        <District
          id="kids"
          image={kidsImg}
          alt="Bright valley full of children playing, biking, kites, balloons and colourful painted houses"
          emoji="🧒"
          title="Kids Valley"
          copy="Down into the colour — kites, bubbles, bikes, ice-cream carts and the whole valley playing."
          meta="Kids World — a district of Frass Hill · and the children's boutique"
          to="/kids-world"
          accent="var(--kids-coral)"
          badge="Kids World live"
          portals={[
            { label: "🌈 Enter Kids World", to: "/kids-world" },
            { label: "🧸 Shop Kids", to: "/frass-kids" },
          ]}
        />

      </div>

      <section className="mx-auto max-w-[1600px] px-6 pb-24 lg:px-10">
        <h2 className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
          Kids World — by age group
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { slug: "0-3", age: "Ages 0–3", copy: "Sensory play & early discovery.", color: "var(--kids-coral)" },
            { slug: "3-6", age: "Ages 3–6", copy: "Storytelling, imagination & basic concepts.", color: "var(--kids-turquoise)" },
            { slug: "6-12", age: "Ages 6–12", copy: "Creative projects & interactive games.", color: "var(--kids-sun)" },
            { slug: "12-plus", age: "Ages 12+", copy: "Leadership, youth entrepreneurship, financial literacy & Builder thinking.", color: "var(--hill-gold)" },
          ].map((a) => (
            <Link
              key={a.age}
              to="/kids-world/$age"
              params={{ age: a.slug }}
              className="rounded-3xl border border-border bg-card p-6 transition hover:-translate-y-1"
            >
              <span className="block h-1 w-10 rounded-full" style={{ background: a.color }} />
              <h3 className="mt-4 font-display text-xl uppercase">{a.age}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{a.copy}</p>
            </Link>
          ))}
        </div>

      </section>
    </div>
  );
}

function District({
  id,
  image,
  video,
  alt,
  emoji,
  title,
  copy,
  meta,
  to,
  accent,
  badge,
  portals,
}: {
  id: string;
  image: string;
  video?: string;
  alt: string;
  emoji: string;
  title: string;
  copy: string;
  meta: string;
  to: string;
  accent: string;
  badge?: string;
  portals?: { label: string; to: string }[];
}) {
  return (
    <article
      id={id}
      className="group relative overflow-hidden rounded-[2rem] border border-border bg-card transition duration-500 hover:-translate-y-1.5"
      style={{ boxShadow: `0 30px 90px -50px ${accent}` }}
    >
      <Link to={to} aria-label={`${title} — ${meta}`} className="block">
        <div className="relative h-64 overflow-hidden md:h-80">
          {video ? (
            <video
              src={video}
              poster={image}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              aria-label={alt}
              className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out will-change-transform group-hover:scale-105"
            />
          ) : (
            <img
              src={image}
              alt={alt}
              loading="lazy"
              width={1280}
              height={960}
              className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out will-change-transform group-hover:scale-105"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
          {badge && (
            <span
              className="absolute right-4 top-4 rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-[0.22em] text-black"
              style={{ background: accent }}
            >
              {badge}
            </span>
          )}
          <div className="absolute inset-x-0 bottom-0 p-6">
            <span className="text-2xl">{emoji}</span>
            <h2 className="mt-1 font-display text-3xl uppercase leading-none text-white md:text-4xl">
              {title}
            </h2>
            <p className="mt-2 max-w-md text-sm text-white/75">{copy}</p>
          </div>
        </div>
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-5">
        <span className="min-w-0 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          {meta}
        </span>
        <div className="flex shrink-0 flex-wrap gap-2">
          {(portals ?? [{ label: "Enter", to }]).map((p) => (
            <Link
              key={p.label}
              to={p.to}
              className="rounded-full border px-4 py-2 text-[10px] font-bold uppercase tracking-[0.22em] transition hover:bg-foreground/5"
              style={{ borderColor: accent, color: accent }}
            >
              {p.label}
            </Link>
          ))}
        </div>
      </div>
    </article>
  );
}
