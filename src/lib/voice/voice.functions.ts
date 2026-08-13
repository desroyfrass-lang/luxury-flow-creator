// FRASS-0522 — Founder-only management of Frassy's one official voice.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  VOICE_CANDIDATE_IDS,
  clampSpeed,
  clampWarmth,
  normalizeVoiceId,
  type VoiceIdentity,
} from "@/lib/voice/frassy-voice";

export type VoiceIdentityRow = VoiceIdentity & {
  id: string;
  status: "official" | "candidate" | "retired";
  note: string | null;
  approvedAt: string | null;
  createdAt: string;
};

/** Public read: the official voice, so every surface hears the same Frassy. */
export const officialVoice = createServerFn({ method: "GET" }).handler(async () => {
  const { getOfficialVoiceIdentity } = await import("@/lib/voice/voice-identity.server");
  return getOfficialVoiceIdentity();
});

export const listVoiceIdentities = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const role = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (role.data !== true) throw new Error("Only the Founder can change Frassy's voice.");
    const { data, error } = await context.supabase
      .from("voice_identity")
      .select("id, voice_id, speed, warmth, pronunciation, status, note, approved_at, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((r): VoiceIdentityRow => ({
      id: r.id,
      voiceId: normalizeVoiceId(r.voice_id),
      speed: clampSpeed(r.speed),
      warmth: clampWarmth(r.warmth),
      pronunciation: (r.pronunciation ?? {}) as Record<string, string>,
      status: r.status as VoiceIdentityRow["status"],
      note: r.note,
      approvedAt: r.approved_at,
      createdAt: r.created_at,
    }));
  });

/**
 * Approving a voice is a platform-wide act: the previous official voice is
 * retired in the same breath so there is never more than one Frassy.
 */
export const approveOfficialVoice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        voiceId: z.enum(VOICE_CANDIDATE_IDS as [string, ...string[]]),
        speed: z.number().min(0.8).max(1.2),
        warmth: z.number().int().min(1).max(5),
        pronunciation: z.record(z.string(), z.string().max(120)).default({}),
        note: z.string().max(400).nullable().default(null),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const role = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (role.data !== true) throw new Error("Only the Founder can change Frassy's voice.");

    const retire = await context.supabase
      .from("voice_identity")
      .update({ status: "retired" })
      .eq("status", "official");
    if (retire.error) throw new Error(retire.error.message);

    const { data: row, error } = await context.supabase
      .from("voice_identity")
      .insert({
        voice_id: data.voiceId,
        speed: data.speed,
        warmth: data.warmth,
        pronunciation: data.pronunciation,
        status: "official",
        note: data.note,
        approved_by: context.userId,
        approved_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    const { clearVoiceIdentityCache } = await import("@/lib/voice/voice-identity.server");
    clearVoiceIdentityCache();
    return { id: row.id, ok: true as const };
  });
