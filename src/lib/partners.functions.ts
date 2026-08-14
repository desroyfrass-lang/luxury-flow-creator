import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * FRASS-0456 — First Partner Welcome Hall (server authority).
 *
 * Constitutional rule (FRASS-0449): the client may *request* partner
 * recognition; only the backend may *grant* it. An invitation is matched on the
 * caller's verified sign-in email, never on anything the browser sends.
 */

export type PartnerStatus = {
  invited: boolean;
  designation: string | null;
  displayName: string | null;
  claimed: boolean;
};

/** Reads the caller's own invitation, if one exists. RLS scopes this to them. */
export const getMyPartnerStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<PartnerStatus> => {
    const { data, error } = await context.supabase
      .from("partner_invitations")
      .select("designation, display_name, claimed_by")
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return { invited: false, designation: null, displayName: null, claimed: false };
    return {
      invited: true,
      designation: data.designation,
      displayName: data.display_name,
      claimed: Boolean(data.claimed_by),
    };
  });

export type ProvisionResult = {
  designation: string | null;
  displayName: string | null;
  /** Everyday-language list of what was made ready, in the order Frassy narrates it. */
  provisioned: { key: string; label: string; detail: string; created: boolean }[];
};

/**
 * The single provisioning act behind the Frass Hill door. Idempotent: walking
 * through the hall twice never creates a second identity.
 */
export const provisionFrassHill = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ displayName: z.string().max(120).optional() }).parse(d ?? {}),
  )
  .handler(async ({ context, data }): Promise<ProvisionResult> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // 1. Verified identity — the only trusted source of the caller's email.
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(
      context.userId,
    );
    if (authError) throw authError;
    const email = (authUser.user?.email ?? "").toLowerCase();
    const emailVerified = Boolean(authUser.user?.email_confirmed_at);

    // 2. Invitation claim (backend authority only).
    let designation: string | null = null;
    let inviteName: string | null = null;
    if (email && emailVerified) {
      const { data: invite } = await supabaseAdmin
        .from("partner_invitations")
        .select("id, designation, display_name, claimed_by")
        .ilike("email", email)
        .maybeSingle();
      if (invite && (!invite.claimed_by || invite.claimed_by === context.userId)) {
        designation = invite.designation;
        inviteName = invite.display_name;
        if (!invite.claimed_by) {
          await supabaseAdmin
            .from("partner_invitations")
            .update({ claimed_by: context.userId, claimed_at: new Date().toISOString() })
            .eq("id", invite.id);
        }
        await supabaseAdmin
          .from("user_roles")
          .upsert({ user_id: context.userId, role: "partner" }, { onConflict: "user_id,role" });
      }
    }

    const provisioned: ProvisionResult["provisioned"] = [];
    const chosenName = data.displayName?.trim() || inviteName || null;

    // 3. Profile.
    const { data: profile } = await context.supabase
      .from("profiles")
      .select("id, display_name")
      .eq("id", context.userId)
      .maybeSingle();
    if (!profile) {
      await context.supabase
        .from("profiles")
        .insert({ id: context.userId, display_name: chosenName, builder_stage: "explorer" });
      provisioned.push({
        key: "profile",
        label: "Your place in the record",
        detail: "You exist on the Hill now — not as a row in a list, as a person with a name.",
        created: true,
      });
    } else {
      if (chosenName && !profile.display_name) {
        await context.supabase
          .from("profiles")
          .update({ display_name: chosenName })
          .eq("id", context.userId);
      }
      provisioned.push({
        key: "profile",
        label: "Your place in the record",
        detail: "Already here from before — I kept it.",
        created: false,
      });
    }

    // The shared profile is the FrassKicks customer identity too. Frass Hill
    // does not create a second account or a parallel customer record.
    provisioned.push({
      key: "kicks-profile",
      label: "Your FrassKicks customer profile",
      detail:
        "Your shopping identity uses this same account for saved fits and orders. Here's what this means: one key opens both Frass Hill and the store.",
      created: !profile,
    });

    // 4. Frass Card.
    const { data: card } = await context.supabase
      .from("business_cards")
      .select("user_id")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (!card) {
      await context.supabase.from("business_cards").insert({ user_id: context.userId });
    }
    provisioned.push({
      key: "card",
      label: "Your Frass Card",
      detail:
        "One permanent identity page that is yours for life. Here's the idea: it's your address on the Hill — people can find you, pay you, and follow your work from it.",
      created: !card,
    });

    // 5. Builder Vault presence (the container; contents come later).
    const { count } = await context.supabase
      .from("vault_items")
      .select("id", { count: "exact", head: true })
      .eq("user_id", context.userId);
    provisioned.push({
      key: "vault",
      label: "Your Builder Vault",
      detail:
        "A private place to keep everything you make. Here's how it works: a drawer that never loses anything, and nobody else can open it.",
      created: (count ?? 0) === 0,
    });

    // 6. The Daily.
    provisioned.push({
      key: "daily",
      label: "Your Daily",
      detail:
        "A short, honest plan each morning. Let's break it down: instead of a hundred things, you get the few that actually move you forward today.",
      created: true,
    });

    return { designation, displayName: chosenName ?? inviteName, provisioned };
  });

/* ------------------------------ Founder tools ----------------------------- */

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error) throw new Error(error.message);
  if (!data) {
    const { data: sa } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "super_admin",
    });
    if (!sa) throw new Error("Founder access required.");
  }
}

export const listPartnerInvitations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as never);
    const { data, error } = await context.supabase
      .from("partner_invitations")
      .select("id, email, designation, display_name, note, claimed_at, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const invitePartner = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        email: z.string().email().max(200),
        designation: z.enum(["first_partner", "early_partner", "beta_partner", "brand_partner"]),
        displayName: z.string().max(120).optional(),
        note: z.string().max(500).optional(),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context as never);
    const { error } = await context.supabase.from("partner_invitations").upsert(
      {
        email: data.email.toLowerCase(),
        designation: data.designation,
        display_name: data.displayName || null,
        note: data.note || null,
        invited_by: context.userId,
      },
      { onConflict: "email" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const revokePartnerInvitation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context as never);
    const { error } = await context.supabase
      .from("partner_invitations")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
