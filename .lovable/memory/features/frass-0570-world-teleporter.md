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

## FRASS-0571A — Active-card audit context
- The Teleporter card that opens a route is the sole source of truth for Frassy's audit context.
- The teleport session carries the active card number, title, route, component, source file and district.
- Frassy chat history is isolated per Teleporter card, so an earlier review (especially Card #011) cannot replay inside a later card.
- Every Founder audit request explicitly identifies the active card; prior card numbers and “ready for next card” instructions are ignored.
