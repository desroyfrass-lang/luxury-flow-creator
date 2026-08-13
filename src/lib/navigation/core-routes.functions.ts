// FRASS-0514 — Core Route Audit.
//
// Every core destination is verified against the router's real route table
// before a production publish. A core route that does not resolve is a
// launch-blocking production failure, not a broken link.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type CoreRouteCheck = {
  key: string;
  label: string;
  path: string;
  requiresAuth: boolean;
  founderOnly: boolean;
  redirectsTo: string | null;
  resolves: boolean;
  closest: string[];
};

export type CoreRouteAudit = {
  checkedAt: string;
  totalRoutes: number;
  passing: number;
  failing: number;
  results: CoreRouteCheck[];
};

export const auditCoreRoutes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async (): Promise<CoreRouteAudit> => {
    const { CORE_ROUTES } = await import("./core-routes");
    const { verifyRoute } = await import("@/lib/repair/repair.server");

    const results: CoreRouteCheck[] = [];
    let totalRoutes = 0;

    for (const route of CORE_ROUTES) {
      const v = await verifyRoute(route.path);
      totalRoutes = v.totalRoutes;
      results.push({
        key: route.key,
        label: route.label,
        path: route.path,
        requiresAuth: route.requiresAuth,
        founderOnly: route.founderOnly ?? false,
        redirectsTo: route.redirectsTo ?? null,
        resolves: v.routeExists,
        closest: v.closestRoutes,
      });
    }

    const failing = results.filter((r) => !r.resolves).length;
    return {
      checkedAt: new Date().toISOString(),
      totalRoutes,
      passing: results.length - failing,
      failing,
      results,
    };
  });
