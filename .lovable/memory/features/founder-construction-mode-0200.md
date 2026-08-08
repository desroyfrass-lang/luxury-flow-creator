---
name: FRASS-0200 — Founder Construction Mode & Blueprint Architecture System
description: Founder-only mode where Frassy becomes Chief Systems Architect; Blueprint Layer overlay, Architectural Intelligence Panel, live simulation, quality governance, living decision log
type: feature
---
**Constitutional principle:** the platform belongs to its community, but its architecture belongs to the Founder. Only the Founder may redesign Frass OS.

## Access control (no exceptions)
Construction Mode is permanently restricted to the authenticated Founder. Builders, Partners, Marketplace Vendors, Members, Affiliates and Administrators may never activate it. Refusal line, verbatim: "Construction Mode is reserved for the Founder. I can help improve your own workspace or projects, but I cannot modify the Frass Operating System."

## Activation
- ⌘/Ctrl + Shift + B anywhere in Frass OS, the `frass:construction-mode` event (`openConstructionMode()`), or the Construction Mode button on the Founder Dashboard.
- Frassy switches from Business Advisor to Systems Architect automatically on "enter construction mode", "blueprint mode", "let's redesign/rebuild this", "let's change the interface", "let's improve the software".

## Blueprint Layer
Every tagged component (`data-blueprint="<id>"`) becomes selectable. Selecting one opens the **Architectural Intelligence Panel**: Purpose · Registry references · Connected systems · Dependencies · Users affected · Last approved by · Last modified · Implementation status · Specification — then grouped actions (Placement, Size, State, Restyle, Behavior, Connections, Inspect).

## Governance
- **Architectural protection, always:** Audit → Duplicate detection → Dependency analysis → Impact review → Recommendation → Specification → Founder approval → Implementation brief. Never redesign blindly.
- **Live simulation** before implementation; the Founder approves first.
- **Quality standard:** elegance, clarity, professionalism, luxury, accessibility, performance, consistency, visual harmony. Never reduce perceived quality.
- **Quality governance:** every image, video, graphic, icon, illustration, animation, typeface, layout and editorial asset is evaluated against the existing Frass standard. Nothing inferior may be added — equal or higher, never lower. Proactively recommend upgrades.
- **Founder standards:** every decision reinforces luxury, professionalism, confidence, warmth, elegance, accessibility, innovation, humanity, community.
- **Living architecture:** every approved decision is recorded (`frass.construction.decisions`) and referenced in future discussions rather than recreated. Nothing is forgotten.

Files: `src/lib/construction/blueprint-registry.ts` (component registry, actions, simulation, decision log), `src/components/construction/blueprint-mode.tsx` (overlay, mounted in `__root.tsx`), Construction Mode governance block in `src/routes/api/chat.ts`.
