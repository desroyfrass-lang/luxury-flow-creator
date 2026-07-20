import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { getMyBusinessRoles, type BusinessRole } from "@/lib/workspace.functions";

export function useWorkspaceRoles(): BusinessRole[] {
  const [hasSession, setHasSession] = useState(false);
  const fn = useServerFn(getMyBusinessRoles);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setHasSession(!!data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setHasSession(!!s));
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const { data } = useQuery({
    queryKey: ["workspace-roles", hasSession],
    queryFn: () => fn(),
    enabled: hasSession,
    staleTime: 60_000,
  });

  return (data ?? []) as BusinessRole[];
}
