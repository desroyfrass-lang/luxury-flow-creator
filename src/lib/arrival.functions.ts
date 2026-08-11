import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * FRASS-0466 — First Arrival authority.
 *
 * The backend, not the browser, decides whether a person has ever been inside
 * Frass before. That single fact decides whether Frassy says "I've been
 * looking forward to meeting you" or simply "Welcome back".
 */

export type ArrivalState = {
  /** True the very first time this account is seen after verification. */
  firstArrival: boolean;
  displayName: string | null;
  /** Partner designation ("first_partner", …) when an invitation matched. */
  designation: string | null;
  /** True once the Intelligent Builder Journey has been finished. */
  journeyComplete: boolean;
  journeyStarted: boolean;
  emailVerified: boolean;
};

const MEMORY_CATEGORY = "arrival";
const MEMORY_KEY = "first_arrival_at";

/**
 * Reads arrival state and records the first arrival in the same call, so the
 * welcome can never fire twice for the same account.
 */
export const getArrivalState = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ArrivalState> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = context.userId;

    const [userRes, memoryRes, profileRes, journeyRes, inviteRes] = await Promise.all([
      supabaseAdmin.auth.admin.getUserById(userId),
      supabaseAdmin
        .from("builder_memory")
        .select("id")
        .eq("user_id", userId)
        .eq("category", MEMORY_CATEGORY)
        .eq("key", MEMORY_KEY)
        .maybeSingle(),
      supabaseAdmin
        .from("profiles")
        .select("display_name, full_name")
        .eq("id", userId)
        .maybeSingle(),
      supabaseAdmin
        .from("builder_journeys")
        .select("status")
        .eq("user_id", userId)
        .maybeSingle(),
      supabaseAdmin
        .from("partner_invitations")
        .select("designation, display_name")
        .eq("claimed_by", userId)
        .maybeSingle(),
    ]);

    const email = (userRes.data?.user?.email ?? "").toLowerCase();
    const emailVerified = Boolean(userRes.data?.user?.email_confirmed_at);

    // An unclaimed invitation still counts for recognition purposes.
    let designation = (inviteRes.data?.designation as string | null) ?? null;
    let inviteName = (inviteRes.data?.display_name as string | null) ?? null;
    if (!designation && email && emailVerified) {
      const { data: invite } = await supabaseAdmin
        .from("partner_invitations")
        .select("designation, display_name")
        .ilike("email", email)
        .maybeSingle();
      designation = (invite?.designation as string | null) ?? null;
      inviteName = (invite?.display_name as string | null) ?? inviteName;
    }

    const firstArrival = !memoryRes.data;
    if (firstArrival) {
      await supabaseAdmin.from("builder_memory").insert({
        user_id: userId,
        category: MEMORY_CATEGORY,
        key: MEMORY_KEY,
        value: new Date().toISOString(),
        source: "system",
      });
    }

    const status = (journeyRes.data?.status as string | null) ?? null;

    return {
      firstArrival,
      displayName:
        (profileRes.data?.display_name as string | null) ??
        (profileRes.data?.full_name as string | null) ??
        inviteName ??
        null,
      designation,
      journeyComplete: status === "complete",
      journeyStarted: Boolean(status),
      emailVerified,
    };
  });
