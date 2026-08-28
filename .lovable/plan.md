# Atlas Phase 2 — Real User Functional Verification

No new features. No Build 4. No shell filling. This phase only proves, by real clicking, what actually works today.

## What changes on disk

Only two documents:

- `FRASS_FUNCTIONAL_REALITY_AUDIT.md` — updated to separate **STATIC EVIDENCE** (the existing 95/116/18 classification) from **END-TO-END VERIFIED** (what real clicking proved). No page keeps "REAL" status just because it has saving code.
- `FRASS_CORE_JOURNEY_SCORECARD.md` — new: one row per journey with the columns you specified (Journey, User Role, Entry, Primary Action, Persistence, Reload, Return, Permissions, Mobile, Frassy, Final Status, P0–P3, Notes).

No source code is touched. Bugs found are written down, not fixed.

## Test accounts

Two real sign-ins, minted inside the sandbox (no passwords needed, no new accounts created):

- **Normal member** — an existing non-admin account with the fewest existing records, so nothing real is disturbed. I'll name the exact account before signing in as it, for your approval.
- **Founder** — your own admin account, used only for section 14 and 15, and only for safe, reversible test actions (create a draft, save, reload, then leave it clearly labelled "ATLAS TEST").

Every test record created is prefixed `ATLAS TEST` so it is identifiable and removable.

## How each area is tested

For every area below the same loop runs: enter → do the primary task → save → reload the page → find it again → edit/continue → navigate away → come back → confirm it survived → confirm permissions. A page that merely loads is never counted as working.

Order of testing:

1. Normal user entry — login, Welcome Hall, into Frass Hill; then direct-URL attempts at `/control-room`, `/admin`, `/studios`, `/admin/roles` to confirm the block is enforced by the server, not just hidden in the menu.
2. Profile menu — the exact items actually rendered are recorded, then each one is opened and its primary action attempted.
3. My Workspace (`/room`) — and its true relationship to My Space, My Vaults, Daily and creator tools.
4. Frass Daily — open today, act on a task, mark it, reload.
5. My Vaults — open an owned vault, create a test record, save, reload, switch vault, confirm records stay separated.
6. FV Studios — is Frassy present and does she do anything; start and save a real creation.
7. Builder's Vault — the promised primary workflow, end to end.
8. Creation District — create, save, retrieve, continue.
9. Opportunity Center — open an opportunity, act, save status, reload; and whether the data is real, seeded, or generated.
10. Academy District — start a lesson, progress, save, reload, continue.
11. My Frass Card — actual purpose read from the implementation, then every meaningful action.
12. Frass District commerce — Kicks/Drip → product → variant → cart → quantity/remove → checkout handoff. **No charge is completed.** Plus Lookbook, Capsule, Try-On, Saved items where present.
13. Kids World — one journey per current age band, plus Home and Back.
14. Founder Hall — as Founder, one safe control action, saved and reloaded; then re-confirm a normal member is still blocked.
15. Frassy Studios — Builds 1–3 as workflows: production → script/scene → review → approved → distribution package → calendar → empty performance state. No external platforms connected, no analytics invented.
16. Frassy — per area, classified as Functional Action Assistant / Functional Navigation Assistant / Guidance Only / Decorative / Missing / Broken. Her face appearing never counts as functional.
17. Mobile — the critical journeys repeated at phone width, testing actions and not just layout.

## Technical notes

Verification runs through a scripted headless browser against the live preview, one journey per script, capturing screenshots, console errors and failed network calls as evidence. Findings that cannot be reproduced by clicking are marked BLOCKED rather than guessed.

Statuses used: END-TO-END VERIFIED · FUNCTIONAL WITH ISSUES · PARTIAL · UI SHELL · BROKEN · BLOCKED · REDIRECT ONLY · NOT IMPLEMENTED.

## What you get at the end

A written result for every numbered area, the P0 and P1 failure lists, which previously-"REAL" pages failed real testing, which are genuinely verified, which still need your own hands-on testing — then the Atlas Phase 2 Verdict: can a normal member, a creator/partner, and the Founder each complete their core journey (YES / NO / PARTIALLY), and the five workflows to fix first in priority order.

Then I stop and wait for your approval before anything is repaired or built.
