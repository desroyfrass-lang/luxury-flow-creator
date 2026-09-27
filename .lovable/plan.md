# Login & Access Recovery — Final Specification (plan only, nothing built)

**FOUNDER DECISIONS INCORPORATED — PLAN AWAITING NICOLLE GOLDING'S FINAL REVIEW AND APPROVAL. NOT APPROVED FOR BUILD.**

Legend: **[V]** verified in current code or database · **[D]** from recovery notes · **[P]** proposal · **[FD]** Founder decision (resolved) · **[F?]** still needs Founder approval.
Rule of the whole workstream: **AUTHENTICATION → ROLE → PERMISSIONS → DESTINATION → EXPERIENCE.**

## Founder/Owner team and identity

- Founder/Owner team: **Nicolle Golding** and **Desroy Gooden**.
- Nicolle Golding is the primary current build operator. She is doing most of the current FRASS build and recovery work.
- The existing Founder login is `desroyfrass@gmail.com`. It stays unchanged. No second Founder account will be created, and the login credential will not be changed.
- The login email does not identify which person is operating. Nothing in this plan infers the operator from it.

## Verified facts this plan rests on

- **[V]** Only one role row exists: one `admin` (the Founder login). Nobody holds any other role. Sheldon holds none.
- **[V]** Two Founder checks disagree:
  - The app's Founder lock (`checkIsAdmin` → `requireFounderRoute`) accepts **admin only**.
  - The database treats **admin OR super_admin** as Founder level: in `has_role`, in `is_studio_staff()`, and in some policies.
- **[V]** Older database policies let `staff` and `designer` write to certain tables (migration 20260722200134). Nobody holds those roles, so there is no live exposure. It is still a hidden door.
- **[V]** A server Founder lock runs before the page draws on only four page groups: `/control-room`, `/founder`, `/admin/*`, and `/studios/*`.
- **[V]** These pages have a sign-in lock only and check "Founder?" inside the page, after it starts drawing: `/frassy`, `/global-operations`, `/payment-providers`.
- **[V]** These pages have a sign-in lock only, and no role check was found: `/commerce-simulation`, `/visual-review`, `/blueprints`, `/builder-hall`, `/financial-center`, `/manufacturing`, `/launch-accelerator`.
- **[V]** The `/auth` sign-in page shows everyone "Owner access", "Enter the Founder Control Room", and "First sign-up becomes the site owner". The ownership claim was already removed from the server **[D, Atlas Phase 1]**, so this wording is false.
- **[V]** Every sign-in lands on `/welcome-hall?arrival=first`, whatever the role.
- **[V]** The private-area wrapper lets people in on a **saved browser session** if the live check errors.
- **[V]** The menu's "is Founder" answer is cached for 60 seconds, and the cache is not tied to which account is signed in.

## 1. Final role model [P]

| Role | Who | Stored as |
|---|---|---|
| Visitor | Not signed in | nothing |
| Member / Customer | Signed in, no role | nothing (no row) |
| Tester | Sheldon, for now | new `tester` role + allowlist of experiences |
| Founder / Owner | Nicolle Golding and Desroy Gooden, via the existing Founder login | existing `admin` (super_admin folded in) |

- Admin Workspace work is Founder-only for now. Admin, Staff and Super Admin are treated as one job; no separate job is proven in code.
- Builder and Partner are one business identity, not an access power. Deferred.
- Moderator stays as a word in the list, with no powers now.

## 2. Sheldon Tester permission matrix [FD]

Sheldon tests commissioned experiences. He is not part of the recovery or debugging team.

| Area | Tester |
|---|---|
| Normal public / customer / member journey | Yes |
| Sign-up / login, Welcome Hall, Frassy interview / onboarding | Yes |
| Start My Day / Daily | Yes |
| Workshop | Yes |
| His own permitted data / own Vault | Yes, when allowlisted; own data only |
| FV Studios `/studio` | Only when specifically allowlisted |
| Page feedback / voice feedback | Yes |
| Shop / cart / checkout | TEST MODE ONLY, when allowlisted |
| For Us, Kids | Not in the first allowlist; add later only once commissioned and intentionally assigned |
| Founder Hall, Founder Control Room, Teleporter | No |
| Admin Workspace `/admin/*`, Roles & Access, Frassy Studios `/studios/*` | No |
| `/frassy` command centre, Global Operations, Payment Providers | No |
| Founder financial internals, other people's data, Founder notes, real payouts | No |

The allowlist is a short list of experience names. The Founder owns it and changes it only through the existing Roles & Access page.

## 3. Member/Customer flow [P]

```text
/auth (plain "Sign in / Create account", no owner wording)
  -> Welcome Hall (first arrival or returning)
  -> Frassy interview (if not yet met)  -> Start My Day / Daily
  -> one primary action per screen; Frassy advances to the next
```

A member never sees an internal door. If they type an internal address, they are sent to Welcome Hall **before** anything internal draws.

