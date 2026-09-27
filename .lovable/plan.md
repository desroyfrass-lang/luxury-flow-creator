# Login & Access Recovery — Final Specification (plan only, nothing built)

Legend: **[V]** verified in current code or database · **[D]** from recovery notes · **[P]** proposal · **[F?]** still needs Founder approval.
Rule of the whole workstream: **AUTHENTICATION → ROLE → PERMISSIONS → DESTINATION → EXPERIENCE.**

## Verified facts this plan rests on

- **[V]** Only one role row exists in the database: one `admin` (the Founder). Nobody holds any other role. Sheldon holds none.
- **[V]** There are two Founder checks, and they disagree:
  - The app's Founder lock (`checkIsAdmin` → `requireFounderRoute`) accepts **admin only**.
  - The database treats **admin OR super_admin** as Founder level: inside `has_role` (who may look up other people's roles), inside `is_studio_staff()`, and in some policies.
- **[V]** Some older database policies also let `staff` and `designer` write to certain tables (migration 20260722200134). Nobody holds those roles today, so there is no live exposure. It is still a hidden door.
- **[V]** The server Founder lock sits before the page draws on only four page groups: `/control-room`, `/founder`, `/admin/*`, `/studios/*`.
- **[V]** These pages sit behind sign-in only and decide "Founder?" inside the page after it starts drawing: `/frassy`, `/global-operations`, `/payment-providers`.
- **[V]** These pages sit behind sign-in only, and no role check was found: `/commerce-simulation`, `/visual-review`, `/blueprints`, `/builder-hall`, `/financial-center`, `/manufacturing`, `/launch-accelerator`. Whether each is internal is **[F?]**.
- **[V]** The sign-in page `/auth` says "Owner access", "Enter the Founder Control Room", and "First sign-up becomes the site owner" to everyone. The ownership claim itself was already removed from the server **[D, Atlas Phase 1]**, so the wording is false and misleading.
- **[V]** Every sign-in goes to `/welcome-hall?arrival=first`, whatever the role.
- **[V]** The private-area wrapper lets people in on a **saved browser session** if the live check errors.
- **[V]** The menu's "is Founder" answer is cached for 60 seconds, and the cache isn't tied to which account is signed in.

## 1. Final role model [P]

| Role | Who | Stored as |
|---|---|---|
| Visitor | Not signed in | nothing |
| Member / Customer | Signed in, no role | nothing (no row) |
| Tester | Sheldon, for now | new `tester` role + allowlist of experiences |
| Founder / Owner | Desroy | existing `admin` (super_admin folded in) |

- Admin Workspace work: done by the Founder only, for now. Admin = Staff = Super Admin, per your ruling; no separate job is proven in code.
- Builder = Partner: one business identity, not an access power. Deferred.
- Moderator: kept as a word in the list; given no powers now.

## 2. Sheldon Tester permission matrix [P]

| Area | Tester |
|---|---|
| Public site, shop, worlds, checkout (test mode only) | Yes |
| Sign-up, Welcome Hall, Frassy interview, onboarding | Yes |
| Start My Day / Daily, Workshop, own Vault | Yes, own data only, when on allowlist |
| Commissioned experiences (e.g. FV Studios `/studio`) | Only items on allowlist |
| Page feedback / voice feedback | Yes |
| Founder Hall, Founder Control Room, Teleporter | No |
| Admin Workspace (`/admin/*`), Roles & Access, Frassy Studios `/studios/*` | No |
| `/frassy` command centre, Global Operations, Payment Providers, financial audit/center internals | No |
| Other people's data, Founder notes, real payouts | No |

The allowlist is a short list of experience names. It is owned by the Founder and changed only through the existing Roles & Access page.

## 3. Member/Customer flow [P]

```text
/auth (plain "Sign in / Create account", no owner wording)
  -> Welcome Hall (first arrival or returning)
  -> Frassy interview (if not yet met)  -> Start My Day / Daily
  -> one primary action per screen; Frassy advances to the next
```

A member never sees an internal door. Typing an internal address sends them to Welcome Hall **before** anything internal draws.

## 4. Founder flow [P]

Same sign-in page. Once the server confirms Founder, Welcome Hall offers Founder Hall as the next action. It is not the default for everyone. Founder Control Room and the Teleporter stay behind the server Founder lock. Ownership is granted only by the Founder, inside Roles & Access. It is never claimed at sign-up.

## 5. Exact auth → authorization sequence [P]

1. **Authentication:** the live user check. If it fails, the person counts as signed out. A saved browser session alone never unlocks an internal page. **[F?]** Keep the saved-session fallback for member pages only?
2. **Role:** a single server answer from a new `getMyAccess()` function returns `{ founder, tester, testerAllowlist }`. Founder = admin or super_admin, the same rule the database already uses.
3. **Permissions:** each protected page declares what it needs: `founder`, `tester:<experience>`, or `member`.
4. **Destination:** decided in the page's before-drawing step (`beforeLoad`). A refusal sends the person to Welcome Hall.
5. **Experience:** only then does the page draw. Menus are built from the same answer, and they are for display only.

## 6. Route/door protection rules [P]

- Every internal page gets a before-drawing server check. Any check inside the page itself is removed or kept only as a second layer.
- The allowed guards are exactly two, both built on `requireFounderRoute`: `requireFounderRoute` and `requireTesterExperience(key)`. No ad-hoc checks inside pages.
- Every server function behind an internal page repeats the server check.
- Redirects and aliases (`/command`, `/admin/`, `/room`) must land on a guarded page. They already do **[V]**.
- Menus and icons come from one registry (`hierarchy.ts` / `account-menu.ts`) and are filtered by the same access answer.
- The access cache is tied to the user id, and it is cleared on sign-out and on account switch.
- Old database policies that name `staff` or `designer` are either rewritten to the single Founder rule or explicitly kept **[F?]**.

## 7. Bypass reproduction and test plan (done first, no code changes)

Personas: signed out, Member test account, Founder. Tester is added after step 4 of section 10.
For each page from the verified list, on desktop 1280 and mobile 390:

- Click every icon and menu item.
- Type the address directly.
- Hard refresh.
- Deep link with `?next=` and similar values.
- Press Back after sign-out.
- Expire the session with the page open.
- Switch accounts from Founder to Member in the same browser within 60 seconds.
- Load a public page that shows Founder chips.

Record screenshots and network calls. Name which cause was actually hit:
- (a) the check inside the page,
- (b) the saved-session fallback,
- (c) the stale "is Founder" cache,
- (d) a public page showing Founder bits,
- (e) something else.

Report the result before any fix.

## 8. Legacy role mapping [P]

| String | Evidence | Decision |
|---|---|---|
| admin | Founder lock, 1 holder | Keep = Founder |
| super_admin | Database treats it as admin; app doesn't; 0 holders | Consolidate into Founder (app accepts both; stop granting it) |
| staff | Menu "Approvals"; old policies; 0 holders | Consolidate into Founder; deprecate |
| moderator | Menu only; 0 holders | Defer (future community/Kids) |
| partner | Business menu, Money Moves; 0 holders | Builder = Partner; defer as business identity |
| designer | Merch studio link; old write policies; 0 holders | Legacy; defer, remove write power [F?] |
| affiliate / ambassador | Business menu labels, "Soon"; 0 holders | Legacy; defer |
| customer | Never stored | Same as Member; stop using |
| tester | Missing | Add |

The enum values themselves stay in the database, since removing them is risky and they are unused. Deprecation happens in code and grants.

## 9. Files and data likely to change [P]

- **Database:**
  - Add `tester` to `app_role`.
  - New `tester_access(user_id, experience_key)` table with grants and RLS (Founder writes; the Tester reads their own rows).
  - Rewrite the staff/designer policies **[F?]**.
- `src/lib/roles.ts`: add `tester`.
- `src/lib/admin.functions.ts`: `checkIsAdmin` accepts admin or super_admin. Add `getMyAccess`.
- `src/lib/founder/route-guard.ts`: add `requireTesterExperience`.
- Before-drawing guards on `frassy.tsx`, `global-operations.tsx`, `payment-providers.tsx`, and any page from the confirmed-internal list.
- `src/hooks/use-is-admin.ts`, `use-my-roles.ts`, `use-workspace-roles.ts`: tie the cache to the user; clear it on sign-out.
- `src/lib/navigation/account-menu.ts`, `hierarchy.ts`, `site-shell.tsx`: add a "Testing" group; remove the staff/super_admin branches.
- `src/routes/auth.tsx`: neutral sign-in wording only.
- `src/routes/_authenticated/workspace.tsx`: drop the ROLE_META labels for consolidated roles.
- Welcome Hall continuation (`src/lib/welcome-hall/continuation.ts`): role-aware next action.
- `src/routes/_authenticated/admin.roles.tsx`: grant/revoke Tester and edit the allowlist (reuse the existing page).
- `src/routes/_authenticated/route.tsx`: integration-managed. Change it only if the section 5 **[F?]** is approved.

## 10. Implementation sequence (stop for approval after each)

1. Reproduce the bypass (section 7) and report.
2. Unify the Founder rule (admin or super_admin) and add before-drawing guards to the confirmed internal pages.
3. Fix the access cache and sign-out/account-switch clearing.
4. Neutral `/auth` wording.
5. Tester role, allowlist table, and granting in Roles & Access.
6. Tester destination and "Testing" menu group.
7. Old policy cleanup **[F?]**.
8. Full acceptance run.

## 11. Acceptance criteria

- Signed out: every internal address goes to sign-in or Welcome Hall with no internal content drawn, including on refresh and deep links.
- Member: no internal door visible or reachable; own Daily/Workshop works.
- Tester: only allowlisted experiences plus the member journey. Every Founder/Admin address refuses, and so do their server functions.
- Founder: everything works; the 201-card Teleporter audit still passes unchanged.
- Account switch: no Founder icons remain after switching.
- Back after sign-out: no protected content.
- `/auth` has no owner wording.
- Tests, typecheck, and build pass. Nothing is deployed without approval.

## 12. Non-goals

- The Teleporter, 201-card baseline and its audit.
- Payments, allocations, Stripe, and the ledger.
- FV Studios / Frassy presentation, A1 / Enhance Phone Recording, and the Music Engine.
- The Frassy AI backend and integration-managed auth files (unless approved).
- Moderator powers and business-role redesign.
- New pages or duplicate routes. Removing enum values. Deployment.

## Founder decisions still needed

1. Sheldon's first allowlist (FV Studios only? Daily/Workshop? For Us? Kids? test-mode checkout?).
2. Remove the saved-session fallback for internal pages only, or everywhere?
3. Which of `/commerce-simulation`, `/visual-review`, `/blueprints`, `/builder-hall`, `/financial-center`, `/manufacturing`, `/launch-accelerator` are Founder-only?
4. Rewrite the old staff/designer database write permissions now (recommended), or later?
5. Should Tester feedback go to a separate Founder inbox, with a visible "Tester" badge?

Note: roadmap entry for this workstream will be added when Build mode starts (plan mode allows editing only this plan).
