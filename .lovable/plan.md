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

### 2. Founder Audit Journal
- When a page was opened from the World Teleporter, render one full-width Founder Audit Journal directly in the page flow, below the audited page content—not as a floating panel.
- It reads like a permanent engineering record: Founder message, Frassy response, thin card divider, next Founder message, next Frassy response.
- Every entry carries a timestamp, a copy button, and Founder-only expandable diagnostics.
- Every entry survives refresh and survives voice playback.
- The Audit Receipt and the developer evidence live inside the same journal, directly beneath the response they belong to. There is no separate conversation, timeline, and developer view.

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

### 4. Server-issued Teleporter session is the identity authority
- No browser-derived identity. Not `body.card`, not `body.route`, not `body.districtPath`, and not the referrer — referrers vanish on bookmarks, refreshes and deep links.
- Entering a card through the Teleporter creates a server-issued session record: `audit_session`, `card_id`, `canonical_route`, `registry_hash`, `locked`, `opened_at`, `closed_at`.
- Resolution order:

```text
Server active Teleporter session → Locked card_id → Canonical route from registry → Run AI
```

- If there is no active server session, the audit does not run; the Founder is told to re-enter the card from the Teleporter.

### 5. Audit Lock — no mid-stream switching
- Once an audit begins, the session is locked:

```text
Audit Session  AF-10442
Card           025
Locked         TRUE
```

- Every message in that journal stays attached to Card #025 until the Founder exits or explicitly starts a new audit.
- If the Founder types "actually let's talk about Card 11," the system does not switch. It answers:

```text
Current audit is locked to Card #025.
Exit audit?   YES / NO
```

### 6. Hard stop on mismatch
- If a request arrives whose claimed identity does not match the locked session, the model is never called:

```text
Audit Blocked
Session Card    025
Claimed         011
Reason          Audit identity mismatch
Credits spent   0
```

- No retry, no guessing, no fallback, no model call, no ledger write.
- Audit requests can no longer exit through the free navigation-answer path before identity is settled.
- Clean-room history stays: only the current Founder message plus the locked identity reaches the model.

### 7. Output kill switch
- After the model replies, the server checks the output against the locked identity. If the reply references any card number or canonical route other than the locked one, it is never shown:

```text
Audit aborted.
Reason: Model response referenced an identity outside the locked audit.
Credits refunded.
Please retry.
```

- Corrupted audits never reach the journal, and the abort itself is recorded so the failure is visible.

### 8. Permanent Audit Receipt
- Every audit entry permanently carries:

```text
AUDIT RECEIPT
Audit Session   AF-10442
Card            025
Canonical Route /admin/visual-index
Registry Hash   4F2A9D...
Context         LOCKED
History         EMPTY
Model           <model id>
Credits         1
```

- The registry hash proves exactly which registry version produced the audit.
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