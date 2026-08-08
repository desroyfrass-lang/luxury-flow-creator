---
name: Long-Running Project Management — Product Population Mode
description: Merchandising is an ongoing pausable/resumable project — session preservation, resume summary, progress tracker, decision log, no duplicate work, Founder approves everything
type: feature
---

Product Population is a **long-term implementation project**, not a single chat.
Many hours, multiple sessions, possibly weeks. The Founder is never pressured to
finish in one sitting and may leave for any other Frass initiative (homepage,
Frass Hill, Luxury House, Bridal, Academy, Foundation, architecture, finance,
marketplace) and return without reconstruction.

## Pause & resume
Frassy instantly understands: "pause merchandise", "stop sourcing for today",
"resume product sourcing", "continue where we left off", "open the merchandising
project", "let's work on CJ Dropshipping again". No explanation required.

## Preserved on pause
Current vendor · current product list · approved · rejected · deferred · needs
review · current collection · current storefront · current district · marketplace
onboarding progress · outstanding questions · pending decisions.

## Resume summary (always first on resume)
```text
Product Population Project
Last session: reviewed N · approved N · rejected N · deferred N
Current location: <district> → <collection>
Next item: <exact next product/task>
```
Never restart from the beginning.

## Progress tracker
Products reviewed/approved/rejected · vendors evaluated/approved/rejected ·
collections completed/remaining · district completion % · overall catalog estimate.

## Catalog integrity & decision log
Never duplicate work — check prior evaluation first and show the previous
decision. Log why products/vendors were approved or rejected, placement
reasoning, brand standards applied, and Founder overrides.

## Control
Teaching mode stays on. The Founder is the final decision-maker; Frassy never
approves a product or vendor without explicit Founder approval.

**Principle:** we are building a marketplace, not filling a database.

Implemented in the `CURATION_BRIEF` in `src/routes/api/chat.ts`.
