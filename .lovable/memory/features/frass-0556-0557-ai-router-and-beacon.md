---
name: FRASS-0556 AI Intelligence Router + FRASS-0557 Persistent Frassy Companion
description: Frassy routes every request to the cheapest capable brain (or none at all), and lives as one context-aware beacon on every page
type: feature
---

# FRASS-0556 — AI Intelligence Router (One Frassy. Many Brains.)

Constitutional: Frassy is never permanently tied to one AI provider.

Routing order (implemented in `src/lib/ai/intelligence-router.ts`, wired in `src/routes/api/chat.ts`):
0. **Rule first / no AI** — if Frass can answer from its own rules, data or route
   registry (navigation like "open my Tradesperson Vault"), answer free. Nothing billed.
1. Understand the request: complexity, memory, vision, reasoning, voice.
2. Choose the brain: simple → cheapest capable; conversation → fast; blueprint →
   memory-aware; vision → vision model; strategy → high-reasoning.
3. Founder cost protection — cheapest option that still delivers the experience;
   under budget pressure, reasoning drops a tier rather than dropping the member.
4. Provider independence — every task carries a fallback chain; a provider outage
   silently routes to the next brain. Adding/removing a provider = edit the table only.
5. Founder AI Intelligence Dashboard section lives in the AI Operations panel.
6. Learning: prefer the lower-cost provider when quality is comparable.
7. Sustainability review for every new AI feature: what does it cost, who pays,
   can it scale, is there a cheaper provider, can it be done without AI?

Members never choose a model. The Founder rarely thinks about providers.

# FRASS-0557 — Persistent Frassy Companion

- One Universal Frassy Beacon on every page, four states: idle (Frass logo),
  listening (microphone), thinking (pulse), speaking (logo + waveform).
- One tap = conversation starts. No hunting for a tiny mic inside the chat.
- The beacon never touches screen edges, chat borders, buttons or navigation.
- Context aware: the beacon's invitation matches the page (Daily, Workshop,
  Money Moves, Marketplace, Founder Mode). Never shopping prompts inside the Daily.
- Every Frassy conversation surface has Expand / Restore.
- Navigation chip: compact, upper-left, Back · Home · 📍 current page. Never centred.
- The beacon is the primary interaction point; the chat window is secondary.
