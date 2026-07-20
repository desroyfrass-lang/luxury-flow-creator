// Premium neural TTS for Frassy — Lovable AI Gateway (openai/gpt-4o-mini-tts).
// Returns a full MP3 file (stream_format omitted → audio) so the client can just
// `new Audio(url).play()`. Short greetings/replies stay well under any latency
// budget; streaming PCM is a future optimization we don't need for luxury lines.

import { createFileRoute } from "@tanstack/react-router";

type Body = {
  text?: unknown;
  voice?: unknown;
  instructions?: unknown;
  speed?: unknown;
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
        const text = typeof body.text === "string" ? body.text.trim() : "";
        if (!text) return new Response("Missing text", { status: 400 });
        if (text.length > 800) return new Response("Text too long", { status: 400 });

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
              "Lovable-API-Key": key,
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
            const status = upstream.status === 402 || upstream.status === 429 ? upstream.status : 502;
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
