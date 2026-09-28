# Daily + Workshop Consolidation and Safe Legacy Cleanup (PLAN ONLY, revised)

Nothing is built, deleted or deployed by this plan. Each phase needs its own Founder approval. Sheldon is not assigned. No production deployment without separate approval.

## Phase 1 (DONE, read-only): findings and Founder decisions

### Findings
- Current black Daily (`/daily` → `src/routes/_authenticated/daily.tsx`) is truthful; every card comes from real saved work (`board.functions.ts`, `board-model.ts`, `work.functions.ts`, `work-result.ts`, `work-handoff.ts`).
- Original white Daily (`src/components/workspace/frass-daily.tsx`, 1,560 lines) is BURIED — nothing imports it. It is four Dailies in one file (general + hard-coded Kanko, Mother, Tradesperson); separate files `kanko-daily.tsx`, `mother-daily.tsx`, `tradesperson-daily.tsx` are only opened by it.
- Daily → Workshop contract is PARTIAL: open/save/complete/hand-off exist; missing: Daily refresh after Workshop completion, consistent search-param naming, next-priority step, automated end-to-end test.
- My AI: MISSING — no member-owned AI connection, long-form capture or notes machinery found.
- Frassy: PARTIAL — approved daily/workshop looks exist (`wardrobe.ts`, `frassy-look-daily.jpg`, `frassy-look-workshop.jpg`), shared character (`character.ts`), room-look system (`room-looks.ts`), in-page chat available today. No Executive Assistant standing/seated asset yet.
- Legacy: `/room` — REDIRECT NEEDED (~25 inbound links, incl. Welcome Hall safe destination); `/room-classic` — SAFE CANDIDATE; `/frass-daily`, `/founder/daily` — SAFE CANDIDATES (stale refs only); `frass-daily.tsx` and layout designer — MUST PRESERVE UNTIL CONSOLIDATED.
- Tester panel missing on Daily: probable cause — Frassy's full-screen welcome overlay shares the same top layer (z-60) as the Tester panel and is drawn later, covering it. Not repaired.

### Founder decisions (locked)
1. **Visual direction:** the canonical Daily IS an intentional light-room exception — white/ivory, calm, premium assistant/planning-room feeling. The general dark streetwear treatment does not apply to Daily. Mobile-first and readable. Real current machinery stays underneath.
2. **Personalized Dailies:** no separate hard-coded Kanko/Mother/Tradesperson Daily applications. Preserve reusable planning/personalization intelligence only where it operates from the actual signed-in member's real profile/context. No hard-coded personal details in canonical Daily. Persona/sample UI is retirement material after consolidation and dependency proof.
3. **Executive Assistant Frassy:** visual direction already approved (same identity; glasses; middle part; smooth straight hair/low ponytail with soft curls at ends; cream/ivory business-casual suit or FRASS top; iPad/tablet, notepad/books, coffee props; standing pose and seated-at-desk pose with legs crossed, full outfit visible). Daily + general Workshop share it. FV Studios keeps its approved Studio Frassy. **No new Frassy asset in Phase 2** — asset transfer/integration belongs to the later Frassy visual phase (Phase 4) after the approved image is supplied to the project.
4. **My AI:** recorded as MISSING and kept OUT of Phase 2. Designed before Phase 5. No schema, provider integrations, fake connection states or persistence now. Provider choices are a later Founder decision.

## B. Target experience
Welcome Hall / Frassy interview → Start My Day (light white/ivory, mobile-first, rich, real data) → one primary action → Workshop → actual work → save, reload, continue → complete → Daily updates → next action.
- Daily = what to do today (orchestration). Workshop = do it (execution). No duplicate Workshop tools inside Daily.
- Frassy = brain and orchestrator, present in both. My AI = optional long-form companion, never replaces Frassy.

## C. Phases (each separately approvable)
1. Recovery matrix + final spec confirmation — DONE.
2. Consolidated canonical Daily foundation (boundary below).
3. Prove the Daily → Workshop loop end to end: save, reload, continue, complete, Daily reflects result, next priority.
4. Light visual refinement + mobile Focus Mode + Executive Assistant Frassy asset integration (after the approved image is supplied) + talking to Frassy inside Daily.
5. Split-screen My AI planning, capture and hand-off (design first; machinery was found MISSING).
6. Tester panel on Daily + role and security acceptance.
7. Redirect or update old incoming links (`/room` aliases, stale refs).
8. Deletion of obsolete Daily/workspace pages and components, proven safe dependency by dependency (audit → preserve unique machinery → update dependents → verify → delete, separate approval).
9. Founder acceptance.

## D. Phase 2 exact boundary (NOT yet approved)

Phase 2 may ONLY, after separate future approval:
- construct the ONE canonical `/daily` foundation using the current REAL Daily board/work machinery as the source of truth;
- recover/consolidate approved white-Daily sections that can be powered truthfully by existing real data;
- use the light white/ivory Daily presentation;
- preserve/reconnect the real member-saved layout/customization capability where safe;
- preserve Founder-only sections behind existing server authorization where they belong;
- establish one primary action per work item pointing toward the existing Workshop handoff;
- eliminate sample/persona display from the canonical signed-in Daily.

Phase 2 must NOT:
- implement or repair the complete Daily → Workshop persistence loop (Phase 3);
- add the new Executive Assistant Frassy visual asset or animation/in-page Frassy redesign (Phase 4);
- build My AI / split screen / capture / provider connection (Phase 5);
- repair Tester panel or security behavior (Phase 6);
- change redirects or legacy inbound references (Phase 7);
- delete or archive old pages/components (Phase 8);
- deploy production or assign Sheldon;
- make DB/schema changes without stopping for separate Founder approval.

### Phase 2 acceptance boundary
- Canonical `/daily` renders from real signed-in data; no sample people, no fake numbers.
- Light Daily sections have truthful empty states when real data is absent.
- A member cannot see Founder-only data.
- Existing current board records remain intact.
- The existing Workshop route stays untouched except using its already-existing handoff contract.
- Layout/customization persistence is not broken.
- Mobile usable.
- Tests, typecheck and build pass when Phase 2 is eventually implemented.

## E. Protections that stay in place
Founder checks on the server (admin OR super_admin), the identity watcher, safe aliases, the truthful Financial Center, Tester commissions, existing records, no sample data for signed-in members. Any schema change is reported for approval first.

## F. Later-phase acceptance (Phases 3–9)
Signed-out, ordinary Member, Tester and Founder; first-time and returning; real Money Moves and Fast Tracks; Frassy presence and conversation; split-screen truthful state and captured-result handoff; mobile; legacy redirects; no dead links or protected leakage; Tester panel on Daily; full Daily → Workshop persistence loop; tests/typecheck/build pass.

## G. Out of scope
Deployment, Sheldon, Merch Studio, the `/admin` loop, the Founder Hall menu link, finance and payments, unrelated legacy pages, My AI provider choice.
