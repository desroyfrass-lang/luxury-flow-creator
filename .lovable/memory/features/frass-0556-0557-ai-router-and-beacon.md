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

# FRASS-0558 — One Frassy Experience

One conversation, one interface, one companion. Enforced by `src/lib/frassy/surfaces.ts`,
the single place that decides how Frassy appears on any page:

- **workspace** — the page already hosts a full Frassy conversation (Welcome Hall,
  Daily, Room, Workspace, Founder, Command Center, Builder Hall, Studio, Creation,
  Onboarding). The floating companion is not mounted at all.
- **beacon** — pages with no built-in conversation (marketplace, catalog, knowledge,
  business pages) get the compact beacon.
- **none** — social, play and entertainment surfaces (For Us, For Me, Town Square,
  Kids World, Live, Radio, member profiles) plus auth/checkout/pay. Frassy never
  interrupts; she is summoned deliberately.

Never create another chat surface. Adding a Frassy to a page = adding a prefix here.

Other locked rules:
- Conversation follows the member across pages via the one shared transcript; page
  changes never restart it. Context changes, conversation doesn't.
- Tapping the beacon opens a full conversation workspace, never a cramped box.
  Closing returns to the beacon with nothing lost.
- Universal voice control: one always-green "Talk to Frassy" control in the same
  place, cycling Listening → Thinking → Speaking, with a red **End** that stops
  voice, closes the mic and keeps the conversation saved.
- Navigation chip stays small, upper-left, never overlapping content. Platform rule.
