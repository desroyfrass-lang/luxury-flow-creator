// Daily Gate — one Daily across the entire ecosystem.
// Whether a Builder enters the Founder Control Room, My Workspace, Frass Hill
// or the storefront as a Partner/Creator/Affiliate, the first experience of the
// calendar day is The Frass Daily. Dispatch "frass:open-daily" to reopen it.

import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdminStatus } from "@/hooks/use-is-admin";
import { FrassDaily } from "@/components/workspace/frass-daily";
import { dayKey } from "@/lib/workspace/daily";

const SEEN_KEY = "frass.daily.seen";
export const OPEN_DAILY_EVENT = "frass:open-daily";

export function openTheDaily() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(OPEN_DAILY_EVENT));
}

export function DailyGate() {
  const [open, setOpen] = useState(false);
  const [auto, setAuto] = useState(false);
  const [name, setName] = useState<string | undefined>();
  const [signedIn, setSignedIn] = useState(false);
  const { isAdmin } = useIsAdminStatus();
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      const user = data.session?.user;
      if (!user) return;
      setSignedIn(true);
      const meta = user.user_metadata as { full_name?: string; name?: string } | undefined;
      const label = meta?.full_name ?? meta?.name ?? user.email?.split("@")[0];
      setName(label ? label.split(" ")[0] : undefined);
      if (window.localStorage.getItem(SEEN_KEY) !== dayKey()) {
        setAuto(true);
        setOpen(true);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const reopen = () => {
      setAuto(false);
      setOpen(true);
    };
    window.addEventListener(OPEN_DAILY_EVENT, reopen);
    return () => window.removeEventListener(OPEN_DAILY_EVENT, reopen);
  }, []);

  // Login → The Daily (once per day) → My Workspace.
  const dismiss = useCallback(() => {
    window.localStorage.setItem(SEEN_KEY, dayKey());
    setOpen(false);
    if (auto && window.location.pathname !== "/room") void navigate({ to: "/room" });
    setAuto(false);
  }, [auto, navigate]);


  if (!signedIn || !open) return null;

  return (
    <FrassDaily
      audience={isAdmin ? "founder" : "builder"}
      name={name}
      onDismiss={dismiss}
      onNavigate={(href) => {
        dismiss();
        void navigate({ to: href });
      }}
      onOpenProject={(projectId) => {
        window.localStorage.setItem("frass.workspace.project", projectId);
        dismiss();
        void navigate({ to: "/room" });
      }}
    />
  );
}

