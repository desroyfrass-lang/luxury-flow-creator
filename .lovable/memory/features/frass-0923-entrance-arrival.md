---
name: FRASS-0923/0924 Entrance & Arrival Experience
description: Front door decides first arrival (arch journey → Frassy welcome + voice choice → interview → Daily) vs returning (daily greeting → Daily); Explore goes straight to town; /arrival retired
type: feature
---

# FRASS-0923 — The Frass Entrance (Act I)

`/` is the ceremonial entrance with two paths: **SHOP FRASS** and
**ENTER FRASS HILL**. Enter Frass Hill uses server journey state:
- Genuine first arrival → `/welcome-hall?arrival=first`: arch journey (Act II)
  → Frassy's personal welcome, with the voice/communication choice asked
  inside it → Frassy interview (`/onboarding`) → Daily.
- Returning, not welcomed today → `/welcome-hall?welcome=daily`: Frassy's
  daily greeting alone → Start my day → Daily.
- Returning, welcomed today → `/daily`.

The voice choice is part of Frassy's welcome, never a global pop-up over
other pages. Deliberate "Explore Frass Hill" (`/frass-hill`) goes straight to
the town — no daily greeting in front of it.

Plain `/welcome-hall` is the informational "About the Welcome Hall" page,
reached only deliberately; it is never the member's actual welcome.

# FRASS-0924 — The Arrival Experience (Act II)

Constitutional principle: *Frass Hill is never entered through navigation
alone. Every first arrival is a journey.*

The arch camera push, Frassy's four lines and the named sounds (breeze →
dominoes → children → music) play inside the first arrival. The first
overlook (drag across all eight districts) sits at the top of `/frass-hill`.
The old `/arrival` page is retired and redirects to `/frass-hill`; the Frass
Gateway Arch photo is kept as a brand asset.
