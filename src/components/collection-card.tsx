import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

interface CollectionCardProps {
  to: string;
  params?: Record<string, string>;
  image: string;
  eyebrow?: string;
  title: string;
  description?: string;
  ratio?: "tall" | "wide" | "square";
  size?: "lg" | "md";
  children?: ReactNode;
}

const ratioClass: Record<NonNullable<CollectionCardProps["ratio"]>, string> = {
  tall: "aspect-[4/5]",
  wide: "aspect-[16/10]",
  square: "aspect-square",
};

export function CollectionCard({
  to,
  params,
  image,
  eyebrow,
  title,
  description,
  ratio = "tall",
  size = "lg",
}: CollectionCardProps) {
  return (
    <Link
      to={to}
      params={params as never}
      className="lux-card group relative block overflow-hidden rounded-3xl bg-card"
    >
      <div className={`relative w-full overflow-hidden ${ratioClass[ratio]}`}>
        <img
          src={image}
          alt={title}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.06]"
        />
        {/* chrome edge */}
        <div className="absolute inset-0 ring-1 ring-inset ring-white/40 rounded-3xl pointer-events-none" />
        {/* gold sheen on hover */}
        <div className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100 pointer-events-none"
             style={{ background: "linear-gradient(135deg, transparent 40%, oklch(0.92 0.12 85 / 0.18) 50%, transparent 60%)" }}
        />
        {/* gradient mask for legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

        <div className={`absolute inset-x-0 bottom-0 p-6 md:p-${size === "lg" ? "10" : "8"} text-white`}>
          {eyebrow && (
            <div className="mb-3 text-[10px] uppercase tracking-[0.3em] text-white/85">
              <span className="inline-flex items-center gap-2">
                <span className="h-px w-6 bg-[color:var(--gold)]" />
                {eyebrow}
              </span>
            </div>
          )}
          <h3 className={`font-display ${size === "lg" ? "text-4xl md:text-6xl" : "text-3xl md:text-4xl"} leading-[0.95]`}>
            {title}
          </h3>
          {description && (
            <p className="mt-3 max-w-md text-sm md:text-base text-white/85">{description}</p>
          )}
          <div className="mt-5 inline-flex items-center gap-2 text-sm uppercase tracking-[0.25em] text-white">
            <span className="border-b border-[color:var(--gold)] pb-0.5 transition-all group-hover:tracking-[0.32em]">
              Explore
            </span>
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>
      </div>
    </Link>
  );
}
