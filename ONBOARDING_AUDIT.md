# FRASS-0563 — Onboarding Journey Constitutional Audit

Status: Audit only. No onboarding code changed. Awaiting Founder approval.
Date: 14 Aug 2026

Constitutional sentence proposed by the Founder (adopted in this audit as the
measuring stick):

> Frass has one front door, but two welcome experiences. Frass District
> welcomes customers. Frass Hill welcomes Builders. Only Frass Hill creates a
> personalized Builder journey.

> The Daily is not the beginning of the journey. It is the result of the
> journey.

---

## 1. Current journey (what the code actually does today)

### Shopper door

```
frasskicks.com  (src/routes/index.tsx)
   ↓ "Shop Frass District"
/join/frasskicks        — create a customer profile
   ↓ on success: navigate({ to: "/welcome" })      ← VIOLATION
/welcome                — Builder First Arrival ceremony
   ↓ buttons: "Enter the Welcome Hall" | "Sit down with Frassy"
/welcome-hall or /onboarding — Builder onboarding
```

A shopper who only wanted sneakers is handed the Builder arrival ceremony and
two Builder doors. The Frass District is never reached from the shop signup.

### Builder door

```
frasskicks.com
   ↓ "Enter Frass Hill"
/join/frass-hill        — register (email confirm returns to this page)
   ↓ provisionFrassHill() creates card / vault / membership
   ↓ buttons: "Sit down with Frassy" (/onboarding) | "See my workspace" (/room)  ← ESCAPE HATCH
/welcome                — only reached when already signed in
   ↓ first arrival: 4 spoken lines, then two buttons
/welcome-hall           — SCENERY ONLY: no conversation, no interview, no greeting
   ↓ manual link
/onboarding             — the real interview (Frassy now opens it herself)
   ↓ 12+ stages, ~8–10 h
/room                   — the Daily
```

### Where the current journey diverges from the intended one

| # | Divergence | Evidence |
|---|---|---|
| 1 | Shop signup routes into the Builder arrival | `join.frasskicks.tsx:66` → `/welcome` |
| 2 | `/welcome-hall` contains no Frassy conversation at all | `welcome-hall.tsx` renders scenery, sightlines, ambience toggle only |
| 3 | `/welcome-hall` is registered as a `workspace` surface, so the floating Frassy beacon is *suppressed* there | `src/lib/frassy/surfaces.ts` WORKSPACE_PREFIXES | 
| 4 | Result of 2 + 3: the Welcome Hall is a **silent room with Frassy deliberately removed** | — |
| 5 | Hill registration offers "See my workspace" before the interview | `join.frass-hill.tsx` |
| 6 | Three arrival pages compete: `/welcome`, `/welcome-hall`, `/arrival` | route list |
| 7 | The interview has no completion contract — no minimum understanding before the Daily | `journey.functions.ts` |
| 8 | There is no `onboarding_completed` flag; `builder_journeys.status` is the only signal, and it reaches `complete` only after all 12 stages (~8–10 h) | schema |

---

## 2. Intended journey (constitutional)

```
frasskicks.com — one front door, two clearly explained doors
        │
        ├── 🛍 FRASS DISTRICT (customers)
        │      /join/frasskicks (only if buying/saving requires it)
        │      → /frass-district
        │      → Frassy greets as a host: "I'll help you find it"
        │      → NO interview, NO Daily, NO Workshop, NO Blueprint
        │
        └── 🌳 FRASS HILL (Builders)
               /join/frass-hill  — register
               → /welcome        — Frassy's personal first arrival
               → Welcome Hall CONVERSATION (auto-start, voice or text)
                    greeting → who are you → what brings you here
                    → what are you building → what matters most
               → Blueprint created (mission, goals, industry)
               → Learning profile   (how you want things explained)
               → Momentum profile   (hours, energy, pace)
               → District / venture choice
               → Daily generated from what Frassy now knows
               → Workshop + Business Vault initialised
               → Daily opens
```

---

## 3. Missing connections

**Steps skipped**
- Shopper never reaches a district welcome; Builder never reaches an actual
  Welcome Hall conversation.
- Learning profile and momentum profile are never asked during onboarding.
  Learning level lives in `localStorage` only (`frassy/learning-levels.ts`),
  so it is device-bound and lost on a new browser.
- Blueprint is never created by onboarding. `member_success_blueprints` is only
  written from `/blueprints` and Frassy tools — a member can reach the Daily
  with no blueprint at all.

**Steps duplicated**
- Three arrival experiences (`/welcome`, `/welcome-hall`, `/arrival`) plus the
  entrance page — four ceremonial screens for one arrival.
- Two "meet Frassy" invitations on `/welcome` that lead to different places.

