// FRASS-0570 — the way back. A floating chip that only appears for the Founder
// while inspecting a page reached from the World Teleporter.
import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { isTeleporting, endTeleport, TELEPORT_HOME } from "@/lib/founder/teleport-session";
import { closeAuditSession } from "@/lib/founder/audit-session.functions";

export function TeleportReturnChip() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAdmin = useIsAdmin();
  const [active, setActive] = useState(false);
  const closeSession = useServerFn(closeAuditSession);

  useEffect(() => {
    setActive(isTeleporting());
  }, [pathname]);

  if (!active || !isAdmin || pathname === "/control-room") return null;

  return (
    <button
      type="button"
      onClick={async () => {
        endTeleport();
        // FRASS-0579 — leaving the card closes the locked audit session.
        try {
          await closeSession({});
        } catch {
          /* the session simply stays open until the next card is opened */
        }
        window.location.assign(TELEPORT_HOME);
      }}

      className="fixed bottom-24 left-4 z-[60] rounded-full border border-[color:var(--gold)] bg-background/95 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[color:var(--gold)] shadow-lg backdrop-blur"
    >
      ⬅ Return to World Teleporter
    </button>
  );
}
