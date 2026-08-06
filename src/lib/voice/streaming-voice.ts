// Streaming TTS output provider — Lovable AI Gateway (openai/gpt-4o-mini-tts)
// over SSE, decoded chunk-by-chunk through the PcmPlayer.
//
// This is the Phase-1 implementation of `VoiceOutput`. Phase 3 (OpenAI
// Realtime) replaces this file only; callers keep the same interface.

import { PcmPlayer } from "./pcm-player";
import type { SpeakRequest, VoiceOutput } from "./types";
import {
  failPlayback,
  markPlaybackTimestamp,
  resetPlaybackDiagnostics,
  updatePlaybackDiagnostics,
} from "./playback-diagnostics";

export class StreamingGatewayVoice implements VoiceOutput {
  readonly id = "lovable-gateway-tts-stream";
  private player: PcmPlayer | null = null;
  private abort: AbortController | null = null;
  private active = false;

  get speaking(): boolean {
    return this.active;
  }

  stop() {
    this.active = false;
    try {
      this.abort?.abort();
    } catch {
      /* noop */
    }
    this.abort = null;
    this.player?.stop();
    this.player = null;
  }

  async speak(req: SpeakRequest): Promise<void> {
    const text = req.text.trim();
    if (!text) return;

    this.stop();
    resetPlaybackDiagnostics();
    const controller = new AbortController();
    this.abort = controller;
    const player = new PcmPlayer();
    this.player = player;
    this.active = true;

    const ctx = await player.ensureContext();
    if (!ctx) {
      this.active = false;
      throw new Error("audio-context-unavailable");
    }

    updatePlaybackDiagnostics({ ttsRequestSent: "ok" });
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: text.slice(0, 800),
        voice: req.voice,
        instructions: req.instructions,
        speed: req.speed,
        stream: true,
      }),
      signal: controller.signal,
    });
    if (!res.ok || !res.body) {
      this.active = false;
      updatePlaybackDiagnostics({ audioStreamReceived: "failed" });
      failPlayback(`TTS response (${res.status})`);
      const detail = await res.text().catch(() => "");
      throw new Error(`TTS ${res.status}${detail ? `: ${detail}` : ""}`);
    }
    updatePlaybackDiagnostics({ audioStreamReceived: "active" });
    markPlaybackTimestamp("ttsGenerated");

    const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
    let buffer = "";
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (controller.signal.aborted) return;
        buffer += value;
        const frames = buffer.split("\n\n");
        buffer = frames.pop() ?? "";
        for (const frame of frames) {
          const line = frame.split("\n").find((l) => l.startsWith("data:"));
          if (!line) continue;
          const raw = line.slice(5).trim();
          if (!raw || raw === "[DONE]") continue;
          try {
            const payload = JSON.parse(raw) as { type?: string; audio?: string };
            if (payload.type === "speech.audio.delta" && payload.audio) {
              player.pushBase64(payload.audio);
            }
          } catch {
            /* ignore malformed frame */
          }
        }
      }
      if (controller.signal.aborted) return;
      await player.waitForDrain();
      updatePlaybackDiagnostics({ playbackCompleted: "ok" });
    } finally {
      if (this.player === player) {
        player.stop();
        this.player = null;
        this.active = false;
      }
    }
  }
}
