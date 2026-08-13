---
name: FRASS-0546 Adaptive Momentum Engine
description: Earned deadlines — four momentum levels, five achievement styles, optional challenges, automatic pressure release
type: feature
---

Deadlines are EARNED, never imposed. Members start pressure-free; accountability rises only after
demonstrated consistency, and drops automatically when the pace reads strained or tired.

Momentum levels (earned, and reversible without comment):
- 🌱 Explorer — no deadlines, gentle encouragement, celebrate every small win
- 🚀 Builder — one weekly goal, flexible target date, gentle reminders
- 🦈 Momentum Builder — optional dated Momentum Challenges, accept or decline freely
- 👑 High Performer — member writes their own challenges; larger rewards for larger impact

Achievement styles (the member chooses; same destination for all):
🦈 Shark · 🏔️ Climber · 🚀 Sprinter · 🌳 Gardener · 🌊 Navigator. The style only changes the shape
and horizon of a challenge, never the goal.

Rules:
- Never call a member late, behind or overdue.
- Any challenge may be declined with no consequence; a member may opt out of challenges forever.
- Rewards (credits, badges, marketplace promotion, featured slots, vault capabilities, community
  recognition at the member's privacy level) are secondary — the real reward is financial progress.
- Stress, burnout or falling completion rate reduces pressure automatically; a level drop is a
  protective decision, never a demotion, and is never framed as one.

Implementation: `src/lib/frassy/momentum.ts`, `src/hooks/use-momentum.ts`,
`src/components/frassy/momentum-card.tsx`; prompt block composed into every Frassy conversation.
