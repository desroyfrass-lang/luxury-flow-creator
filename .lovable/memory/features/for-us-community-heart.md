---
name: For Us — Community Heart (FRASS-0920 / 0921)
description: For Us is the Community Hall in Town Square, not a feed — finite sections, context-aware ordering, breadcrumb return, permanent nav item
type: feature
---
FRASS-0920 / FRASS-0921 — For Us.

Constitutional principle: People before products. Stories before shopping. Community before algorithms.

- Lives at `/for-us`, framed as the Community Hall inside Frass Town Square (Town Square venue links here).
- Nine finite sections: Today in Frass, Good News From Around the Hill, Walk With Power, Creator Spotlight, Style & Inspiration, Music & Podcasts, Learn Together, Around the Hill, Community Celebrations.
- NO endless scroll. Ends with "You've caught up with today's community highlights" plus five onward actions.
- Frassy appears as Community Steward, never an algorithm.
- FRASS-0921: permanent nav item labelled exactly "For Us" — never renamed, hidden or relocated. Present in the site header, mobile bar, main menu and the workspace sidebar via `ForUsLink`.
- `ForUsLink` always passes `?from=<current path>`; the page shows a breadcrumb `<Origin> → For Us` and Back returns exactly there.
- Context awareness: arriving from Studio/Builders/Farm/Luxury/Kids/Workspace reorders sections and stories by tag priority — same page, intelligent ordering.
- Content registry lives in `src/lib/for-us.ts`.
