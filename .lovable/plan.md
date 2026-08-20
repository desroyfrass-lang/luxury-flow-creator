# Permanent Teleporter Chat and Card Identity Repair

## Goal
Stop spending credits on an audit experience that cannot be trusted. Remove the transient speech box, make every pasted Founder message and every Frassy reply permanent and copyable in one on-page transcript, and prevent Card #011 from serving a Card #025 review.

## Confirmed current state
- The disappearing small box is the separate voice teleprompter in `frassy-conversation-dock.tsx`. It is mounted only while speech is active or paused, so it disappears as soon as playback becomes idle even though the speech text is retained.
- The normal transcript records turns, but Teleporter audits on `/admin/*` currently open Frassy as a floating panel rather than as a permanent section of the audited page.
- The canonical registry currently resolves `/admin/visual-index` to Card #025 and `/admin/financial-audit` to Card #011.
- The API currently resolves the audit from `districtPath` in the request body. That value comes from the browser. The exact reason the live request is still arriving as Card #011 is not yet proven.

## Implementation

### 1. Remove the transient box completely
- Delete the teleprompter rendering from the global Frassy Conversation Dock.
- Keep only compact voice transport/status controls where needed; no spoken reply will appear in a separate temporary text surface.
- Ensure no other overlay, toast, or speech component duplicates Frassy’s reply outside the canonical transcript.

### 2. Embed the Teleporter audit transcript into the audited page
- When a page was opened from the World Teleporter, render one full-width Frassy audit conversation directly in the page flow, below the audited page content—not as a floating, disappearing panel.
- Render the Founder’s pasted text immediately as a normal transcript message before the request is sent.
- Render Frassy’s completed reply as the next normal message and preserve both through refresh using the existing Founder Audit Ledger.
- Keep previous card reviews inline with thin card dividers, preserving the single continuous journal requirement.
- Add a clear copy control to every Founder and Frassy message so the complete text can be copied into another AI provider without manual drag-selection.
- Remove the collapsible “Developer details” mini-box. Put the audit identity receipt in the permanent transcript as compact selectable text; keep raw diagnostic evidence available in a persistent, copyable transcript entry only during Founder audit testing.

### 3. Make the request URL authoritative
- On `/api/chat`, derive the audited pathname from the server-observed page referrer rather than accepting the browser body as authority.
- Compare the referrer pathname with the body pathname. If they differ, block the AI call before credits are spent and show both values in a permanent diagnostic message.
- Resolve the card only after that check. A request from `/admin/visual-index` must resolve to Card #025 or stop without calling the model.
- Ensure audit requests cannot exit through the free navigation-answer path before an audit receipt is created.
- Keep clean-room model history: only the current Founder message plus the server-resolved Card #025 identity reaches the model.

### 4. Prove the raw orchestration before calling the bug fixed
- Add focused tests for:
  - `/admin/visual-index` → Card #025.
  - `/admin/financial-audit` → Card #011.
  - referrer/body mismatch → blocked with zero AI call.
  - an audit navigation-like message cannot bypass audit identity handling.
  - pasted Founder text and Frassy replies remain in the permanent transcript after voice playback ends and after refresh.
- In Preview, open Card #025 through the Teleporter and inspect the actual `/api/chat` exchange.
- Verify the exact model input names Card #025 before cleanup and the raw model response analyzes the Visual Index page.
- Verify there is no transient text box, no Card #011, no `/admin/financial-audit`, and no “Ready for Card #12.”
- Do not mark Production resolved until the same clean-session test passes after publishing.

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