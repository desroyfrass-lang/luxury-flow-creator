import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useSiteImageUrl } from "@/hooks/use-site-images";

interface CollectionCardProps {
  to: string;
  params?: Record<string, string>;
  image: string;
  /** Optional override slot key; when set, looks up `site_images` for live-editable image. */
  slot?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  /** kept for backwards-compat; no longer drives layout */
  ratio?: "tall" | "wide" | "square";
  size?: "lg" | "md";
  cta?: string;
  children?: ReactNode;
}

const heightClass: Record<NonNullable<CollectionCardProps["size"]>, string> = {
  // 500-600px range, responsive
  lg: "h-[560px] md:h-[600px]",
  md: "h-[500px] md:h-[540px]",
};

export function CollectionCard({
  to,
  params,
  image,
  slot,
  title,
  description,
  size = "lg",
  cta = "Shop Now",
}: CollectionCardProps) {
  const resolvedSrc = useSiteImageUrl(slot ?? "__none__", image);
  const src = slot ? resolvedSrc : image;
  return (
    <Link
      to={to}
      params={params as never}
      className="lux-card group relative block overflow-hidden rounded-2xl bg-card"
    >
      <div className={`relative w-full overflow-hidden rounded-2xl ${heightClass[size]}`}>
        <img
          src={src}
          alt={title}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-contain transition-transform duration-[1400ms] ease-out group-hover:scale-[1.04]"
        />
        {/* dark cinematic wash so the title pops like the reference */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,oklch(0.07_0.005_80_/_0.45)_0%,oklch(0.07_0.005_80_/_0.55)_45%,oklch(0.07_0.005_80_/_0.85)_100%)]" />
        {/* gold sheen on hover */}
        <div
          className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100 pointer-events-none"
          style={{
            background:
              "linear-gradient(135deg, transparent 40%, oklch(0.92 0.12 85 / 0.16) 50%, transparent 60%)",
          }}
        />
        {/* gold inset border to echo the reference frame */}
        <div className="absolute inset-3 ring-1 ring-[color:var(--gold)]/25 rounded-xl pointer-events-none" />

        <div className="absolute inset-x-0 bottom-0 p-8 md:p-10 text-foreground">
          <h3
            className="font-display uppercase text-[clamp(1.5rem,4.2vw,3.25rem)] leading-[0.95] tracking-[0.01em] text-[color:var(--gold-soft,#f0d78c)] [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical] overflow-hidden text-balance"
            style={{
              textShadow:
                "0 0 18px oklch(0.92 0.12 85 / 0.55), 0 0 38px oklch(0.92 0.12 85 / 0.25), 0 2px 0 oklch(0 0 0 / 0.55)",
            }}
          >
            {title}
          </h3>
          {description && (
            <p className="mt-4 max-w-md text-sm md:text-base italic font-script text-foreground/90">
              {description}
            </p>
          )}
          <span className="lux-press mt-6 inline-flex items-center justify-center rounded-sm border border-[color:var(--gold)] bg-transparent px-7 py-3 text-[11px] font-bold uppercase tracking-[0.32em] text-[color:var(--gold)] transition group-hover:bg-[color:var(--gold)] group-hover:text-[color:var(--ink)]">
            {cta}
          </span>
        </div>
      </div>
    </Link>
  );
}
