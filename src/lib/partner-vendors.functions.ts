// Partner ↔ vendor mapping server functions.
//
// Isolation model: every partner-facing server tool MUST call
// `getMyAllowedVendorIds()` and filter every query/mutation by that list.
// Vendor IDs are NEVER accepted from the client — the server always
// re-derives the caller's scope from `partner_vendors`.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(
  supabase: { rpc: (fn: "has_role", args: { _user_id: string; _role: "admin" | "super_admin" }) => Promise<{ data: unknown }> },
  userId: string,
) {
  const [{ data: isAdmin }, { data: isSuper }] = await Promise.all([
    supabase.rpc("has_role", { _user_id: userId, _role: "admin" }),
    supabase.rpc("has_role", { _user_id: userId, _role: "super_admin" }),
  ]);
  if (!isAdmin && !isSuper) throw new Error("Forbidden");
}


/** Returns the caller's currently-allowed vendor IDs (deny-by-default: empty array). */
export const getMyAllowedVendorIds = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("get_active_partner_vendor_ids", {
      _user_id: context.userId,
    });
    if (error) throw error;
    return (data ?? []) as string[];
  });

/** Admin: list all mappings (active + revoked) with partner emails. */
export const listPartnerVendors = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("partner_vendors")
      .select("id, user_id, vendor_id, status, notes, created_at, created_by, revoked_at, revoked_by")
      .order("created_at", { ascending: false });
    if (error) throw error;

    // Attach emails for readability.
    const userIds = Array.from(
      new Set((rows ?? []).flatMap((r) => [r.user_id, r.created_by, r.revoked_by].filter(Boolean) as string[])),
    );
    const emails = new Map<string, string>();
    await Promise.all(
      userIds.map(async (id) => {
        const { data } = await supabaseAdmin.auth.admin.getUserById(id);
        if (data.user?.email) emails.set(id, data.user.email);
      }),
    );

    return (rows ?? []).map((r) => ({
      ...r,
      user_email: emails.get(r.user_id) ?? null,
      created_by_email: r.created_by ? emails.get(r.created_by) ?? null : null,
      revoked_by_email: r.revoked_by ? emails.get(r.revoked_by) ?? null : null,
    }));
  });

/** Admin: grant a partner access to a vendor ID (or reactivate a revoked mapping). */
export const grantPartnerVendor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userEmail: string; vendorId: string; notes?: string }) =>
    z
      .object({
        userEmail: z.string().email().max(320),
        vendorId: z.string().trim().min(1).max(200),
        notes: z.string().max(1000).optional(),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Resolve email → user_id via Auth Admin list (paged).
    const email = data.userEmail.toLowerCase();
    let target: { id: string; email?: string | null } | null = null;
    for (let page = 1; page <= 20 && !target; page++) {
      const { data: list, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 200 });
      if (error) throw error;
      target = list.users.find((u) => u.email?.toLowerCase() === email) ?? null;
      if (list.users.length < 200) break;
    }
    if (!target) throw new Error(`No user found with email ${data.userEmail}`);

    // Upsert: reactivate revoked, or insert new. Enforced by unique (user_id, vendor_id).
    const { data: existing } = await supabaseAdmin
      .from("partner_vendors")
      .select("id, status")
      .eq("user_id", target.id)
      .eq("vendor_id", data.vendorId)
      .maybeSingle();

    let mappingId: string;
    if (existing) {
      if (existing.status === "active") {
        return { ok: true as const, mappingId: existing.id, reactivated: false, alreadyActive: true };
      }
      const { data: upd, error: updErr } = await supabaseAdmin
        .from("partner_vendors")
        .update({
          status: "active",
          notes: data.notes ?? null,
          created_at: new Date().toISOString(),
          created_by: context.userId,
          revoked_at: null,
          revoked_by: null,
        })
        .eq("id", existing.id)
        .select("id")
        .single();
      if (updErr) throw updErr;
      mappingId = upd.id;
    } else {
      const { data: ins, error: insErr } = await supabaseAdmin
        .from("partner_vendors")
        .insert({
          user_id: target.id,
          vendor_id: data.vendorId,
          status: "active",
          notes: data.notes ?? null,
          created_by: context.userId,
        })
        .select("id")
        .single();
      if (insErr) throw insErr;
      mappingId = ins.id;
    }

    const { emitPlatformEvent } = await import("@/lib/platform-events.server");
    await emitPlatformEvent({
      eventType: "partner_vendor.granted",
      actorId: context.userId,
      entityType: "partner_vendors",
      entityId: mappingId,
      payload: { user_id: target.id, user_email: target.email ?? null, vendor_id: data.vendorId },
    });

    return { ok: true as const, mappingId, reactivated: existing?.status === "revoked", alreadyActive: false };
  });

/** Admin: revoke a mapping (soft — kept for audit). */
export const revokePartnerVendor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { mappingId: string }) =>
    z.object({ mappingId: z.string().uuid() }).parse(d),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error: fetchErr } = await supabaseAdmin
      .from("partner_vendors")
      .select("id, user_id, vendor_id, status")
      .eq("id", data.mappingId)
      .single();
    if (fetchErr) throw fetchErr;
    if (row.status !== "active") return { ok: true as const, alreadyRevoked: true };

    const { error: updErr } = await supabaseAdmin
      .from("partner_vendors")
      .update({
        status: "revoked",
        revoked_at: new Date().toISOString(),
        revoked_by: context.userId,
      })
      .eq("id", data.mappingId);
    if (updErr) throw updErr;

    const { emitPlatformEvent } = await import("@/lib/platform-events.server");
    await emitPlatformEvent({
      eventType: "partner_vendor.revoked",
      actorId: context.userId,
      entityType: "partner_vendors",
      entityId: data.mappingId,
      payload: { user_id: row.user_id, vendor_id: row.vendor_id },
    });

    return { ok: true as const, alreadyRevoked: false };
  });
