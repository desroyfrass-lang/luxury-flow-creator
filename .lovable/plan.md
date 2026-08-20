# Frassy's words must never disappear from /onboarding

## What is actually happening

Confirmed by reading the code, not guessed:

1. In `src/routes/_authenticated/onboarding.tsx`, every reply is shown from a temporary list (`local`), then after reloading from the database the page runs `setLocal([])`. The words on screen are thrown away on the assumption the database copy took their place.
2. The list that gets displayed filters saved messages by "track" (`owner` vs `builder`) and drops anything that looks like a Teleporter audit turn. If the greeting was saved under a different track than the page is currently showing — which happens while the Founder is being switched onto the owner track — the saved copy is filtered out.
3. In `src/lib/journey.functions.ts`, `journeyOpening` inserts the greeting without checking whether the insert succeeded. A blocked or failed insert is silent.

Result: the reply appears (temporary copy), then is deleted (temporary copy cleared) while its permanent copy is either filtered out or was never written. That is the "pops up and then disappears" behaviour, and it is why the text can't be copied.

## The fix

### 1. Never delete a message that has not been proven saved
- Remove the blind `setLocal([])`.
- After the database reload, drop a temporary message only when the exact same text is present in the reloaded, *displayed* list. Anything unmatched stays on screen permanently.

### 2. One append-only conversation record on the page
- Keep a local append-only mirror of the whole conversation (per user, in browser storage), written the moment any Founder message is sent and the moment any Frassy reply arrives — including spoken greetings.
- The page renders the union of saved-in-database and mirrored messages, de-duplicated by text. Nothing on screen is ever removed by a reload, a track switch, a refetch, voice playback, or a navigation back to the page.
- Refresh restores the full thread from the mirror even if the server copy is missing.

### 3. Stop the filters from hiding real conversation
- The track filter no longer hides messages: everything belonging to this member's journey is shown. A track change reorders/labels, never deletes.
- The Teleporter-audit filter stays, but only for turns carrying the audit header — it can no longer swallow ordinary replies.

### 4. Make saving honest
- `journeyOpening` and the turn handler check the insert result. A failed save is surfaced in the page as a small "saved locally only" note on that message instead of failing silently.

### 5. Copyable by design
- Each message gets a copy button, plus one "Copy whole conversation" action at the top of the thread, so any transcript can be pasted elsewhere.

### 6. Verification before this is called done
- Load `/onboarding`, let Frassy greet, wait for playback to finish: the greeting text is still on screen.
- Refresh: the full thread is still there.
- Send a message, let her reply, refresh: both are still there.
- Force a track switch: nothing already shown disappears.

## Plain English
Right now the page shows Frassy's words on a sticky note, then throws the sticky note away as soon as it assumes the filing cabinet has a copy. Sometimes the filing cabinet doesn't. The fix is to never throw the sticky note away until we've actually seen the filed copy, and to keep our own permanent notebook of the conversation on your device as well. Plus copy buttons so you can paste any of it straight into another tool.

## About the credits
I can't issue refunds or adjust billing from here — that's handled by Lovable billing support, and this repeated-failure history is a reasonable basis for a review request. I can only make sure the defect stops recurring.

## Scope
Only the `/onboarding` conversation, its message persistence and its copy controls. No store, district, Teleporter or security behaviour changes.

---
**Implementation** ⏳
**Type Check** ⏳
**Build** ⏳
**Preview** ⏳
**Production** ⏳
**Constitution Updated** ⏳
**Project Memory Updated** ⏳
**Requires Founder Testing** ⏳

Root Cause: The page clears the on-screen copy of each reply after a reload, while filters and unverified saves can leave the reloaded copy missing.
Status: Awaiting Founder approval before implementation.
