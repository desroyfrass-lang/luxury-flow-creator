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

### 2. The route is the ONLY client authority
- The server never trusts anything from the browser except the Current URL.
- Not: card number, title, district, audit context, component, route metadata, file. Nothing.
- The browser does not send "Card #025." It sends only: `I'm on /admin/visual-index`.
- Everything else is derived server-side, every single time:

```text
Current URL
    ↓
Server Router
    ↓
Registry
    ↓
Canonical Card
    ↓
AI Prompt
```

- Create one shared registry resolver that derives the canonical card from its route/file.
- Require verified Founder access for audit mode; a client cannot create an audit response merely by adding `auditContext`.
- Version the registry. Every registry carries a `Registry Version` (e.g. `2026.08.19.01`). Every audit receipt includes it, so if production serves a stale registry it is visible instantly.

### 2a. AI is impossible until validation succeeds
- The pipeline is strictly ordered. The AI never receives a prompt until every prior step passes:

```text
Validate
    ↓
Resolve Card
    ↓
Lock Audit Context
    ↓
Generate Prompt
    ↓
AI
```

- If validation fails at any stage, the AI never even receives a prompt. This makes it impossible for the model to hallucinate Card #11.
- If the active URL and the resolved registry entry disagree — or the route is unknown or duplicated — do not call the AI. Return a visible Founder diagnostic instead:

```text
Audit blocked.
Current URL:        /admin/visual-index
Resolved Registry:  /admin/financial-audit
Reason:             Registry mismatch
No AI call executed.
```

- A blocked audit is never written to the Audit Ledger. The ledger only ever contains successful audits. Failed validations are diagnostics, not audit history.

### 2b. Forensic Audit Source receipt
- Every audit response and every blocked attempt carries an Audit Source block. It is a forensic receipt:

```text
Audit Source
Engine:              TELEPORTER ENGINE v3
Registry Version:
Conversation ID:
Request ID:
Current URL:
Resolved Card:
History Count:
Prompt Hash:
Timestamp:
```

- Shown with the live response and stored with the ledger entry so any future recurrence is diagnosable in seconds.

### 3. Remove stale session authority
- Do not store any active card object.
- Store only: Destination URL. That is it.
- Everything else comes from the Registry. Every. Single. Time.
- On every target page and every send, derive the complete active card from the current registry.
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
4. Click it and confirm the destination says `Reviewing Card #025 · /admin/visual-index` before sending. The browser sends only the Current URL — no card number, no metadata.
5. Send a unique test sentence while recording the browser request and response.
6. Confirm the request is `POST /api/chat` and the forensic receipt shows `TELEPORTER ENGINE v3`, a `Registry Version`, Card #025, `/admin/visual-index`, a fresh Request ID, Prompt Hash, and Timestamp.
7. Confirm the first response line is Card #025, it is stored once in the Audit Ledger, and no maximum-update-depth error appears.
8. Repeat with Card #011 and confirm it independently resolves to `/admin/financial-audit`.
9. Force a mismatch (e.g. navigate to `/admin/visual-index` but tamper so the registry disagrees) and confirm the AI is never called — the response is the `Audit blocked.` diagnostic and nothing is written to the ledger.

## Technical scope
- Audit Ledger snapshot, Teleporter session resolver, shared card resolver, Frassy request construction, `/api/chat` server verification, hard-fail diagnostic, and audit receipt display/storage.
- No security-finding changes, onboarding changes, or unrelated feature work.

## Status

Status: Founder-blocking

This issue cannot be marked fixed until a live production audit of Card #025 returns:
- Card #025
- `/admin/visual-index`
- `TELEPORTER ENGINE v3` receipt
- Correct ledger entry
- Zero runtime errors

Build success, preview success, type checks, or unit tests do not satisfy acceptance.

Root Cause: The audit handler trusts browser card metadata, stale Teleporter session objects can remain authoritative, and the Audit Ledger snapshot can trigger the confirmed FrassyChat render loop.
