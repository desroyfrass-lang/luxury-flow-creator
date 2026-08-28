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
