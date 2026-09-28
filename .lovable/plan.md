# Daily + Workshop Consolidation and Safe Legacy Cleanup (PLAN ONLY, revised)

Nothing is built, deleted or deployed by this plan. Each phase needs its own Founder approval. Sheldon is not assigned. There is no production deployment without separate approval.

## A. What exists today (verified read-only)
- **Current black Daily (REAL):** `/daily` → `src/routes/_authenticated/daily.tsx` (commit 515fe977, 28 Aug 2026). It uses real machinery: `src/lib/daily/board.functions.ts`, `board-model.ts`, `work.functions.ts`, `work-result.ts`, `work-handoff.ts` (tested), `money-move-link.ts`, `src/components/daily/work-card.tsx`. Every Daily entrance leads here (`daily-gate.tsx`, `/room?daily=1`).
- **Original white Daily (BURIED):** `src/components/workspace/frass-daily.tsx` (1,560 lines, `FrassDaily`). Nothing imports it.
- **Personalization pieces (PARTIAL):** `src/lib/daily/blueprints.ts`, `kanko.ts`, `mother.ts`, `tradesperson.ts`, `time-roi.ts`, `customization.ts`, `customization.functions.ts`, `conversational.ts`, `src/components/workspace/daily-customization.tsx`, `daily-layout-panel.tsx`, `/workspace/daily-design`.
- **Workshop (REAL):** `/workshop` → `src/routes/_authenticated/workshop.tsx`. Routes that genuinely accept a work hand-off are listed in `WIRED_SPECIALIST_PATHS`.
- **Legacy:** `/room` redirect (`room.tsx`); `/room-classic` → `workspace-room.tsx` (not linked in member menus). References to `/frass-daily` and `/founder/daily` need checking (see Phase 1).
- **Frassy assets:** the shared character in `src/lib/frassy/character.ts`; room looks in `src/lib/frassy/room-looks.ts` (FV Studios seated look is approved); earlier looks exist, including `frassy-look-daily.jpg` and `frassy-look-workshop.jpg`. Today the Daily uses only a small avatar (`frassy-avatar.tsx`).
- **Known Step 9 defect:** the Tester panel doesn't show on Daily (`src/components/tester/tester-bar.tsx`). It is not fixed here.

## B. Target experience
Welcome Hall / Frassy interview → Start My Day (light white/ivory, mobile-first, rich, real data) → one primary action → Workshop → actual work → save, reload, continue → complete → Daily updates → next action.
- **Daily** = what should I do today (orchestration).
- **Workshop** = do it (execution). There are no duplicate Workshop tools inside Daily.
- **Frassy** = the brain and orchestrator, present in both.
- **My AI** = an optional long-form thinking companion. It never replaces Frassy.

The goal is not to restore the old white Daily wholesale. It is to recover its richer experience, keep the current real board and data machinery, and connect cleanly to the one Workshop.

## C. Recovery matrix (Phase 1 output, read-only)
Go through `frass-daily.tsx` section by section. Label each part **KEEP / CONNECT / CONSOLIDATE / RETIRE**, and separate real machinery and data from presentation, placeholders, local-only state and old Founder/member mixing. The sections to cover:
Celebrate/wins · briefing · priorities · workload · Delegate to Frassy · approvals · opportunities · goals / Vision Maps · performance · recent activity · Continue · evening reflection · project progress · Founder executive panels (`src/lib/workspace/founder-os.ts`) · personalized Dailies/blueprints (Kanko, Mother, Tradesperson and others) · layout designer/customization · navigation · visual treatment.
For each row, record: data source (real table or function, or sample/persona), where it lives in the canonical Daily, and what's missing.
Phase 1 also confirms the final spec with the Founder before any building starts.

## D. Daily → Workshop contract (must be proven end to end)
Daily picks real work → one primary action opens the correct Workshop item and context (through `buildHandoffHref` / `parseWorkHandoff`) → the Workshop does the work → SAVE → RELOAD keeps it → CONTINUE → COMPLETE (`setWorkItemState`) → Daily immediately shows the result and progress → next priority.
Just opening the Workshop does not count as acceptance.

