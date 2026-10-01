import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { KIDS_WORLDS } from "@/lib/kids-world";

export const Route = createFileRoute("/kids-world")({
  component: KidsWorldLayout,
});

// SiteShell already mounts the child-first KidsNav and KidsFooter for every
// Kids World page, so this layout no longer adds a second header.
function KidsWorldLayout() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const activeAge = KIDS_WORLDS.find((w) => path.includes(`/kids-world/${w.slug}`))?.slug;

  return (
    <SiteShell>
      <div className="kids-zone min-h-screen" data-age={activeAge ?? "3-6"}>
        <Outlet />
      </div>
    </SiteShell>
  );
}
