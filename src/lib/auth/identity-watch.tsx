// Login & Access Recovery Step 3 — session hygiene.
//
// One app-wide listener that notices when the signed-in PERSON changes
// (sign-in, sign-out, or switching accounts) and immediately forgets every
// identity-dependent answer the browser was holding: Founder/role results and
// identity re-confirmations. It grants nothing — the server stays the final
// authority on every Founder door.
import { useEffect, useSyncExternalStore } from "react";
import { useQueryClient, type QueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { clearVerifications, setVerificationOwner } from "@/lib/security/sensitive-actions";

/** Query key prefixes whose answers depend on who is signed in. */
export const IDENTITY_QUERY_PREFIXES = [
  "is-admin",
  "is-admin-status",
  "my-roles",
  "workspace-roles",
] as const;

let currentUserId: string | null = null;
let known = false;
const listeners = new Set<() => void>();

function setUser(id: string | null) {
  if (known && id === currentUserId) return;
  currentUserId = id;
  known = true;
  setVerificationOwner(id);
  listeners.forEach((l) => l());
}

export function purgeIdentityState(queryClient: QueryClient) {
  for (const prefix of IDENTITY_QUERY_PREFIXES) {
    void queryClient.cancelQueries({ queryKey: [prefix] });
    queryClient.removeQueries({ queryKey: [prefix] });
  }
  clearVerifications();
}

/** Current signed-in user id (null when signed out or not yet known). */
export function useAuthUserId(): { userId: string | null; ready: boolean } {
  const snap = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => (known ? currentUserId ?? "" : undefined),
    () => undefined,
  );
  return { userId: snap ? snap : null, ready: snap !== undefined };
}

/** Mounted once in the root layout. */
export function AuthIdentityWatcher() {
  const queryClient = useQueryClient();
  useEffect(() => {
    let mounted = true;
    const apply = (id: string | null) => {
      if (!mounted) return;
      const changed = known && id !== currentUserId;
      if (changed) purgeIdentityState(queryClient);
      setUser(id);
    };
    supabase.auth.getSession().then(({ data }) => apply(data.session?.user.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") purgeIdentityState(queryClient);
      apply(session?.user.id ?? null);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [queryClient]);
  return null;
}
