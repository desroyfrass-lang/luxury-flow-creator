// FRASS-0569 — The platform may never bypass the Welcome Hall.
//
// Any signed-in Builder heading into Frass Hill or the Daily first passes
// through the Welcome Hall, once per calendar day. Only the member may skip it,
// and only from inside the Hall itself.

import { useEffect, useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { welcomedToday } from "@/lib/welcome-hall/daily-welcome";

export function DailyWelcomeGate({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let alive = true;
    if (welcomedToday()) {
      setChecked(true);
      return;
    }
    void supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!alive) return;
        if (!data.session) {
          setChecked(true);
          return;
        }
        navigate({
          to: "/welcome-hall",
          search: { welcome: "daily", next: pathname },
          replace: true,
        });
      })
      .catch(() => {
        if (alive) setChecked(true);
      });
    return () => {
      alive = false;
    };
  }, [navigate, pathname]);

  if (!checked) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-2xl px-6 py-24 text-sm text-muted-foreground">
          One moment — Frassy is meeting you at the gate.
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