## E. Frassy presence and function
- One Frassy identity, with approved presentations for each room. Daily and the general Workshop share one **Executive Assistant Frassy**: glasses, middle part, smooth hair in a low ponytail with soft curls at the ends, cream business-casual suit or FRASS top, and tablet/iPad/notepad/coffee planning props.
- Two approved poses: **standing**, and **seated at a desk with legs crossed** holding planning materials. She has a substantial full-body or seated presence, not a tiny avatar.
- Approved assets and identity are recovered and reused first. Any new pose goes to the Founder for approval, and no random replacement Frassy is used. FV Studios keeps its Studio Frassy. Specialist rooms may get their own approved looks later.
- The presentation is ready for animation, reusing the `room-looks.ts` presence-state pattern. Full lip-sync and body animation come later and do not block this work.
- Function: members talk to Frassy without leaving Daily. She briefs, helps prioritize, explains why, takes and organizes notes, celebrates progress, and recognizes completed work where the current machinery supports it.

## F. Split-screen "Open My AI" planning mode (working label)
Daily normally opens with Frassy and today's plan. For deep planning the member picks "Open My AI":
- **Left:** Daily + Frassy + current priority, notes and progress.
- **Right:** the member's own connected or uploaded AI workspace.
- If no personal AI is connected, it shows a truthful Connect / Open My AI state. There is no fake AI.

Flow: MEET FRASSY → PLAN TODAY → DEEP THINKING → SPLIT SCREEN → CAPTURE USEFUL RESULT → FRASSY ORGANIZES → CREATE/UPDATE REAL WORK ITEM → SEND TO WORKSHOP → EXECUTE → SAVE → DAILY UPDATES.
The captured result travels with the work item, so the member never has to re-explain it. Phase 1 identifies which capture and connection machinery already exists and which is missing. No saving of data is invented before that is known.

## G. Personalized Dailies
Separate Kanko, Mother or Tradesperson Daily applications are not kept automatically. Each is audited. Reusable personalization intelligence and blueprints are kept inside ONE canonical Daily. Obsolete persona and sample implementations are retired.

## H. Safe cleanup rule
AUDIT → preserve unique machinery and data → update or redirect what depends on it → verify the replacement → DELETE the obsolete page or code (with separate approval).
- Aliases such as `/room` stay only while old links genuinely need a redirect.
- `/room-classic` is a strong retirement candidate, after a dependency check.
- Stale references to `/frass-daily` and `/founder/daily` are cleaned up after proving nothing depends on them.
- `frass-daily.tsx` is retired only after its approved features live in canonical `/daily`.
- This becomes the model for a later site-wide Legacy & Dead Page Cleanup Pass. No unrelated systems are touched here.

## I. Phases (each separately approvable)
1. Recovery matrix + final spec confirmation (read-only).
2. Build the consolidated canonical Daily on the existing real machinery.
3. Prove the Daily → Workshop loop end to end: save, reload, continue, complete, update.
4. Light visual system + mobile Focus Mode + Executive Assistant Frassy presence + talking to Frassy inside Daily.
5. Split-screen My AI planning, capture and hand-off (only after Phase 1 confirms the machinery).
6. Tester panel on Daily + role and security acceptance.
7. Redirect or update old incoming links.
8. Deletion of obsolete Daily and workspace pages and components, proven safe dependency by dependency.
9. Founder acceptance.

## J. Protections that stay in place
Founder checks on the server (admin OR super_admin), the identity watcher, safe aliases, the truthful Financial Center, Tester commissions, existing records, and no sample data for signed-in members. Any schema change is reported for approval first.

## K. Acceptance tests
Signed-out, ordinary Member, Tester and Founder. First-time and returning visits. Real Money Moves and Fast Tracks, with no sample or fake data. Frassy presence and conversation. Split-screen shows a truthful state, and the captured result is handed off. Mobile. Old-link redirects. No dead links and no protected leakage. The Tester panel appears on Daily. The full Daily → Workshop persistence loop. Tests, typecheck and build pass.

## L. Out of scope
Deployment, Sheldon, Merch Studio, the `/admin` loop, the Founder Hall menu link, finance and payments, unrelated legacy pages.
