# Permanent Teleporter Chat and Card Identity Repair

## Goal
Stop spending credits on an audit experience that cannot be trusted. Remove the transient speech box, make every pasted Founder message and every Frassy reply permanent and copyable in one on-page transcript, and prevent Card #011 from serving a Card #025 review.

## Confirmed current state
- The disappearing small box is the separate voice teleprompter in `frassy-conversation-dock.tsx`. It is mounted only while speech is active or paused, so it disappears as soon as playback becomes idle even though the speech text is retained.
- The normal transcript records turns, but Teleporter audits on `/admin/*` currently open Frassy as a floating panel rather than as a permanent section of the audited page.
- The canonical registry currently resolves `/admin/visual-index` to Card #025 and `/admin/financial-audit` to Card #011.
- The API currently resolves the audit from `districtPath` in the request body. That value comes from the browser. The exact reason the live request is still arriving as Card #011 is not yet proven.

## Implementation

### 1. Remove the transient speech box
- Delete the teleprompter rendering from the global Frassy Conversation Dock.
- Remove every duplicate speech overlay and duplicate rendered reply, so Frassy appears to speak in exactly one place.
- Voice playback becomes only a way of hearing the transcript, never a second interface.

### 2. Permanent Audit Journal
- When a page was opened from the World Teleporter, render one full-width audit conversation directly in the page flow, below the audited page content—not as a floating panel.
- The journal reads like a notebook: Founder message, Frassy response, thin card divider, next Founder message, next Frassy response.
- Every message carries a timestamp, a copy button, and Founder-only expandable diagnostics.
- Every message survives refresh and survives voice playback.
- The Audit Receipt and the developer evidence live inside the same transcript, directly beneath the response they belong to. There is no separate conversation, timeline, and developer view.

### 3. Server-generated audit header before the AI is called
- Before any model call, the server writes the header from resolved registry data:

```text
══════════════════════
Teleporter Card #025
Visual Index
/admin/visual-index
Audit Started  09:42:18
══════════════════════
```

- Frassy's analysis is rendered beneath that header. Even a total hallucination cannot hide what the server intended to audit.

### 4. Server authority over identity
- The server never trusts `body.card`, `body.route`, or `body.districtPath`.
- Identity is resolved from the request the server itself observed:

```text
Observed Request → Observed Referrer → Resolve Card → Run AI
```

- The browser-claimed route is accepted as a comparison value only, never as authority.

### 5. Hard stop on mismatch
- If the observed route does not match the resolved card, the model is never called:

```text
Audit Blocked
Observed        /admin/visual-index
Body            /admin/financial-audit
Reason          Audit identity mismatch
Credits spent   0
```

- No retry, no guessing, no fallback, no model call, no ledger write.
- Audit requests can no longer exit through the free navigation-answer path before identity is settled.
- Clean-room history stays: only the current Founder message plus the server-resolved identity reaches the model.

### 6. Permanent Audit Receipt
- Every audit response permanently carries:

```text
AUDIT RECEIPT
Audit Session      AF-10442
Observed URL       /admin/visual-index
Resolved Card      025
History            EMPTY
AI Credits         1
Identity Verified  YES
```

- The receipt is stored with the journal entry, so any audit can be proven long after the fact.

### 7. Tests, including sequential leakage
- `/admin/visual-index` → Card #025.
- `/admin/financial-audit` → Card #011.
- Observed/body mismatch → blocked, zero AI call, zero credits.
- A navigation-style audit message cannot bypass audit identity handling.
- Founder text and Frassy replies persist after voice playback and after refresh.
- Sequential audit test: open Card #011, then #025, then #018, then #032, then #005, and verify each response references only the current card. This is the cache-leak test.

### 8. Production gate
- Production is not marked complete until the Founder verifies, in a clean published session, that Card #011, Card #025, and Card #032 each audit correctly without ever mentioning another card.
- No transient text box, no “Ready for Card #12,” no foreign route lines.

## Plain English
The disappearing box will be removed, not patched. The conversation will become part of the page like a permanent written record, with a copy button on every message. Before Frassy is allowed to spend a credit, the server will check the page you are actually standing on; if anything says Card #011 while you are on Card #025, the request stops and costs nothing.

## Scope
Only the Teleporter audit conversation, its voice text surface, and audit request identity validation will change. No unrelated store, member chat, or district features will be altered.

---
**Implementation** ⏳  
**Type Check** ⏳  
**Build** ⏳  
**Preview** ⏳  
**Production** ⚠️  
**Constitution Updated** ⏳  
**Project Memory Updated** ⏳  
**Requires Founder Testing** ⏳

Root Cause: The disappearing box is confirmed; the live Card #011 request source remains unconfirmed until the real request path is captured and compared.  
Status: Corrective implementation is awaiting Founder approval; Production is not considered fixed.