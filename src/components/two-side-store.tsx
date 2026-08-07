import { Link } from "@tanstack/react-router";

export interface StoreSide {
  to: string;
  params?: Record<string, string>;
  image: string;
  eyebrow: string;
  title: string;
  description: string;
  /** Neon accent for this half of the store. */
  accent: string;
}

/**
 * A store split down the middle: two rooms, two lighting schemes.
 * Used by Bare Drip — lingerie/underwear on one side, swimwear on the other.
 */
export function TwoSideStore({ sides }: { sides: readonly StoreSide[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 md:gap-0">
      {sides.map((side) => (
        <Link
          key={side.to + side.title}
          to={side.to}
          params={side.params as never}
          className="group relative block overflow-hidden rounded-2xl md:rounded-none md:first:rounded-l-2xl md:last:rounded-r-2xl"
        >
          <div className="relative h-[520px] w-full overflow-hidden md:h-[680px]">
            <img
              src={side.image}
              alt={side.title}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1600ms] ease-out group-hover:scale-[1.07]"
            />
            {/* room lighting */}
            <div
              className="pointer-events-none absolute inset-0 opacity-70 transition-opacity duration-500 group-hover:opacity-95"
              style={{ background: `radial-gradient(120% 70% at 50% 0%, ${side.accent}, transparent 70%)` }}
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-[linear-gradient(180deg,transparent,oklch(0.07_0.005_80_/_0.9))]" />
            {/* neon door frame */}
            <div
              className="pointer-events-none absolute inset-4 rounded-xl opacity-70 transition-opacity duration-500 group-hover:opacity-100"
              style={{ boxShadow: `inset 0 0 0 1.5px ${side.accent}, 0 0 46px -8px ${side.accent}` }}
            />

            <div className="absolute inset-x-0 bottom-0 p-8 lg:p-12">
              <span
                className="text-[10px] font-semibold uppercase tracking-[0.34em]"
                style={{ color: side.accent }}
              >
                {side.eyebrow}
              </span>
              <h3 className="mt-3 font-display text-3xl uppercase leading-[0.92] text-foreground md:text-5xl">
                {side.title}
              </h3>
              <p className="mt-3 max-w-sm text-sm text-foreground/75">{side.description}</p>
              <span
                className="mt-6 inline-flex items-center gap-3 rounded-full border px-6 py-3 text-[10px] font-bold uppercase tracking-[0.3em] transition group-hover:bg-foreground/10"
                style={{ borderColor: side.accent, color: side.accent }}
              >
                Enter Room
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
