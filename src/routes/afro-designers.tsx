import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AfroTheme } from "@/components/afro/AfroTheme";

export const Route = createFileRoute("/afro-designers")({
  component: AfroLayout,
});

function AfroLayout() {
  return (
    <AfroTheme>
      <Outlet />
    </AfroTheme>
  );
}
