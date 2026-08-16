---
name: FRASS-0570 World Teleporter
description: Founder-only read-only architecture inspection tab in the Control Room; lists every route as Live/Built-unlinked/Legacy with one-tap teleport and return chip
type: feature
---
- Lives at `/control-room?tab=world-teleporter` (🗺️ World Teleporter section in `src/lib/founder/command-center.ts`).
- Registry: `src/lib/founder/world-teleporter.ts` — generated from the route tree plus a
  navigation-link scan. Regenerate when routes change; it is data, not logic.
- Panel: `src/components/founder/world-teleporter-panel.tsx`. Read-only: no save, delete or update.
- Return chip: `src/components/founder/teleport-return-chip.tsx` + `src/lib/founder/teleport-session.ts`,
  mounted in `__root.tsx`, Founder-only, returns to the teleporter tab.
- Inspection sprint only: it must never rename routes, wire navigation or remove duplicates.
