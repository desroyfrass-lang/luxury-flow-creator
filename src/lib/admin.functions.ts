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

// Atlas Recovery Phase 1 — the self-service "claim site ownership" bootstrap
// has been removed. Frass Hill has an owner; ownership is granted only through
// the owner console, never claimed by whoever arrives first.

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
