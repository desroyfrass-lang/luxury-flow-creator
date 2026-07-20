import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const BUSINESS_ROLES = [
  "super_admin",
  "admin",
  "staff",
  "moderator",
  "partner",
  "designer",
  "ambassador",
  "affiliate",
] as const;
export type BusinessRole = (typeof BUSINESS_ROLES)[number];

/** Returns the caller's business roles (empty array for standard shoppers). */
export const getMyBusinessRoles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    if (error) throw error;
    const roles = (data ?? [])
      .map((r: { role: string }) => r.role)
      .filter((r): r is BusinessRole => (BUSINESS_ROLES as readonly string[]).includes(r));
    return Array.from(new Set(roles)) as BusinessRole[];
  });

/** Reauthenticate the current user by re-verifying their password.
 * Uses admin API to avoid disturbing the active session. */
export const reauthenticateWithPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { password: string }) =>
    z.object({ password: z.string().min(1).max(200) }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: userRes, error: userErr } =
      await supabaseAdmin.auth.admin.getUserById(context.userId);
    if (userErr || !userRes.user?.email) {
      // Never disclose why — unauthorized users see a generic result.
      return { ok: false as const };
    }
    const email = userRes.user.email;
    // Verify password without persisting a new session.
    const { createClient } = await import("@supabase/supabase-js");
    const verify = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const { error } = await verify.auth.signInWithPassword({ email, password: data.password });
    if (error) return { ok: false as const };
    return { ok: true as const };
  });
