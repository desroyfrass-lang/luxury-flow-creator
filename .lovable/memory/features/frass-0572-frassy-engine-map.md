---
name: FRASS-0572 Frassy Engine Map — one intelligence layer, many modes
description: Only two conversation pipelines may exist (shared /api/chat and the Journey pipeline); Journey Mode never runs or replays Teleporter audits; surfaces pick a mode, never a new engine
type: feature
---

One Frassy intelligence layer. Modes: Journey, Founder, Teleporter Audit,
Builder, Customer. Registry: `src/lib/frassy/engine-registry.ts`. Map document:
`FRASSY_ENGINE_MAP.md`.

Pipelines (only two, no third may be created):
- `shared` — `/api/chat` (`src/routes/api/chat.ts`) — Founder, Audit, Builder, Customer.
- `journey` — `src/lib/journey.functions.ts` — `/onboarding` only.

Constitutional rules:
- Journey Mode never conducts a Teleporter audit and never replays audit turns.
  Audits run only on the shared pipeline, clean-room, card resolved from the path.
- Journey history, journey openings and the `/onboarding` transcript all filter
  out audit turns (`isTeleporterAuditTurn`). This was the root cause of the
  repeating "Card #11" replies: an old audit was saved into journey history and
  re-served as her opening line.
- New surfaces choose a mode, never a new engine.

Open milestone: collapse Journey Mode onto the shared pipeline so stage state is
workflow data, not a second engine.

FRASS-0572A: Founder-only Frassy Engine badge (bottom-left, dismissible, stored
in `frass.frassy.engine-badge`) shows pipeline, mode, history source, turns
loaded, audit turns filtered, active card and path. Constitutional principle:
engine boundaries are sacred — Journey, Founder, Builder, Customer and
Teleporter Audit modes never share conversational history unless deliberately
designed and documented.
