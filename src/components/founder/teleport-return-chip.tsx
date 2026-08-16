// FRASS-0570 — the way back. A floating chip that only appears for the Founder
// while inspecting a page reached from the World Teleporter.
import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { isTeleporting, endTeleport, TELEPORT_HOME } from "@/lib/founder/teleport-session";

export function TeleportReturnChip() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAdmin = useIsAdmin();
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(isTeleporting());
  }, [pathname]);

  if (!active || !isAdmin || pathname === "/control-room") return null;

  return (
    <button
      type="button"
      onClick={() => {
        endTeleport();
        window.location.assign(TELEPORT_HOME);
      }}
      className="fixed bottom-24 left-4 z-[60] rounded-full border border-[color:var(--gold)] bg-background/95 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[color:var(--gold)] shadow-lg backdrop-blur"
    >
      ⬅ Return to World Teleporter
    </button>
  );
}
