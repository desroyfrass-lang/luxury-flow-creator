import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { fetchJourneyStatus } from "@/hooks/use-journey-status";
import { useIsAdminStatus } from "@/hooks/use-is-admin";

/**
 * FRASS-0563 — Nobody reaches the Daily before Frassy has met them.
 *
 * The Daily is the desk, not the front door. A member who has never answered
 * Frassy once is walked back to the Welcome Hall conversation instead of being
 * dropped inside their workspace in silence. The Founder is never gated.
 */
export function WelcomeGate({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { isAdmin, loading: roleLoading } = useIsAdminStatus();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    if (roleLoading) return;
    if (isAdmin) {
      setAllowed(true);
      return;
    }
    let alive = true;
    void fetchJourneyStatus()
      .then((status) => {
        if (!alive) return;
        if (!status.signedIn || status.metFrassy) {
          setAllowed(true);
          return;
        }
        setAllowed(false);
        navigate({ to: "/onboarding", replace: true });
      })
      .catch(() => {
        // Never lock a member out because a check failed.
        if (alive) setAllowed(true);
      });
    return () => {
      alive = false;
    };
  }, [isAdmin, roleLoading, navigate]);

  if (allowed === null) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-2xl px-6 py-24 text-sm text-muted-foreground">
          One moment — Frassy is checking where you left off.
        </div>
      </main>
    );
  }

  if (!allowed) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-2xl px-6 py-24">
          <h1 className="font-display text-3xl">Frassy hasn't met you yet.</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Taking you to the Welcome Hall first — your Daily will be waiting right after.
          </p>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
