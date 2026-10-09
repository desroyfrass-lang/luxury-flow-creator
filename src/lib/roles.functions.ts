import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { ROLE_OPTIONS, type AppRole } from "@/lib/roles";

export { ROLE_OPTIONS, type AppRole };

const roleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(ROLE_OPTIONS),
});

/** Returns every role held by the calling user. */
export const listMyRoles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    if (error) throw error;
    return (data ?? []).map((r) => r.role as AppRole);
  });

/** Admin-only: list all users with their granted roles. */
export const listUsersWithRoles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    // Step 8 — Founder rule: admin OR super_admin, checked live on the server.
    const [a, s] = await Promise.all([
      context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" }),
      context.supabase.rpc("has_role", { _user_id: context.userId, _role: "super_admin" }),
    ]);
    if (a.error || s.error || !(a.data || s.data)) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: authUsers, error: authErr } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    if (authErr) throw authErr;

    const { data: roles, error: rolesErr } = await supabaseAdmin
      .from("user_roles")
      .select("user_id, role");
    if (rolesErr) throw rolesErr;

    const byUser = new Map<string, string[]>();
    for (const r of roles ?? []) {
      const list = byUser.get(r.user_id) ?? [];
      list.push(r.role as string);
      byUser.set(r.user_id, list);
    }

    return authUsers.users.map((u) => ({
      id: u.id,
      email: u.email ?? null,
      roles: byUser.get(u.id) ?? [],
    }));
  });

/**
 * Grant or revoke a role. Runs as the signed-in user through the database
 * function founder_set_role, which enforces: admins manage lower roles only;
 * admin/super_admin changes need super_admin; the last super_admin cannot be
 * removed; every change is written to founder_audit_ledger in the same step.
 */
async function setRole(context: { supabase: any }, data: { userId: string; role: AppRole }, grant: boolean) {
  const { error } = await context.supabase.rpc("founder_set_role", {
    _user_id: data.userId,
    _role: data.role,
    _grant: grant,
    _note: "",
  });
  if (error) throw new Error(error.message);
  return { ok: true };
}

/** Grant a role (rules enforced in the database). */
export const grantRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => roleSchema.parse(data))
  .handler(({ context, data }) => setRole(context, data, true));

/** Revoke a role (rules enforced in the database). */
export const revokeRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => roleSchema.parse(data))
  .handler(({ context, data }) => setRole(context, data, false));
