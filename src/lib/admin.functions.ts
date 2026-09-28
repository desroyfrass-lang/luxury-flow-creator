import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Returns true if the calling user is an admin. */
export const checkIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    // FRASS Step 2 — one Founder rule: admin OR super_admin, checked live.
    for (const role of ["admin", "super_admin"] as const) {
      const { data, error } = await context.supabase.rpc("has_role", {
        _user_id: context.userId,
        _role: role,
      });
      if (error) throw error;
      if (data) return true;
    }
    return false;
  });

// Atlas Recovery Phase 1 — the self-service "claim site ownership" bootstrap
// has been removed. Frass Hill has an owner; ownership is granted only through
// the owner console, never claimed by whoever arrives first.

/** List recent page feedback for the admin console. */
export const listPageFeedback = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    // Step 8 — Founder rule: admin OR super_admin, checked live on the server.
    const [a, s] = await Promise.all([
      context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" }),
      context.supabase.rpc("has_role", { _user_id: context.userId, _role: "super_admin" }),
    ]);
    if (a.error || s.error || !(a.data || s.data)) throw new Error("Forbidden");

    const { data, error } = await context.supabase
      .from("page_feedback")
      .select("id, page_path, page_title, helpful, issue_text, user_id, created_at, tester_status, tester_experience")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) throw error;
    return data ?? [];
  });
