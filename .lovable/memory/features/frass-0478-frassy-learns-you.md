---
name: FRASS-0478 — Frassy Learns You (working style)
description: Frassy quietly learns HOW each member likes to work (voice/text, depth, timing, reminders, tone) by observation; architecture frozen after this
type: feature
---

# FRASS-0478 — Frassy Learns You

Founder Principle: "Frassy shouldn't just remember what you said. She should remember how you like to work."

Not conversation memory — **working style**, learned by observation, never configured:
- voice vs text preference
- concise answers vs detailed walkthroughs
- morning / afternoon / evening / night rhythm
- skips explanations (interruptions, "just tell me") vs asks for more
- reminders welcome vs only-when-asked
- encouragement vs direct style

Personality never changes. Only fit improves. Different members (Founder = concise; Kanko = more explanation and reassurance) get the same Frassy, tuned.

## Implementation
- `src/lib/frassy/working-style.ts` — local-only profile, pure `applyTurn` reducer, `deriveProfile`, `workingStyleContext` (manner guidance sent to the model, never facts, never spoken back), `describeWorkingStyle`, `forgetWorkingStyle`. Confidence threshold: 6 observations.
- `src/components/frassy-chat.tsx` — observes each turn, records interruptions (cutting her off) and idle-offer responses; sends `workingStyleContext` to `/api/chat`.
- `src/hooks/use-frassy-startup.ts` — `markNudgeOffered()` when the idle offer is made, so reminder learning only counts real offers.
- `src/routes/api/chat.ts` — accepts `workingStyleContext` and folds it into the context block.
- `src/components/frassy/working-style-card.tsx` — member-facing plain-English summary + "Forget how I work" (Builder Hall).

## Status
COMPLETE. **Frassy's core architecture is FROZEN.** No more major redesigns — from here, improvements are better conversations, timing, business knowledge, guidance and naturalness only.
