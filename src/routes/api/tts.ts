// Neural TTS for Frassy — Lovable AI Gateway (openai/gpt-4o-mini-tts).
//
// PHASE 2 SCOPE: one request → one complete MP3 file → client plays it once.
// SSE/PCM streaming stays disabled; streaming playback belongs to Phase 3 and
// was a source of the turn-ownership regressions.
//
// FRASS-0522 — Frassy Voice Identity. The voice, speed and warmth are resolved
// here from the Founder-approved official record, NOT from the caller. Callers
// may only ask for a tone (how she feels), never for a different voice — that
// is what keeps her the same person in every district. The single exception is
// an explicit Founder preview from the Voice Studio.
import { primaryProvider } from "@/lib/ai/providers";
import { createFileRoute } from "@tanstack/react-router";
import {
  VOICE_CANDIDATE_IDS,
  applyPronunciation,
  buildVoiceInstruction,
  clampSpeed,
  clampWarmth,
  isVoiceTone,
} from "@/lib/voice/frassy-voice";
import { getOfficialVoiceIdentity } from "@/lib/voice/voice-identity.server";

type Body = {
  text?: unknown;
  tone?: unknown;
  stream?: unknown;
  /** Founder Voice Studio preview only. */
  preview?: unknown;
  voice?: unknown;
  speed?: unknown;
  warmth?: unknown;
};

export const Route = createFileRoute("/api/tts")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json().catch(() => ({}))) as Body;

        // Phase 2 guard: streaming playback stays off.
        if (body.stream === true) {
          return new Response("Streaming TTS is disabled", { status: 400 });
        }

        const rawText = typeof body.text === "string" ? body.text.trim() : "";
        if (!rawText) return new Response("Missing text", { status: 400 });
        // The client chunks long replies (src/lib/voice/chunk-text.ts) and never
        // truncates. This ceiling is a safety valve, not a content limit.
        if (rawText.length > 2400) return new Response("Text too long", { status: 400 });

        const official = await getOfficialVoiceIdentity();
        const isPreview =
          body.preview === true &&
          typeof body.voice === "string" &&
          VOICE_CANDIDATE_IDS.includes(body.voice);

        const identity = isPreview
          ? {
              voiceId: body.voice as string,
              speed: body.speed === undefined ? official.speed : clampSpeed(body.speed),
              warmth: body.warmth === undefined ? official.warmth : clampWarmth(body.warmth),
              pronunciation: official.pronunciation,
            }
          : official;

        const tone = isVoiceTone(body.tone) ? body.tone : "neutral";
        const text = applyPronunciation(rawText, identity.pronunciation);
        const instructions = buildVoiceInstruction(identity, tone);

        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("TTS not configured", { status: 500 });

        try {
          const upstream = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${key}`,
            },
            body: JSON.stringify({
              model: primaryProvider("speech-out"),
              input: text,
              voice: identity.voiceId,
              speed: identity.speed,
              response_format: "mp3",
              instructions,
            }),
          });

          if (!upstream.ok) {
            const errText = await upstream.text().catch(() => "");
            const status =
              upstream.status === 402 || upstream.status === 429 ? upstream.status : 502;
            return new Response(errText || "TTS upstream error", { status });
          }

          return new Response(upstream.body, {
            headers: {
              "Content-Type": "audio/mpeg",
              "Cache-Control": "private, max-age=3600",
            },
          });
        } catch (err) {
          return new Response(err instanceof Error ? err.message : "TTS failed", { status: 500 });
        }
      },
    },
  },
});
