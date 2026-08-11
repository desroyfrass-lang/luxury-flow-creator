import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

/**
 * FRASS-0467 — Secure Partner Sign-Out.
 *
 * One sign-out for the entire platform. Nothing else may call
 * `supabase.auth.signOut()` directly, so that every exit clears cached member
 * data, closes Founder and Partner access, and leaves nothing recoverable with
 * the browser's Back button.
 */
export function useSecureSignOut() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return async () => {
    // 1. Stop anything still fetching before its session disappears.
    await queryClient.cancelQueries();
    // 2. Drop every cached answer that belonged to this member.
    queryClient.clear();
    // 3. Forget per-session hosting/greeting state so the next member is new.
    try {
      sessionStorage.clear();
    } catch {
      /* private mode — nothing cached to clear */
    }
    // 4. End the authenticated session everywhere this token is valid.
    await supabase.auth.signOut({ scope: "global" }).catch(async () => {
      await supabase.auth.signOut();
    });
    // 5. REPLACE, so Back cannot restore an authenticated screen.
    navigate({ to: "/signed-out", replace: true });
  };
}

export function SignOutButton({
  className,
  label = "Sign out",
}: {
  className?: string;
  label?: string;
}) {
  const signOut = useSecureSignOut();
  return (
    <button
      type="button"
      onClick={() => void signOut()}
      className={
        className ??
        "inline-flex items-center gap-2 rounded-sm border border-border px-4 py-2 text-[11px] uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:border-[color:var(--gold)] hover:text-foreground"
      }
    >
      <LogOut className="h-3.5 w-3.5" aria-hidden />
      {label}
    </button>
  );
}
