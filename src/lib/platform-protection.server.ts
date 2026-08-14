// FRASS-0476 — server-side enforcement of Platform Protection Mode.
// A switch that only changes a label is theatre; these guards are the real lock.
import {
  PROTECTION_SETTINGS_ID,
  isPaused,
  parsePaused,
  pausedMessage,
  type ProtectionDomain,
  type ProtectionState,
} from "@/lib/platform-protection";

type Sb = { from: (t: string) => any };

/** Read the current switch with whichever Supabase client the caller already has. */
export async function readProtection(sb: Sb): Promise<ProtectionState> {
  const { data } = await sb
    .from("launch_program_settings")
    .select("enabled, notice, updated_at")
    .eq("id", PROTECTION_SETTINGS_ID)
    .maybeSingle();
  if (!data) return { active: false, paused: [], updatedAt: null };
  return {
    active: Boolean(data.enabled),
    paused: parsePaused(data.notice as string | null),
    updatedAt: (data.updated_at as string | null) ?? null,
  };
}

/** Throws a everyday-language error when the Founder has frozen this part of Frass. */
export async function assertPlatformOpen(sb: Sb, domain: ProtectionDomain): Promise<void> {
  const state = await readProtection(sb);
  if (isPaused(state, domain)) throw new Error(pausedMessage(domain));
}
