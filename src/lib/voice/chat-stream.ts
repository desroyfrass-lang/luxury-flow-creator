// Client transport for a streaming Frassy turn.
//
// Belongs to the voice layer but is deliberately provider-agnostic: it speaks
// only to Frassy's own /api/chat. Deltas surface as live text, complete clauses
// surface as speakable sentences, and the terminal frame carries the cards.

import { SentencePump } from "./sentence-pump";

export type FrassyStreamResult = {
  reply: string;
  cards?: { products?: unknown[]; order?: unknown } | undefined;
  error?: string;
};

export type FrassyStreamHandlers = {
  /** Raw token deltas — for live on-screen text. */
  onDelta?: (text: string) => void;
  /** Complete clauses, in order — feed straight into the speech session. */
  onSentence?: (sentence: string) => void;
  signal?: AbortSignal;
};

export async function streamFrassyChat(
  body: Record<string, unknown>,
  handlers: FrassyStreamHandlers = {},
): Promise<FrassyStreamResult> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, stream: true }),
    signal: handlers.signal,
  });

  const contentType = res.headers.get("Content-Type") ?? "";
  if (!contentType.includes("text/event-stream") || !res.body) {
    const data = (await res.json().catch(() => ({}))) as FrassyStreamResult;
    if (!res.ok) return { reply: "", error: data.error ?? "I hit a snag. Try again in a sec?" };
    if (data.reply) {
      handlers.onDelta?.(data.reply);
      handlers.onSentence?.(data.reply);
    }
    return data;
  }

  const pump = new SentencePump((sentence) => handlers.onSentence?.(sentence));
  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  let streamed = "";
  let final: FrassyStreamResult | null = null;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += value;
    const frames = buffer.split("\n\n");
    buffer = frames.pop() ?? "";
    for (const frame of frames) {
      const line = frame.split("\n").find((l) => l.startsWith("data:"));
      if (!line) continue;
      const raw = line.slice(5).trim();
      if (!raw) continue;
      let payload: {
        type?: string;
        text?: string;
        reply?: string;
        replaced?: boolean;
        error?: string;
        cards?: FrassyStreamResult["cards"];
      };
      try {
        payload = JSON.parse(raw);
      } catch {
        continue;
      }
      if (payload.type === "delta" && payload.text) {
        streamed += payload.text;
        handlers.onDelta?.(payload.text);
        pump.push(payload.text);
      } else if (payload.type === "done") {
        // A replaced reply (founder guard) was never spoken — speak it now.
        if (payload.replaced) {
          pump.reset();
          handlers.onSentence?.(payload.reply ?? "");
        } else {
          pump.flush();
        }
        final = { reply: payload.reply ?? streamed, cards: payload.cards };
      } else if (payload.type === "error") {
        pump.reset();
        final = { reply: "", error: payload.error };
      }
    }
  }

  if (!final) {
    pump.flush();
    final = { reply: streamed };
  }
  return final;
}
