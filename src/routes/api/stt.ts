// High-accuracy speech-to-text for Frassy — Lovable AI Gateway.
// The browser records complete WAV clips and posts them here; we forward them
// to openai/gpt-4o-transcribe with a Frass vocabulary prompt so platform names
// ("Frassy", "FrassKicks", "Builder Vault", "Executive Tower") are never misheard.

import { primaryProvider } from "@/lib/ai/providers";
import { createFileRoute } from "@tanstack/react-router";

const FRASS_VOCABULARY = [
  "Frass",
  "Frass OS",
  "Frass Operating System",
  "Frassy",
  "FrassKicks",
  "Frass Kicks",
  "Frass Drip",
  "Frass Hill",
  "Builder",
  "Builder Vault",
  "Builder Passport",
  "Builder Composer",
  "Welcome Hall",
  "Creation District",
  "Opportunity Center",
  "Academy",
  "Community Square",
  "Foundation",
  "Executive Tower",
  "Marketplace",
  "Universal Memory",
  "Universal Search",
  "Nicky",
].join(", ");

const PROMPT = `Transcribe clearly with correct punctuation and capitalization. Domain vocabulary: ${FRASS_VOCABULARY}.`;

const MAX_BYTES = 12 * 1024 * 1024;

export const Route = createFileRoute("/api/stt")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("STT not configured", { status: 500 });

        let form: FormData;
        try {
          form = await request.formData();
        } catch {
          return new Response("Expected multipart/form-data", { status: 400 });
        }

        const audio = form.get("file");
        if (!(audio instanceof File) || audio.size === 0) {
          return new Response("Missing audio", { status: 400 });
        }
        if (audio.size > MAX_BYTES) {
          return new Response("Audio too large", { status: 413 });
        }

        const upstreamForm = new FormData();
        upstreamForm.append("model", primaryProvider("speech-in"));
        upstreamForm.append("file", audio, audio.name || "recording.wav");
        upstreamForm.append("prompt", PROMPT);

        try {
          const upstream = await fetch(
            "https://ai.gateway.lovable.dev/v1/audio/transcriptions",
            {
              method: "POST",
              headers: { "Lovable-API-Key": key },
              body: upstreamForm,
            },
          );

          if (!upstream.ok) {
            const detail = await upstream.text().catch(() => "");
            const status =
              upstream.status === 402 || upstream.status === 429 ? upstream.status : 502;
            return new Response(detail || "Transcription failed", { status });
          }

          const data = (await upstream.json().catch(() => ({}))) as { text?: unknown };
          const text = typeof data.text === "string" ? data.text.trim() : "";
          return Response.json({ text });
        } catch (err) {
          return new Response(err instanceof Error ? err.message : "STT failed", {
            status: 500,
          });
        }
      },
    },
  },
});
