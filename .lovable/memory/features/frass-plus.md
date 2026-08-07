---
name: Frass Plus flagship boutique
description: Plus Size is now "Frass Plus" — a flagship Frass District destination with wings, departments and signature confidence collections
type: feature
---
# Frass Plus

Extended sizing is a **flagship destination**, never a subsection. Name locked:
**Frass Plus** ("Style has no size. Confidence has no limits.").

Routes:
- `/frass-plus` — boutique landing (editorial hero, browse rails, two wings,
  signature collections)
- `/frass-plus/men` · `/frass-plus/women` — Gentlemen's / Ladies' Collection
  department floors using `StorePortalCard`
- `/frass-plus/$gender/$category` — themed showrooms (`ShowroomScene` +
  `ShowroomRack`) leading to `/collection/$handle`

Legacy `/plus-size/*` redirects to the matching Frass Plus wing.

Rules:
- Navigate by collection, occasion and lifestyle — **never** by size. Size is a
  product attribute only.
- Magazine-quality editorial photography with confident, diverse models; no
  clinical "big & tall" catalogue styling.
- Signature collections: Everyday / Executive / Evening / Island / Street /
  Active Confidence + Celebration Collection.
- Structure lives in `src/lib/frass-plus.ts`; collection handles are
  `{mens|womens}-plus-{department}-{sub}` and `frass-plus-{signature}`,
  resolved in `getCollectionMeta` in `src/lib/shopify.ts`.
