import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export type RewardStatus = {
  signedIn: boolean;
  email: string | null;
  steps: {
    profile: boolean;
    newsletter: boolean;
    emailVerified: boolean;
    social: boolean;
  };
  percent: number;
  unlocked: boolean;
  redeemed: boolean;
  code: string | null;
};

function coupon(userId: string) {
  return `FRASS40-${userId.slice(0, 8).toUpperCase()}`;
}

export const getRewardStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<RewardStatus> => {
    const { supabase, userId, claims } = context;
    const email = (claims.email as string) ?? null;
    const emailVerified = Boolean(
      (claims as Record<string, unknown>).email_verified ??
        (claims as Record<string, unknown>).email_confirmed_at,
    );

    const [{ data: profile }, { data: couponRow }] = await Promise.all([
      supabase
        .from("profiles")
        .select("full_name,gender,style_preferences,favorite_categories,newsletter_opt_in,social_followed")
        .eq("id", userId)
        .maybeSingle(),
      supabase
        .from("reward_coupons")
        .select("code,redeemed_at")
        .eq("user_id", userId)
        .maybeSingle(),
    ]);

    const profileComplete = Boolean(
      profile &&
        profile.full_name &&
        profile.gender &&
        (profile.style_preferences?.length ?? 0) > 0 &&
        (profile.favorite_categories?.length ?? 0) > 0,
    );
    const newsletter = Boolean(profile?.newsletter_opt_in);
    const social = Boolean(profile?.social_followed);

    const steps = { profile: profileComplete, newsletter, emailVerified, social };
    const percent =
      (steps.profile ? 10 : 0) +
      (steps.newsletter ? 10 : 0) +
      (steps.emailVerified ? 10 : 0) +
      (steps.social ? 10 : 0);

    return {
      signedIn: true,
      email,
      steps,
      percent,
      unlocked: Boolean(couponRow),
      redeemed: Boolean(couponRow?.redeemed_at),
      code: couponRow?.code ?? null,
    };
  });

const ProfileSchema = z.object({
  full_name: z.string().trim().min(1).max(120),
  birthday: z.string().optional().nullable(),
  gender: z.string().trim().min(1).max(40),
  style_preferences: z.array(z.string().max(40)).min(1).max(20),
  favorite_categories: z.array(z.string().max(40)).min(1).max(20),
});

export const saveProfileInfo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ProfileSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId, claims } = context;
    const { error } = await supabase.from("profiles").upsert({
      id: userId,
      email: (claims.email as string) ?? null,
      full_name: data.full_name,
      birthday: data.birthday || null,
      gender: data.gender,
      style_preferences: data.style_preferences,
      favorite_categories: data.favorite_categories,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const subscribeNewsletter = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId, claims } = context;
    const email = (claims.email as string) ?? null;
    if (!email) throw new Error("Missing email");
    const { error: upErr } = await supabase
      .from("profiles")
      .upsert({ id: userId, email, newsletter_opt_in: true });
    if (upErr) throw new Error(upErr.message);
    await supabase
      .from("newsletter_subscribers")
      .upsert({ email, user_id: userId }, { onConflict: "email" });
    return { ok: true };
  });

export const confirmSocialFollow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId, claims } = context;
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: userId, email: (claims.email as string) ?? null, social_followed: true });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const claimReward = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId, claims } = context;
    const email = (claims.email as string) ?? null;
    if (!email) throw new Error("Email required to claim reward");

    // Re-verify all steps server-side
    const emailVerified = Boolean(
      (claims as Record<string, unknown>).email_verified ??
        (claims as Record<string, unknown>).email_confirmed_at,
    );
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name,gender,style_preferences,favorite_categories,newsletter_opt_in,social_followed")
      .eq("id", userId)
      .maybeSingle();

    const profileComplete = Boolean(
      profile &&
        profile.full_name &&
        profile.gender &&
        (profile.style_preferences?.length ?? 0) > 0 &&
        (profile.favorite_categories?.length ?? 0) > 0,
    );
    if (!profileComplete || !profile?.newsletter_opt_in || !profile?.social_followed || !emailVerified) {
      throw new Error("Complete all 4 steps to unlock your reward");
    }

    const code = coupon(userId);
    const { data: existing } = await supabase
      .from("reward_coupons")
      .select("code")
      .eq("user_id", userId)
      .maybeSingle();
    if (existing) return { code: existing.code };

    const { error } = await supabase
      .from("reward_coupons")
      .insert({ user_id: userId, email, code, percent_off: 40 });
    if (error) throw new Error(error.message);
    return { code };
  });

export const validateCoupon = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ code: z.string().trim().min(3).max(60) }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row } = await supabase
      .from("reward_coupons")
      .select("code,percent_off,redeemed_at")
      .eq("user_id", userId)
      .eq("code", data.code.toUpperCase())
      .maybeSingle();
    if (!row) return { valid: false as const, reason: "Coupon not found for your account" };
    if (row.redeemed_at) return { valid: false as const, reason: "Coupon already used" };
    return { valid: true as const, percentOff: row.percent_off };
  });
