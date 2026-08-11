// FRASS-0475 — one way to make Frassy speak, everywhere.
// Voice gets a single automatic second chance; if it still cannot start, the
// caller receives the plain-English line to show instead. Silence is never an
// acceptable outcome.

import { speakText } from "@/lib/voice/speech-manager";
import { VOICE_FALLBACK_MESSAGE, VOICE_RETRY_LIMIT } from "@/lib/frassy/startup";

export async function speakWithGuarantee(
  text: string,
  opts: { owner?: string; allowed?: boolean } = {},
): Promise<{ spoke: boolean; notice: string | null }> {
  if (opts.allowed === false) return { spoke: false, notice: null };
  let attempts = 0;
  let result = await speakText(text, { owner: opts.owner ?? "frassy" }).catch(
    () => "failed" as const,
  );
  while (attempts < VOICE_RETRY_LIMIT && (result === "failed" || result === "blocked")) {
    attempts += 1;
    result = await speakText(text, { owner: opts.owner ?? "frassy" }).catch(
      () => "failed" as const,
    );
  }
  if (result === "failed" || result === "blocked")
    return { spoke: false, notice: VOICE_FALLBACK_MESSAGE };
  return { spoke: true, notice: null };
}
