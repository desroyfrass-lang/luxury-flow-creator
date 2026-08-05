import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Returns true if the calling user is an admin. */
export const checkIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (error) throw error;
    return Boolean(data);
  });

/**
 * Claim admin role for the calling user IFF no admin exists yet.
 * Self-service first-owner setup. Subsequent calls are no-ops.
 */
export const claimInitialAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count, error: countErr } = await supabaseAdmin
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");
    if (countErr) throw countErr;
    if ((count ?? 0) > 0) {
      return { claimed: false, reason: "An admin already exists." };
    }
    const { error: insErr } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: context.userId, role: "admin" });
    if (insErr) throw insErr;
    return { claimed: true };
  });

/** List recent page feedback for the admin console. */
export const listPageFeedback = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");

    const { data, error } = await context.supabase
      .from("page_feedback")
      .select("id, page_path, page_title, helpful, issue_text, user_id, created_at")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) throw error;
    return data ?? [];
  });
