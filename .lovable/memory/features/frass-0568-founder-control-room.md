---
name: FRASS-0568 Founder Control Room Consolidation
description: One Founder headquarters at /control-room using the Command Center interface; /command and /founder redirect; legacy Control Room retired
type: feature
---
**One Headquarters. One Name. One Experience.**

- The Founder headquarters is `/control-room`, titled 🎛️ Founder Control Room.
- It uses the former Command Center interface (section tabs + inline panels).
- `/command` and `/founder` are redirect-only stubs. Never re-create a second Founder dashboard.
- Migrated legacy capabilities live in `src/components/founder/commissioning-panel.tsx`:
  commissioning phases, Launch Readiness, districts, Development Credits, Platform Status,
  Architectural Health, Founder controls, plus link tools for Payment Providers, Global
  Operations and Financial Center.
- New sections in `src/lib/founder/command-center.ts`: 🎙️ Conversation (Frassy chat) and
  🏗️ Commissioning.
- Founder-only: identity gate + `noindex,nofollow`; the page never renders for others.
- Language: say "Founder Control Room" — "Command Center" is retired terminology.
