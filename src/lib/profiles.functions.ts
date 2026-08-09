import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { BuilderAboutSchema } from "@/lib/about";
import type { Database } from "@/integrations/supabase/types";

export type BuilderProfile = Database["public"]["Tables"]["profiles"]["Row"];

const UpdateProfileSchema = z.object({
  display_name: z.string().max(120).nullable().optional(),
  handle: z
    .string()
    .max(40)
    .regex(/^[a-z0-9_]+$/, "Handle may only contain lowercase letters, numbers, and underscores.")
    .nullable()
    .optional(),
  bio: z.string().max(1000).nullable().optional(),
  avatar_url: z.string().url().max(1000).nullable().optional(),
  is_public: z.boolean().optional(),
  builder_stage: z.enum(["visitor", "explorer", "builder", "steward"]).optional(),
  primary_district: z.string().max(80).nullable().optional(),
  full_name: z.string().max(160).nullable().optional(),
  phone: z.string().max(40).nullable().optional(),
  address_line1: z.string().max(200).nullable().optional(),
  address_line2: z.string().max(200).nullable().optional(),
  city: z.string().max(120).nullable().optional(),
  region: z.string().max(120).nullable().optional(),
  postal_code: z.string().max(40).nullable().optional(),
  country: z.string().max(120).nullable().optional(),
  /** FRASS-0423 — the Living Biography shown on the FOR ME About tab. */
  about: BuilderAboutSchema.optional(),
});

/** Returns the authenticated Builder's login email (the account sign-in name). */
export const getMyAccountLogin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.auth.admin.getUserById(context.userId);
    if (error) throw error;
    return {
      email: data.user?.email ?? null,
      lastSignInAt: data.user?.last_sign_in_at ?? null,
      createdAt: data.user?.created_at ?? null,
    };
  });

/**
 * Changes the authenticated Builder's password.
 * Requires the current password. Passwords are stored one-way hashed and can
 * never be read back — this is the only supported way to set a known password.
 */
export const changeMyPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { currentPassword: string; newPassword: string }) =>
    z
      .object({
        currentPassword: z.string().min(1).max(200),
        newPassword: z.string().min(8, "Use at least 8 characters.").max(200),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: userRes, error: userErr } = await supabaseAdmin.auth.admin.getUserById(
      context.userId,
    );
    if (userErr || !userRes.user?.email) return { ok: false as const, message: "Could not verify your account." };

    const { createClient } = await import("@supabase/supabase-js");
    const verify = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error: signInErr } = await verify.auth.signInWithPassword({
      email: userRes.user.email,
      password: data.currentPassword,
    });
    if (signInErr) return { ok: false as const, message: "Current password is incorrect." };

    const { error } = await supabaseAdmin.auth.admin.updateUserById(context.userId, {
      password: data.newPassword,
    });
    if (error) return { ok: false as const, message: "Could not update your password." };
    return { ok: true as const, message: "Password updated." };
  });

/** Returns the authenticated Builder's full profile. */
export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select("*")
      .eq("id", context.userId)
      .single();
    if (error) throw error;
    return data as BuilderProfile;
  });

/** Updates the authenticated Builder's profile. Enforces handle uniqueness via the database constraint. */
export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: z.infer<typeof UpdateProfileSchema>) => UpdateProfileSchema.parse(d))
  .handler(async ({ context, data }) => {
    const update: Database["public"]["Tables"]["profiles"]["Update"] = {
      ...(data as Record<string, unknown>),
      updated_at: new Date().toISOString(),
    };
    const { data: profile, error } = await context.supabase
      .from("profiles")
      .update(update)
      .eq("id", context.userId)
      .select()
      .single();
    if (error) throw error;
    return profile as BuilderProfile;
  });

/** Public lookup for a Builder profile by handle. Returns only public, safe fields. */
export const getPublicProfileByHandle = createServerFn({ method: "GET" })
  .inputValidator((d: { handle: string }) =>
    z.object({ handle: z.string().max(40) }).parse(d),
  )
  .handler(async ({ data }) => {
    // Served server-side with an explicit safe-column projection: visitors have
    // no direct database read access to profiles.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .select(
        "id, display_name, handle, bio, avatar_url, builder_stage, primary_district, created_at, updated_at",
      )
      .eq("handle", data.handle)
      .eq("is_public", true)
      .single();
    if (error) throw error;
    return profile;
  });

