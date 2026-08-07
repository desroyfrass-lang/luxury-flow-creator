---
name: Frassy entrance (universal host behavior)
description: Frassy welcomes once per major destination per session, then shrinks to the corner as companion; returning visits show only "Welcome back."
type: feature
---
Frassy is the host of every Frass destination, not a corner chatbot.

- First arrival at a major destination in a session: environment softens, Frassy rises center at ~35% of viewport, speaks a destination-specific welcome, then shrinks and glides to the lower-right corner (companion mode). She never disappears.
- Once per destination per session (sessionStorage key `frassy-host:<id>`). Sub-pages, grids and product pages never re-trigger.
- Returning to a destination in the same session: no takeover — a small "Welcome back." bubble above the companion, then quiet.
- Never blocks: click anywhere, Escape or "Start exploring" sends her aside early. Respects prefers-reduced-motion.
- Destinations + copy live in `src/lib/frassy-destinations.ts`; behavior in `src/components/frassy-host.tsx`, mounted once in `__root.tsx`.
- Principle: Frassy enhances the environment, never competes with it. The world is the hero, the people are the purpose.
