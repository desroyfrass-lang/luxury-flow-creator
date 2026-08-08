---
name: The Frass Daily & One-Workspace architecture
description: One Daily across the ecosystem (once per calendar day, role-adaptive, 11 sections); Founder Control Room is Mission Control launch pad; /room = "My Workspace" with modes, not separate workspaces
type: feature
---
## Architecture (locked)

Founder Control Room (/founder) → Launch Workspace → My Workspace (/room) → Current Mode.

- **Founder Control Room stays.** It is Mission Control / executive command center and the entry point into My Workspace. Never redirect or delete it — make it smaller, not gone.
- **My Workspace (/room) is the single canonical workspace** for every member. Never build Partner Workspace, Artist Workspace, or Member Workspace. One person can be Builder + Partner + Farmer + Artist + Seller at once.
- **Modes change the tools, never the place**: Projects, Fashion Studio, Music Studio, Marketplace, Farm Hub, Foundation, Finance, Academy. Defined in `src/lib/workspace/workspace-config.ts` (`WORKSPACE_MODES`).
- **Continuity:** the workspace reopens on the last mode + project (localStorage `frass.workspace.mode` / `frass.workspace.project`). Switching modes never reloads.
- **One chat, one composer, one upload manager** — the workspace composer + UploadTray. Do not add a second upload page or composer.
- Naming: "My Workspace", not "Workspace Room".

## The Frass Daily

One Daily across the entire ecosystem (Founder Control Room, My Workspace, Frass Hill, FrassKicks, Marketplace, Academy, Music Studio, Farm Hub). Content adapts to roles/permissions/projects; framework never changes.

- Opens **once per calendar day** per Builder; reopenable anytime (`openTheDaily()` / `frass:open-daily` event, header + sidebar button).
- Opening experience: fade in, Frassy large, welcomes by name, shrinks to assistant position, workspace fades in behind.
- Answers five questions before work: what happened, what needs me, what can Frassy handle, what opportunities, how close to goals.
- Sections in order: 1 Celebrate first · 2 Daily briefing · 3 Today's priorities (Critical/Important/Optional/Completed) · 4 Estimated workload (live) · 5 Delegate to Frassy ("I'll do it" / "Frassy handles it") · 6 Pending approvals · 7 Opportunities · 8 Goals & Vision Maps · 9 Daily performance · 10 Recent activity · 11 Continue working.
- Founder adds executive panels: Launch Readiness, Marketplace Health, Foundation, Revenue Snapshot, Vendor Pipeline, Affiliate Overview, Community Health, Critical Decisions.
- Evening (after 17:00): optional reflection, never mandatory.
- Design: bright, warm, elegant cards, large readable text, minimal scrolling. Must make users feel prepared, not overwhelmed.

Files: `src/lib/workspace/daily.ts`, `src/components/workspace/frass-daily.tsx`, `src/components/workspace/daily-gate.tsx` (mounted in `__root.tsx`).
