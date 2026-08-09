type CinematicMediaHeroProps = {
  image: string;
  alt: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  focus?: "founder" | "mural" | "wide";
  children?: React.ReactNode;
};

/** A wide, sticky B-roll header. The page rises over it as the visitor scrolls. */
export function CinematicMediaHero({
  image,
  alt,
  eyebrow,
  title,
  subtitle,
  focus = "mural",
  children,
}: CinematicMediaHeroProps) {
  return (
    <section className={`media-hero-stage${focus === "wide" ? " media-hero-stage-wide" : ""}`} aria-labelledby="media-hero-title">
      <div className={`media-hero-sticky${focus === "wide" ? " media-hero-sticky-wide" : ""}`}>
        <img
          src={image}
          alt={alt}
          width={1600}
          height={900}
          fetchPriority="high"
          className={`media-hero-image media-${focus}-focus`}
        />
        <div className="media-hero-fade" aria-hidden="true" />
        <div className="media-hero-copy">
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-gold-soft">{eyebrow}</p>
          <h1 id="media-hero-title" className="mt-3 max-w-5xl font-display text-5xl uppercase leading-none text-foreground sm:text-7xl lg:text-8xl">
            {title}
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-foreground/70 sm:text-base">{subtitle}</p>
          {children ? <div className="mt-7 flex flex-wrap gap-3">{children}</div> : null}
        </div>
      </div>
    </section>
  );
}