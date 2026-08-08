---
name: FRASS-0923/0924 Entrance & Arrival Experience
description: The homepage is the ceremonial Frass Entrance (arch, Frassy full welcome once); ENTER FRASS HILL goes through the /arrival journey before the Town Plan
type: feature
---

# FRASS-0923 — The Frass Entrance (Act I)

`/` is the ceremonial entrance: the monumental Frass arch at golden hour, the
Frass mark on the arch, "Welcome to Frass." and two equal paths —
**SHOP FRASS** → `/frass-district`, **ENTER FRASS HILL** → `/arrival`.

- Frassy performs her full welcome **only here**, once: large centre → three
  lines → shrinks into companion mode. `ENTRANCE_IDS` in
  `src/components/frassy-host.tsx` is empty so no other page re-introduces her.
- "Skip entrance next time" preference (`frass-skip-entrance` in localStorage)
  redirects returning visitors to the district; `/?stay` always shows it.
- `/gateway` and `/shop-frass` are redirects (`/` and `/frass-district`).
- The old homepage (shop district grid) now lives at `/frass-district`.
- A permanent nav item **The Entrance** returns to `/` at any time.

# FRASS-0924 — The Arrival Experience (Act II)

`/arrival` — people don't click into Frass Hill, they journey into it: the
camera pushes beneath the arch, Frassy narrates four lines with the sounds
named as they grow (breeze → dominoes → children → music), then the **first
overlook**: a pannable (drag) panorama of all eight districts, each clickable.
"Arrive at the Town Plan" → `/frass-hill` (Act III).

Constitutional principle: *Frass Hill is never entered through navigation
alone. Every first arrival is a journey.*
