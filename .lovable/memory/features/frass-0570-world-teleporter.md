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

## FRASS-0570A — Audit progress tracking
- Every card has a permanent audit number from a stable sort of the registry
  (`src/lib/founder/teleporter-audit.ts`); numbers never change when cards move.
- Statuses: ⚪ Not Reviewed, 🟡 In Progress, 🟢 Reviewed, 🔄 Consolidated, 🔴 Retired.
- Stored per Founder in `teleporter_audit` (Founder/Admin-only RLS), with one short private note per card.
- Panel adds progress counter, resume banner, "Resume audit" (first unreviewed card) and quick filters.
- Still inspection only: tracking review state never changes routes or navigation.

## FRASS-0570B — Active card is Frassy's audit source of truth
- Opening a Teleporter card stores its permanent number, title, route, component, route file and district in the temporary teleport session.
- Founder Frassy receives that active card explicitly on every message sent from the inspected page.
- A Teleporter audit turn is stateless: prior assistant card audits are excluded so an old card number cannot anchor the next review.
- Frassy must name the active card exactly and must never infer the current or next card from conversation history.
