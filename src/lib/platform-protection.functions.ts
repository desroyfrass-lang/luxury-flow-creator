// FRASS-0476 — Platform Protection Mode persistence.
// Reads are open to any signed-in member (so surfaces can explain a pause);
// writing the switch is Founder-only. Reuses `launch_program_settings`.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  ALL_DOMAINS,
  PROTECTION_OFF,
  PROTECTION_SETTINGS_ID,
  parsePaused,
  serializePaused,
  type ProtectionDomain,
  type ProtectionState,
} from "@/lib/platform-protection";

type Sb = { from: (t: string) => any; rpc: (n: string, a?: unknown) => any };

export const getPlatformProtection = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ProtectionState> => {
    const sb = context.supabase as unknown as Sb;
    const { data } = await sb
      .from("launch_program_settings")
      .select("enabled, notice, updated_at")
      .eq("id", PROTECTION_SETTINGS_ID)
      .maybeSingle();
    if (!data) return PROTECTION_OFF;
    return {
      active: Boolean(data.enabled),
      paused: parsePaused(data.notice as string | null),
      updatedAt: (data.updated_at as string | null) ?? null,
    };
  });

export const setPlatformProtection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { active: boolean; paused?: string[] }) => ({
    active: Boolean(input?.active),
    paused: (Array.isArray(input?.paused) ? input.paused : ALL_DOMAINS).filter((d): d is ProtectionDomain =>
      (ALL_DOMAINS as string[]).includes(d),
    ),
  }))
  .handler(async ({ data, context }): Promise<ProtectionState> => {
    const sb = context.supabase as unknown as Sb;
    const { data: admin } = await sb.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    const { data: sup } = await sb.rpc("has_role", { _user_id: context.userId, _role: "super_admin" });
    if (!admin && !sup) {
      const { recordSecurityEvent } = await import("@/lib/security/events.server");
      await recordSecurityEvent({
        category: "access",
        rule: "Founder-only surface",
        surface: "platform-protection.setPlatformProtection",
        userId: context.userId,
        detail: "A signed-in member without Founder authority tried to change Platform Protection Mode.",
        plainEnglish: "Somebody reached for the emergency switch. It stayed locked.",
      });
      throw new Error("Founder access only.");
    }

    const updated_at = new Date().toISOString();
    const { error } = await sb.from("launch_program_settings").upsert({
      id: PROTECTION_SETTINGS_ID,
      enabled: data.active,
      notice: serializePaused(data.paused),
      updated_at,
    });
    if (error) throw new Error(error.message);

    // The switch itself is a security event — every throw is on the record.
    const { recordSecurityEvent } = await import("@/lib/security/events.server");
    await recordSecurityEvent({
      category: "policy",
      rule: "Platform Protection Mode",
      surface: "platform-protection.setPlatformProtection",
      userId: context.userId,
      detail: data.active
        ? `Platform Protection Mode turned ON. Paused: ${data.paused.join(", ") || "nothing yet"}.`
        : "Platform Protection Mode turned OFF. Normal operations resumed.",
      plainEnglish: data.active
        ? "The Founder closed the till while something is checked. Everything stays viewable."
        : "The Founder reopened the platform. Normal trading resumed.",
    });

    return { active: data.active, paused: data.paused, updatedAt: updated_at };
  });
