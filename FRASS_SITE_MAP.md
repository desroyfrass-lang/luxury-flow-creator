# FRASSKICKS.COM — MASTER SITE MAP

Everything that exists today, in three worlds: **The Frass District** (shopping),
**Kids World** (children), **Frass Hill** (the builder town). 143 route files total.

---

## PART 1 — THE FRASS DISTRICT (shopping world)

### 1A. Pages

**Hub & redirects**
| URL | What it is | Connects to |
|---|---|---|
| `/frass-district` | Main district street — store directory, "Going Viral" rail, Fitting Room CTA | every sub-store below, `/try-on`, `/sales-clearance`, `/frass-hill` |
| `/shop-frass` | Legacy → redirects to `/frass-district` | — |
| `/kicks-district` | Legacy → redirects to `/shop-frass` → `/frass-district` | — |

**Frass Kicks** — `/frass-kicks` (layout) · index redirects to district · `/frass-kicks/men` · `/frass-kicks/women`

**Frass Drip** — `/frass-drip` → `/frass-drip/men` → `/frass-drip/men/$category`; mirrored for `/women`

**Bare Drip** — `/bare-drip` → `/bare-drip/men|women` → `/bare-drip/men|women/$category`

**Frass Plus+** — `/frass-plus` · `/frass-plus/$gender` · `/frass-plus/$gender/$category` · `/frass-plus/$gender/kicks` · `/frass-plus/$gender/bare` · `/frass-plus/sales` (its own liquidation room)

**Frass Shape** — `/frass-shape` · `/frass-shape/$gender` · `/frass-shape/$gender/$category` · `/frass-shape/$gender/goals/$goal`

**Frass Kids (shop side)** — `/frass-kids` · `/frass-kids/$segment` · `/frass-kids/$segment/$collection` · `/frass-kids/$segment/kicks` · `/frass-kids/boys` and `/girls` redirect to `/frass-kids`

**Frass Luxury House** — `/frass-luxury-house` · `/men` (East Wing) · `/women` (West Wing)

**Afro Designers** — `/afro-designers` · `/designers` · `/designers/$slug` · `/collections/$slug` · `/join` (links into Hill: `/business-vaults`, `/manufacturing`)

**Social Media Virals (TikTok Shop)** — `/social-media-virals` · `/$category` · `/$category/$sub` · `/$category/$sub/$product` → `/product/$handle`

**Capsules & Lookbook** — `/capsules` · `/capsules/$handle` (links `/try-on`, `/product/$handle`) · `/lookbook` · `/lookbook/$story` (links back into capsules)

**Bridal** — `/bridal` · `/journey` · `/vault` · `/collections` · `/sourcing` · `/marketplace` · `/walk`; plus `/bridal-boutique` (own shop header)

**Shared shopping utilities** — `/product/$handle` · `/checkout` · `/visual-search` · `/rewards` · `/try-on` (sign-in required) · `/sales-clearance` (The Liquidation Room)

### 1B. Navigation menus
All District navigation is one component: `src/components/gateway-nav.tsx`, `mode="shop"`.

- **Always-visible pills (`SHOP_PRIMARY`)**: Frass District · Afro Designers · Frass Luxury House · Frass Bridal · Frass Plus+ · Frass Kids
- **Full drawer menu (`SHOP_NAV`)**: Frass District · Frass Kicks (Men / Women / Kicks District) · Frass Drip (Men / Women) · Bare Drip (Men / Women) · Luxury House (East / West Wing) · Bridal (Journey / Vault / Collections / Sourcing / Marketplace) · Afro Designers (Designers / Join) · Frass Plus+ (Men / Women) · Frass Kids (Kids Valley / Parent Dashboard) · Viral · Shopping Extras (Liquidation Room / Capsules / Lookbook / Visual Search / Rewards)
- **Header chrome on every shop page**: world switcher (District ↔ Hill), visual-search icon, region switcher, Builder Vault link, Daily button, account menu, sign-out, cart drawer
- **In-page trail**: `src/components/page-header.tsx` breadcrumbs (Home → District → store → category)
- **Second shell menu**: `src/components/site-shell.tsx` (Gateway, Enter Frass Hill, Lookbook, Music, Blog)

### 1C. Features and where they connect
- **Cart** — `cart-drawer.tsx` + `src/lib/cart-store.ts`, mounted in the global nav → `/checkout` → `/rewards`
- **Fitting Room / Try-On** — `/try-on`, entered from the district home, capsule pages and rewards
- **Frassy concierge** — `frassy-chat.tsx`, reads the cart, can route shoppers anywhere
- **Rewards & discounts** — `/rewards` (sign-in gated), `/sales-clearance`, `/frass-plus/sales`
- **Visual search** — `/visual-search`, reachable from the search icon everywhere
- **Capsules ↔ Lookbook** — cross-linked storytelling, both feed `/product/$handle`

