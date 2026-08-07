import { Link } from "@tanstack/react-router";
import { useSiteImageUrl } from "@/hooks/use-site-images";

interface StorePortalCardProps {
  to: string;
  params?: Record<string, string>;
  image: string;
  /** Optional site_images slot key for live-editable imagery. */
  slot?: string;
  /** Department name shown on the marquee sign, e.g. "Work Drip". */
  title: string;
  description?: string;
  /** Small plate above the sign, e.g. "Department 01". */
  eyebrow?: string;
  cta?: string;
}

/**
 * A storefront portal: marquee sign, glass double doors that part on hover,
 * lit showroom interior and a polished floor reflection. Used on the
 * department-store floor pages (Frass Drip for Men / Women).
 */
export function StorePortalCard({
  to,
  params,
  image,
  slot,
  title,
  description,
  eyebrow,
  cta = "Enter Showroom",
}: StorePortalCardProps) {
  const resolved = useSiteImageUrl(slot ?? "__none__", image);
  const src = slot ? resolved : image;

  return (
    <Link
      to={to}
      params={params as never}
      aria-label={`${title} — ${cta}`}
      className="group relative block"
    >
      {/* marquee sign above the doorway */}
      <div className="relative z-20 mx-auto -mb-3 w-[92%]">
        <div className="rounded-t-xl border border-[color:var(--gold)]/50 bg-[linear-gradient(180deg,oklch(0.18_0.01_80),oklch(0.10_0.008_80))] px-5 py-5 text-center shadow-[0_18px_40px_-24px_oklch(0.92_0.12_85_/_0.7)] md:py-6">
          {eyebrow && (
            <span className="block text-[12px] font-semibold uppercase tracking-[0.34em] text-foreground/65 md:text-[13px]">
              {eyebrow}
            </span>
          )}
          <span className="mt-2 block font-display uppercase leading-[0.95] tracking-[0.03em] text-[clamp(1.7rem,6.5vw,2.9rem)] text-[color:var(--gold-soft,#f0d78c)] title-glow">
            {title}
          </span>
        </div>

        {/* sign under-glow spilling onto the doorway */}
        <div className="pointer-events-none mx-auto h-6 w-[70%] bg-[radial-gradient(60%_100%_at_50%_0%,oklch(0.92_0.12_85_/_0.30),transparent_75%)] opacity-70 transition-opacity duration-700 group-hover:opacity-100" />
      </div>

      {/* the doorway */}
      <div className="lux-card relative overflow-hidden rounded-2xl border border-[color:var(--gold)]/25 bg-card">
        <div className="relative h-[460px] w-full overflow-hidden md:h-[560px]">
          {/* lit interior */}
          <img
            src={src}
            alt={`${title} showroom interior`}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover brightness-[1.12] saturate-[1.05] transition-transform duration-[1600ms] ease-out group-hover:scale-[1.07]"
          />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_60%_at_50%_20%,oklch(0.95_0.06_85_/_0.16)_0%,transparent_70%)]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-[linear-gradient(180deg,transparent,oklch(0.07_0.005_80_/_0.78))]" />

          {/* glass double doors */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-y-0 left-0 w-1/2 border-r border-[color:var(--gold)]/30 bg-[linear-gradient(105deg,oklch(0.14_0.01_80_/_0.72),oklch(0.20_0.01_80_/_0.34))] backdrop-blur-[2px] transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-x-full">
              <span className="absolute right-3 top-1/2 h-16 w-[3px] -translate-y-1/2 rounded-full bg-[color:var(--gold)]/70" />
              <span className="absolute inset-y-6 left-6 w-px bg-[color:var(--gold)]/20" />
            </div>
            <div className="absolute inset-y-0 right-0 w-1/2 bg-[linear-gradient(255deg,oklch(0.14_0.01_80_/_0.72),oklch(0.20_0.01_80_/_0.34))] backdrop-blur-[2px] transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-full">
              <span className="absolute left-3 top-1/2 h-16 w-[3px] -translate-y-1/2 rounded-full bg-[color:var(--gold)]/70" />
              <span className="absolute inset-y-6 right-6 w-px bg-[color:var(--gold)]/20" />
            </div>
          </div>

          {/* gold frame */}
          <div className="pointer-events-none absolute inset-3 rounded-xl ring-1 ring-[color:var(--gold)]/25" />

          {/* threshold plate */}
          <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
            {description && (
              <p className="max-w-sm font-script text-sm italic text-foreground/85 md:text-base">
                {description}
              </p>
            )}
            <span className="lux-press mt-5 inline-flex items-center justify-center rounded-sm border border-[color:var(--gold)] px-7 py-3 text-[10px] font-bold uppercase tracking-[0.32em] text-[color:var(--gold)] transition group-hover:bg-[color:var(--gold)] group-hover:text-[color:var(--ink)]">
              {cta}
            </span>
          </div>
        </div>
      </div>

      {/* polished floor reflection */}
      <div className="pointer-events-none mx-auto h-16 w-[92%] rounded-b-3xl bg-[linear-gradient(180deg,oklch(0.92_0.12_85_/_0.14),transparent_80%)] opacity-60 blur-[2px] transition-opacity duration-700 group-hover:opacity-100" />
    </Link>
  );
}
