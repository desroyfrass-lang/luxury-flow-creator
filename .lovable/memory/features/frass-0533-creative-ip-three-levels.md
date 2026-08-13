---
name: FRASS-0533 Creative Series & IP + FRASS-0533-A Three Levels of Financial Freedom
description: Series as intellectual property produced by Frassy from a Blueprint (flagship "I Am Not My Hair"), plus Earn → Scale → Legacy in every Business Vault
type: feature
---
**FRASS-0533 — Creative Series & Intellectual Property.**
A series is a media business, not content: recurring characters, back catalog, merch, books, specials, licensing.
The member is always the creator; Frassy is the production partner — brainstorm, scripts, jokes, storytelling,
continuity, production tracking, publishing schedule, titles, descriptions, thumbnails, keywords, monetization.

Weekly question: *"Are we creating this week's episode of &lt;project&gt;?"*
Pipeline: brainstorm → concept → script → scenes → storyboards → animation → upload prep → publish → Shorts → track.

Series live on the **Member Success Blueprint** (`creative_projects` jsonb), never hardcoded into a Daily.
The Daily shows 🎬 **Episode Progress** (section id `episode-progress`) from whatever the Blueprint carries.
Adding/updating one is configuration (🟡), never engineering (🔴).

Flagship: **I Am Not My Hair** — the Founder's animated series (hairdressing, comedy, Caribbean culture, natural
hair, locks, beauty industry, education, storytelling). Humour must come from real salon experience. Characters:
veteran stylist, "just trim the ends" client, apprentice, natural-hair expert, lock specialist, barber next door,
salon owner. Also a Business Vault: **Creative Series & IP Vault** (`creative-series`, showcase FV Studios).

Founder principle: *Every business begins with a story.*

**FRASS-0533-A — Three Levels of Financial Freedom.** Every Vault is three businesses:
1️⃣ **Earn** (active income today) → 2️⃣ **Scale** (knowledge into digital products) → 3️⃣ **Legacy**
(memberships, channels, royalties, affiliate libraries, licensing, IP that earns without daily labour).
Frassy must name the stage a Money Move serves and the next move toward Legacy.
*Frass never stops at helping members earn a living — it helps them build legacies.*

Code: `src/lib/creative/series.ts`, `src/lib/business/three-levels.ts`,
`src/components/workspace/creative-project-progress.tsx`, `creative-series` entry in `vault-family.ts`.
