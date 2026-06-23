import { createFileRoute, Outlet, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { checkIsAdmin, claimInitialAdmin } from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";
import { SiteShell } from "@/components/site-shell";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const navigate = useNavigate();
  const isAdminFn = useServerFn(checkIsAdmin);
  const claimFn = useServerFn(claimInitialAdmin);
  const [claiming, setClaiming] = useState(false);

  const { data: isAdmin, isLoading, refetch } = useQuery({
    queryKey: ["is-admin"],
    queryFn: () => isAdminFn(),
  });

  const onClaim = async () => {
    setClaiming(true);
    try {
      const res = await claimFn();
      if (res.claimed) {
        toast.success("You are now the site owner.");
        await refetch();
      } else {
        toast.error(res.reason ?? "Could not claim admin");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setClaiming(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  if (isLoading) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-md px-6 py-32 text-center text-sm text-muted-foreground">
          Checking access…
        </div>
      </SiteShell>
    );
  }

  if (!isAdmin) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-md px-6 py-24 text-center">
          <h1 className="font-display text-4xl">Owner access required</h1>
          <p className="mt-4 text-sm text-muted-foreground">
            This account isn't the site owner. If you're the first person to set this up, claim ownership below — works only when no owner exists yet.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <button
              onClick={onClaim}
              disabled={claiming}
              className="lux-press w-full rounded-sm border border-[color:var(--gold)] bg-[color:var(--gold)] px-6 py-3.5 text-xs font-bold uppercase tracking-[0.32em] text-[color:var(--ink)] disabled:opacity-50"
            >
              {claiming ? "Claiming…" : "Claim site ownership"}
            </button>
            <button
              onClick={signOut}
              className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground"
            >
              Sign out
            </button>
          </div>
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12 py-12">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
              Owner console
            </div>
            <h1 className="mt-2 font-display text-5xl">Admin</h1>
          </div>
          <nav className="flex items-center gap-4 text-[11px] uppercase tracking-[0.25em]">
            <Link
              to="/admin/images"
              activeProps={{ className: "text-[color:var(--gold)]" }}
              className="text-muted-foreground hover:text-foreground"
            >
              Images
            </Link>
            <Link
              to="/admin/text"
              activeProps={{ className: "text-[color:var(--gold)]" }}
              className="text-muted-foreground hover:text-foreground"
            >
              Text
            </Link>
            <Link to="/" className="text-muted-foreground hover:text-foreground">
              View site
            </Link>
            <button onClick={signOut} className="text-muted-foreground hover:text-foreground">
              Sign out
            </button>
          </nav>
        </div>
        <Outlet />
      </div>
    </SiteShell>
  );
}
