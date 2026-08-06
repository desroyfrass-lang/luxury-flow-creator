// Integration-managed: protected layout for /_authenticated/* routes.
// SSR off because Supabase stores the session in localStorage.
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data, error } = await supabase.auth.getUser();
    if (data?.user) return { user: data.user };
    // getUser() can fail transiently (network/token refresh). Fall back to a
    // stored session before bouncing a signed-in Builder back to /auth.
    if (error) {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session?.user) return { user: sessionData.session.user };
    }
    throw redirect({ to: "/auth", search: { next: location.pathname + (location.searchStr ?? "") } });
  },

  component: () => <Outlet />,
});
