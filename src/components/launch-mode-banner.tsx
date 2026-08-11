// FRASS-0462 — Pre-Launch Mode banner and the "Available at Launch" chip.
// Exciting, never limiting. Nothing here ever looks broken.

import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getLaunchMode } from "@/lib/launch-mode.functions";
import { DEFAULT_LAUNCH_MODE, launchBannerCopy, type LaunchMode } from "@/lib/launch-mode";

/** Shared hook so every surface reads the same launch state once. */
export function useLaunchMode(): LaunchMode {
  const fn = useServerFn(getLaunchMode);
  const q = useQuery({ queryKey: ["launch-mode"], queryFn: () => fn({}), staleTime: 60_000 });
  return q.data ?? DEFAULT_LAUNCH_MODE;
}

export function LaunchModeBanner({ className = "" }: { className?: string }) {
  const mode = useLaunchMode();
  const copy = launchBannerCopy(mode);
  if (!copy) return null;
  return (
    <section
      className={`rounded-3xl border border-[color:var(--gold,#d4af37)]/35 bg-[color:var(--gold,#d4af37)]/[0.07] px-5 py-4 ${className}`}
      aria-label="Pre-launch mode"
    >
      <p className="font-display text-sm uppercase tracking-[0.18em] text-[color:var(--gold,#d4af37)]">
        {copy.title}
      </p>
      {copy.lines.map((l) => (
        <p key={l} className="mt-1 text-sm text-muted-foreground">
          {l}
        </p>
      ))}
    </section>
  );
}

/** Stands in exactly where a payment control would be while payments are off. */
export function LaunchPending({ label = "Available at Launch" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--gold,#d4af37)]/35 bg-[color:var(--gold,#d4af37)]/[0.08] px-4 py-2 text-sm text-[color:var(--gold,#d4af37)]">
      🚀 {label}
    </span>
  );
}
