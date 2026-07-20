import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ROLES = [
  "admin",
  "super_admin",
  "staff",
  "moderator",
  "designer",
  "affiliate",
  "partner",
  "ambassador",
  "customer",
] as const;
export type AppRole = (typeof ROLES)[number];

async function assertAdmin(ctx: { supabase: any; userId: string }) {
  const { data, error } = await ctx.supabase.rpc("has_role", {
    _user_id: ctx.userId,
    _role: "admin",
  });
  if (error) throw error;
  if (!data) throw new Error("Forbidden: admin role required");
}

export const listUsersWithRoles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ data: authUsers, error: e1 }, { data: roleRows, error: e2 }] = await Promise.all([
      supabaseAdmin.auth.admin.listUsers({ perPage: 200 }),
      supabaseAdmin.from("user_roles").select("user_id, role"),
    ]);
    if (e1) throw e1;
    if (e2) throw e2;
    const rolesByUser = new Map<string, string[]>();
    for (const r of roleRows ?? []) {
      const list = rolesByUser.get(r.user_id) ?? [];
      list.push(r.role);
      rolesByUser.set(r.user_id, list);
    }
    return (authUsers?.users ?? []).map((u) => ({
      id: u.id,
      email: u.email ?? null,
      created_at: u.created_at,
      roles: rolesByUser.get(u.id) ?? [],
    }));
  });

export const grantRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string; role: AppRole }) =>
    z.object({ userId: z.string().uuid(), role: z.enum(ROLES) }).parse(d),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: data.userId, role: data.role })
      .select()
      .maybeSingle();
    if (error && !error.message.includes("duplicate")) throw error;
    const { emitPlatformEvent } = await import("@/lib/platform-events.server");
    await emitPlatformEvent({
      eventType: "role.granted",
      actorId: context.userId,
      entityType: "user",
      entityId: data.userId,
      payload: { role: data.role },
    });
    return { ok: true };
  });

export const revokeRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string; role: AppRole }) =>
    z.object({ userId: z.string().uuid(), role: z.enum(ROLES) }).parse(d),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    if (data.userId === context.userId && data.role === "admin") {
      throw new Error("You cannot revoke your own admin role");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", data.userId)
      .eq("role", data.role);
    if (error) throw error;
    const { emitPlatformEvent } = await import("@/lib/platform-events.server");
    await emitPlatformEvent({
      eventType: "role.revoked",
      actorId: context.userId,
      entityType: "user",
      entityId: data.userId,
      payload: { role: data.role },
    });
    return { ok: true };
  });

export const ROLE_OPTIONS = ROLES;
