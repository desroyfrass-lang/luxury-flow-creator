# FRASS CORE JOURNEY SCORECARD — ATLAS PHASE 2

Method: scripted real browser sessions against the running app. Each journey was
driven the way a person would drive it: enter → understand → do a task → save →
reload → leave → come back → check the work is still there and still private.

Test accounts
- Normal member: porositybalance@gmail.com (approved by the Founder). All records
  created are labelled **ATLAS TEST**.
- Founder/Admin: **not signed in during this pass** — see "Not tested" below.

Status meanings
- END-TO-END VERIFIED — done, saved, survived reload and return.
- FUNCTIONAL WITH ISSUES — works, but something is wrong along the way.
- PARTIAL — some of it real, some of it not.
- UI SHELL — looks complete, saves nothing.
- BROKEN — cannot be used.
- BLOCKED — could not be tested this pass.
- REDIRECT ONLY — sends you somewhere else.

---

## 1. Normal member journeys

| # | Journey | Route | Status | Evidence |
|---|---|---|---|---|
| 1 | Sign-in and arrival | `/welcome-hall` | END-TO-END VERIFIED | Session restored, member greeted by name ("GOOD MORNING, POROSITYBALANCE"). |
| 2 | **Self-Service Vault Engine** | `/vaults`, `/vaults/new` | **END-TO-END VERIFIED** | Completed the 13-question setup, vault created (`ATLAS TEST VAULT`, Business → Beauty, 16 sections), appears in MY VAULTS after reload. |
| 3 | **Vault record keeping** | `/vaults/:id/m/clients` | **END-TO-END VERIFIED** | Added `ATLAS TEST CLIENT`, reloaded the page, record still there with Open / Mark done / Archive / Delete. |
| 4 | The Frass Daily | Daily overlay | FUNCTIONAL WITH ISSUES | Renders personalised, closes and stays closed for the day. Carries a **"🟡 Sample Data"** badge — the day's items are not yet the member's real work. |
| 5 | Money Moves | `/money-moves` | PARTIAL | Real page, real scoring language, "I did this / Not today" controls present; not yet confirmed to persist across sessions. |
| 6 | Opportunity Center | `/opportunity` | PARTIAL | Real counters (0 open, $0 value), Add Opportunity form present; write path untested this pass. |
| 7 | Academy District | `/academy` | UI SHELL | Colleges, paths and lessons render; "START THIS PATH" leads to content, no member progress recorded. |
| 8 | Frassy Money Moves Desk | `/frassy` | PARTIAL | Loads with autonomy modes and "Frassy is working"; no interactive controls exposed on load. |
| 9 | For Us / community arrival | `/for-us` | FUNCTIONAL WITH ISSUES | Full immersive arrival renders. `/community` is a **404**. |
| 10 | Frass Hill town plan | `/frass-hill` | END-TO-END VERIFIED (navigation) | Town plan renders with all districts after the daily gate is satisfied. |
| 11 | Services Marketplace | `/services` | UI SHELL | Category and trust copy renders; no listings, no actions. |
| 12 | Workspace | `/workspace` | BLOCKED BY DESIGN | Identity Check (biometric / password) stands in front. Correct behaviour, but automation cannot pass it — needs Founder hands-on. |
| 13 | Wallet | `/workspace/wallet` | BLOCKED BY DESIGN | Same Identity Check gate. |
| 14 | First 30 Days | `/first-30-days` | FUNCTIONAL WITH ISSUES | Renders the programme; throws a React "state update before mount" warning. |
| 15 | Builder Journey / onboarding | `/onboarding` | PARTIAL | 12 chapters listed and reachable; `/room` and `/daily` both land here instead of their own pages. |

## 2. Permissions (tested as the normal member)

| Check | Result |
|---|---|
| `/control-room` | ✅ Blocked — "FOUNDER ACCESS REQUIRED" |
| `/admin` | ✅ Blocked |
| `/studios` | ✅ Blocked |
| `/admin/roles` | ⚠️ **RISK** — shows a "CLAIM SITE OWNERSHIP" button to a normal member when no owner is detected |
| Vault data | ✅ Only this member's vaults and records were visible |

## 3. Broken links found (all 404 for a signed-in member)

`/card` · `/builder-identity` · `/shop` · `/kids` · `/community` · `/wallet`

These are names a member would reasonably type or follow. Each needs either a real
page or a redirect to its live equivalent.

## 4. Not tested this pass

- Founder/Admin journeys (Control Room, Frassy Studios, Release Approval,
  Security Center) — no Founder session was used, per the "do not change
  anything" instruction.
- Anything behind the Identity Check (Workspace, Wallet) — requires the Founder
  or the member to authenticate by hand.
