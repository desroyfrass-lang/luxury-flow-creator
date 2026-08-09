import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { claimWelcomeLink } from "@/lib/link.functions";
import { clearRef, readRef } from "@/lib/frass-link";

/**
 * FRASS-0428 — the Welcome Link.
 * When someone arrives through a member's permanent Frass Link and then joins,
 * the platform permanently remembers who introduced them.
 */
export function WelcomeLinkClaim() {
  useEffect(() => {
    let done = false;
    const attempt = async () => {
      if (done) return;
      const ref = readRef();
      if (!ref) return;
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;
      done = true;
      try {
        await claimWelcomeLink({ data: { handle: ref.handle, source: ref.source, path: ref.path } });
      } catch {
        /* the introduction can be claimed on a later visit */
      }
      clearRef();
    };

    void attempt();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") void attempt();
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return null;
}
