---
name: FRASS-0413/0414 Wellness Centre & Dual Navigation
description: Health & Wellness Centre (free Frass Wellness vs paid Frass Care Network) and the split Hill/District navigation
type: feature
---

FRASS-0413 — Frass Health & Wellness Centre (`/health-wellness`, `src/lib/wellness.ts`),
registered as a Frass Hill district (`wellness_centre`). Aesthetic: mountain
herbalist in the greenery — cool air, drying herbs, lantern light. Two arms:
- **Frass Wellness** — free, non-clinical: Herb House, Movement Yard, Kitchen
  Table, Quiet Room, Artist Wellness Hub, Growers' Desk (Farm District link).
- **Frass Care Network** — verified, credential-checked practitioners you book
  and pay directly.
The care boundary line (not medical advice) must stay visible on the page.

FRASS-0414 — Dual Navigation. `gateway-nav.tsx` holds SHOP_NAV/SHOP_PRIMARY
(commerce) and HILL_NAV/HILL_PRIMARY (town: Hill, Town Square, For Us,
Wellness, Kids World, FV Studios, Community). Chosen by `mode`. Commerce never
clutters the town and vice versa; the mode switcher is the only door between.

Voice note: `speech-manager.ts` must call `installAudioUnlockListener()` at
module load and prime `unlockAudio()` before its first await — without it every
TTS clip is silently blocked and Frassy appears mute.
