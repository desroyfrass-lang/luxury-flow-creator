# Login & Access Recovery — Diagnosis and Plan (read-only)

Legend: **[V]** verified in current code or database this turn · **[D]** from existing recovery notes · **[P]** proposal only · **[U]** could not be verified yet.

## A. Executive diagnosis

- **[V]** There is one sign-in lock (the private area wrapper) and one Founder lock (`requireFounderRoute`). The Founder lock covers only 4 page groups: `/control-room`, `/founder`, `/admin/*`, `/studios/*`.
- **[V]** Several other internal pages sit behind the sign-in lock only and check "is Founder?" inside the page after it has started drawing: `/frassy`, `/global-operations`, `/payment-providers`. Any signed-in person reaches those pages; they are told "no" by the page, not stopped at the door.
- **[V]** The database has exactly **one** role row: one `admin` (the Founder). No `tester`, `staff`, `partner`, etc. is held by anyone. Sheldon therefore has no role today and gets the plain signed-in member experience.
- **[V]** The Founder check only asks "admin?". `super_admin` is listed in menus but is not recognised by the server check.
- **[V]** Every sign-in, sign-up and Google return sends people to `/welcome-hall?arrival=first`, whoever they are. There is no per-role landing.
- **[U]** The exact cause of "clicking icons opened internal areas without signing in" is not yet proven. Section G lists the three likely causes in the code. The first build step is to reproduce it, not to guess.

Plain English: the building has a front door lock and a lock on four Founder rooms. A few other staff rooms only have a "Staff only" sign on the inside wall, and there is no such thing as a "tester" badge yet.

## B. Current auth/access architecture

- **[V]** Sign-in page `/auth`: email+password, sign-up, Google, password reset → `/reset-password`. Accepts only safe `next=/...` values.
- **[V]** After sign-in: a full page reload to `/welcome-hall?arrival=first&next=…`. Welcome Hall decides where to go next.
- **[V]** Private wrapper `_authenticated/route.tsx`: runs only in the browser, calls `getUser()`, and **falls back to the saved session if that call errors**, then lets the person in. Otherwise it sends them to `/auth?next=…`.
- **[V]** `WelcomeGate`: sends members who haven't met Frassy to `/onboarding`. If the check fails, it **lets them in** (by design).
- **[V]** Founder lock `requireFounderRoute` → server `checkIsAdmin` → `has_role(uid,'admin')`. If the answer isn't "yes", it redirects to `/welcome-hall`. This is correct and server-verified.
- **[V]** Menus: `site-shell.tsx` uses `useIsAdmin` for visibility, and `accountMenuGroups(roles)` builds the profile menu. This only hides links; it does not lock anything.
- **[V]** Teleporter baseline lives in `src/lib/founder/world-teleporter.ts`, `teleporter-audit*`, `audit-registry.ts`. Not to be touched.

## C. Current role inventory (mapped to real jobs)

| Role string | Held by anyone? [V] | Real job in code | Verdict [P] |
|---|---|---|---|
| admin | 1 (Founder) | The only role the server checks for Founder power | Keep as the Founder/Owner role |
| super_admin | 0 | Menu label only; server ignores it | Redundant — fold into Founder |
| staff | 0 | Menu shows "Approvals" only | Not needed now |
| moderator | 0 | Same as staff today | Keep in type for future For Us / Kids moderation; do not use now |
| designer / affiliate / partner / ambassador | 0 | Business/workspace roles (`BUSINESS_ROLES`), Money Moves, Frass Hill menu | Business identity, not access power — review later |
| customer | 0 | Default; not stored | Same as "signed in, no role" |
| tester | does not exist | — | Add (the only new role) |

## D. Proposed minimal role model [P]

1. **Visitor** — not signed in. Public shop/world pages only.
2. **Member** — signed in, no role. Their own Daily, Workshop, Vault, archive. Nothing internal.
3. **Tester** — Member, plus access to the specific commissioned experiences named on a Founder-owned list. No Founder or Admin powers.
4. **Founder/Owner** — existing `admin`. Everything.

No other roles are added. `super_admin`, `staff`, and `moderator` stay in the database list but are not given any power in this workstream.

## E. Sheldon Tester access matrix [P — needs your confirmation]

| Area | Tester |
|---|---|
| Public site, shop, worlds | Yes |
| Welcome Hall, onboarding, own Daily, Workshop, Vault | Yes (as a member, own data only) |
| Commissioned experiences to test (e.g. FV Studios `/studio`) | Yes — only items on the Tester list |
| Leave feedback (existing page feedback) | Yes |
| Founder Control Room, Founder Hall, `/frassy` command centre, Teleporter | No |
| `/admin/*`, Roles & Access, Frassy Studios `/studios/*` | No |
| Global Operations, Payment Providers, Financial audit, other people's data | No |
| Real money/payment actions | No (test mode only, if listed) |

## F. Route/door audit findings

