# Daily + Workshop Consolidation and Safe Legacy Cleanup (PLAN ONLY)

Nothing is built, deleted or deployed by this plan. Each phase below needs its own Founder approval. Sheldon is not assigned.

## A. What exists today (verified read-only)
- **Black Daily (REAL, current):** `/daily` → `src/routes/_authenticated/daily.tsx`. Built on 28 Aug 2026 (commit 515fe977). It reads real work through `src/lib/daily/board.functions.ts` + `board-model.ts`, with cards from `src/components/daily/work-card.tsx`. Every Daily entrance leads here, including the "Open the Daily" event (`src/components/workspace/daily-gate.tsx`) and `/room?daily=1`.
- **White Daily (BURIED, original):** `src/components/workspace/frass-daily.tsx` (1,560 lines, the `FrassDaily` component). Nothing imports it any more, so no page opens it. The blueprints it depends on are still present: `src/lib/daily/blueprints.ts`, `kanko.ts`, `mother.ts`, `tradesperson.ts`, `time-roi.ts`, `customization*.ts`, `conversational.ts`, plus `src/components/workspace/daily-customization.tsx` and `daily-layout-panel.tsx`.
- **Workshop (REAL):** `/workshop` → `src/routes/_authenticated/workshop.tsx`. Hand-off from Daily to Workshop is `src/lib/daily/work-handoff.ts` (tested), with results in `work-result.ts` and records in `work.functions.ts`.
- **Legacy (LEGACY):** `/room` redirects to `/workshop` or `/daily` (`room.tsx`). `/room-classic` keeps the old My Workspace room (`workspace-room.tsx`), which is not linked from member menus. `/workspace/daily-design` is the layout designer.
- **Known issue (not fixed):** the Tester panel doesn't appear on the Daily page (`src/components/tester/tester-bar.tsx`).

## B. What we're aiming for
One Daily with the white Daily's look and features: Celebrate, briefing, priorities, workload, Delegate to Frassy, approvals, opportunities, goals, performance, activity and Continue. It shows only the member's real records, never sample people. Every Open or Continue button goes straight into the one Workshop and carries the work item with it. There will be no second Daily and no second Workshop.

## C. Phases (each needs separate approval)
1. **Side-by-side review (read-only preview):** give the Founder a preview-only way to view the white Daily next to the black one. Nothing changes for members.
2. **Data rewiring:** replace the white Daily's persona and sample inputs with the real board data (`getDailyBoard`, work items, Money Moves, Fast Tracks). Sample data stays blocked for signed-in members.
3. **Workshop connection:** send every white-Daily action through `buildHandoffHref` into `/workshop` or the tool that owns the record. Done, Tomorrow and Dismiss use `setWorkItemState`.
4. **Swap:** `/daily` renders the restored white Daily. Keep the black layout as a fallback until the Founder accepts the swap.
5. **Tester panel on Daily:** fix it only if approved as a separate item.
6. **Safe legacy cleanup:** archive rather than delete. Keep the `/room` redirects. Retire `/room-classic` and unused black-Daily pieces only after the swap passes acceptance.

## D. Protections that stay in place
Founder checks on the server (admin OR super_admin), the identity watcher, safe aliases, the truthful Financial Center, Tester commissions, and all existing records. No schema changes are expected. If one turns out to be needed, it is reported first.

## E. Uncertain items (need a read-only check before Phase 2)
- Which parts of `frass-daily.tsx` read persona or sample data rather than props. This has to be checked line by line.
- Whether the white Daily styling (bright surfaces) still fits the current design tokens in `src/styles.css`. The dark streetwear memory rule conflicts with a white Daily, so the Founder decides.
- Whether the Founder executive panels (`src/lib/workspace/founder-os.ts`) still match the Control Room.

## F. Risks
- Showing sample data to real members. Guard: tests that fail if persona data renders for a signed-in user.
- Broken links during the swap. Guard: a link crawl across all Daily entrances.
- Losing the black Daily's real-data board. Guard: reuse it as the data source, not replace it.

## G. Out of scope
Deployment, Sheldon, Merch Studio, the `/admin` loop, the Founder Hall menu link, finance or payments changes.

## H. Acceptance tests
Signed-out users are sent to sign-in. Member: first visit and returning visit; picks a Daily task, it hands off to the Workshop, saves, reloads and is still there, is completed, and the next task appears. Frassy responds. Money Moves and Fast Tracks show real data only. Tester: sees only commissioned steps and the panel shows on Daily (if Phase 5 is approved). Founder: executive panels are visible and nothing protected leaks to others. Mobile layout works. The legacy `/room` and `/room?daily=1` redirects still work, with no dead links. Tests, typecheck and build pass.
