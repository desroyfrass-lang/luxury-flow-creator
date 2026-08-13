// FRASS-0522 — server-side resolver for Frassy's one official voice.
// Cached briefly so every clip in a conversation uses the same settings
// without a database round-trip per sentence.
import {
  DEFAULT_PRONUNCIATION,
  FALLBACK_VOICE_IDENTITY,
  clampSpeed,
  clampWarmth,
  normalizeVoiceId,
  type VoiceIdentity,
} from "@/lib/voice/frassy-voice";

let cached: { at: number; identity: VoiceIdentity } | null = null;
const TTL_MS = 60_000;

export function clearVoiceIdentityCache() {
  cached = null;
}

export async function getOfficialVoiceIdentity(): Promise<VoiceIdentity> {
  if (cached && Date.now() - cached.at < TTL_MS) return cached.identity;
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("voice_identity")
      .select("voice_id, speed, warmth, pronunciation")
      .eq("status", "official")
      .maybeSingle();
    if (!data) return FALLBACK_VOICE_IDENTITY;
    const identity: VoiceIdentity = {
      voiceId: normalizeVoiceId(data.voice_id),
      speed: clampSpeed(data.speed),
      warmth: clampWarmth(data.warmth),
      pronunciation:
        data.pronunciation && typeof data.pronunciation === "object" && !Array.isArray(data.pronunciation)
          ? (data.pronunciation as Record<string, string>)
          : DEFAULT_PRONUNCIATION,
    };
    cached = { at: Date.now(), identity };
    return identity;
  } catch {
    return FALLBACK_VOICE_IDENTITY;
  }
}
