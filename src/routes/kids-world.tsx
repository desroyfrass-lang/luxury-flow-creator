import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { KIDS_WORLDS } from "@/lib/kids-world";
import { useKidsPassport } from "@/lib/kids-passport";

export const Route = createFileRoute("/kids-world")({
  component: KidsWorldLayout,
});

function KidsWorldLayout() {
  const { passport } = useKidsPassport();
  const path = useRouterState({ select: (r) => r.location.pathname });
  const visible = passport?.locked
    ? KIDS_WORLDS.filter((w) => w.slug === passport.age)
    : KIDS_WORLDS;

  const activeAge = KIDS_WORLDS.find((w) => path.includes(`/kids-world/${w.slug}`))?.slug;

  return (
    <SiteShell>
      <div className="kids-zone min-h-screen" data-age={activeAge ?? "3-6"}>
      <nav
        aria-label="Kids World"
        className="sticky top-[64px] z-30 border-b border-[color:var(--primary)]/25 bg-background/90 backdrop-blur-xl"
      >

        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-3 px-6 py-3 lg:px-12">
          <Link
            to="/kids-world"
            className="text-[10px] font-bold uppercase tracking-[0.28em] text-[color:var(--gold)]"
          >
            🌈 Kids World
          </Link>
          <span className="hidden text-muted-foreground/40 sm:inline">/</span>
          {visible.map((w) => (
            <Link
              key={w.slug}
              to="/kids-world/$age"
              params={{ age: w.slug }}
              className="rounded-full border px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] transition hover:bg-foreground/5"
              style={{
                borderColor: path.includes(`/kids-world/${w.slug}`) ? w.accent : "transparent",
                color: w.accent,
              }}
            >
              {w.emoji} {w.ageLabel}
            </Link>
          ))}
          <div className="ml-auto flex items-center gap-3">
            <Link
              to="/kids-world/street"
              className="rounded-full bg-primary/15 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary hover:bg-primary/25"
            >
              🏘 Frass Street
            </Link>
            <Link
              to="/kids-world/discover"
              className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
            >
              ✨ Discover
            </Link>
            <Link
              to="/frass-kids"
              className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
            >
              🛍 Shop Kids
            </Link>
            <Link
              to="/kids-world/parents"
              className="rounded-full border border-border px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] hover:bg-foreground/5"
            >
              Parent Dashboard
            </Link>
          </div>
        </div>
      </nav>
      <Outlet />
    </SiteShell>
  );
}
