import { createFileRoute, Outlet } from "@tanstack/react-router";
import { FoundationInvite } from "@/components/foundation-invite";

export const Route = createFileRoute("/frass-kids")({
  component: KidsLayout,
});

function KidsLayout() {
  return (
    <div className="kids-zone min-h-screen">
      <Outlet />
      <FoundationInvite cause="kids" />
    </div>
  );
}

