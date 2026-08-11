---
name: FRASS-0459 Business Builder — Launch Accelerator
description: Partner launch coaching layer — journeys per business, income-weighted money moves, momentum caps, just-in-time lessons, income timeline, weekly review, founder oversight
type: feature
---
FRASS-0459 extends (never replaces) the Business Builder. Frassy acts as a
business coach, not a course or checklist: every day she answers "what is the
fastest, smartest way to move this partner closer to sustainable income?"

- Model: `src/lib/business/accelerator.ts` — 5 pilot journeys (Affiliate,
  Wellness, Coco Vintage, Faceless Content, Podcast). Each vault is a journey
  of stages → moves, not folders.
- Every move carries: why it matters, minutes, ⭐ income potential (1–4),
  major/minor, optional micro-lesson and tool link.
- **Momentum law**: never more than 3 major + 5 minor moves in a day; the rest
  waits. Completion builds confidence, overload destroys it.
- Learning is just-in-time only (2–5 min micro-lessons), never courses.
- Coaching language always explains the unlock ("if we finish these three
  today, you'll be ready to publish tomorrow"). Celebration is meaningful
  progress, never confetti; missed days get "welcome back, I've reorganised
  everything", never shame.
- Income timeline: first campaign, first sale, first episode, first $100/$500/$1,000.
- Persistence: `partner_launch_state` (mission, hours_per_day, income_goal,
  jsonb state). Owner-only writes; admins read-only.
- Screens: `/launch-accelerator` (partner) and `/admin/launch-partners`
  (founder oversight — visibility for mentoring, never editing).
- Kanko is the pilot partner; this becomes the standard experience for every
  future Frass Hill Partner.
