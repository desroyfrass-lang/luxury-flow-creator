---
name: FRASS-0477 Frassy Presence Constitution
description: Always present, never intrusive — arrival/returning/working/idle etiquette, Focus Mode silence, and the cloud → device → text voice hierarchy with a visible indicator
type: feature
---

FRASS-0477, P0 constitutional amendment. Extends the ONE shared Frassy — no new
Frassy, no page-local behaviour.

Presence engine: `src/lib/frassy/presence.ts` (pure, testable), consumed by the
shared `useFrassyStartup` hook and therefore by every Frassy surface.
- arrival — first time in a room this session: full welcome, spoken, once.
- returning — same session revisit: "Welcome back." only; never the speech again.
- working — member is interacting: quiet and available, never interrupts.
- idle — no interaction for `IDLE_NUDGE_MS` (4 min): one gentle
  "Need a hand with the next step?", once per room, then silence.
- Focus Mode (`focusMode` option): short greeting only, no idle nudge; task,
  progress, completion and emergencies only.
Session bookkeeping keys: `frassy-presence:visit:<room>` and
`frassy-presence:nudge:<room>`.

Voice hierarchy: `src/lib/voice/voice-tier.ts` — cloud → device → text, set by
`speech-manager.ts` at every outcome (including the previously terminal
"blocked" path, which now tries device voice first). `speakWithGuarantee`
returns the tier and its notice. The chat header shows
"Frassy Voice Active" / "Using Device Voice" so the member never guesses why
the voice changed.

Direction from the Founder: Frassy's architecture is now settled. From here she
grows in capability (knowledge, conversation, timing, polish), not complexity.
