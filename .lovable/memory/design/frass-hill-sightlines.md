---
name: Frass Hill sightline principle
description: Constitutional rule — every building in Frass Hill must be visible before it is visited; every district screen shows what you can see from there
type: design
---

# Sightline Principle (constitutional, FRASS-0920)

**Every building should be visible before it is visited.**

Frass Hill is not a menu. It is a place with views. People see a destination from afar,
wonder "what's over there?", and walk to it. Curiosity, never navigation.

## How to apply
- Every district surface must show **"From here you can see"** — the other districts,
  with a *direction* (down the road, up the hillside, in the valley below, toward the
  horizon) and a *sensory sight*, never a menu label.
- Sights are things you notice: shopfront lights glowing, bass drifting across the square,
  cranes catching the light, kites over the trees, fields going green to the horizon.
- Founder Hall stands above everything and is visible from nearly everywhere.
- A district that shows no view of the rest of the town is incomplete.

## Implementation
- `HILL_SIGHTLINES`, `SIGHTLINE_PRINCIPLE` and `sightlinesFrom()` in `src/lib/frass-hill.ts`.
- `src/components/hill-sightlines.tsx` — reusable "From here you can see" panel; pass
  `onLook` on the town plan to jump between cards, omit it on district pages to navigate.
