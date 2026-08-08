---
name: FRASS-0400 Frassy Workspace Composer
description: Universal AI workstation composer — persistent, multimodal, Upload Manager with queue/pause/resume/retry/indexing; one composer for every role
type: feature
---
FRASS-0400 — Frassy Workspace Composer (Constitutional Platform Component).

Never call it a chat box. It is the primary workstation of every Frass workspace:
where Builders talk, upload, create, organize, learn, and operate.

Implementation:
- `src/components/workspace/frassy-composer.tsx` — the single composer. Text, voice,
  captures, files, folders (webkitdirectory), clipboard paste, drag & drop, bulk drops.
  Tools array is permission-driven; interface stays identical across roles.
- `src/lib/workspace/upload-queue.ts` — enterprise intake queue: chunked resumable reads,
  concurrency, progress, ETA, pause/resume/retry/cancel, storage used, Frassy indexing stage.
- `src/components/workspace/upload-manager.tsx` — always-visible Upload Manager.
- Wired into `workspace-room.tsx` (My Workspace). `upload-tray.tsx` was consolidated away.

Rules: one composer, one upload experience. Never build a second upload surface —
extend the queue instead. Composer stays permanently visible in workspaces.