- **[V] Locked properly (server, before drawing):** `/control-room`, `/founder`, `/admin` and all 25 `/admin.*` pages, `/studios` and all 21 `/studios.*` pages.
- **[V] Sign-in lock only, Founder check inside the page:** `/frassy`, `/global-operations`, `/payment-providers`.
- **[V] Sign-in lock only, no role check found by search:** `/commerce-simulation`, `/visual-review`, `/blueprints`, `/builder-hall`, `/financial-center`, `/manufacturing`, `/launch-accelerator`. [U] Whether each one is member-safe or internal needs a page-by-page read.
- **[V] Redirects:** `/command` → `/control-room` (still Founder-locked); `/room` → `/workshop` or `/daily`. Safe.
- **[V] Public top-level pages that also host Founder bits:** `welcome-hall.tsx`, `gateway.tsx`, and components such as the teleport return chip and simulation bar. [U] Whether these reveal Founder controls to non-Founders needs a check.
- **[V]** Server functions: `listUsersWithRoles`, `grantRole`, `revokeRole`, and `listPageFeedback` check admin on the server. [U] The server functions behind the three "inside-the-page" pages have not all been read yet.

## G. Likely root causes of unauthorized/random access (ranked, not yet proven)

1. **[V mechanism]** Pages with a check inside the page draw their frame first and then decide. With a slow or failed check you can briefly see internal layout, or all of it if the check errors.
2. **[V mechanism]** The private wrapper trusts the **saved session in the browser** when the live check errors. An expired or stale session can pass the wrapper. Founder rooms are still protected by the server check, but sign-in-only pages are not.
3. **[V mechanism]** Menu visibility uses cached "is admin" answers (60-second cache keyed only on "has session"). After switching accounts on the same browser, Founder icons can show for up to a minute. Server-locked rooms still bounce the visitor; sign-in-only rooms do not.
4. **[U]** Public pages rendering Founder chips or panels based on browser state.

Build step 1 reproduces each one with a signed-out browser, a member account, and account switching, and records which one Sheldon actually hit.

## H. Files/objects likely touched in a future build [P]

- DB migration: add `tester` to `app_role`. Add a small Founder-managed `tester_access` list (experience keys), with grants and RLS. Optionally treat `super_admin` as Founder inside `has_role` checks.
- `src/lib/roles.ts`: add `tester` to the role list.
- `src/lib/founder/route-guard.ts`: reuse as is. Add a sibling `requireTesterOrFounderRoute` that uses the same pattern.
- New `checkAccess` server function next to `src/lib/admin.functions.ts`.
- Add a server lock before drawing (`beforeLoad`) to: `frassy.tsx`, `global-operations.tsx`, `payment-providers.tsx`, plus any page from F that is confirmed internal.
- `src/routes/_authenticated/route.tsx` is integration-managed. Only discuss the saved-session fallback; don't rewrite it without your approval.
- `src/hooks/use-is-admin.ts` and `use-my-roles.ts`: key the cache on the user id and clear it on sign-out.
- `src/lib/navigation/account-menu.ts` and `use-my-roles.ts`: add a "Testing" group. Remove the unused `super_admin`/`staff` branches.
- `src/routes/auth.tsx` / Welcome Hall: land Testers on a "What to test" list. Reuse the existing Welcome Hall; no new page.
- `src/lib/navigation/hierarchy.ts`: mark audience for tester items.
- Reuse: `requireFounderRoute`, `has_role`, `accountMenuGroups`, `WelcomeGate`, `secure-sign-out.tsx`, the Roles & Access page (`admin.roles.tsx`) for granting Tester.

## I. Verification matrix (after build)

Personas: Visitor, Member, Tester (Sheldon test account), Founder.
For each persona, test every locked and sign-in-only page from F:

- Direct URL typed in the address bar.
- Hard refresh on the page.
- Deep link with query values (for example `?next=`, `?daily=1`).
- Click every nav/menu icon on desktop 1280 and on mobile 390.
- Sign out, then press Back.
- Expired session (clear the token, keep the page open).
- Switch from the Founder account to the Tester account in the same browser.

Also call the related server functions directly as each persona and expect a refusal where access is denied. Expected outcomes follow table E. Pass means a redirect happens **before** any internal content draws.

## J. Safe implementation sequence [P]

1. Reproduce and prove the root cause (no code changes). Report back.
2. Lock the confirmed internal pages with the existing server Founder lock. Stop for your review.
3. Fix the menu cache on account switch and sign-out. Stop.
4. Add the Tester role, the Tester list, and Founder granting through the existing Roles & Access page. Stop.
5. Add Tester landing and the "Testing" menu group. Stop.
6. Run the full matrix in I. Report.

Launch blockers: steps 1–2 (the inside-the-page Founder checks) and step 4 (so Sheldon can test without Founder power). Post-launch cleanup: folding `super_admin`/`staff`, reviewing business roles, and future moderator work.

## K. Not touched in this workstream

The 201-card Teleporter and its audit, the payment/allocation ledger, Stripe webhook and test bridge, FV Studios / Frassy presentation, A1 / Enhance Phone Recording, `has_role` executability, integration-managed Supabase files, the Frassy AI backend, the Music Engine, and deployment.

## L. Questions before Build mode

1. Which exact experiences should Sheldon test first? (FV Studios `/studio` only, or also Daily/Workshop, For Us, Kids, shop checkout in test mode?)
2. Should the private-area wrapper stop trusting the saved session when the live check fails? This makes access stricter but may sign people out during network blips.
3. Is `super_admin` meant to be anyone other than you? If not, may it be removed from menus?
4. Should Testers see a visible "Tester" badge, and should their feedback go to a separate Founder inbox?
5. Pages like `/commerce-simulation`, `/visual-review`, `/blueprints`, `/builder-hall`: are these internal (Founder-only) or member pages?
