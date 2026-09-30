# Welcome Hall / Frassy Welcome — Audit Report and Recovery Order

Read-only audit. Nothing changed. Files/data changed: NONE. Revision: 92aba0407583672840bba148db9eafd58a31de83. Publish/Deploy: NO.
Evidence labels: [CODE] = read in the code this turn; [BROWSER] = seen in earlier browser checks as Founder; [UNPROVEN] = not seen in a browser.

## 1) Entry path

Routes that act as the way into Frass Hill:
- `/` front door, "Enter Frass Hill" button [CODE]: signed out → `/join/frass-hill`. Signed in → asks the server "returning?" → not returning → `/welcome-hall?arrival=first`; returning and already welcomed today → `/daily`; returning, not yet welcomed → `/welcome-hall?welcome=daily`. If the check fails it sends the member to first arrival (fails safe, never assumes Founder).
- `/welcome-hall` has three modes [CODE]: `?welcome=daily` shows only the daily greeting; `?arrival=first` shows only the first-arrival ceremony (arch cinematic, then personal welcome); no flag shows the old informational Hall (gate picture, brochure sections).
- `/frass-hill` town page [CODE]: wrapped in the daily greeting gate — a signed-in member not yet welcomed today is sent to `/welcome-hall?welcome=daily&next=/frass-hill` before the town appears.
- Redirects: `/welcome` → first-arrival mode; `/gateway` → `/welcome-hall`; `/frass-world` → `/frass-hill`.
- `/arrival` (cinematic "Act II") [CODE]: still a full separate page. No member navigation links to it; reachable only by typing it or through the Founder teleporter. Orphaned but protected.
- `/frass-hill-journey` (Walk page) [CODE]: separate page, links to the town.

What normal navigation leads to [CODE]: site top bar links "Frass Hill" → `/frass-hill` and a "Welcome Hall" link → `/welcome-hall` (the old brochure mode). Kids Valley, Town Square list and the Tester bar also link to plain `/welcome-hall`. The join-shop page sends to first arrival with next = Frass District.

First-time vs returning [CODE]: "returning" = journey finished, or (first-arrival note exists AND server-confirmed Founder/Admin). Everyone else sees first arrival → interview → Daily.

## 2) Frassy layers during entry

| Layer | Trigger | Saved marker | Order |
|---|---|---|---|
| Arch cinematic (captions, 4 lines) | first-arrival mode, genuine first arrival only | none of its own | 1st for new members |
| Personal welcome | first-arrival mode, after cinematic | server first-arrival date written | 2nd |
| Interview (onboarding) | after personal welcome | server journey rows | 3rd |
| Daily greeting | returning member, not welcomed today (front door or town gate) | browser "welcomed today" note, saved only on Start my day | 1st for returning |
| Voice-choice window | any page Frassy is allowed on, until a voice choice is made; waits while the entrance is playing | browser voice choice; "later" lasts this tab only | appears on top of whatever is showing |
| Into Daily | Start my day / end of interview | — | last |
| Into town | Explore Frass Hill, via greeting gate first | same "welcomed today" note | after greeting |

Overlaps [CODE + BROWSER]:
- The voice-choice window sits on top (layer 70) and needs a choice. Welcome Hall, Daily and onboarding are all counted as "Frassy pages", so it can cover the daily greeting, the personal welcome or the town until answered. It only holds back while the entrance "is playing" signal is on — the daily greeting does not appear to raise that signal. [BROWSER: seen covering Daily and the Tester panel earlier.]
- Clicking "Explore Frass Hill" as a returning member first meets the daily greeting, not the town — so the town can feel blocked. [BROWSER: seen in last check.]

## 3) Current behaviour vs recorded intent

Recorded decisions found (memory FRASS-0569, 0923/0924, 0475, and earlier approvals in this chat):
- Welcome Hall is the front entrance; the member may skip it, the platform may never bypass it; Daily follows it. — Mostly met.
- Frassy must actually speak; silence never allowed. — Code tries to speak with a fallback; spoken audio in the Hall is [UNPROVEN].
- Four greeting styles (Quick, Motivational, Conversation, Celebration). — Picker exists; its link goes to the brochure Hall, not the greeting (known wrong link).
- "Every first arrival is a journey" (FRASS-0924). — Now transferred into first arrival; not written down in permanent memory yet.
- FRASS-0923 memory says Enter Frass Hill → `/arrival`. — Out of date.

Conflicts:
1. Voice-choice window can appear over the greeting/first arrival/town and block them (not in any recorded decision).
2. Deliberate Explore of the town is interrupted by the daily greeting; recorded decision said deliberate exploring should not be mixed up with the front door.
3. Plain `/welcome-hall` (brochure) is what the top bar, Kids Valley, Town Square and Tester bar open — members reach the old Hall, not the current welcome.
4. Two cinematic versions exist (`/arrival` and the transferred one).

## 4) Frassy presence

- Daily greeting shows Frassy's picture, lines and a "Hear Frassy" button [CODE]; greeting shown alone [BROWSER]. Her voice actually playing: [UNPROVEN].
- First-arrival cinematic shows captions and text lines only, no voice by design [CODE]; never seen in a browser for a new member [UNPROVEN].
- Brochure Hall: a picture of the gates; no visible Frassy greeting as the main moment [CODE].

## 5) Routing / duplication causing the disconnected feel

- One address, three different experiences (`/welcome-hall`), picked by a hidden flag.
- Two greeting gates: the front-door check and the town-page gate.
- Old gate component `WelcomeGate` (only on the old room page) and old `/room-classic` workspace still exist.
- `/arrival` and the Walk page are separate journeys outside the canonical path.

## 6) Classification

- KEEP: front door `/`; `/welcome-hall` daily mode and first-arrival mode; DailyWelcomeCeremony; FirstArrivalCeremony + arrival-cinematic; daily-welcome note; continuation helper; interview; redirects `/welcome`, `/gateway`, `/room`; Frass Gateway Arch photo.
- AMEND: voice-choice gate (wait during the greeting and first arrival, never cover the town); town-page greeting gate (decision needed: keep or let deliberate Explore through); top-bar/Kids/Town Square/Tester "Welcome Hall" links; greeting-style picker link; FRASS-0923 memory (needs approval).
- CONSOLIDATE: brochure Hall content — keep as informational page for signed-out/first-time visitors only, reached deliberately.
- RETIRE (only after the protected transfer is verified): `/arrival`; `WelcomeGate`; `/room-classic`; unused `daily-welcome-gate` behaviour if Explore is freed.

## Proposed recovery order (Welcome Hall only, not implemented)

1. Founder decisions: (a) should Explore Frass Hill skip the daily greeting? (b) should the voice choice be asked inside the greeting instead of a pop-up?
2. Stop the voice-choice window from covering the greeting, first arrival and town.
3. Point the top-bar, Kids, Town Square, Tester and greeting-style links to the right place.
4. Apply decision (a) to the town-page gate.
5. Browser-verify Frassy's voice in the greeting and the new-member path (needs approval card).
6. Update FRASS-0923/0924 memory (with approval).
7. Then the protected `/arrival` retirement batches from the earlier audit.

Implementation ⏳ none (audit) / Type Check ✅ earlier / Build ✅ earlier / Preview ✅ / Production ⏳ unpublished / Constitution Updated ❌ / Project Memory Updated ❌ / Requires Founder Testing ⚠️
