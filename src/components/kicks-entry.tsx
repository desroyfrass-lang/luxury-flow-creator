import { Link } from "@tanstack/react-router";
import type { LinkProps } from "@tanstack/react-router";
import kicksWall from "@/assets/kids-shoe-wall.jpg";

/**
 * The footwear entry. Deliberately NOT a store door — Frass Kicks is its own
 * section wherever it appears (Kids, Plus+). Instead of parting doors you step
 * up to an illuminated shoe wall: three lit bays behind glass.
 */
export function KicksEntry({
  to,
  params,
  eyebrow,
  title,
  description,
  bays = ["Casual", "Classic", "Street"],
  badge,
  image = kicksWall,
}: {
  to: LinkProps["to"];
  params?: Record<string, string>;
  eyebrow: string;
  title: string;
  description: string;
  bays?: string[];
  badge?: React.ReactNode;
  image?: string;
}) {
  return (
    <Link
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      to={to as any}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      params={params as any}
      className="group relative block overflow-hidden rounded-[2rem] border border-[color:var(--gold)]/35 bg-[color-mix(in_oklab,var(--foreground)_5%,transparent)] transition duration-700 hover:border-[color:var(--gold)]"
    >
      <div className="relative h-[300px] w-full overflow-hidden md:h-[420px]">
        <img
          src={image}
          alt=""
          aria-hidden
          loading="lazy"
          width={1920}
          height={1024}
          className="h-full w-full object-cover transition-transform duration-[1600ms] ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,oklch(0.08_0.01_60/0.95),oklch(0.08_0.01_60/0.45)_60%)]" />

        {/* three lit glass bays — the shoe wall signature */}
        <div className="absolute inset-x-5 top-6 grid grid-cols-3 gap-3 md:inset-x-10 md:top-10 md:gap-6">
          {bays.map((bay) => (
            <div
              key={bay}
              className="relative rounded-xl border border-[color:var(--gold)]/40 bg-[oklch(0.08_0.01_60/0.35)] px-2 py-3 text-center backdrop-blur-[2px] transition duration-700 group-hover:border-[color:var(--gold)] md:px-4 md:py-5"
            >
              <div className="pointer-events-none absolute inset-x-3 -top-1 h-4 rounded-full bg-[color:var(--gold)]/40 blur-lg transition group-hover:bg-[color:var(--gold)]/70" />
              <span className="font-display text-[11px] uppercase tracking-[0.22em] text-[color:var(--gold)] md:text-base md:tracking-[0.3em]">
                {bay}
              </span>
              <div className="mx-auto mt-2 h-px w-6 bg-[color:var(--gold)]/60 md:w-12" />
            </div>
          ))}
        </div>

        {badge ? <div className="absolute right-5 top-5">{badge}</div> : null}

        <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
          <span className="text-[10px] uppercase tracking-[0.4em] text-[color:var(--gold)]">
            {eyebrow}
          </span>
          <h3 className="mt-3 font-display text-3xl uppercase leading-none text-[color:var(--luxe-linen,#f6f1e7)] md:text-5xl">
            {title}
          </h3>
          <p className="mt-3 max-w-xl text-xs text-[color:var(--luxe-linen,#f6f1e7)]/75 md:text-sm">
            {description}
          </p>
          <span className="mt-5 inline-flex items-center gap-2 rounded-full border border-[color:var(--gold)]/60 px-5 py-2 text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)] transition group-hover:bg-[color:var(--gold)] group-hover:text-[oklch(0.12_0.01_60)]">
            Step to the wall
          </span>
        </div>
      </div>
    </Link>
  );
}
