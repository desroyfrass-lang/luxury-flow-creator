---
name: FRASS Kids World
description: Kids World is a first-class district of Frass Hill (not owned by Frass Kicks) — one destination, multiple entrances, parent-issued passport, four age worlds
type: feature
---

# FRASS Kids World

- Kids World is a permanent district **inside Frass Hill**. Frass Kicks is only one entrance. There is only ONE Kids World — never duplicate versions per entrance.
- Label is always "Enter Kids World" (never "Activities"). Shopping stays "Shop Kids".
- Entrances: Frass Kids (`/frass-kids` two doors), Frass Hill map (`/frass-world` Kids Valley card + age cards), Frass Hill district navigation (`src/lib/districts.ts` → `kids_world`, status open).
- Routes: `/kids-world`, `/kids-world/$age`, `/kids-world/$age/$place`, `/kids-world/parents`.
- Data: `src/lib/kids-world.ts` — four age worlds (0-3 Gentle Garden, 3-6 Story Courtyard, 6-12 Discovery Village, 12+ Young Builders Quarter) each with places (Learning Village, Creative Studio, Music Garden, Discovery Lab, Adventure Trails, Sports Field, Community Park, Builder Corner…).
- **Passport, not a lock**: `src/lib/kids-passport.ts` (localStorage) + `src/components/kids-world/passport-gate.tsx`. Parent issues a Kids World Passport: age group, Safe Exploration Mode, optional PIN, child name. Frassy frames it as a passport, never a security checkpoint.
- Safe Exploration Mode gates Kids World content ONLY. Retail browsing is never restricted.
- Progress philosophy: no completion, scores, ranks or timers. Explore, create, celebrate milestones. Curiosity over competition.
- Foundation connection is implicit: each place carries one "small kindness" line. Never ask children for donations, never guilt.
- Visual style: premium painterly Caribbean village art, calm, uncluttered, no overstimulation. 12+ bridges into the adult Builder Journey.
