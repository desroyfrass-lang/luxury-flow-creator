# Refactor Collection Tree

Restructure routes, nav, and Shopify collection map to match your final tree. Sub-items under each drip category (Dress Shirts, Bikini Tops, etc.) become their own product-grid pages driven by tag queries.

## URL structure

**Frass Kicks** (remove Crown/Side Kicks middle layer)
```
/frass-kicks                          → Men / Women cards
/frass-kicks/men                      → Street / Classic / Casual cards
/frass-kicks/men/street|classic|casual → product grid
/frass-kicks/women                    → same as men
/frass-kicks/women/street|classic|casual → product grid
```

**Frass Drip** (8 sub-collections per gender)
```
/frass-drip                           → Men / Women cards
/frass-drip/men                       → 8 category cards (Work, Party, Casual, Street, Vacay, Sport, Crown, Extra)
/frass-drip/men/work                  → sub-item cards (Dress Shirts, Polo Shirts, ...)
/frass-drip/men/work/dress-shirts     → product grid
   (same shape for party, casual, street, vacay, sport, crown, extra)
/frass-drip/women/...                 → mirror
```

**Bare Drip**
```
/bare-drip                            → Men / Women cards
/bare-drip/men                        → Swimwear / Underwear cards
/bare-drip/men/swimwear               → sub-item cards (Swim Shorts, Trunks, ...)
/bare-drip/men/swimwear/swim-shorts   → product grid
/bare-drip/men/underwear/...          → same shape
/bare-drip/women/swimwear/...         → same
/bare-drip/women/lingerie/...         → same
```

## What changes

1. **`src/lib/shopify.ts`** — rewrite `COLLECTION_MAP` + `getCollectionMeta` with the full tree above. Each sub-item maps to a Shopify tag query like `vendor:"FRASS KICKS" tag:"Men's" product_type:"Street Kicks"` for kicks, `tag:"frass-drip" tag:"men" tag:"work" tag:"dress-shirts"` for drip, etc. Also export a `CATEGORY_TREE` constant so pages can render their child cards from one source.

2. **Route files — delete**
   - `frass-kicks.crown-kicks.*` (5 files)
   - `frass-kicks.side-kicks.*` (5 files)

3. **Route files — replace / add**
   - `frass-kicks.men.tsx` → landing showing Street/Classic/Casual cards
   - `frass-kicks.women.tsx` → same
   - `frass-kicks.men.$sub.tsx` + `frass-kicks.women.$sub.tsx` → product grid
   - `frass-drip.men.index.tsx` → 8 category cards
   - `frass-drip.men.$category.tsx` → sub-item cards for that category
   - `frass-drip.men.$category.$sub.tsx` → product grid
   - Same 3 for women
   - `bare-drip.men.index.tsx` → Swimwear/Underwear cards
   - `bare-drip.men.$category.tsx` → sub-item cards
   - `bare-drip.men.$category.$sub.tsx` → product grid
   - Same for women (Swimwear/Lingerie)

4. **`src/components/site-shell.tsx`** — update mega-menu nav to match new tree (remove Crown/Side Kicks; add all 8 drip categories per gender; simplify Bare Drip menu).

## Rules I'll follow

- Every route file gets its own `head()` with unique title + description.
- Sub-item pages that return empty from Shopify show "No products found" (per Shopify policy) — no mock products.
- Tag conventions I'll use in queries so you know how to tag products in Shopify:
  - Kicks: `vendor:"FRASS KICKS"`, `tag:"Men's"|"Women's"`, `product_type:"Street Kicks"|"Classic Kicks"|"Casual Kicks"`
  - Drip: `tag:"frass-drip"`, `tag:"men"|"women"`, `tag:"<category>"` (e.g. `work`, `party`), `tag:"<sub>"` (e.g. `dress-shirts`, `polo-shirts`)
  - Bare: `tag:"bare-drip"`, `tag:"men"|"women"`, `tag:"<category>"` (`swimwear`, `underwear`, `lingerie`), `tag:"<sub>"`

## Two quick confirmations before I ship

- **Bikini Tops & Bottoms** — you marked it legacy. I'll drop it from the tree. OK?
- **Crown Drip / Extra Drip sub-items** ("Street / Classic / Casual / On Sale") — same names as kicks sub-types. Should these link to the same product grids as `/frass-kicks/men/street` etc., or are they separate apparel collections tagged differently?

Total: ~40 file writes + 10 deletes + 2 rewrites. One pass once you confirm the two above.
