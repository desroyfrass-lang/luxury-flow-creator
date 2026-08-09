---
name: FRASS-0411 / FRASS-0412 — Creation Business & Launch Voice Feedback
description: Every Creation Has a Business principle, plus the temporary Launch Voice Feedback Program (voice + screenshots, Frassy triage, Founder center)
type: feature
---

## FRASS-0411 — Every Creation Has a Business

Constitutional principle: nothing made inside Frass is "just a file". Every finished
creation is an asset that can earn, teach, promote, or fund something.

- Registry: `src/lib/creation-opportunities.ts` — real pathways only (Frass Radio,
  Brand Partnerships, Marketplace, Merch Studio, Academy, For Us, Vault,
  FV Studios, Foundation). Never invent destinations.
- UI: `src/components/creation/opportunity-panel.tsx`, mounted in FV Studios.
- Every pathway must carry both the expert framing AND a "What this means in
  plain English" line, plus how it pays.

## FRASS-0412 — Frass Launch Voice Feedback Program (TEMPORARY)

Anyone signed in can record or upload a voice note for any reason, plus
screenshots and screen recordings. Frassy transcribes (openai/gpt-4o-transcribe),
summarises and tags themes; the Founder reviews in the Launch Feedback Center.

- Program is temporary and gated by `launch_program_settings.enabled`
  (`id = 'voice_feedback'`). Founder can close it at any time from
  `/admin/launch-feedback`. When closed, every entry point disappears.
- Self-contained by design: `src/lib/launch-feedback.ts`,
  `src/lib/launch-feedback.functions.ts`,
  `src/components/feedback/voice-feedback.tsx`, `/admin/launch-feedback`.
  Deleting these plus four mount points retires the program without touching
  Frassy chat, the Composer, uploads or Studio.
- Entry points: The Daily, Frassy chat, FV Studios, workspace sidebar.
- Storage: private `launch-feedback` bucket, files under `<user_id>/…`.
- Consent copy shows before the mic ever opens; participation is voluntary and
  nothing is published without explicit permission.
