---
name: SPEC-BLUEPRINT-001-FROZEN-v1.0 Builder Operating System
description: Constitutional spec for Builder OS — Daily vs Workshop separation, Money Move lifecycle with nested Fast Tracks, adaptive Workshop environments, Vault Priority, Extended Builder Rhythm, Builder glossary, Simplified mode preservation. FROZEN v1.0.
type: feature
---

## SPEC-BLUEPRINT-001-FROZEN-v1.0 — Builder Operating System

**Status:** ✅ Founder Approved | ✅ Frozen | ✅ Implemented
**Target Scope:** Volume 2 · Builder Operating System (`/daily`, `/workspace`, `/vaults`)
**Version:** SPEC-BLUEPRINT-001-FROZEN-v1.0

### Constitutional Implementation Notice

This specification implements an approved Blueprint and is governed by the Frass Constitution.

This implementation must:
- Extend existing systems.
- Preserve existing member data.
- Preserve Founder workflows.
- Preserve constitutional language.
- Preserve Builder terminology.
- Never duplicate functionality.
- Never create parallel systems when an existing one can be extended.
- If implementation conflicts with an earlier amendment, stop and report the conflict rather than making assumptions.

### Implementation Rule (Safeguard)

This specification EXTENDS the existing Builder Operating System. Do NOT rebuild, wipe, or replace existing Daily or Workshop functionality unless explicitly stated below. Preserve all current Builder features, Simplified View, accessibility modes, Frassy conversations, Founder workflows, and constitutional amendments. Merge into the existing architecture rather than replacing it.

### 1. Core Philosophy & Workspace Separation

- Enforce the fundamental rule across UI & system copy: "The Daily is where Builders think. The Workshop is where Builders build."
- `/daily` (inside `/room`) = decisions, planning, morning briefing. `/workspace` = hands-on making.

### 2. Money Move Lifecycle & Nested Hierarchy

- Consolidate objectives in `/daily` into a single nested Money Move component.
- 5-stage lifecycle: Money Move (Business Objective) → Fast Tracks (Guided Steps) → Ready to Build → Workshop (Creation) → Monetization (Live Endpoint).
- Clicking a top-level Money Move card expands its nested Fast Track execution steps directly inside.
- Fast Tracks are ALWAYS nested inside their Money Move card. Standalone step lists are Retired Systems.
- Built from the existing Vault family (FRASS-0503) — never duplicated.

### 3. Adaptive Workshop Environments

- Dynamically adapt the `/workspace` UI container based on the active Vault type:
  - Music / Audio → FV Studios
  - Wedding / Bridal → Bridal Boutique
  - Art / Fashion → Frass Gallery
  - Food / Culinary → Kitchen Studio
  - Affiliate / General → Default Workshop
- Only the room adapts. Universal OS backend + Universal Upload Manager (FRASS-0400) identical everywhere.

### 4. Vault Priority Classification System

- Mandatory classification tag on all Business Vaults: [Active, Growing, Future, Archived].
- Drives Daily recommendations, Workshop default vault, and Project Fund allocation (60/30/10/0).
- Future + Archived schedule nothing — FRASS-0469 stands.

### 5. Extended Builder Rhythm (Daily Emotional Flow)

The Daily task feed follows the color-coded emotional flow:
1. 🔴 Urgent Matters (Red)
2. 🟡 Decisions Needed (Yellow)
3. 🔵 Growth Opportunities (Blue)
4. 🟢 Celebration & Milestones (Green)
5. 🌸 Beautiful Ending / Encouragement (Floral/Pink)
6. 🚪 Ready to Build (Direct transition CTA into `/workspace`)

Maps onto the existing four-lane color language. The day never starts or ends badly.

### 6. Simplified Builder Experience Preservation

- Maintain both Builder modes seamlessly: Default Builder Experience and Simplified Builder Experience.
- All Builder OS improvements must function identically in both modes; only the visual presentation adapts.
- Daily layouts change organization only, never capability; no layout is "pro"; hidden never means deleted.

### 7. Builder Language Glossary

Standardize all UI labels and tooltips to strictly use approved Frass terms: Daily, Workshop, Vault, Money Move, Fast Track, Ready to Build, Builder Rhythm, Universal Upload Manager.
System copy must replace "deprecated" with "Retired Systems" or "Legacy Systems".

### Out of Scope

Do NOT modify or touch:
- Welcome Hall (`/welcome-hall`)
- Frass Hill Navigation & District Maps
- Kids World
- Commerce & Storefronts
- Founder Control Room (`/command`)
- Security & Role Permissions
- AI Provider Architecture

### Success Criteria (Founder Walkthrough Checklist)

A Founder Walkthrough should confirm:
- ✓ The Daily is used only for planning and decisions.
- ✓ The Workshop is used only for execution.
- ✓ Every Money Move expands into nested Fast Tracks.
- ✓ Every Fast Track naturally leads toward Ready to Build.
- ✓ Every Workshop container adapts to the active Vault type.
- ✓ Both Simplified and Default Builder modes behave identically.
- ✓ No existing Builder features were removed or duplicated.

---

### Implementation Files

Libraries: `src/lib/builder-os/{glossary,vault-priority,workshop-environments,money-move-lifecycle,builder-rhythm}.ts`
Components: `src/components/builder-os/{money-move-stack,builder-rhythm-feed,vault-priority-tag}.tsx`, `src/components/workspace/workshop-environment.tsx`
Wiring: `src/lib/daily/customization.ts` (section IDs `money-move-stack`, `builder-rhythm` registered), `src/components/workspace/frass-daily.tsx`, `src/components/workspace/workspace-room.tsx`, `src/routes/_authenticated/business-vaults.tsx`
