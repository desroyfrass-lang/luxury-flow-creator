// Step 6 — Tester commission machinery. Tester is a normal Member plus an
// explicit, Founder-granted allowlist. Being a Tester never implies access.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { TESTER_EXPERIENCES, type TesterExperience } from "@/lib/roles";

async function assertFounder(supabase: any, userId: string) {
  for (const role of ["admin", "super_admin"] as const) {
    const { data, error } = await supabase.rpc("has_role", { _user_id: userId, _role: role });
    if (error) throw new Error("Forbidden");
    if (data) return;
  }
  throw new Error("Forbidden");
}

/** Caller's own commissioned experiences; empty unless they hold the tester role. Fails closed. */
export const listMyTesterCommissions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<TesterExperience[]> => {
    const { data: isTester, error: roleErr } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "tester",
    });
    if (roleErr || !isTester) return [];
    const { data, error } = await context.supabase
      .from("tester_commissions")
      .select("experience")
      .eq("user_id", context.userId);
    if (error) return [];
    return (data ?? []).map((r) => r.experience as TesterExperience);
  });

/** Live check for one commissioned experience. Any failure → false. */
export const checkTesterCommission = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ experience: z.enum(TESTER_EXPERIENCES) }).parse(d))
  .handler(async ({ context, data }) => {
    const { data: ok, error } = await context.supabase.rpc("has_tester_commission", {
      _user_id: context.userId,
      _experience: data.experience,
    });
    return !error && ok === true;
  });

const assignSchema = z.object({
  userId: z.string().uuid(),
  experience: z.enum(TESTER_EXPERIENCES),
});

/** Founder-only: commission an experience for a Tester. */
export const grantTesterCommission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => assignSchema.parse(d))
  .handler(async ({ context, data }) => {
    await assertFounder(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: isTester } = await supabaseAdmin.rpc("has_role", {
      _user_id: data.userId,
      _role: "tester",
    });
    if (!isTester) throw new Error("User is not a Tester");
    const { error } = await supabaseAdmin.from("tester_commissions").upsert(
      { user_id: data.userId, experience: data.experience, granted_by: context.userId },
      { onConflict: "user_id,experience", ignoreDuplicates: true },
    );
    if (error) throw error;
    return { ok: true };
  });

/** Founder-only: withdraw a commissioned experience. */
export const revokeTesterCommission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => assignSchema.parse(d))
  .handler(async ({ context, data }) => {
    await assertFounder(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("tester_commissions")
      .delete()
      .eq("user_id", data.userId)
      .eq("experience", data.experience);
    if (error) throw error;
    return { ok: true };
  });
