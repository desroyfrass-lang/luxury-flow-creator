# Frassy's Command Interface — the Autonomous Cortex

Frassy already exists across Frass. This adds her **Command Interface**: one place where a Partner sees what she is doing on their behalf, and five Oracles that are extensions of her, not new characters.

Two deliberate deviations from your brief, both to protect existing law:

1. **Colour.** Teal/emerald would break the Frass look. I will use the existing dark streetwear palette with gold/chrome accents, at the same premium weight you described.
2. **One mind, one chat.** No second chat engine. The Dialogue Panel is the existing Frassy conversation in "Command" mode, so memory, voice and transcript carry over.

## What gets built

**Route:** `/frassy` is upgraded in place (it already exists as a light briefing page). No new district, no duplicate dashboard. `/command` and `/founder` keep redirecting as they do now.

### 1. Command Center (main view)
- Frassy's greeting, written in her voice: what she already did today, before being asked.
- Live metrics row: Partners being served, Tasks Frassy completed today, New revenue generated, Days to Financial Freedom.
- Left 2/3 — **Frassy's Dialogue Panel**: the real Frassy chat, embedded permanently in the page flow (never a floating box that disappears).
- Right 1/3 — **Frassy's Active Mind**: current autonomous tasks with progress, and a first-person System Pulse log ("I closed 3 warm leads for Sarah.").
- Header: "Frassy is watching over [Name]'s freedom journey", a live pulse dot, and the **Autonomous Execution / Pause for Manual Review** switch.

### 2. Oracle workspaces (5)
Growth, Build, Sales, Support, Financial. Each is the same shell: "[Oracle] — powered by Frassy's mind", a task queue (QUEUED / EXECUTING / COMPLETE), animated progress, and a preview of the output. One component, five configurations — never five codebases.

### 3. Financial Freedom Tracker
Freedom Score, monthly passive income vs. freedom number, projected months to free, and one Frassy recommendation to accelerate it. This reads from the existing Financial Center — it does not create a second ledger.

### 4. Autonomy rules (constitutional)
- Nothing executes without the Partner's autonomy switch on; Pause means advise-only.
- Every autonomous action is logged with what it was, why, and what it produced.
- Money Moves keep their layer (Immediate Income / Business Builder / Financial Freedom).
- Never the word "AI" or "system" in Partner-facing copy.

## Technical notes
- New tables: `frassy_oracle_tasks` (oracle, partner, status, progress, output, reasoning) and `frassy_autonomy_settings` (per-partner autonomy mode) with RLS + grants; Partner sees only their own rows.
- Server functions in `src/lib/frassy/oracles.functions.ts`; task execution runs through the existing shared `/api/chat` pipeline in the appropriate mode — no third pipeline is created.
- Reuse: `FrassyChat`, `src/lib/frassy/personality.ts`, `context.ts`, `surfaces.ts`, Financial Center reads, Money Moves.
- Icons from lucide-react; all colour via existing tokens.

## Order of build
1. Command Center shell + header + autonomy switch + embedded Dialogue Panel.
2. Oracle engine (tables, server functions, task lifecycle) + the five Oracle pages.
3. Financial Freedom Tracker.

I will build step 1, present it for your review, and wait for approval before step 2.