---

## PART 2 — KIDS WORLD

Two connected systems: **Kids World** (the children's district, no shopping) and **Frass Kids** (the shop), joined by **Kids Valley** (the road in).

### 2A. Pages
| URL | What it is | Connects to |
|---|---|---|
| `/kids-valley` | Narrative front door | `/kids-world/0-3`, `/6-12`, `/12-plus`, `/kids-world`, `/kids-world/parents`, `/frass-hill`, `/welcome-hall` |
| `/kids-world` | Layout with the sticky kids nav | all below |
| `/kids-world/` | Home: passport widget + 4 age worlds | `/kids-world/$age`, `/kids-world/parents`, `/frass-kids`, `/frass-hill` |
| `/kids-world/$age` | One age world (0-3 Gentle Garden, 3-6 Story Courtyard, 6-12 Discovery Village, 12+ Young Builders Quarter) | its places |
| `/kids-world/$age/$place` | A place (Discovery Lab, Learning Village, Maker Workshop, Design Studio…) with activities | `/kids-world/discover`, `/frass-kids` |
| `/kids-world/activity/$slug` | One activity, played | related activities |
| `/kids-world/discover` | Filterable activity gallery + milestones/badges | activities |
| `/kids-world/street` | Frass Street — the child's personal feed | `/kids-world/parents` |
| `/kids-world/parents` | Parent Dashboard: PIN, Safe Exploration Mode, age group, revoke passport | `/kids-world/$age` |
| `/frass-kids/*` | The children's shop (see District, Part 1A) | `/kids-world` |

Gap noted: Kids Valley's stop list skips the `3-6` world.

### 2B. Navigation menus
- **Sticky Kids World nav** (inside `src/routes/kids-world.tsx`): Kids World · one pill per age world the passport allows · 🏘 Frass Street · ✨ Discover · 🛍 Shop Kids · Parent Dashboard
- **PassportGate** (`components/kids-world/passport-gate.tsx`) — issues the passport: age group, child name, Safe Exploration Mode, optional PIN
- **StreetParentPanel** (`components/kids/street-parent-panel.tsx`) — parent view of activity, skills, badges, blocked-content list
- **Shop-side entry** — Frass Kids appears in the District drawer with Kids Valley and the Parent Dashboard

### 2C. Features
- **Parent Passport** — `src/lib/kids-passport.ts`, stored on the device; controls which worlds are even visible
- **Progress (badges & milestones, never scores)** — `src/lib/kids-progress.ts`
- **Learning villages & places** — `src/lib/kids-world.ts`
- **Activities engine** — Supabase `learning_activities` (+ versions), hook `use-activities.ts`, admin CMS at `/admin/activities`
- **Frass Street safety constitution** — `src/lib/kids/frass-street.ts`: 13 buildings, 8 Frassy characters, forbidden-features list, adult-surface blocker, curated-video-only player (`components/kids/safe-video.tsx`)
- **Kids shop catalogue** — `src/lib/frass-kids.ts`: 8 segments × 9 collections, School Drip in place of Work Drip

---

## PART 3 — FRASS HILL (the builder town)

### 3A. Arrival & public town pages
`/welcome-hall` (daily welcome ceremony + first-time orientation + shopper welcome) · `/welcome` · `/arrival` · `/frass-hill` (the Town Plan) · `/frass-hill-journey` (cinematic walk) · `/town-square` · `/for-us` · `/for-me` · `/live`, `/live/go`, `/live/$broadcastId` · `/frass-radio` · `/music-media` · `/health-wellness` · `/frass-hosting` · `/services` · `/blog` · `/join`, `/join/frass-hill`, `/join/frasskicks` · `/auth`, `/reset-password`, `/signed-out`, `/fresh-start` · `/legal`
Retired doors: `/gateway` → `/`, `/frass-world` → `/frass-hill`, `/daily` → the Daily overlay.

### 3B. Member pages (sign-in required, `src/routes/_authenticated/`)
- **Daily life** — `/room` (My Workspace) · `/builder-hall` · `/notifications` · `/journal`
- **Identity & money** — `/workspace/card` (Frass Card) · `/workspace/wallet` · `/workspace/link` · `/workspace/profile` · `/workspace/affiliate` · `/financial-center` · `/payment-providers`
- **Building a business** — `/onboarding` · `/first-30-days` · `/money-moves` · `/launch-accelerator` · `/business-builder` · `/business-vaults` · `/opportunity` · `/manufacturing` · `/workspace/first-venture` · `/global-operations`
- **Creation & learning** — `/studio` (FV Studios) · `/creation` · `/collection` · `/workspace/merch` · `/vault` (Builder Vault) · `/academy` · `/try-on` · `/visual-review` · `/workspace/insights` · `/workspace/daily-design`
- **Founder-only** — `/control-room` (the single headquarters) · `/blueprints` · `/commerce-simulation` · `/frassy`; `/command` and `/founder` redirect here
- **Admin consoles** (23 pages under `/admin`) — activities, blog, capsules, media, images, text, newsroom, virals, visual-index, voice, roles, partners, partner-vendors, launch-partners, launch-feedback, feedback, approvals, audit, financial-audit, affiliate-policy, ai-credits, cj-import, link-check

### 3C. Navigation menus
- **Hill top bar** (`gateway-nav.tsx`, `mode="world"`)
  - Pills: Frass Hill · Town Square · For Us · 🔴 Live · Health & Wellness · Kids World · FV Studios · Frass Radio
  - Drawer groups: **The Town Plan** (Frass Hill, Town Square, For Us, For Me, Builder Vault) · **Health & Wellness** · **Kids World** · **FV Studios** (Business Builder, Launch Accelerator, First 30 Days, Money Moves, Partner Journal, Frass Hosting, FV Studios, Frass Radio, Brand Partnerships) · **Community** (For Us, For Me, Live Directory, Go Live, Opportunity Centre, Academy, Brand Journal, Music & Media, Viral)
  - Plus the District ↔ Hill switcher, Daily button, account menu
- **Welcome Hall gate** — `components/welcome-hall/daily-welcome-gate.tsx` sends every signed-in Builder through `/welcome-hall?welcome=daily` once per day before anything else
- **The Daily overlay** — `components/workspace/daily-gate.tsx`, opens over any page, closes into `/room`; reopenable from both nav bars
- **Workspace lounge rail** — role-aware cards in `_authenticated/workspace.tsx`
- **Founder Control Room tabs** — one registry, `src/lib/founder/command-center.ts`: Home · Platform · Design · Frassy · AI · Operations · Simulator · Innovation · Conversation · Commissioning
- **Frassy beacon & conversation dock** — mounted globally in `__root.tsx`; `src/lib/frassy/surfaces.ts` decides where she appears as a full companion, a beacon, or stays quiet (Kids World, For Us/For Me, Live, Radio, public cards)
- **Simulation Mode bar** — gold bar across the top when the Founder is walking as a persona

### 3D. Features and their wiring
| Feature | Page | Behind it |
|---|---|---|
| Welcome Hall daily ritual | `/welcome-hall` | `lib/welcome-hall/daily-welcome.ts` — 4 tiers: Quick, Motivational, Conversation, Celebration |
| The Daily | overlay → `/room` | `lib/workspace/daily.ts`, persona dailies (Kanko, Mother, Tradesperson) |
| Money Moves | `/money-moves` | `lib/business/money-moves.ts`, launch program, affiliate data → `/first-30-days`, `/launch-accelerator`, `/financial-center` |
| Builder Vault | `/vault` | `vault_items` table, `lib/vault.functions.ts` |
| Frass Card | `/workspace/card` | `business_cards`, `card_listings`, `builder_products`, public view at `/card/$handle` |
| Wallet | `/workspace/wallet` | `financial_receipts`, `card_orders` |
| Frass Link | `/workspace/link` | `link_referrals`, bonus/stage rules; public `/link/$handle` |
| Financial Center | `/financial-center` | Trust Center, Commerce Health, Timeline, Tax Intelligence |
| Academy | `/academy` | Builder Paths, colleges, lessons, reflections |
| FV Studios | `/studio` | AI work forecast → approval → billing |
| Business Builder | `/business-builder` | steps, modes, modules, hosting quotes → `/frass-hosting` |
| Live | `/live` | broadcasts, gifts, comments |
| Founder Control Room | `/control-room` | one registry of every founder tool |
| Simulation Mode | any page | `lib/founder/simulator.ts` — personas, step tracking, restart/exit |

---

## PART 4 — HOW THE THREE WORLDS CONNECT
- The home page `/` is the entrance; the top bar's switcher moves between **District** and **Hill**.
- Kids World is reached from the Hill nav, from Kids Valley, and from the Frass Kids shop.
- The shop's Afro Designers "Join" door opens into the Hill's Business Vaults and Manufacturing.
- Every signed-in Builder passes the Welcome Hall once a day, then the Daily, then lands in `/room`.
- Frassy is present in all three worlds, but she is deliberately silent inside Kids World and on public personal pages.