**Too early**
- Daily/Workspace is reachable immediately after Hill registration.
- The shopper's Builder arrival ceremony.

**Too late**
- District choice happens before Frassy knows anything, at the entrance, rather
  than as a recommendation after the interview.

**Dead ends / circular navigation**
- `/welcome-hall` sightlines link to `/frass-hill` and districts, so a new
  Builder can wander out of onboarding and never return; nothing brings them
  back.
- Email confirmation for the Hill returns to `/join/frass-hill`, while
  `/auth` signup returns to `/welcome` — two different re-entry points.

**Silent screens**
- `/welcome-hall` (worst case: Frassy is actively suppressed there).
- `/arrival` — narrated visually, but no conversation.
- `/frass-district` — no shopper greeting; only the generic beacon.

**Missing voice triggers**
- Welcome Hall voice only starts if the member clicks the ambience toggle.
- District welcome has no voice line at all.

---

## 4. Data dependencies

| Stage | Input required | Data created | Depended on by | Status |
|---|---|---|---|---|
| Registration | name, email | `profiles`, Frass Card, vault | everything | ✅ works |
| First arrival | session | `builder_memory: arrival/first_arrival_at` | greeting choice | ✅ works |
| Interview: mission | conversation | `builder_memory: mission` | Daily, Money Moves, Blueprint | ⚠️ reachable but skippable |
| Interview: goals | mission | `builder_memory: goals` | Daily, Freedom milestones | ⚠️ skippable |
| Interview: identity/passport | conversation | identity, skills | Frass Card, Academy, marketplace | ⚠️ skippable |
| Learning profile | — | **nothing in the database** | every Frassy explanation | ❌ never collected, localStorage only |
| Momentum profile | available hours | **nothing collected at onboarding** | Daily sizing, Return on Time | ❌ missing |
| Blueprint | mission + goals + industry | `member_success_blueprints` | Daily, Workshop, Vaults | ❌ not created by onboarding |
| District choice | recommendation | not recorded | Daily content, vault routing | ❌ not recorded |
| Daily | all of the above | Daily view | the member's day | ❌ **opens with none of it** |

**Constitutional violations flagged:** the Daily, Workshop, Money Moves and
Business Vault recommendations all consume data that onboarding never
guarantees. The Daily can render for a member Frass has never met.

---

## 5. Proposed fixes (for approval — nothing implemented yet)

**A. Split the two welcomes (P0)**
1. `/join/frasskicks` → `/frass-district`, never `/welcome`.
2. Add a lightweight District Welcome: one Frassy line, one voice greeting,
   straight into browsing. No interview, ever.
3. Restate the entrance as two journeys with what each contains (Shop Luxury /
   Build Your Future), not two buttons.

**B. Make the Welcome Hall the conversation (P0)**
4. Merge `/welcome-hall` and `/onboarding` into one Hill Welcome: the scenery
   stays as the backdrop, Frassy's conversation runs inside it, auto-starting
   by voice with a text fallback.
5. Remove the sightline links and the "See my workspace" escape hatch from the
   first session; keep one honest "pause and come back later".
6. Keep `/welcome` as the one-time personal greeting only; `/arrival` becomes
   the cinematic tour reachable from the Hill, not part of onboarding.

**C. Complete the understanding contract (P0)**
7. Add learning profile and momentum profile as two short conversational stages
   inside the interview, written to `builder_memory` (server-side, not
   localStorage).
8. On completing the foundation stages, Frassy writes the first Blueprint
   automatically and records the district choice.
9. Introduce `onboarding_completed` semantics = "foundation complete"
   (mission, goals, learning, momentum, district, blueprint) — not all 12
   stages. The Daily unlocks at foundation, the journey continues afterwards.
10. Extend the existing gate so the Daily/Workshop open only after the
    foundation checklist passes (today it only checks "said one thing").

**D. Verify (P1)**
11. Add the two audits as Experience Simulator runs: a Shopper run and a
    Builder run, each with its own pass criteria.

**Impact:** one route merged, one redirect corrected, two interview stages
added, one blueprint write, one gate widened. No new subsystems, no new
dashboards. Existing systems extended, nothing duplicated.

---

## 6. Constitutional amendments recommended

- **FRASS-0563.1** One front door, two welcome experiences. Frass District
  welcomes customers; Frass Hill welcomes Builders; only Frass Hill creates a
  personalized Builder journey.
- **FRASS-0563.2** The Daily may never open before Frass understands the
  member. If Frass cannot name the member's mission, goals, pace and preferred
  explanation depth, it has not earned the right to generate their Daily.
- **FRASS-0563.3** No further onboarding features until this audit's fixes are
  approved and shipped.
