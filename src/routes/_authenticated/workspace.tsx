import { createFileRoute, useNavigate, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { SiteShell } from "@/components/site-shell";
import { PageFeedback } from "@/components/page-feedback";
import {
  BUSINESS_ROLES,
  getMyBusinessRoles,
  type BusinessRole,
} from "@/lib/workspace.functions";
import symbolLogo from "@/assets/frass-logo-symbol.asset.json";
import { IdentityGate } from "@/components/security/identity-gate";

export const Route = createFileRoute("/_authenticated/workspace")({
  component: WorkspaceRoute,
});

// FRASS-0488 — the bespoke password form that used to live here is gone.
// Every sensitive door in Frass now uses the one shared IdentityGate:
// strongest method first (Face ID / Touch ID / Windows Hello / passkey),
// password always available as the fallback.
function WorkspaceRoute() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  // Child routes gate themselves; only the lounge needs the identity check.
  if (pathname !== "/workspace") return <Outlet />;
  return (
    <IdentityGate action="workspace">
      <WorkspacePage />
    </IdentityGate>
  );
}

const ROLE_META: Record<BusinessRole, { label: string; blurb: string; to?: string }> = {
  super_admin: { label: "Executive Command Center", blurb: "Full platform authority.", to: "/admin" },
  admin: { label: "Administration Console", blurb: "Manage the platform end-to-end.", to: "/admin" },
  staff: { label: "Operations Dashboard", blurb: "Approvals, content, and daily ops.", to: "/admin/approvals" },
  moderator: { label: "Moderation Desk", blurb: "Review and safeguard content.", to: "/admin/approvals" },
  partner: { label: "Partner Dashboard", blurb: "Partner analytics & collaborations.", to: undefined },
  designer: { label: "Creator Studio", blurb: "Merch studio, capsules & submissions.", to: "/workspace/merch" },
  ambassador: { label: "Ambassador Lounge", blurb: "Campaigns & rewards.", to: undefined },
  affiliate: { label: "Affiliate Workspace", blurb: "Track links, earnings, payouts.", to: undefined },
};

function WorkspacePage() {
  const navigate = useNavigate();
  const rolesFn = useServerFn(getMyBusinessRoles);

  const { data: roles, isLoading } = useQuery({
    queryKey: ["workspace-roles"],
    queryFn: () => rolesFn(),
  });

  const orderedRoles = useMemo(
    () => (roles ?? []).slice().sort((a, b) => BUSINESS_ROLES.indexOf(a) - BUSINESS_ROLES.indexOf(b)),
    [roles],
  );

  // No authorized roles — indistinguishable "return to shopping" per spec.
  useEffect(() => {
    if (!isLoading && (roles?.length ?? 0) === 0) {
      const t = setTimeout(() => navigate({ to: "/" }), 1200);
      return () => clearTimeout(t);
    }
  }, [isLoading, roles, navigate]);

  return (
    <SiteShell>
      <div className="mx-auto max-w-2xl px-6 py-24">
        <div className="text-center">
          <img src={symbolLogo.url} alt="" className="mx-auto h-14 w-auto opacity-90" />
          <div className="mt-6 text-[11px] uppercase tracking-[0.4em] text-[color:var(--gold)]">
            Private Workspace
          </div>
          <h1 className="mt-3 font-display text-4xl md:text-5xl">
            You're entering your Frass Hill Workspace.
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Your identity is confirmed. Choose the system you want to work in.
          </p>
        </div>

        {isLoading ? (
          <div className="mt-16 text-center text-sm text-muted-foreground">Preparing your lounge…</div>
        ) : (roles?.length ?? 0) === 0 ? (
          <div className="mt-16 text-center text-sm text-muted-foreground">
            Returning you to the boutique…
          </div>
        ) : (
          <div className="mt-12 space-y-3">
            <div className="text-center text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
              Choose your workspace
            </div>

            <Link to="/onboarding">
              <div className="flex items-center justify-between rounded-xl border border-border/70 bg-background/70 px-5 py-4 backdrop-blur transition hover:border-[color:var(--gold)]">
                <div>
                  <div className="font-display text-lg">Your Builder Journey</div>
                  <div className="text-xs text-muted-foreground">
                    Continue setting up your Frass OS with Frassy. Progress saves automatically.
                  </div>
                </div>
                <div className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
                  Resume →
                </div>
              </div>
            </Link>
            <Link to="/workspace/profile">
              <div className="flex items-center justify-between rounded-xl border border-border/70 bg-background/70 px-5 py-4 backdrop-blur transition hover:border-[color:var(--gold)]">
                <div>
                  <div className="font-display text-lg">Builder Identity</div>
                  <div className="text-xs text-muted-foreground">
                    Your public profile, handle, and builder stage.
                  </div>
                </div>
                <div className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
                  Edit →
                </div>
              </div>
            </Link>
            <Link to="/workspace/insights">
              <div className="flex items-center justify-between rounded-xl border border-border/70 bg-background/70 px-5 py-4 backdrop-blur transition hover:border-[color:var(--gold)]">
                <div>
                  <div className="font-display text-lg">Builder Insights</div>
                  <div className="text-xs text-muted-foreground">
                    Patterns across your work, with the artifacts behind them.
                  </div>
                </div>
                <div className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
                  Enter →
                </div>
              </div>
            </Link>
            {orderedRoles.map((r) => {

              const meta = ROLE_META[r];
              const inner = (
                <div className="flex items-center justify-between rounded-xl border border-border/70 bg-background/70 px-5 py-4 backdrop-blur transition hover:border-[color:var(--gold)]">
                  <div>
                    <div className="font-display text-lg">{meta.label}</div>
                    <div className="text-xs text-muted-foreground">{meta.blurb}</div>
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
                    {meta.to ? "Enter →" : "Soon"}
                  </div>
                </div>
              );
              return meta.to ? (
                <Link key={r} to={meta.to}>
                  {inner}
                </Link>
              ) : (
                <div key={r} className="opacity-60">
                  {inner}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <PageFeedback pageTitle="Builder Workspace" />
    </SiteShell>
  );
}
