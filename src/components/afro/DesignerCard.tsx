import { Link } from "@tanstack/react-router";
import type { Designer } from "@/data/afro-designers";

export function DesignerCard({ designer }: { designer: Designer }) {
  return (
    <Link
      to="/afro-designers/designers/$slug"
      params={{ slug: designer.slug }}
      className="afro-card group block overflow-hidden rounded-3xl"
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={designer.image}
          alt={`${designer.name} — ${designer.tagline}`}
          loading="lazy"
          width={1024}
          height={1024}
          className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.06]"
        />
        <div className="afro-card-shine pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100" />
        <span className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-[color:var(--afro-ink)] shadow-sm">
          <span className="mr-1">{designer.flag}</span>
          {designer.country}
        </span>
      </div>
      <div className="p-5">
        <h3 className="afro-serif text-2xl leading-tight text-[color:var(--afro-ink)]">
          {designer.name}
        </h3>
        <p className="mt-1 text-xs uppercase tracking-[0.25em] text-[color:var(--afro-ocean-deep)]">
          {designer.studio}
        </p>
        <p className="mt-3 text-sm text-[color:var(--afro-ink-soft)]">{designer.tagline}</p>
        <div className="mt-5 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] afro-gold-text">
          Shop the studio
          <span aria-hidden>→</span>
        </div>
      </div>
    </Link>
  );
}
