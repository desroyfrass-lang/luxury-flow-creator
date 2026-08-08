// Neural TTS for Frassy — Lovable AI Gateway (openai/gpt-4o-mini-tts).
//
// PHASE 2 SCOPE: one request → one complete MP3 file → client plays it once.
// SSE/PCM streaming stays disabled; streaming playback belongs to Phase 3 and
// was a source of the turn-ownership regressions.

import { createFileRoute } from "@tanstack/react-router";

type Body = {
  text?: unknown;
  voice?: unknown;
  instructions?: unknown;
  speed?: unknown;
  stream?: unknown;
};

const ALLOWED_VOICES = new Set([
  "alloy",
  "ash",
  "ballad",
  "coral",
  "echo",
  "fable",
  "onyx",
  "nova",
  "sage",
  "shimmer",
  "verse",
]);

export const Route = createFileRoute("/api/tts")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json().catch(() => ({}))) as Body;

        // Phase 2 guard: streaming playback stays off.
        if (body.stream === true) {
          return new Response("Streaming TTS is disabled", { status: 400 });
        }

        const text = typeof body.text === "string" ? body.text.trim() : "";
        if (!text) return new Response("Missing text", { status: 400 });
        // The client chunks long replies (src/lib/voice/chunk-text.ts) and never
        // truncates. This ceiling is a safety valve, not a content limit.
        if (text.length > 2400) return new Response("Text too long", { status: 400 });

        const voiceRaw = typeof body.voice === "string" ? body.voice : "shimmer";
        const voice = ALLOWED_VOICES.has(voiceRaw) ? voiceRaw : "shimmer";
        const instructions =
          typeof body.instructions === "string" ? body.instructions.slice(0, 300) : undefined;
        const speed =
          typeof body.speed === "number" && body.speed >= 0.7 && body.speed <= 1.3
            ? body.speed
            : 1.0;

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
              model: "openai/gpt-4o-mini-tts",
              input: text,
              voice,
              speed,
              response_format: "mp3",
              ...(instructions ? { instructions } : {}),
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
