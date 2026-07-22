import { createFileRoute, useNavigate, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { SiteShell } from "@/components/site-shell";
import {
  BUSINESS_ROLES,
  getMyBusinessRoles,
  reauthenticateWithPassword,
  type BusinessRole,
} from "@/lib/workspace.functions";
import symbolLogo from "@/assets/frass-logo-symbol.asset.json";

export const Route = createFileRoute("/_authenticated/workspace")({
  component: WorkspacePage,
});

const REAUTH_KEY = "frass:workspace-reauth";
const REAUTH_MS = 15 * 60 * 1000;

function hasFreshReauth(): boolean {
  if (typeof window === "undefined") return false;
  const raw = window.sessionStorage.getItem(REAUTH_KEY);
  if (!raw) return false;
  const ts = Number(raw);
  return Number.isFinite(ts) && Date.now() - ts < REAUTH_MS;
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
  const reauthFn = useServerFn(reauthenticateWithPassword);
  const [reauthed, setReauthed] = useState(false);
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isChildRoute = pathname !== "/workspace";

  // Child routes (e.g. /workspace/merch) render themselves inside their own SiteShell
  // and handle their own role gating. This page only shows the lounge at /workspace.
  if (isChildRoute) return <Outlet />;

  useEffect(() => {
    setReauthed(hasFreshReauth());
  }, []);

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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await reauthFn({ data: { password } });
      if (!res.ok) {
        toast.error("Identity not confirmed.");
        setPassword("");
        return;
      }
      window.sessionStorage.setItem(REAUTH_KEY, String(Date.now()));
      setReauthed(true);
      setPassword("");
      // Auto-enter the highest workspace with a destination.
      const primary = orderedRoles.find((r) => ROLE_META[r].to);
      if (primary && ROLE_META[primary].to) {
        navigate({ to: ROLE_META[primary].to! });
      }
    } catch {
      toast.error("Identity not confirmed.");
    } finally {
      setSubmitting(false);
    }
  };

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
            For your protection, please confirm your identity to unlock business systems.
          </p>
        </div>

        {isLoading ? (
          <div className="mt-16 text-center text-sm text-muted-foreground">Preparing your lounge…</div>
        ) : (roles?.length ?? 0) === 0 ? (
          <div className="mt-16 text-center text-sm text-muted-foreground">
            Returning you to the boutique…
          </div>
        ) : !reauthed ? (
          <form
            onSubmit={onSubmit}
            className="mt-12 rounded-2xl border border-[color:var(--gold)]/30 bg-background/70 p-8 shadow-2xl backdrop-blur"
          >
            <label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Confirm password
            </label>
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-sm border border-border bg-background px-4 py-3 text-sm outline-none focus:border-[color:var(--gold)]"
              placeholder="••••••••"
              autoComplete="current-password"
            />
            <button
              type="submit"
              disabled={submitting || !password}
              className="lux-press mt-6 w-full rounded-sm border border-[color:var(--gold)] bg-[color:var(--gold)] px-6 py-3.5 text-xs font-bold uppercase tracking-[0.32em] text-[color:var(--ink)] disabled:opacity-50"
            >
              {submitting ? "Verifying…" : "Enter Workspace"}
            </button>
            <p className="mt-4 text-center text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              Additional methods coming soon · Passkeys · Face ID · Security Keys
            </p>
          </form>
        ) : (
          <div className="mt-12 space-y-3">
            <div className="text-center text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
              Choose your workspace
            </div>
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
    </SiteShell>
  );
}
