import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
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
      ...data,
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
    const { createClient } = await import("@supabase/supabase-js");
    const supabasePublic = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      {
        auth: {
          storage: undefined,
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    );
    const { data: profile, error } = await supabasePublic
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
