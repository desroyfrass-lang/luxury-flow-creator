import { createFileRoute, Outlet, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { checkIsAdmin } from "@/lib/admin.functions";
import { requireFounderRoute } from "@/lib/founder/route-guard";
import { useSecureSignOut } from "@/components/secure-sign-out";
import { SiteShell } from "@/components/site-shell";

export const Route = createFileRoute("/_authenticated/admin")({
  // Atlas Recovery Phase 1 — the owner console is server-verified before it
  // renders. Typing the address is no longer a way in.
  beforeLoad: requireFounderRoute,
  component: AdminLayout,
});

function AdminLayout() {
  const isAdminFn = useServerFn(checkIsAdmin);

  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ["is-admin"],
    queryFn: () => isAdminFn(),
  });

  const signOut = useSecureSignOut();

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
          <h1 className="font-display text-4xl">Access denied</h1>
          <p className="mt-4 text-sm text-muted-foreground">
            This console belongs to the owner of Frass Hill. Ownership cannot be
            requested or claimed from here.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <Link
              to="/welcome-hall"
              className="lux-press w-full rounded-sm border border-border px-6 py-3.5 text-xs font-bold uppercase tracking-[0.32em]"
            >
              Back to the Welcome Hall
            </Link>
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
              to="/frassy"
              className="text-[color:var(--gold)] hover:text-foreground"
            >
              ✦ Frassy OS
            </Link>
            <Link
              to="/admin/approvals"
              activeProps={{ className: "text-[color:var(--gold)]" }}
              className="text-muted-foreground hover:text-foreground"
            >
              Approvals
            </Link>
            <Link
              to="/admin/capsules"
              activeProps={{ className: "text-[color:var(--gold)]" }}
              className="text-muted-foreground hover:text-foreground"
            >
              Capsules
            </Link>
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
            <Link
              to="/admin/media"
              activeProps={{ className: "text-[color:var(--gold)]" }}
              className="text-muted-foreground hover:text-foreground"
            >
              Music & Media
            </Link>
            <Link
              to="/admin/blog"
              activeProps={{ className: "text-[color:var(--gold)]" }}
              className="text-muted-foreground hover:text-foreground"
            >
              Journal
            </Link>
            <Link
              to="/admin/newsroom"
              activeProps={{ className: "text-[color:var(--gold)]" }}
              className="text-muted-foreground hover:text-foreground"
            >
              Newsroom
            </Link>
            <Link
              to="/admin/virals"
              activeProps={{ className: "text-[color:var(--gold)]" }}
              className="text-muted-foreground hover:text-foreground"
            >
              Virals
            </Link>
            <Link
              to="/admin/activities"
              activeProps={{ className: "text-[color:var(--gold)]" }}
              className="text-muted-foreground hover:text-foreground"
            >
              Activities
            </Link>
            <Link
              to="/admin/cj-import"
              activeProps={{ className: "text-[color:var(--gold)]" }}
              className="text-muted-foreground hover:text-foreground"
            >
              CJ Import
            </Link>
            <Link
              to="/admin/visual-index"
              activeProps={{ className: "text-[color:var(--gold)]" }}
              className="text-muted-foreground hover:text-foreground"
            >
              Visual Index
            </Link>
            <Link
              to="/admin/roles"
              activeProps={{ className: "text-[color:var(--gold)]" }}
              className="text-muted-foreground hover:text-foreground"
            >
              Roles
            </Link>
            <Link
              to="/admin/partner-vendors"
              activeProps={{ className: "text-[color:var(--gold)]" }}
              className="text-muted-foreground hover:text-foreground"
            >
              Partner Vendors
            </Link>
            <Link
              to="/admin/feedback"
              activeProps={{ className: "text-[color:var(--gold)]" }}
              className="text-muted-foreground hover:text-foreground"
            >
              Feedback
            </Link>
            <Link
              to="/admin/launch-feedback"
              activeProps={{ className: "text-[color:var(--gold)]" }}
              className="text-muted-foreground hover:text-foreground"
            >
              Launch Feedback
            </Link>
            <Link
              to="/admin/link-check"
              activeProps={{ className: "text-[color:var(--gold)]" }}
              className="text-muted-foreground hover:text-foreground"
            >
              Link Check
            </Link>
            <Link
              to="/admin/ai-credits"
              activeProps={{ className: "text-[color:var(--gold)]" }}
              className="text-muted-foreground hover:text-foreground"
            >
              AI Credits
            </Link>
            <Link
              to="/admin/financial-audit"
              activeProps={{ className: "text-[color:var(--gold)]" }}
              className="text-muted-foreground hover:text-foreground"
            >
              Financial Audit
            </Link>
            <Link
              to="/admin/voice"
              activeProps={{ className: "text-[color:var(--gold)]" }}
              className="text-muted-foreground hover:text-foreground"
            >
              Voice Studio
            </Link>
            <Link
              to="/control-room"
              activeProps={{ className: "text-[color:var(--gold)]" }}
              className="text-muted-foreground hover:text-foreground"
            >
              Control Room
            </Link>
            <Link
              to="/admin/audit"
              activeProps={{ className: "text-[color:var(--gold)]" }}
              className="text-muted-foreground hover:text-foreground"
            >
              Platform Audit
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
