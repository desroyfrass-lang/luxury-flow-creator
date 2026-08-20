// FRASS-0579 — Server-issued Teleporter audit sessions.
//
// Identity no longer comes from the browser. Entering a card through the World
// Teleporter asks the server to open a session; the server resolves the card
// from the canonical registry, seals it, and stores it. Every later audit turn
// reads the locked card from that session — never from a body field, never from
// a referrer.

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { resolveAuditIdentity, isPathAmbiguous } from "./audit-registry";

export type OpenAuditSession = {
  auditSession: string;
  cardNumber: number;
  cardKey: string;
  cardTitle: string;
  canonicalRoute: string;
  registryVersion: string;
  registryHash: string;
  locked: boolean;
};

function newSessionId(): string {
  return `AF-${Math.floor(10000 + Math.random() * 89999)}`;
}

/** Open (or re-open) a locked audit session for the card that owns `path`.
 *  The path is a request, not an identity: the server resolves the card. */
export const openAuditSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { path: string }) => ({ path: String(input.path ?? "") }))
  .handler(async ({ data, context }): Promise<OpenAuditSession | null> => {
    const { supabase, userId } = context;
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });
    if (!isAdmin) return null;
    if (isPathAmbiguous(data.path)) return null;
    const identity = resolveAuditIdentity(data.path);
    if (!identity) return null;

    // One open audit at a time — a new card closes the previous session.
    await supabase
      .from("teleporter_audit_sessions")
      .update({ closed_at: new Date().toISOString(), locked: false })
      .eq("founder_id", userId)
      .is("closed_at", null);

    const auditSession = newSessionId();
    const { error } = await supabase.from("teleporter_audit_sessions").insert({
      founder_id: userId,
      audit_session: auditSession,
      card_number: identity.id,
      card_key: identity.key,
      card_title: identity.title,
      canonical_route: identity.route,
      registry_version: identity.registryVersion,
      registry_hash: identity.registryHash,
      locked: true,
    });
    if (error) throw new Error(error.message);

    return {
      auditSession,
      cardNumber: identity.id,
      cardKey: identity.key,
      cardTitle: identity.title,
      canonicalRoute: identity.route,
      registryVersion: identity.registryVersion,
      registryHash: identity.registryHash,
      locked: true,
    };
  });

/** The Founder's currently open audit session, if any. */
export const activeAuditSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<OpenAuditSession | null> => {
    const { supabase, userId } = context;
    const { data } = await supabase
      .from("teleporter_audit_sessions")
      .select(
        "audit_session, card_number, card_key, card_title, canonical_route, registry_version, registry_hash, locked",
      )
      .eq("founder_id", userId)
      .is("closed_at", null)
      .order("opened_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!data) return null;
    return {
      auditSession: data.audit_session,
      cardNumber: data.card_number,
      cardKey: data.card_key,
      cardTitle: data.card_title,
      canonicalRoute: data.canonical_route,
      registryVersion: data.registry_version,
      registryHash: data.registry_hash,
      locked: data.locked,
    };
  });

/** Exit the audit. Nothing is deleted; the record simply stops being active. */
export const closeAuditSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ closed: boolean }> => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("teleporter_audit_sessions")
      .update({ closed_at: new Date().toISOString(), locked: false })
      .eq("founder_id", userId)
      .is("closed_at", null);
    return { closed: !error };
  });
