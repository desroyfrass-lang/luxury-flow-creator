---
name: Frass Plus+ mirrored collection architecture
description: Frass Plus has no independent collection names — it mirrors Frass Kicks, Frass Drip and Bare Drip exactly, with a gold Plus+ badge
type: feature
---
# Frass Plus+

Extended sizing is a **flagship destination** named **Frass Plus+**.

## Architectural rule (locked)
The Plus store has **no independent collection names**. It mirrors the standard
Frass District architecture exactly, department for department:
- Frass Kicks Plus+ — Casual / Classic / Street
- Frass Drip Plus+ — Work / Party / Casual / Street / Vacay / Sport / Crown /
  Extra / 90's, with identical sub-collections
- Bare Drip Plus+ — Underwear / Lingerie / Swim, with identical sub-collections

Naming: standard name stays dominant, `Plus+` is appended (`Work Drip Plus+`).
`Plus+` renders as a gold premium badge (`src/components/plus-badge.tsx`).

## Source of truth
`src/lib/drip-catalog.ts` holds the standard category maps (also imported by the
Drip and Bare Drip routes). `src/lib/frass-plus.ts` derives the Plus floors from
it — never hand-maintain a second list.

## Handles
Plus handle = standard handle + `-plus` (e.g. `mens-work-drip-blazers-plus`).
`getCollectionMeta` in `src/lib/shopify.ts` resolves the mirror recursively and
adds `tag:"plus"`.

## Routes
- `/frass-plus` — landing: mirrored-stores explainer, wings, signature collections
- `/frass-plus/men` · `/frass-plus/women` — full mirrored floors grouped by store
- `/frass-plus/$gender/$category` — showroom (`ShowroomScene` + `ShowroomRack`)
Legacy `/plus-size/*` redirects here.

Consistency: same styling, photography and release timing as the main district.
Never navigate by size — size is a product attribute.
