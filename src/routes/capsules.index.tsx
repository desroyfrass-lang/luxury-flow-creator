import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { PageHeader } from "@/components/page-header";
import { fetchPublishedCapsules, type CapsuleRow } from "@/lib/capsules";

export const Route = createFileRoute("/capsules/")({
  head: () => ({
    meta: [
      { title: "Curated Capsules — Frass Kicks" },
      {
        name: "description",
        content:
          "Shop complete, stylist-built outfits from head to toe. Every piece from the FRASS KICKS catalog, curated into one-click looks.",
      },
      { property: "og:title", content: "Curated Capsules — Frass Kicks" },
      {
        property: "og:description",
        content: "One-click complete outfits, styled by FRASS KICKS.",
      },
    ],
  }),
  component: CapsulesLanding,
});

const GENDERS = ["all", "men", "women", "unisex"] as const;
type Gender = (typeof GENDERS)[number];

function CapsulesLanding() {
  const [capsules, setCapsules] = useState<CapsuleRow[] | null>(null);
  const [gender, setGender] = useState<Gender>("all");
  const [style, setStyle] = useState<string>("all");
  const [collection, setCollection] = useState<string>("all");

  useEffect(() => {
    fetchPublishedCapsules().then(setCapsules).catch(() => setCapsules([]));
  }, []);

  const { styles, collections } = useMemo(() => {
    const s = new Set<string>();
    const c = new Set<string>();
    (capsules ?? []).forEach((cap) => {
      if (cap.style) s.add(cap.style);
      if (cap.collection) c.add(cap.collection);
    });
    return { styles: [...s].sort(), collections: [...c].sort() };
  }, [capsules]);

  const filtered = useMemo(() => {
    return (capsules ?? []).filter((c) => {
      if (gender !== "all" && c.gender !== gender) return false;
      if (style !== "all" && c.style !== style) return false;
      if (collection !== "all" && c.collection !== collection) return false;
      return true;
    });
  }, [capsules, gender, style, collection]);

  const grouped = useMemo(() => {
    const g = new Map<string, CapsuleRow[]>();
    for (const c of filtered) {
      const key = c.collection ?? "Featured";
      if (!g.has(key)) g.set(key, []);
      g.get(key)!.push(c);
    }
    return [...g.entries()];
  }, [filtered]);

  return (
    <SiteShell>
      <PageHeader
        eyebrow="Stylist Studio"
        title="Curated Capsules"
        description="Complete, one-click looks — every piece hand-picked from the Frass Kicks catalog and styled to feel like it walked out of a private closet."
        crumbs={[{ label: "Home", to: "/" }, { label: "Capsules" }]}
      />

      {/* Filter bar */}
      <section className="mx-auto max-w-[1600px] px-6 lg:px-12">
        <div className="flex flex-wrap items-center gap-3 border-y border-border/60 py-4">
          <FilterGroup label="Gender" value={gender} onChange={(v) => setGender(v as Gender)} options={[...GENDERS]} />
          {styles.length > 0 && (
            <FilterGroup label="Style" value={style} onChange={setStyle} options={["all", ...styles]} />
          )}
          {collections.length > 0 && (
            <FilterGroup label="Collection" value={collection} onChange={setCollection} options={["all", ...collections]} />
          )}
        </div>
      </section>

      {/* Grid */}
      <section className="mx-auto max-w-[1600px] px-6 lg:px-12 py-14">
        {capsules === null ? (
          <div className="flex items-center justify-center py-24 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-20">
            {grouped.map(([groupName, list]) => (
              <div key={groupName}>
                <div className="mb-8 flex items-end justify-between gap-6">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--gold)]">Capsule collection</div>
                    <h2 className="mt-2 font-display text-3xl md:text-4xl">{groupName}</h2>
                  </div>
                  <span className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                    {list.length} look{list.length === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                  {list.map((c) => <CapsuleCard key={c.id} capsule={c} />)}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </SiteShell>
  );
}

function FilterGroup({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{label}</span>
      <div className="flex flex-wrap gap-1">
        {options.map((o) => (
          <button
            key={o}
            onClick={() => onChange(o)}
            className={`px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] rounded-full transition ${
              value === o
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground border border-border"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function CapsuleCard({ capsule }: { capsule: CapsuleRow }) {
  return (
    <Link
      to="/capsules/$handle"
      params={{ handle: capsule.handle }}
      className="lux-card group relative block overflow-hidden rounded-3xl bg-card"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        {capsule.hero_image ? (
          <img
            src={capsule.hero_image}
            alt={capsule.name}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="absolute inset-0 chrome-surface" />
        )}
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        {capsule.bundle_discount_pct > 0 && (
          <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-[color:var(--gold)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[color:var(--ink)]">
            <Sparkles className="h-3 w-3" /> Save {capsule.bundle_discount_pct}%
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
          <div className="text-[10px] uppercase tracking-[0.3em] opacity-80">
            {[capsule.style, capsule.occasion].filter(Boolean).join(" · ") || "Complete look"}
          </div>
          <h3 className="mt-1 font-display text-2xl leading-tight">{capsule.name}</h3>
          {capsule.description && (
            <p className="mt-1 text-xs opacity-80 line-clamp-2">{capsule.description}</p>
          )}
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/30 backdrop-blur px-4 py-1.5 text-[10px] uppercase tracking-[0.25em]">
            View capsule →
          </div>
        </div>
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-background/60 backdrop-blur p-16 text-center">
      <h3 className="font-display text-3xl">No capsules yet</h3>
      <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto">
        Our stylists are curating the first drops. Check back soon, or head to the admin to build one.
      </p>
    </div>
  );
}
