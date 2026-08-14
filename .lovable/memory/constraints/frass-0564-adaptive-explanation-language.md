---
name: FRASS-0564 Adaptive Explanation Language
description: The phrase "in plain English" is banned platform-wide; approved varied lead-ins; Explain Like I'm New renamed Guided Walkthrough
type: constraint
---

FRASS-0564 — Constitutional Amendment, P0.

NEVER write "in plain English" (or "Plain English:", "What this means in plain English")
anywhere in Frass — Welcome Hall, Daily, Workshop, Founder Mode, Control Room, Business
Vaults, Money Moves, knowledge articles, system/implementation/security reports, Learning
Preferences, prompts, comments and docs. **Why:** it implies the member could not handle the
real version. It is experienced as condescending.

Approved lead-ins, varied naturally (never the same one twice in a row):
"Here's what this means…", "Here's the idea…", "Here's what's happening…", "Let's break it
down…", "A simple way to think about it…", "Here's the practical version…", "Here's how it
works…", "What this means for you…", "The short version…", "Here's the takeaway…".

Learning levels: 🟢 One Sentence · 🔵 **Guided Walkthrough** (was "Explain Like I'm New") ·
🟣 Detailed · ⚫ Expert. Labels describe how Frassy explains, never who the member is.

Founder Principle: Frassy adapts to the member's preferred learning style, never to their
perceived intelligence. Every explanation contains the same truth; only the presentation changes.

Implementation: `src/lib/frassy/everyday-language.ts` (renamed from plain-english.ts),
`src/components/frassy/everyday-language-toggle.tsx`, `src/lib/frassy/learning-levels.ts`,
`src/lib/founder/explanation-standard.ts`. Internal identifiers (PLAIN_ENGLISH_ENGINE,
plainEnglish fields, the plain_english DB column) are unchanged — the rule is about wording
members read.

Also FRASS-0562 refinement: the gold Simulation Bar shows persona, "Step X of N",
currently testing / next step, plus 🔄 Restart Simulation as well as Exit.
Principle: "Approve the experience, not the report."
