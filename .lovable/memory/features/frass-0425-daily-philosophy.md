---
name: FRASS-0425 Amendment — The Daily Philosophy & seven refinements
description: Constitutional purpose of The Daily plus Morning Briefing, End of Day celebration, time estimates, Focus Mode, consistency record, workspace health, Close My Day
type: feature
---
Constitutional principle:

"The Daily exists so members never wonder what to do next, never lose track of
what they've accomplished, and always finish their workday with clarity,
confidence, and peace of mind."

Seven locked refinements (implemented in `src/lib/workspace/daily-os.ts` +
`src/components/workspace/frass-daily.tsx`):

1. **Morning Briefing** — executive summary before any work: item count, critical
   count, approvals, yesterday's completion, new opportunities, estimated time.
   Ends with "Ready to begin".
2. **End of Day celebration** — after Close My Day: headline, what was
   accomplished (green), what rolls into tomorrow. Never guilt-based.
3. **Estimated time per task** — every numbered step shows minutes beside its lane dot.
4. **Focus Mode (Workday Mode)** — a distraction-free view: current task only,
   Frassy, progress bar, composer. "Finished — next task" advances.
5. **Consistency record** — Today / This Week / This Month completion percentages.
   Professional, never gamified. Stored in `frass.daily.history`.
6. **Workspace health** — every briefing workspace shows 🟢 Excellent /
   🟠 Attention Needed / 🔴 Immediate Attention derived from its lane counts.
7. **Close My Day** — the last button. Sets `frass.daily.closed` for the calendar
   day; reopenable.
