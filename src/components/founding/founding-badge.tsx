import { FOUNDING_BADGE, foundingTitle } from "@/lib/founding";

/**
 * FRASS-0490 — the one First Partner mark. Every surface renders this exact
 * component; there is no second badge design anywhere in Frass.
 */
export function FoundingBadge({
  sequence,
  size = "md",
  className = "",
}: {
  sequence?: number | null;
  size?: "sm" | "md";
  className?: string;
}) {
  const label = foundingTitle(sequence);
  return (
    <span
      title="First Partner — honorary lifetime recognition. It grants no extra permissions."
      className={[
        "inline-flex items-center gap-2 rounded-full border border-[color:var(--gold)]/50",
        "bg-[color:var(--gold)]/10 font-medium uppercase tracking-[0.18em] text-[color:var(--gold)]",
        size === "sm" ? "px-2.5 py-1 text-[10px]" : "px-3 py-1.5 text-[11px]",
        className,
      ].join(" ")}
    >
      <span aria-hidden>{FOUNDING_BADGE.glyph}</span>
      {label}
    </span>
  );
}
