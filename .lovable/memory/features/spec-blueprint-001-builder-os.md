---
name: SPEC-BLUEPRINT-001-FINAL Builder Operating System
description: Daily vs Workshop separation, Money Move lifecycle with nested Fast Tracks, adaptive Workshop environments, Vault Priority, Extended Builder Rhythm, Builder glossary
type: feature
---

**Core rule:** "The Daily is where Builders think. The Workshop is where Builders build."
`/daily` (inside `/room`) = decisions, planning, morning briefing. `/workspace` = hands-on making.

**Money Move Lifecycle (5 stages):** Money Move (objective) → Fast Tracks (guided steps)
→ Ready to Build → Workshop (creation) → Monetization (live endpoint).
Fast Tracks are ALWAYS nested inside their Money Move card. Standalone step lists are Retired Systems.
Built from the existing Vault family (FRASS-0503) — never duplicated.

**Adaptive Workshop Environments:** Music/Audio → FV Studios · Wedding/Bridal → Bridal Boutique ·
Art/Fashion → Frass Gallery · Food/Culinary → Kitchen Studio · Affiliate/General → default Workshop.
Only the room adapts. Universal OS backend + Universal Upload Manager (FRASS-0400) identical everywhere.

**Vault Priority (mandatory tag):** Active, Growing, Future, Archived.
Drives Daily recommendations, Workshop default vault and Project Fund allocation
(60/30/10/0). Future + Archived schedule nothing — FRASS-0469 stands.

**Extended Builder Rhythm (Daily feed order):**
🔴 Urgent Matters → 🟡 Decisions Needed → 🔵 Growth Opportunities → 🟢 Celebration & Milestones
→ 🌸 Beautiful Ending → 🚪 Ready to Build. Maps onto the existing four-lane colour language.

**Builder Language Glossary:** Daily, Workshop, Vault, Money Move, Fast Track, Ready to Build,
Builder Rhythm, Universal Upload Manager. Never say "deprecated" — say "Retired Systems" or
"Legacy Systems".

Files: `src/lib/builder-os/{glossary,vault-priority,workshop-environments,money-move-lifecycle,builder-rhythm}.ts`,
`src/components/builder-os/*`, `src/components/workspace/workshop-environment.tsx`.
Daily sections `money-move-stack` and `builder-rhythm` are registered in `src/lib/daily/customization.ts`.
