# Founder Blocking Bug — Runtime-Verified Teleporter Repair

## Goal
Make one live Teleporter review provably return the card selected by the Founder. Do not resume the audit until selecting Card #025 reaches `/admin/visual-index` and the response begins with Card #025.

## Confirmed findings
- The Teleporter click stores card context, navigates to the selected route, and the shared Frassy panel posts to `POST /api/chat`.
- `/api/chat` is the only handler that creates the `VISUAL VERIFICATION` heading. No `/api/frassy`, `/api/teleporter`, service worker, or second audit template exists in the current codebase.
- The current registry defines `/admin/financial-audit` as Card #011 and `/admin/visual-index` as Card #025.
- The server checks only whether two browser-supplied paths match. It does not independently verify that the supplied number belongs to that route.
- Production returned Card #025 when directly given `number: 25` with `/admin/financial-audit`, proving the server echoes an unverified browser card number.
- The supplied console shows `Maximum update depth exceeded` inside `FrassyChat`. The Audit Ledger snapshot reads local storage into a new array on every React snapshot request, which can cause this render loop.

## Implementation

### 1. Stop the Frassy runtime crash
- Give the Audit Ledger external store one stable in-memory snapshot.
- Update that snapshot only when ledger data is appended, merged, deleted, cleared, or synchronized.
- Keep the permanent Founder Audit Ledger and its database synchronization.

### 2. Make the server authoritative for card identity
- Create one shared registry resolver that derives the canonical card from its route/file.
- In `/api/chat`, ignore browser-supplied number, title, component, file, and district as authorities.
- Resolve the canonical card from the shared registry using the route currently being rendered, verified server-side, not the route metadata the browser submits. Chain: Teleporter selection → router navigation → current page loads → server resolves current route → shared registry lookup → canonical card → AI prompt.
- Require verified Founder access for audit mode; a client cannot create an audit response merely by adding `auditContext`.

### 2a. Hard fail before any AI call
- If the active URL and the resolved registry entry disagree — or the route is unknown or duplicated — do not call the AI at all.
- Return a visible Founder diagnostic instead, in this shape:

```text
Audit blocked.
Current URL:        /admin/visual-index
Resolved Registry:  /admin/financial-audit
Reason:             Registry mismatch.
No AI call executed.
```

- A blocked audit is never written to the Audit Ledger as a review.

### 2b. Audit Source diagnostic
- Every audit response and every blocked attempt carries an Audit Source block:

```text
Audit Source
Teleporter Card:
Current URL:
Registry Match:
Conversation ID:
History Count:
Prompt Hash:
```

- Shown with the live response and stored with the ledger entry so any future recurrence is diagnosable in seconds.


### 3. Remove stale session authority
- Store only the selected card key/route needed for navigation.
- On every target page and every send, derive the complete active card from the current registry.
- Never return a cached card object merely because its stored path matches.
- Prevent sending until the destination visibly shows the canonical card and route selected in the Teleporter.

### 4. Add undeniable runtime provenance
- Return an audit receipt containing handler ID, deployment marker, canonical card number, canonical route, request ID, and timestamp.
- Display it beneath the live response and persist it with the Audit Ledger entry.
- Add a response header identifying the serving handler so browser network inspection proves the exact endpoint.
- Use a new marker that cannot exist in the old handler: `TELEPORTER ENGINE v3`.

### 5. Keep history without confusing it with the live response
- Keep the searchable Card #001 onward Audit Ledger.
- Clearly label historical entries as ledger history and the current request as the live canonical card.
- Preserve every completed Founder message and Frassy reply exactly as generated.

## Runtime acceptance test
1. Open Production at `frasskicks.com` as the Founder and complete or skip the Daily Welcome gate.
2. Open Founder Control Room → World Teleporter.
3. Search for Card #025 and confirm its canonical route is `/admin/visual-index`.
4. Click it and confirm the destination says `Reviewing Card #025 · /admin/visual-index` before sending.
5. Send a unique test sentence while recording the browser request and response.
6. Confirm the request is `POST /api/chat` and the receipt says `TELEPORTER ENGINE v3`, Card #025, `/admin/visual-index`, with a fresh request ID and timestamp.
7. Confirm the first response line is Card #025, it is stored once in the Audit Ledger, and no maximum-update-depth error appears.
8. Repeat with Card #011 and confirm it independently resolves to `/admin/financial-audit`.

The fix is complete only after these live runtime checks pass; source inspection, type checking, and build success alone do not count.

## Technical scope
- Audit Ledger snapshot, Teleporter session resolver, shared card resolver, Frassy request construction, `/api/chat` server verification, and audit receipt display/storage.
- No security-finding changes, onboarding changes, or unrelated feature work.

Implementation ⏳ / Type Check ⏳ / Build ⏳ / Preview ⏳ / Production ❌ / Constitution Updated ⏳ / Project Memory Updated ⏳ / Requires Founder Testing ⏳

Root Cause: The audit handler trusts browser card metadata, stale Teleporter session objects can remain authoritative, and the Audit Ledger snapshot can trigger the confirmed FrassyChat render loop.
Status: Founder-blocking; implementation is paused for approval and must be proven in the live runtime.