## 4. Founder flow [P]

- Founders use the same sign-in page.
- Once the server confirms Founder, Welcome Hall offers Founder Hall as the next action. It is not the default for everyone.
- Founder Control Room and the Teleporter stay behind the server Founder lock.
- Ownership is granted only by a Founder, inside Roles & Access. It is never claimed at sign-up.

## 5. Exact auth → authorization sequence

1. **Authentication [FD]:**
   - Protected, internal and privileged pages require a live sign-in check **and** a live permission check.
   - A saved browser session alone never unlocks a privileged or internal area, and never grants elevated permission.
   - Member convenience may keep a fallback for non-privileged continuity only. It never substitutes for authorization or exposes protected data.
   - The integration-managed sign-in wrapper is not modified in this plan update. How to apply this rule to it is decided at build time with approval.
2. **Role [P]:** one server answer from a new `getMyAccess()` returns `{ founder, tester, testerAllowlist }`. Founder means admin or super_admin — the same rule the database already uses.
3. **Permissions [P]:** each protected page declares what it needs: `founder`, `tester:<experience>`, or `member`.
4. **Destination [P]:** decided in the before-drawing step (`beforeLoad`). A refused visitor goes to Welcome Hall.
5. **Experience [P]:** only then does the page draw. Menus use the same answer, for display only.

## 6. Route/door protection rules

- **[FD] Founder-only now:** `/commerce-simulation`, `/visual-review`, `/blueprints`, plus the existing `/control-room`, `/founder`, `/admin/*`, `/studios/*`, `/frassy`, `/global-operations`, `/payment-providers`.
- **[FD] Protected but UNASSIGNED** until recovery establishes their real purpose: `/builder-hall`, `/manufacturing`, `/launch-accelerator`. They keep the sign-in requirement, are not given to Testers, and are not classified as member or Founder-only yet.
- **[FD] Financial Center is split into two permission levels:**
  - "My money / my financial information": may eventually be member-facing, for that person's own data only.
  - FRASS Founder-level financial administration, audit and control: Founder-only.
  - The two levels are never collapsed into one. How today's single `/financial-center` page divides between them is **[F?]**, to be settled from recovery evidence.
- **[P]** Every internal page gets a server check before it draws. Checks inside the page stay only as a second layer.
- **[P]** Only two guards are allowed: `requireFounderRoute` and `requireTesterExperience(key)`, both following the same pattern. No ad-hoc checks inside pages.
- **[P]** Every server function behind an internal page repeats the server check.
- **[V]** Redirects and aliases (`/command`, `/admin/`, `/room`) already land on guarded pages.
- **[P]** Menus and icons come from one registry and are filtered by the same access answer. The cache is tied to the user id and cleared on sign-out and account switch.

## 7. Bypass reproduction and test plan

**Build step 1 only. This plan update does not authorize running it.** No code changes during reproduction.

Personas: signed out, a Member test account, and the Founder login. The Tester persona is added after the Tester stage.

For each page listed in section 6, on desktop (1280 wide) and mobile (390 wide):
- click every icon and menu item
- type the address directly
- hard refresh
- deep link with `?next=` and similar values
- press Back after signing out
- expire the session with the page open
- switch accounts from Founder to Member in the same browser within 60 seconds
- open public pages that show Founder chips

Record screenshots and network calls, then name the actual cause:
- (a) a check inside the page
- (b) the saved-session fallback
- (c) the stale "is Founder" cache
- (d) a public page showing Founder bits
- (e) something else

Report before any repair.

## 8. Legacy role mapping

| String | Evidence | Decision |
|---|---|---|
| admin | Founder lock, 1 holder | Keep = Founder |
| super_admin | Database treats as admin; the app does not; 0 holders | Consolidate into Founder (the app accepts both; stop granting it) |
| staff | Menu "Approvals"; old write policies; 0 holders | **[FD]** Remove its legacy write powers; keep the enum value; future powers commissioned deliberately |
| designer | Merch studio link; old write policies; 0 holders | **[FD]** Remove its legacy write powers; keep the enum value; future powers commissioned deliberately |
| moderator | Menu only; 0 holders | Defer (future For Us / Kids / community moderation) |
| partner | Business menu, Money Moves; 0 holders | Builder = Partner; defer as business identity |
| affiliate / ambassador | Business menu labels, "Soon"; 0 holders | Legacy; defer |
| customer | Never stored | Same as Member; stop using |
| tester | Missing | Add |

**[FD]** No enum values are deleted. Unexplained legacy write authority is removed, and those write powers are handed to the single Founder rule where a Founder actually needs them.

## 9. Files and data likely to change (future build only)

- **Database:**
  - Add `tester` to `app_role`.
  - New `tester_access(user_id, experience_key)` table with grants and RLS. Founders write it; a Tester reads only their own rows.
  - **[FD]** Rewrite the staff/designer write policies to the Founder rule.
  - Tester flag on feedback records, reusing the existing feedback tables.
