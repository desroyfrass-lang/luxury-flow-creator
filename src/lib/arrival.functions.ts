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
  /** Returning destination is the Daily: journey complete, or server-verified Founder/Admin. */
  returnToDaily: boolean;
};

const MEMORY_CATEGORY = "arrival";
const MEMORY_KEY = "first_arrival_at";

/** Read-only entry decision. The first-arrival marker is written only by the ceremony. */
export const getHillEntry = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const userId = context.userId;
    const [memory, journey, admin, superAdmin] = await Promise.all([
      context.supabase.from("builder_memory").select("id").eq("user_id", userId)
        .eq("category", MEMORY_CATEGORY).eq("key", MEMORY_KEY).maybeSingle(),
      context.supabase.from("builder_journeys").select("status").eq("user_id", userId).maybeSingle(),
      context.supabase.rpc("has_role", { _user_id: userId, _role: "admin" }),
      context.supabase.rpc("has_role", { _user_id: userId, _role: "super_admin" }),
    ]);
    if (memory.error || journey.error || admin.error || superAdmin.error) {
      throw new Error("Could not check your arrival just now.");
    }
    return {
      returning: journey.data?.status === "complete" || (Boolean(memory.data) && (Boolean(admin.data) || Boolean(superAdmin.data))),
    };
  });

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

    // Founder/Admin is verified live on the server as the signed-in account —
    // never from email or client state. An unfinished Builder journey must not
    // trap a Founder in onboarding; they return to the normal Daily instead.
    let founder = false;
    for (const role of ["admin", "super_admin"] as const) {
      const { data } = await context.supabase.rpc("has_role", {
        _user_id: userId,
        _role: role,
      });
      if (data) {
        founder = true;
        break;
      }
    }

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
      returnToDaily: status === "complete" || founder,
    };
  });
