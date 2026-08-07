import { cn } from "@/lib/utils";

/**
 * The permanent Plus+ designation. The standard collection name always stays
 * dominant — this badge is the only thing that marks extended sizing.
 */
export function PlusBadge({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = {
    sm: "px-1.5 py-0.5 text-[9px] tracking-[0.18em]",
    md: "px-2 py-0.5 text-[10px] tracking-[0.2em]",
    lg: "px-3 py-1 text-xs tracking-[0.22em]",
  } as const;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-[color:var(--gold)]/70 bg-[linear-gradient(120deg,color-mix(in_oklab,var(--gold)_28%,transparent),transparent)] font-bold uppercase text-[color:var(--gold)] align-middle",
        sizes[size],
        className,
      )}
    >
      Plus+
    </span>
  );
}

/** Standard collection name followed by the gold Plus+ badge. */
export function PlusTitle({
  name,
  size = "md",
  className,
}: {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  return (
    <span className={cn("inline-flex flex-wrap items-center gap-2", className)}>
      <span>{name}</span>
      <PlusBadge size={size} />
    </span>
  );
}
