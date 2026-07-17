import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { checkIsAdmin } from "@/lib/admin.functions";

export function useIsAdmin() {
  const [hasSession, setHasSession] = useState(false);
  const isAdminFn = useServerFn(checkIsAdmin);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setHasSession(!!data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setHasSession(!!session);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const { data } = useQuery({
    queryKey: ["is-admin", hasSession],
    queryFn: () => isAdminFn(),
    enabled: hasSession,
    staleTime: 60_000,
  });

  return Boolean(data);
}
