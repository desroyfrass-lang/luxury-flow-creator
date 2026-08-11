// FRASS-0476 — the discreet notice a member sees on a paused surface.
// Calm, never alarming: the lights are on, the till is simply closed.

import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Lock } from "lucide-react";
import { isPaused, type ProtectionDomain } from "@/lib/platform-protection";
import { getPublicPlatformProtection } from "@/lib/platform-protection.functions";

/** Live switch state, safe to call from public routes. */
export function usePlatformProtection() {
  const read = useServerFn(getPublicPlatformProtection);
  return useQuery({
    queryKey: ["platform-protection", "public"],
    queryFn: () => read(),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

/** True when this part of Frass is frozen right now. */
export function useIsPaused(domain: ProtectionDomain): boolean {
  const { data } = usePlatformProtection();
  return data ? isPaused(data, domain) : false;
}

export function PlatformProtectionBanner({
  domain,
  className = "",
}: {
  domain: ProtectionDomain;
  className?: string;
}) {
  const paused = useIsPaused(domain);
  if (!paused) return null;
  return (
    <div
      role="status"
      className={`flex items-start gap-2 rounded-sm border border-[color:var(--gold)]/40 bg-[color:var(--gold)]/10 px-3 py-2 text-xs ${className}`}
      data-blueprint="protection-banner"
    >
      <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[color:var(--gold)]" />
      <span>
        Platform maintenance in progress — read-only mode active. You can look around freely; this
        action will be back on shortly.
      </span>
    </div>
  );
}