- Kids World — no working route found from the member side.
- Commerce checkout — Pre-Launch Mode disables payment by design.

## 5. Headline

The **Vault engine is the strongest thing on the platform** — a member can create
a workspace, put real records in it, leave and come back, and it is all still
there, private to them. Around it, three things hold the experience back:

1. Six dead links a member can hit on ordinary names.
2. The Daily still shows sample data rather than the member's real work.
3. `/admin/roles` can offer site ownership to a normal member.

No source code, data or shells were changed during this audit.

---

# ATLAS RECOVERY PHASE 1 — 28 Aug 2026

## 0. Audit contradiction: "nothing was changed" vs "the ledger no longer throws"

- **What "the ledger" is:** the Founder Audit Ledger (FRASS-0573) — the Founder's
  permanent conversation journal, shown inside the Founder Control Room.
- **File changed:** `src/lib/founder/audit-ledger.functions.ts` (`listAuditLedger`).
- **When:** immediately *after* the Atlas Phase 2 audit report was written, as a
  separate error-fix request from the Founder ("Error: Founder access only").
- **Was it part of Atlas Phase 2?** No. It was a follow-up fix in the next
  message, so the Phase 2 sentence "nothing was fixed" was true when written and
  became stale once the fix landed in the same document.
- **Source code change:** YES — the reading function now returns an empty list
  for non-Founders instead of throwing.
- **Database change:** NO. **RLS change:** NO. Writes stayed Founder-only and the
  table's policies were untouched.
- **Why the contradiction:** the two statements describe two different moments
  and were recorded in one document without a timeline. Corrected here.

## 1. P0 — CLAIM SITE OWNERSHIP

- **BEFORE:** `/admin` (and therefore `/admin/roles`) rendered for any signed-in
  member and offered a "Claim site ownership" button.
- **Root cause:** the owner console had no route-level authorization at all. It
  rendered an "Owner access required" screen client-side, and that screen carried
  a first-run bootstrap button.
- **Could a member actually claim ownership?** NO. `claimInitialAdmin` refused
  whenever an admin already existed, and the Founder (desroyfrass@gmail.com)
  holds the admin role. The exposure was a real authorization gap in the door,
  not a completed takeover path.
- **FIX:** server-verified `beforeLoad` guard (`requireFounderRoute`) on `/admin`;
  the bootstrap UI and the `claimInitialAdmin` server function were deleted
  outright, so no ownership-claim action exists to call any more.
- **RETEST (porositybalance@gmail.com):** `/admin` → `/welcome-hall`,
  `/admin/roles` → `/welcome-hall`. No ownership control rendered. **PASS.**

## 2. P0 — Founder Hall / Control Room exposure

- **BEFORE:** `/control-room`, `/founder`, `/command`, `/studios` relied on a
  client-side role hook only; a direct URL rendered the shell for anyone.
- **FIX:** all Founder routes now run one shared server-verified guard before
  loading or rendering anything. Unauthorized visitors go to the Welcome Hall,
  never sideways into another Founder route.
- **RETEST:** `/control-room` → `/welcome-hall`, `/founder` → `/welcome-hall`,
  `/command` → `/welcome-hall`, `/studios` → `/welcome-hall`. **PASS.**
- Founder-only server functions (roles list/grant/revoke, ledger, admin data)
  already re-verify `has_role` server-side; unchanged.

## 3. `/room` and `/daily`

- **BEFORE (Phase 2):** both landed on `/onboarding`.
- **Root cause:** the member has an *in-progress* Builder Journey and has never
  answered Frassy (0 messages), so FRASS-0563's Welcome Gate correctly walked
  them to onboarding. This is a legitimate unmet prerequisite, not a routing bug.
- **RETEST:** `/room` → My Workspace renders; `/daily` → `/room?daily=true` and
  the Daily opens. **PASS** (no invented replacement destination).

## 4. Welcome Hall self-redirect loop

- **Root cause:** the `next` continuation accepted any internal path, including
  `/welcome-hall` itself and `/onboarding`.
- **FIX:** one shared sanitizer (`src/lib/welcome-hall/continuation.ts`) used by
  the route, the daily ceremony and the gate. Self-references, sign-in and
  onboarding fall back to the canonical member destination `/room`.
- **RETEST:** `/welcome-hall?welcome=daily&next=/welcome-hall` normalised to
  `next=/room`. **PASS.**

## 5. The six 404 destinations

