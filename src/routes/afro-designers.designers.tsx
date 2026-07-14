import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { DESIGNERS, REGIONS, type RegionSlug } from "@/data/afro-designers";
import { DesignerCard } from "@/components/afro/DesignerCard";
import { FrassyGold } from "@/components/afro/FrassyGold";

export const Route = createFileRoute("/afro-designers/designers")({
  head: () => ({
    meta: [
      { title: "All Designers — Afro Designers | Frass Kicks" },
      {
        name: "description",
        content:
          "Browse every studio on Afro Designers — African, African American, Caribbean, Jamaican, and diaspora labels curated in one place.",
      },
      { property: "og:title", content: "All Designers — Afro Designers" },
      {
        property: "og:description",
        content: "Every studio in the Afro Designers marketplace.",
      },
    ],
  }),
  component: DesignersIndex,
});

function DesignersIndex() {
  const [filter, setFilter] = useState<RegionSlug | "all">("all");
  const list =
    filter === "all" ? DESIGNERS : DESIGNERS.filter((d) => d.region === filter);

  return (
    <div className="mx-auto max-w-[1400px] px-6 lg:px-12 pt-16 pb-24">
      <div className="flex flex-col items-start gap-6">
        <Link
          to="/afro-designers"
          className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--afro-ocean-deep)] hover:text-[color:var(--afro-gold)]"
        >
          ← Back to Afro Designers
        </Link>
        <div className="flex items-center gap-4">
          <FrassyGold className="h-14 w-14" />
          <div>
            <p className="text-[11px] uppercase tracking-[0.4em] afro-gold-text">
              The Directory
            </p>
            <h1 className="afro-serif text-5xl md:text-6xl leading-[0.98] text-[color:var(--afro-ink)]">
              All Designers
            </h1>
          </div>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap gap-2">
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
          All
        </FilterChip>
        {REGIONS.map((r) => (
          <FilterChip
            key={r.slug}
            active={filter === r.slug}
            onClick={() => setFilter(r.slug)}
          >
            {r.title}
          </FilterChip>
        ))}
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {list.map((d) => (
          <DesignerCard key={d.slug} designer={d} />
        ))}
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.3em] transition ${
        active
          ? "afro-gold-btn text-white shadow"
          : "border border-[color:var(--afro-chrome)] bg-white/70 text-[color:var(--afro-ink-soft)] hover:border-[color:var(--afro-gold)]"
      }`}
    >
      {children}
    </button>
  );
}
