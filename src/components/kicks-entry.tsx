import { Link } from "@tanstack/react-router";
import type { LinkProps } from "@tanstack/react-router";
import kicksWall from "@/assets/kids-shoe-wall.jpg";

/**
 * The footwear entry. Deliberately NOT a store door — Frass Kicks is its own
 * section wherever it appears (Kids, Plus+). A single illuminated banner card
 * that walks you straight up to the wall; the Casual / Classic / Street bays
 * live on the wall itself, each with its own shelf photography.
 */
export function KicksEntry({
  to,
  params,
  eyebrow,
  title,
  description,
  badge,
  image = kicksWall,
}: {
  to: LinkProps["to"];
  params?: Record<string, string>;
  eyebrow: string;
  title: string;
  description: string;
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
