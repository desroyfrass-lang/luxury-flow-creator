import { Link } from "@tanstack/react-router";

export interface LuxCollection {
  handle: string;
  title: string;
  blurb: string;
  image: string;
}

/**
 * An editorial doorway into one room of Frass Luxury House.
 * Restraint over decoration: ivory type, hairline gold rule, slow reveal.
 */
export function LuxuryCollectionCard({ item }: { item: LuxCollection }) {
  return (
    <Link
      to="/collection/$handle"
      params={{ handle: item.handle }}
      className="group block"
      aria-label={`Enter the ${item.title} collection`}
    >
      <div className="relative overflow-hidden rounded-[2px] bg-[oklch(0.16_0.01_70)] shadow-[0_40px_90px_-60px_rgba(0,0,0,0.9)]">
        <div className="relative aspect-[4/5] w-full overflow-hidden">
          <img
            src={item.image}
            alt={item.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-[2000ms] ease-out group-hover:scale-[1.05]"
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(15,12,8,0.72)_100%)]" />
          <div className="pointer-events-none absolute inset-5 opacity-0 ring-1 ring-[color:var(--gold)]/50 transition-opacity duration-700 group-hover:opacity-100" />
        </div>
      </div>
      <div className="pt-6">
        <span className="block h-px w-10 bg-[color:var(--gold)]/70 transition-all duration-700 group-hover:w-20" />
        <h3 className="mt-5 font-display text-[clamp(1.35rem,2.4vw,2rem)] uppercase leading-[1.05] tracking-[0.06em] text-foreground">
          {item.title}
        </h3>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">{item.blurb}</p>
        <span className="mt-6 inline-flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.34em] text-[color:var(--gold)]">
          Enter Collection
          <span className="h-px w-6 bg-[color:var(--gold)] transition-all duration-500 group-hover:w-12" />
        </span>
      </div>
    </Link>
  );
}
