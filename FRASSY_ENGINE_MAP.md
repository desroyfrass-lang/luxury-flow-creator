# FRASS-0572 — Frassy Engine Map (every entry point, one intelligence layer)

Authoritative registry in code: `src/lib/frassy/engine-registry.ts`.

## Which surface uses which conversation engine

| Surface | Conversation engine | Mode | History store | Status |
|---|---|---|---|---|
| `/onboarding` (Welcome Hall journey) | Journey pipeline (`src/lib/journey.functions.ts`) | Journey | `builder_journey_messages` | Journey only — audits now blocked |
| `/control-room` (Founder Control Room) | Shared `/api/chat` | Founder | shared transcript | Founder |
| World Teleporter card review (any inspected route) | Shared `/api/chat` | Teleporter Audit | clean room (0 prior turns) | Founder |
| `/room`, `/workspace/*` (Builder Hall) | Shared `/api/chat` | Builder | shared transcript | Builder |
| `/daily` (The Frass Daily) | Shared `/api/chat` | Builder | shared transcript | Builder |
| Beacon on storefront / marketplace / card / public pages | Shared `/api/chat` | Customer | shared transcript | Public |

Only two pipelines exist and no third may be created. New surfaces choose a
**mode**, never a new engine.

## Root cause of the Card #11 loop

The Journey pipeline kept its own saved history. A Teleporter audit conducted
earlier had been written into that history, so:

- `journeyOpening` re-served the last saved assistant message — the Card #11
  review — as Frassy's opening words.
- `journeyTurn` replayed those audit turns as conversation context, so she kept
  continuing the old audit ("ready for Card #12").

Fixes applied in this pass:

1. `journeyTurn` strips every Teleporter audit turn from history before the model
   reads it.
2. `journeyOpening` never re-serves an audit turn as an opening line.
3. `/onboarding` never renders audit turns in the transcript.
4. Journey Mode carries an explicit boundary instruction: no `VISUAL
   VERIFICATION`, no card numbers, no "next card". If a card review is requested
   there, she points to Control Room → World Teleporter.

## Long-term milestone (open)

Collapse Journey Mode onto the shared pipeline so there is one orchestration and
one memory layer, with stage state as workflow data rather than a second engine.
Until then, this map is the contract.

## Constitutional principle — engine boundaries are sacred

Journey, Founder, Builder, Customer and Teleporter Audit modes never share
conversational history unless that sharing is deliberately designed and written
down here. Cross-mode memory bleed is the root of this whole family of bugs.

## FRASS-0572A — Frassy Engine badge (Founder only)

A small badge (bottom-left, dismissible) shows, live: pipeline, mode, history
source, turns loaded, audit turns filtered, active card, and path.
Code: `src/components/founder/frassy-engine-badge.tsx`, fed by
`src/lib/frassy/engine-diagnostics.ts`. Surfaces publish what they actually
loaded, so the badge reports reality, not intent.
