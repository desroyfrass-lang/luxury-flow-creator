---
name: FRASS Content Experience Engine
description: Publishing infrastructure for learning activities — content objects, Activity Player, Draft→Published workflow, progress celebration; powers Kids World first
type: feature
---

# FRASS Content Experience Engine (Specification 1)

Principle: **Lovable builds the platform. Frassy and the Founder build the experiences.**
No activity is ever hardcoded — every activity is a content object in the database.

- Tables: `learning_activities` (full 40+ field content object incl. video/audio/story/slides/instructions/materials/guides/questions/quiz/downloads/badge/skills/extras) and `learning_activity_versions` (auto snapshot on every update via `snapshot_learning_activity` trigger).
- Lifecycle: Draft → Founder Review → Approved → Published → Archived → Retired (`ACTIVITY_STATUSES` in `src/lib/content-engine.ts`). Only `published` rows are public.
- Reads: `src/hooks/use-activities.ts` (published feeds, single activity, staff all-status, version history).
- Player: `src/components/content/activity-player.tsx` renders whatever the content object contains — Watch / Listen / Read / Slides / Make it / Talk about it / Play / Print & colour + a collapsible grown-up panel (objective, materials, parent guide, teacher guide).
- Cards: `src/components/content/activity-card.tsx`.
- Routes: `/kids-world/activity/$slug`, `/kids-world/discover` (age, category, duration filters), activities also surface inside each `/kids-world/$age/$place`.
- Publishing UI: `/admin/activities` (staff/admin only via RLS) — full editor + status transitions + version count.
- Progress = celebration, never scoring: `src/lib/kids-progress.ts` (localStorage) tracks started/completed/saved/badges/skills and gentle milestones. No ranks, timers or comparisons.
- Passport still governs access: activities outside the passport age group are not opened.
- The engine is district-agnostic (`CONTENT_DISTRICTS`) — Builder Academy, Farm District, Studio District and DJ Academy can publish through the same system with no redesign.
