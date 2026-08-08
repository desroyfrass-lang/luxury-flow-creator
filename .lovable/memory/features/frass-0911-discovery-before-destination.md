---
name: FRASS-0911 Discovery Before Destination
description: Movement layer of Frass Hill — street life you pass, blended district transitions, living time (hour/occasion), and the town remembering you
type: feature
---

# FRASS-0911 — Discovery Before Destination (constitutional)

**Every destination should first be experienced from a distance, inviting curiosity
before interaction.** (Expanded form of the Sightline Principle.)

## The four rules
1. **Movement, not navigation.** Every journey rewards curiosity; the longer walk is often
   the better experience. People pass life — a carver, a coffee stand, two builders over a
   blueprint, children selling lemonade, a sleeping dog. None are destinations.
2. **No hard borders.** Districts blend. You hear music, then see murals, then people
   carrying guitars, then studios. The district changes before the sign says it changed.
3. **Living time.** Dawn, morning, afternoon, evening, night each feel different; occasions
   (Emancipation Day, Harvest Festival, Founder's Day, Christmas) change the whole town.
4. **The town remembers you.** "Last time you were here, you were working on Kids Village."
   Quiet, once, never in the way.

## Placemaking standard
Districts are judged by movement questions, not interface questions: walking pace, benches,
whether you can sit and simply watch, birds, music approaching Studio District, dominoes heard
before seen, lights coming on one at a time at sunset. If clicking nothing still feels alive,
the district passes.

## Implementation
- `src/lib/frass-hill-movement.ts` — `DISCOVERY_PRINCIPLE`, `MOVEMENT_PRINCIPLE`,
  `TRANSITION_PRINCIPLE`, `PLACEMAKING_QUESTIONS`, `STREET_LIFE`, `DISTRICT_BLENDS`,
  `HILL_HOURS`/`atmosphereAt()`, `HILL_OCCASIONS`, and visit memory (`rememberVisit`/`memoryOf`).
- `src/components/hill-movement.tsx` — `HillHourBand`, `HillHourWash`, `StreetLife`,
  `DistrictBlends`, `TownMemory`.
- Mounted on `src/routes/frass-hill.tsx`. Any new district surface must include street life
  and a blend out of the district.
