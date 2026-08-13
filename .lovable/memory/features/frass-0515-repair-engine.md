---
name: FRASS-0515 Frass Repair Engine
description: Frassy as first-line support engineer — verify before diagnosing, safe pre-approved repairs only, engineering ticket on escalation, learned troubleshooting patterns
type: feature
---

FRASS-0515 — Constitutional Amendment, P0. Called the **Frass Repair Engine** (never
"troubleshooting") in member-facing language.

Sequence Frassy always follows: understand → diagnose → **verify the root cause** →
approved automatic repair → confirm resolved → escalate only if human/code change needed.
No guessing. No repeated questions. Never "contact support".

May repair automatically: caches · search indexes · non-critical background services ·
configuration entries · broken internal links · navigation metadata · corrupted user
preferences.
May never: deploy code · edit source · change constitutional rules · modify security
policies · change financial records · bypass permissions (→ FRASS-0502-D deployment gate).

Founder Mode: root cause, files likely affected, recommended fix, severity, blocking-launch
flag, and a ready-to-send engineering ticket — the Founder never translates problems for
engineering.

Learning: each solved issue becomes a pattern (`repair_patterns`) checked first next time.

Implementation (extend, never duplicate): `src/lib/repair/engine.ts`,
`repair.server.ts`, `repair.functions.ts`, `src/lib/repair/prompt.ts`, Frassy tools in
`src/lib/frassy-repair-tools.server.ts`, Repair Center panel in
`src/components/founder/repair-center.tsx` inside the Founder Security Center.
Tables: `repair_incidents`, `repair_patterns`.

## FRASS-0515-H — Repair History (permanent)
Every time Frassy resolves or escalates an issue she quietly writes a Repair History
entry. Members never see it; Founder Mode always can. Each entry must answer:
what was repaired · when · automatic or manual · root cause · has this happened before
(recurrence via `pattern_signature` + `repair_patterns.times_seen`) · was a constitutional
amendment created because of it (`amendment_ref` / `amendment_note`).
Columns live on `public.repair_incidents`: `resolution_mode`, `resolved_at`, `resolved_by`,
`resolution_note`, `amendment_ref`, `amendment_note`; a trigger stamps mode and time
automatically. Standalone safe repairs also log an entry (`recordManualRepair`).
The Founder closes the loop in the Repair Center; the history is the engineering
knowledge base — never a member-facing surface.

