---
name: FRASS Kids Shop
description: Children's flagship retail experience — 8 age/gender stores, mirrored collection architecture (Work Drip → School Drip), Foundation invite and checkout giving
type: feature
---

# FRASS Kids Shop (retail phase)

Journey: Home (Frass District) → Frass Kids → age+gender store → collection showroom → product grid → PDP → checkout.

- Single first selection combines age and gender: 0–3, 3–6, 6–12, 12+ × Boys/Girls (8 cards) at `/frass-kids`.
- Every age group carries the SAME collection architecture as the adult district. Only Work Drip changes → **School Drip**. Collections: Frass Kicks, School, Casual, Street, Party, Vacay, Sports, Denim, Seasonal (`src/lib/frass-kids.ts`).
- Routes: `/frass-kids`, `/frass-kids/$segment`, `/frass-kids/$segment/$collection`; legacy `/frass-kids/boys|girls` redirect to the entrance.
- Shopify handles: `kids-{age}-{gender}-{collection}[-{sub}]`, resolved in `src/lib/shopify.ts` to `tag:"frass-kids" tag:"{gender}" tag:"age-{age}" tag:"{collection}"`.
- Atmosphere: elegant Caribbean daylight, playful but never cartoonish; authentic candid children's photography, diverse representation.
- Foundation: `src/components/foundation-invite.tsx` shows once per session after ~12 minutes browsing Kids; "Maybe Later" always available, never guilt-based.
- Checkout giving is optional: cause = children's initiatives when shopping Kids, otherwise Frass Hill community.
- Activities experience is a separate future phase.
