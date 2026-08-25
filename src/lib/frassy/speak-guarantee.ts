// FRASS-0475 / FRASS-0477 — one way to make Frassy speak, everywhere.
//
// Voice hierarchy: cloud voice → device voice (automatic, inside the speech
// manager) → text greeting with a small indicator. Silence is never an
// acceptable outcome, and the member never has to guess why she sounds
// different.

import { speakText } from "@/lib/voice/speech-manager";
import { voiceAllowed } from "@/lib/frassy/voice-consent";
import { VOICE_RETRY_LIMIT } from "@/lib/frassy/startup";
import {
  VOICE_TIER_NOTICES,
  getVoiceTier,
  setVoiceTier,
  type VoiceTier,
} from "@/lib/voice/voice-tier";
import type { VoiceTone } from "@/lib/voice/frassy-voice";

export async function speakWithGuarantee(
  text: string,
  opts: { owner?: string; allowed?: boolean; tone?: VoiceTone } = {},
): Promise<{ spoke: boolean; notice: string | null; tier: VoiceTier }> {
  if (opts.allowed === false) return { spoke: false, notice: null, tier: getVoiceTier() };
  // Step 2 — the visitor chooses first. Until they do, she stays in text and
  // remains completely usable there.
  if (!voiceAllowed()) return { spoke: false, notice: null, tier: "text" };
  let attempts = 0;
  let result = await speakText(text, { owner: opts.owner ?? "frassy", tone: opts.tone }).catch(
    () => "failed" as const,
  );
  while (attempts < VOICE_RETRY_LIMIT && (result === "failed" || result === "blocked")) {
    attempts += 1;
    result = await speakText(text, { owner: opts.owner ?? "frassy", tone: opts.tone }).catch(
      () => "failed" as const,
    );
  }
  if (result === "failed" || result === "blocked") {
    setVoiceTier("text");
    return { spoke: false, notice: VOICE_TIER_NOTICES.text, tier: "text" };
  }
  const tier = getVoiceTier();
  return { spoke: true, notice: VOICE_TIER_NOTICES[tier], tier };
}
