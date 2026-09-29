# Phase 6 — Tester Gate: Read-Only Verification

Scope: verification only. No code, database, role, setting, memory, roadmap, AGENTS or Constitution changes. No deploy. Sheldon is not assigned. Phases 4, 5, 7, 8 and 9 do not start.

Account: only `frass-test-member-01@example.com` (tester role; commissioned for welcome_hall, onboarding, daily, workshop). The Founder account is never used.

## What gets checked (browser, test account signed in)

1. **Tester panel shows up.** Visit Welcome Hall, Frassy interview, Daily and Workshop. Each page is checked right after it loads and again after 3s and 8s, with fresh sessions and repeat loads (5 runs on Daily). The check records whether the panel is on screen and whether anything is covering it (e.g. Frassy's welcome at the same layer). Result: RESOLVED / INTERMITTENT / REPRODUCIBLE.
2. **Commissioned access works.** All four experiences open, and the account can see its own work (the Phase 3 items).
3. **Protected places are refused.** Open directly: `/founder`, `/control-room`, the Teleporter, `/admin`, `/admin/roles`, `/admin/feedback`, `/studios/*`, `/frassy`, Global Operations, Payment Providers, and the Founder financial pages. Each must send the tester away or refuse before protected content loads. Founder-only server actions are also called with the test account's own sign-in; each must refuse.
4. **Feedback path.** Send ONE report from the panel on the Daily (status "Works", note "Phase 6 verification — test record"). Then confirm with a read-only query that it was saved under the test account with `tester_experience = daily`. Also try sending a report for an experience that isn't commissioned; it must be refused. This one report is the only data written, and it will be disclosed.
5. **Account isolation.** Read-only queries using the test account's sign-in: work items, feedback and profiles return only its own rows. Founder notes and payout tables return nothing.
6. **Shop/checkout.** Read-only look at the cart and checkout pages: confirm test/sandbox mode and that no real payment or payout can be started. No purchase is made.
7. **Frassy permission window.** Dismiss it with "Later" or close it. Confirm afterwards that the mic stays off, no consent is saved as granted, and no role or access changes.
8. **Checks.** Existing tests, type check and full build (read-only runs).
9. **Evidence.** One screenshot at each checkpoint, saved in temporary storage outside the project.

## Outcome rules

- Everything passes: report **Phase 6 PASS** and stop.
- A real blocker (for example, the panel is covered on Daily): stop and report the exact cause plus the smallest proposed repair. Nothing gets fixed until the Founder approves it.

## Technical notes

- Sign-in: `lovable auth-session --json --user 1231c6fd-11c7-4798-bbb9-e7e5cf11d790`. This needs the on-screen Approve card.
- Panel coverage check: `document.elementFromPoint` at the panel's centre, plus the computed z-index of `[data-tester-bar]` compared with the Frassy overlay.
- Refusal checks: the redirect target and the absence of Founder markers in the page, plus direct server-function calls expecting Forbidden or 401.
