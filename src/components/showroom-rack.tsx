import { Link } from "@tanstack/react-router";
import type { ShowroomTheme } from "@/lib/showroom-themes";

export interface RackItem {
  /** Collection handle the card opens. */
  handle: string;
  title: string;
  image: string;
}

/**
 * A department-store rack: cards hang from a lit rail, tilt slightly and
 * lift forward on hover. Clicking a card opens the full product grid for
 * that collection.
 */
export function ShowroomRack({
  items,
  theme,
  eyebrow,
}: {
  items: RackItem[];
  theme: ShowroomTheme;
  eyebrow: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-14 sm:gap-x-8 lg:grid-cols-3 lg:gap-x-10 lg:gap-y-20 xl:grid-cols-4">
      {items.map((item) => (
        <Link
          key={item.handle + item.title}
          to="/collection/$handle"
          params={{ handle: item.handle }}
          aria-label={`${item.title} — view all products`}
          className="group relative block pt-8"
        >
          {/* rail + hangers */}
          <div
            className="pointer-events-none absolute inset-x-[-14px] top-0 h-[3px] rounded-full"
            style={{
              background: `linear-gradient(90deg, transparent, ${theme.accent}, transparent)`,
              boxShadow: `0 0 18px -2px ${theme.accent}`,
            }}
          />
          <div className="pointer-events-none absolute left-1/2 top-0 h-8 w-16 -translate-x-1/2">
            <span
              className="absolute left-[22%] top-0 h-8 w-[2px] rounded-full opacity-80"
              style={{ background: theme.accentSoft }}
            />
            <span
              className="absolute right-[22%] top-0 h-8 w-[2px] rounded-full opacity-80"
              style={{ background: theme.accentSoft }}
            />
          </div>

          {/* the garment card */}
          <div
            className="relative overflow-hidden rounded-[14px] border bg-card transition-all duration-500 ease-out group-hover:-translate-y-2 group-hover:rotate-0 rotate-[-0.6deg] group-even:rotate-[0.6deg]"
            style={{
              borderColor: `color-mix(in oklab, ${theme.accent} 35%, transparent)`,
              boxShadow: `0 26px 60px -34px ${theme.accent}`,
            }}
          >
            <div className="relative aspect-[3/4] w-full overflow-hidden">
              <img
                src={item.image}
                alt={`${item.title} rack`}
                loading="lazy"
                className="h-full w-full object-cover brightness-[1.12] saturate-[1.05] transition-transform duration-[1400ms] ease-out group-hover:scale-[1.08]"
              />
              <div
                className="pointer-events-none absolute inset-0 opacity-70 transition-opacity duration-500 group-hover:opacity-100"
                style={{ background: theme.ambient }}
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-[linear-gradient(180deg,transparent,oklch(0.07_0.005_80_/_0.88))]" />

              {/* hanging tag */}
              <div className="absolute inset-x-0 bottom-0 p-4 lg:p-5">
                <span
                  className="block text-[10px] font-semibold uppercase tracking-[0.3em]"
                  style={{ color: theme.accentSoft }}
                >
                  {eyebrow}
                </span>
                <span className="mt-1.5 block font-display uppercase leading-[0.95] tracking-[0.02em] text-[clamp(1.15rem,3.6vw,1.9rem)] text-foreground">
                  {item.title}
                </span>
                <span className="mt-3 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.26em] text-foreground/70 transition-colors group-hover:text-foreground">
                  View all
                  <span
                    className="h-px w-6 transition-all duration-500 group-hover:w-10"
                    style={{ background: theme.accent }}
                  />
                </span>
              </div>
            </div>
          </div>

          {/* floor reflection */}
          <div
            className="pointer-events-none mx-auto mt-2 h-4 w-[78%] rounded-[50%] blur-[6px] opacity-45 transition-opacity duration-500 group-hover:opacity-70"
            style={{ background: `radial-gradient(60% 100% at 50% 0%, ${theme.accent}, transparent 75%)` }}
          />
        </Link>
      ))}
    </div>
  );
}
