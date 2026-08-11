---
name: FRASS-0475 Frassy Startup Guarantee
description: Constitutional startup sequence — verify layout/chat/voice/auth/context before Frassy speaks, layout watchdog self-repair, 3-second silence rule with voice retry and spoken-in-words fallback
type: feature
---
FRASS-0475 — Platform Initialization Constitution. Never patch a page; the
shared system must make the failure impossible everywhere.

Startup sequence, owned by one place:
1. Page loads.
2. Verify readiness — layout, shared chat, voice engine, auth (member-only
   surfaces), page context. `evaluateReadiness` in `src/lib/frassy/startup.ts`.
3. Only then may Frassy greet.

Systems:
- `src/lib/frassy/startup.ts` — pure brain: readiness, layout fault inspection
  (`inspectLayout`), repair sizing (`repairSize`), silence judgement, Welcome
  Hall completeness. `SILENCE_LIMIT_MS = 3000`.
- `src/hooks/use-frassy-startup.ts` — runs inside the single shared chat
  component, so no page can opt out. Layout watchdog (rAF + 1s sweeps for the
  first 10s, resize/orientation, ResizeObserver) rebuilds a collapsed or
  overflowing panel in place — never a page refresh.
- `src/lib/frassy/speak-guarantee.ts` — the only way Frassy speaks: one
  automatic retry, then the plain-English line
  "I'm having trouble speaking right now, but I'm here and ready to help."
  Silence is a startup failure; words are always shown.
- Markers the watchdog measures: `data-frassy-panel`, `data-frassy-toolbar`,
  `data-frassy-voice`, `data-frassy-transcript`, `data-frassy-composer`. Any new
  Frassy surface must carry them rather than invent its own startup logic.

Greeting is once per destination per session (`frassy-startup:<id>`), using the
`src/lib/frassy-destinations.ts` registry, and only while Frassy is on screen.
