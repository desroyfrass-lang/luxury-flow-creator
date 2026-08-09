---
name: FRASS-0416 Live Broadcasting Architecture
description: Two live forms — For Us Live (community streaming) vs Frass Radio Live (scheduled broadcasts); LIVE is a platform-wide status
type: feature
---
FRASS-0416 — Live Broadcasting Architecture. Founder Approved.

Two distinct live forms, never merged:
- 🔴 **Go Live (For Us)** — community-driven, instant, social. Creator updates, launches, performances, Foundation events, tutorials, Q&A, milestones. Supports real-time comments, gifts, affiliate/marketplace product links, brand partnerships.
- 📻 **Live on Frass Radio** — curated, scheduled, broadcast-oriented. DJ sets, premieres, podcasts, interviews, Foundation broadcasts, wellness talks, community news, educational programming.

Rules:
- The live entry point is permanent: shows `🔴 Go Live` when nobody is live, `🔴 Live Now (X)` when broadcasts are active. Present in the site nav and on For Us.
- LIVE is a **platform-wide status**: a broadcasting creator shows a subtle 🔴 LIVE badge anywhere they appear (profiles, posts, search, Marketplace, Brand Partnerships, The Daily), one click from the stream.
- Live Directory lives at `/live`; go-live flow at `/live/go`; broadcast room at `/live/$broadcastId`.
- Frassy always asks "What are you going live for today?" first and prepares tools per purpose (registry in `src/lib/live.ts`).
- Gifting settles through the existing Frass Wallet / gifting revenue rules — no parallel money path.
- Every finished broadcast is archived and repurposable in FV Studios: podcast, clips, YouTube, course, For Us story, Frass Radio replay.

Constitutional principle: Every creator should be able to share their story live. Every broadcast should have the opportunity to become lasting content. Frass transforms moments into long-term value.

Data: `live_broadcasts`, `live_comments`, `live_gifts` (realtime enabled). Hooks in `src/hooks/use-live.ts`, UI in `src/components/live/live-status.tsx`.
