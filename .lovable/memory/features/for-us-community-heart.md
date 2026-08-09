---
name: For Us — Community Heart (FRASS-0920 / 0921)
description: For Us is the Community Hall in Town Square, not a feed — finite sections, context-aware ordering, breadcrumb return, permanent nav item
type: feature
---
FRASS-0920 / FRASS-0921 — For Us.

Constitutional principle: People before products. Stories before shopping. Community before algorithms.

- Lives at `/for-us`, framed as the Community Hall inside Frass Town Square (Town Square venue links here).
- Nine finite sections: Today in Frass, Good News From Around the Hill, Walk With Power, Creator Spotlight, Style & Inspiration, Music & Podcasts, Learn Together, Around the Hill, Community Celebrations.
- FRASS-0415: "For Us is not designed for scrolling" is RETIRED. New principle: **For Us is designed for discovery** — one continuous feed (`buildDiscoveryFeed`), no artificial cap, scenic rests (`SCENIC_MOMENTS`) between groups of six posts.
- Visual identity is bright Caribbean daylight, not black: `.for-us-tropical` scope in src/styles.css re-skins the semantic tokens (white/sand/palm/ocean/gold).
- Weather Principle: `resolveForUsWeather()` shifts the page wash and greeting by morning / afternoon / sunset / evening.
- Frassy appears as Community Steward, never an algorithm.
- FRASS-0921: permanent nav item labelled exactly "For Us" — never renamed, hidden or relocated. Present in the site header, mobile bar, main menu and the workspace sidebar via `ForUsLink`.
- `ForUsLink` always passes `?from=<current path>`; the page shows a breadcrumb `<Origin> → For Us` and Back returns exactly there.
- Context awareness: arriving from Studio/Builders/Farm/Luxury/Kids/Workspace reorders sections and stories by tag priority — same page, intelligent ordering.
- Content registry lives in `src/lib/for-us.ts`.
