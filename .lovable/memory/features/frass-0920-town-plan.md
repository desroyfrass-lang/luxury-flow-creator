---
name: FRASS-0920 Frass Hill Town Plan
description: Frass Hill is a town of exactly 8 districts; all other services (Opportunity Centre, Builder Academy, DJ Academy, Marketplace Pavilion, Reflection Gardens, Foundation Office) are venues INSIDE a district. "Frass World" is retired.
type: feature
---

# FRASS-0920 — The Town Plan (supersedes FRASS-0910 district list)

Architectural correction: **functions are not districts.** Frass Hill is a living town.
You don't walk to "Opportunity Centre" — you walk into the Town Square, and there happens
to be an Opportunity Centre.

## The only eight districts
1. 🏛 **Frass Town Square** — civic/social heart (Information Centre, Frassy Kiosk, Opportunity Centre, Community Hall, Marketplace Stalls, Foundation Office, Volunteer Centre, Café, Domino Yard, Music Stage, Reflection Corner)
2. 👶 **Children's Village** — all four age worlds, Parent Dashboard, Kids Shop, Family Vision Maps
3. 👟 **Frass District** — the commercial fashion promenade (Kicks, Drip, Bare Drip, Plus+, Afro Designers, Virals, Liquidation Room, Capsules). NOT "Frass Kicks".
4. ✨ **Frass Luxury House** — separate estate; gardens → wine room → wings → atelier → bridal
5. 🎵 **Studio District** — replaces Music Quarter AND DJ District (recording, DJ, podcast, photo, video, editing, performance hall, publishing, artist development)
6. 🏗 **Builders Village** — skilled trades (Builder Academy lives here, plus showcase, directory, equipment, estimator, CRM, apprenticeships, legacy library)
7. 🌿 **Farm District** — fields, greenhouses, farm market, equipment yard, training, journals
8. 🏛 **Founder Hall** — Constitution, history, roadmap, Hall of Legacy, Blueprint Studio

**Rule:** any new feature gets an address inside one of these eight. Never add a top-level district.

## Entrance
"Frass World" is retired — Frass Hill IS the world. Gateway sequence:
Welcome to Frass → Frassy appears → welcomes → shrinks elegantly → two buttons:
**SHOP** or **ENTER FRASS HILL**. `/frass-world` permanently redirects to `/frass-hill`.

## Implementation
- `src/lib/frass-hill.ts` — 8-district registry with `venues[]`, stewards, journeys, terminology, TOWN_PLAN_RULE.
- `src/routes/frass-hill.tsx` — the town plan page (hero + district cards that expand to show what's inside).
- `src/routes/frass-world.tsx` — redirect only.