| Route | Classification | Result |
|---|---|---|
| `/card` | BROKEN ALIAS → `/workspace/card` | redirect verified |
| `/builder-identity` | BROKEN ALIAS → `/workspace/profile` | redirect verified |
| `/shop` | BROKEN ALIAS → `/frass-district` (matches existing `/shop-frass`) | redirect verified |
| `/kids` | BROKEN ALIAS → `/kids-world` (Kids Valley; the kids *shop* is `/frass-kids`) | redirect verified |
| `/community` | BROKEN ALIAS → `/town-square` | redirect verified |
| `/wallet` | BROKEN ALIAS → `/workspace/wallet` | redirect verified, then **REQUIRES HUMAN IDENTITY VERIFICATION** (Identity Check) |

All destinations were taken from the authoritative registry in
`src/lib/navigation/hierarchy.ts`; no new destination list was introduced and no
missing feature was built.

## 6. Vault Engine regression

`/vaults` lists the existing ATLAS TEST VAULT; the vault opens and its stored
record persists. **STILL END-TO-END VERIFIED.**

## 7. Founder Admin Architecture Amendment (applied in Phase 1)

**ONE HEADQUARTERS, MANY PROTECTED ROOMS.**

- **Founder Hall** is now the single headquarters at `/founder` (previously that
  URL only bounced into the Control Room). It is a navigation and orientation
  layer: plain-language cards onto rooms that already exist. No new admin tool,
  no new dashboard, no data cramming.
- **Control Room** stays exactly as it is at `/control-room` — a major protected
  operational room reached from Founder Hall, with a breadcrumb back to
  headquarters. Nothing was merged, moved or deleted.
- **Onboarding Room** stays the members' onboarding system at `/onboarding`. No
  Founder-only copy. It is now a first-class Founder TP destination and a
  Founder Hall card, so the Founder can inspect the real room.
- **Founder TP** gained a pinned "quick jumps" row (Onboarding Room, Control
  Room, Studios, Vaults, Security & Access, Site Management) plus a "Back to
  Founder Hall" chip. The rest of the World Teleporter is untouched.
- **Authoritative registry** (`src/lib/navigation/hierarchy.ts`) was corrected at
  source: Founder Hall's path is `/founder`, Control Room and Onboarding Room are
  its children. No second hard-coded destination list drives the menus.
- **Founder can leave administration** intentionally: an "Enter Frass Hill" card,
  visually separated from the rooms, walks the member experience. No impersonation
  was invented.
- **Rooms with no existing implementation were not fabricated.** Every card points
  at a route that already exists; a dedicated Kids World *administration* console
  does not exist, so the Kids card opens the real Kids World for inspection.

### Architecture verdict

- FOUNDER HALL IS THE SINGLE ADMIN HEADQUARTERS: YES
- CONTROL ROOM REMAINS A SEPARATE PROTECTED TOOL: YES
- ONBOARDING ROOM REMAINS A SEPARATE USER SYSTEM: YES
- ONBOARDING ROOM IS ACCESSIBLE THROUGH FOUNDER TP: YES
- FOUNDER CAN RETURN TO FOUNDER HALL FROM PROTECTED SYSTEMS: YES
- NORMAL MEMBER CANNOT ACCESS FOUNDER HALL: YES (verified: `/founder` → Welcome Hall)
- NORMAL MEMBER CANNOT ACCESS CONTROL ROOM: YES (verified)
- NORMAL MEMBER CANNOT ACCESS FOUNDER TP: YES (it lives inside the guarded Control Room)
- FOUNDER CAN ENTER THE NORMAL FRASS HILL EXPERIENCE INTENTIONALLY: YES
- NO NEW COMPETING ADMIN HOME WAS CREATED: YES

---

## DAILY + WORKSHOP FUNCTIONAL REBUILD — RETEST (real member: porositybalance@gmail.com)

| Journey step | BEFORE | FIX | RETEST | STATUS |
| --- | --- | --- | --- | --- |
| `/daily` | Redirect to `/room?daily=true`, sample persona data | Canonical `/daily` under `_authenticated`, real data only | Loads directly, greets member, shows only real work | ✅ |
| `/workshop` | Did not exist | Canonical execution environment on `member_actions` | Created work item, persisted after reload | ✅ |
| Daily ↔ Workshop | Duplicated features | Daily organises, Workshop executes; one shared work record | Item created in Workshop appears in Daily TODAY | ✅ |
| `/room` | Member workspace with sample data | Redirects to `/workshop` (or `/daily` for `?daily=true`); old UI preserved at `/room-classic` | No 404, no onboarding bounce | ✅ |
| Sample data for real members | Fake tasks/revenue/meetings | Removed from the member path; honest empty states | No fabricated items shown | ✅ |
| Navigation registry | `My Space` rooted at `/room` | Rooted at `/daily`, Workshop registered as an area | Breadcrumbs/teleporter resolve correctly | ✅ |