- `src/lib/roles.ts`: add `tester`.
- `src/lib/admin.functions.ts`: `checkIsAdmin` accepts admin or super_admin; add `getMyAccess`.
- `src/lib/founder/route-guard.ts`: add `requireTesterExperience`.
- Before-drawing guards: `frassy.tsx`, `global-operations.tsx`, `payment-providers.tsx`, `commerce-simulation.tsx`, `visual-review.tsx`, `blueprints.tsx`. Founder-level parts of `financial-center.tsx`, per the split in section 6.
- `src/hooks/use-is-admin.ts`, `use-my-roles.ts`, `use-workspace-roles.ts`: tie the cache to the user; clear it on sign-out.
- `src/lib/navigation/account-menu.ts`, `hierarchy.ts`, `site-shell.tsx`: add a "Testing" group and a visible Tester badge; remove the staff/super_admin branches.
- `src/routes/auth.tsx`: neutral sign-in wording only.
- `src/routes/_authenticated/workspace.tsx`: drop the labels for consolidated roles.
- `src/lib/welcome-hall/continuation.ts`: role-aware next action.
- `src/routes/_authenticated/admin.roles.tsx`: grant or revoke Tester and edit the allowlist, reusing the existing page.
- **[FD]** Feedback reuse, with no new feedback system:
  - `src/components/page-feedback.tsx`, `src/lib/feedback.functions.ts`, `src/lib/launch-feedback*.ts`, the voice feedback flow
  - existing `/admin/feedback` and `/admin/launch-feedback`, extended with a Founder-only Tester view
- `src/routes/_authenticated/route.tsx`: integration-managed. Changed only if separately approved to enforce section 5.

## 10. Implementation sequence (stop and report for approval after each)

1. Reproduce the bypass (section 7) and report. **Not authorized by this update.**
2. Unify the Founder rule (admin or super_admin) and add before-drawing guards to the Founder-only pages.
3. Fix the access cache and clear it on sign-out and account switch.
4. Neutral `/auth` wording.
5. Tester role, allowlist table, and granting in Roles & Access.
6. Tester destination, "Testing" menu group, Tester badge, and a Founder-only Tester feedback view (reusing existing feedback).
7. Remove the legacy staff/designer write permissions **[FD]**.
8. Full acceptance run.

## 11. Acceptance criteria

- Signed out: every internal address goes to sign-in or Welcome Hall with no internal content drawn, including after refresh and from deep links.
- Member: no internal door is visible or reachable. Their own Daily and Workshop work.
- Tester: sees only the allowlisted experiences plus the member journey, and sees the Tester badge. Every Founder/Admin address refuses, and so do its server functions. Checkout is test mode only.
- Tester feedback: records page context, appears only in the Founder Tester view, and can be marked for retest.
- Founder: everything works. The 201-card Teleporter audit still passes unchanged.
- No saved session alone opens a privileged page.
- Account switch leaves no Founder icons behind. Back after sign-out shows no protected content.
- `/auth` has no owner wording.
- No legacy staff/designer write permission remains. The enum values remain.
- Tests, typecheck, and build pass. Nothing is deployed without approval.

## 12. Non-goals

- The Teleporter, the 201-card baseline, and its audit.
- Payments, Stripe, the allocation ledger, payouts, and settlement (including inside Financial Center).
- Owner-share trusted-storage repair (separate money workstream).
- Wallet → Financial Center consolidation (later, separately approved).
- Builder Hall → Welcome Hall consolidation and its `/frassy` link correction (later, separately approved).
- Commissioning `/manufacturing` or completing `/launch-accelerator` commissioning.
- FV Studios / Frassy presentation, A1 / Enhance Phone Recording, and the Music Engine.
- The Frassy AI backend and integration-managed auth files, including `_authenticated/route.tsx` (unless Nicolle separately approves).
- Moderator powers and a business-role redesign.
- New pages, duplicate routes, a new Founder financial room, or a duplicate feedback system.
- Removing enum values. Creating another Founder account or changing the Founder login.
- For Us and Kids tester access.
- Deployment.

## Resolved Founder decisions (formerly unresolved)

1. **[FD]** `/builder-hall`, `/manufacturing`, `/launch-accelerator` classified as member-oriented; none is Founder-only; none is in Sheldon's initial scope (section 6).
2. **[FD]** `/financial-center` is the member's own money home; Founder financial administration stays in existing Founder systems (section 6).
3. **[FD]** Integration-managed wrapper stays unchanged; privileged destinations add their own live checks (section 5).

No planning questions remain open. Build still requires Nicolle's separate approval of this final plan.

Note: the roadmap entry for this workstream will be added when Build mode starts. Plan mode allows editing only this plan.

**FOUNDER DECISIONS INCORPORATED — PLAN AWAITING NICOLLE GOLDING'S FINAL REVIEW AND APPROVAL. NOT APPROVED FOR BUILD.**
