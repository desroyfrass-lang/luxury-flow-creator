// FRASS-0600 — Frassy Studios shell inside Frass Hill's Founder Hall.
// Founder/Admin only. Nothing here replaces an existing Founder tool; this is a
// new wing of the same house.
import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { IdentityGate } from "@/components/security/identity-gate";
import { STUDIO_NAV, STUDIO_PRIMARY_NAV, STUDIO_SECONDARY_NAV, studioNavItems } from "@/lib/studios/studios";
import { FrassyChat } from "@/components/frassy-chat";
import { useIsAdminStatus } from "@/hooks/use-is-admin";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/studios")({
  head: () => ({
    meta: [
      { title: "Frassy Studios | Frass Hill" },
      {
        name: "description",
        content:
          "Frass Hill's production house: create once, publish everywhere, own everything. Founder and admin only.",
      },
      { property: "og:title", content: "Frassy Studios | Frass Hill" },
      { property: "og:description", content: "The Frass Hill media production, publishing and monetization engine." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: StudiosAccessGate,
});

function StudiosAccessGate() {
  const { isAdmin, loading } = useIsAdminStatus();
  if (loading) return <StudioAccessState title="Checking Studio access…" />;
  if (!isAdmin) return <StudioAccessState title="Founder or Admin access required" />;
  return <IdentityGate action="founder_command_center"><StudiosShell /></IdentityGate>;
}

function StudioAccessState({ title }: { title: string }) {
  return <main className="mx-auto grid min-h-[70vh] max-w-lg place-items-center px-6 text-center"><div><h1 className="font-display text-3xl uppercase">{title}</h1><p className="mt-3 text-sm text-muted-foreground">Frassy Studios stays inside Founder Hall.</p><div className="mt-6 flex justify-center gap-3"><Button asChild variant="outline"><Link to="/welcome-hall">Welcome Hall</Link></Button><Button asChild><Link to="/">Site Home</Link></Button></div></div></main>;
}

function StudiosShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const search = useRouterState({ select: (s) => s.location.searchStr });

  const isActive = (item: (typeof STUDIO_NAV)[number]) => {
    if (item.to === "/studios") return pathname === "/studios";
    if (pathname !== item.to) return false;
    const wanted = item.search ? new URLSearchParams(item.search).toString() : "";
    const current = (search ?? "").replace(/^\?/, "");
    return wanted ? current === wanted : current === "";
  };

  return (
    <main className="mx-auto w-full max-w-[1500px] px-4 py-8 lg:px-8">
      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="lg:w-64 lg:shrink-0">
          <nav aria-label="Studio location" className="flex flex-wrap gap-1 text-[9px] uppercase tracking-[0.18em] text-muted-foreground"><Link to="/welcome-hall" className="hover:text-foreground">Welcome Hall</Link><span>→</span><Link to="/control-room" className="hover:text-foreground">Founder Hall</Link><span>→</span><Link to="/studios" className="text-[color:var(--gold)]">Frassy Studios</Link></nav>
          <div className="mt-3 text-[10px] uppercase tracking-[0.32em] text-[color:var(--gold)]">FRASS-0600</div>
          <h1 className="font-display text-2xl uppercase leading-none tracking-tight">Frassy Studios</h1>
          <nav aria-label="Frassy Studios primary navigation" className="mt-5 grid grid-cols-2 gap-1.5 lg:flex lg:flex-col lg:gap-0.5">
            {studioNavItems(STUDIO_PRIMARY_NAV).map((item) => (
              <Link
                key={item.id}
                to={item.to}
                search={item.search as never}
                title={item.plain}
                className={`rounded-sm px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] transition ${
                  isActive(item)
                    ? "bg-[color:var(--gold)]/10 text-[color:var(--gold)]"
                    : "text-muted-foreground hover:bg-card/60 hover:text-foreground"
                }`}
              >
                <span aria-hidden className="mr-2">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-5 space-y-2 border-t border-border/60 pt-4">
            {STUDIO_SECONDARY_NAV.map((group) => (
              <details key={group.label} className="group">
                <summary className="cursor-pointer list-none px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground">{group.label} <span aria-hidden>＋</span></summary>
                <nav aria-label={`${group.label} studio navigation`} className="grid gap-0.5 pl-2">
                  {studioNavItems(group.ids).map((item) => <Link key={item.id} to={item.to} search={item.search as never} title={item.plain} className={`rounded-sm px-3 py-2 text-[10px] uppercase tracking-[0.14em] ${isActive(item) ? "bg-[color:var(--gold)]/10 text-[color:var(--gold)]" : "text-muted-foreground hover:bg-card/60 hover:text-foreground"}`}>{item.icon} {item.label}</Link>)}
                </nav>
              </details>
            ))}
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <Outlet />

          <section className="mt-14 rounded-lg border border-border/70 bg-card/40 p-5">
            <div className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]">Your production assistant</div>
            <h2 className="mt-1 font-display text-xl uppercase tracking-tight">Ask Frassy</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Same Frassy you already know — she just knows the studio too. Try: “develop this episode”, “find continuity
              problems”, “turn this into social clips”, “show me what needs approval”.
            </p>
            <div className="mt-4">
              <FrassyChat embedded tone="dark" />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
