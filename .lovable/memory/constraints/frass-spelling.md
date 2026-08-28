---
name: Frass brand spelling
description: Brand is always "Frass" (two s's) — never "Fras", "Frost" or "Frosty", including product lines and slugs
type: constraint
---

The brand name is always **Frass**. Never "Fras", "Frost", "Frosty" or "Fresh" —
in copy, component text, product line names or URL slugs.

Fixed 2026-08-28: Frassy's wardrobe used a "Frost District" clothing line with a
`frost-district` handle. Renamed to Frass District / `frass-district`.

**Why:** the name is not a typo and must never be auto-corrected by a model or a
person. `src/lib/studios/production-engine.server.ts` already instructs the AI
never to change FRASS.
