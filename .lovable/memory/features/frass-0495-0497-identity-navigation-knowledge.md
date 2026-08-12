---
name: FRASS-0495/0496/0497 Creative identity, one-world navigation, Frassy knowledge
description: Visual Creator vs Music Creator classification, continuous navigation rules, and Frassy learning departments as layers not new AIs
type: feature
---

# FRASS-0495 — Creative Identity Classification (One word. One meaning.)

- Generic "Artist" is never a primary classification when a specific discipline exists.
- **🎨 Visual Creator** → Frass Gallery. Painters, illustrators, sketch artists, digital artists, sculptors, fine artists, photographers, NFT artists, mixed-media. Money Moves: gallery, originals, prints, licensing, exhibitions, NFTs.
- **🎵 Music Creator** → FV Studios. Singers, songwriters, producers, DJs, bands, instrumentalists, composers, vocalists, recording artists. Money Moves: recording, publishing, distribution, live performance, merch, royalties.
- Pathways stay completely separate.
- Frassy NEVER assumes: "I'm an artist" → "Wonderful. What kind of creative work do you do? Visual art, music, or another creative field?"
- Existing "Artist" values migrate only when safely determinable; otherwise keep until the member updates. Never guess.
- Search for "artist" returns both classes, each labelled by its own craft.
- Same treatment for other overloaded labels: Coach (business/fitness/life/career), Writer (author/copywriter/screenwriter/blogger), Designer (graphic/fashion/interior/UX). One profession = one clear business path.
- Note: "Artist statement" stays as-is (real art-world term); it is not a classification.

Implementation: `src/lib/identity/creative-classification.ts` (`classifyCreative`, `safeMigration`, `expandCreativeSearch`, `clarifyOverloaded`), gallery copy updated, injected into Frassy's prompt.

# FRASS-0496 — One World Navigation

- Every destination is another room in the same building; never a different app.
- Members always know: where they are, where they came from, where they can go next, how to return.
- Permanent: Daily opens above the Workspace; closing the Daily reveals the Workspace; opening the Workspace restores the working environment. Companion experiences.
- Frassy never restarts or forgets across rooms.
- Shared design language, typography, motion, navigation behaviour, accessibility.
- Context preserved: unsaved work protected, conversations continue, progress visible, no punishment for exploring.
- **Design question for every future feature:** "If a member closed their eyes for one second and reopened them in this room, would they immediately know they're still inside Frass?"
- Do not redesign navigation or add duplicate menus — extend the existing architecture.

Implementation: `src/lib/navigation/one-world.ts` (`CLOSED_EYES_TEST`, `oneWorldReview`).

# FRASS-0497 — Frassy Knowledge Architecture

- One Frassy, one personality, one memory, one voice, one conversation. Unlimited knowledge, departments and industries.
- New departments are **knowledge layers**, never new assistants/chatbots.
- Context switching: Gallery → visual-creator guide; FV Studios → music-creator guide; Financial Center → financial guide. Member never changes assistants.
- Layers: real estate, healthcare (operations only), legal resources (never invents advice), travel, education, finance, freight brokerage, visual creation, music creation, fitness, wellness, agriculture, construction, hospitality.
- Answer to "which AI am I talking to?": "Same Frassy, every room. I just know more about this one."
- **Permanent development rule:** first question for any new department is "What does Frassy need to learn?" — never "Do we need another AI?"

Implementation: `src/lib/frassy/knowledge-architecture.ts` (`KNOWLEDGE_LAYERS`, `layersForPath`), extends `src/lib/frassy/context.ts` (FRASSY_PLACES) — no fork.

Next phase per Founder: stop global constitutional specs; move to Phase 2 Personalized Daily Intelligence (Kanko first, then family and launch partners).
