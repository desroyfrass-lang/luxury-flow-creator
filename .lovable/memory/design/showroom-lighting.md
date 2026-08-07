---
name: Showroom lighting and neon theming
description: Drip showrooms must have themed store-set backgrounds and per-category neon; never a black void
type: design
---
# Showroom lighting rules

Never leave a showroom on a flat black background. Every category floor gets a
physical store set (`ShowroomScene`): back wall + panelling/texture, ceiling
light bar, floor plane with neon spill. Defined per category in
`src/lib/showroom-themes.ts` (`wall`, `panel`, `floor`).

Keep exactly as-is: card size, the two hanger connectors, the suspended rack
look, the existing lighting.

Every card must have a hover glow + a light pool on the floor beneath it.

Neon accent per category:
- work → chrome/silver
- party → purple (locked, the Chief Architect loves it)
- casual → blue
- street → green
- vacay → turquoise
- sport → lime
- crown → gold
- extra → orange
- 90s → hot red/pink

Background always represents the collection (boardroom walnut, nightclub
lighting, lounge, concrete street, resort louvers, court floor, etc.).

Bare Drip landing pages are split rooms: men = Underwear Room + Swim Room;
women = Lingerie Room + Swim Room, each with its own lighting.
