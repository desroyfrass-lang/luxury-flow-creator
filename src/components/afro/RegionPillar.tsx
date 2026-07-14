import { Link } from "@tanstack/react-router";
import type { Region } from "@/data/afro-designers";

export function RegionPillar({ region }: { region: Region }) {
  return (
    <Link
      to="/afro-designers/collections/$slug"
      params={{ slug: region.slug }}
      className="afro-pillar group relative flex h-full flex-col justify-between rounded-3xl p-6"
    >
      <div>
        <p className="text-[10px] uppercase tracking-[0.35em] text-[color:var(--afro-ocean-deep)]">
          {region.tagline}
        </p>
        <h3 className="afro-serif mt-3 text-3xl leading-[1.02] text-[color:var(--afro-ink)]">
          {region.title}
        </h3>
        <p className="mt-3 text-sm text-[color:var(--afro-ink-soft)]">{region.blurb}</p>
      </div>
      <div className="mt-8 flex items-center justify-between">
        <ul className="flex flex-wrap gap-1.5">
          {region.subcategories.slice(0, 3).map((s) => (
            <li
              key={s}
              className="rounded-full border border-[color:var(--afro-chrome)] bg-white/70 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-[color:var(--afro-ink-soft)]"
            >
              {s}
            </li>
          ))}
        </ul>
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full afro-gold-btn text-white shadow transition-transform group-hover:translate-x-0.5">
          →
        </span>
      </div>
    </Link>
  );
}
