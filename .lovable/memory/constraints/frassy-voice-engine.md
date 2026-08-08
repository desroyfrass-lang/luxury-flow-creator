---
name: Frassy voice engine stop-ship rules
description: Single authoritative conversation state machine, no speech truncation, playback completion as source of truth, feature freeze until the completion test passes
type: constraint
---

Frassy's voice pipeline has ONE authoritative owner:
`src/lib/voice/conversation-machine.ts`. Every subsystem (LLM, TTS, playback,
UI render, microphone) subscribes and reports into it. No subsystem may decide
a turn is finished.

States: Idle · Listening · Transcribing · Thinking · Streaming Response ·
Speaking · Waiting for Builder · Interrupted · Error. One at a time.

**Never truncate speech.** `text.slice(0, N)` in the voice path is banned — it
was the cause of Frassy stopping mid-sentence. Long replies are chunked with
`src/lib/voice/chunk-text.ts` and every chunk is spoken in order.

**Playback completion is the source of truth.** Never infer completion from
token generation or text rendering. A turn closes only when LLM, TTS, playback
and render have all reported terminal status and the audio buffer is empty.

Hidden diagnostics overlay: `src/components/voice-state-overlay.tsx`, enabled
with `?voicedebug=1` or Ctrl+Alt+V.

**Feature freeze:** no new Frassy features — no animations, voice
personalities, concierge behaviours, homepage greetings, emotional refinements
— until 100 consecutive conversations run with zero truncated replies, zero
self-triggered replies, zero mid-sentence stops, zero unsolicited greetings and
zero autonomous responses.
