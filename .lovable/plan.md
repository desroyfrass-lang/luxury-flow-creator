# Frassy OS — Phase 1 (Foundation)

A private admin operating system at `/frassy`. Separate from the customer Frassy chat widget. Read-only aggregator over what already exists in the database — no new approval flows yet.

## What ships

**Route:** `/frassy` (under `_authenticated`, admin-only gate). Not linked from the public site. Owner accesses it directly or via a discreet link from `/admin`.

**Layout:** Dark luxury "mission control" — full-bleed dark canvas, gold hairlines, generous whitespace, monospaced accents for numbers. Distinct from Shopify and from the storefront.

## Sections (top to bottom)

1. **Greeting bar**
   Time-aware ("Good morning / afternoon / evening"), name from profile, warm one-liner. Rotates from a small pool so it never feels canned.

2. **Store status strip** (6 tiles)
   Orders overnight · Revenue (today / 7d) · Pending orders · Low-stock alerts · New customers · Rewards claimed. Each tile: big number, delta vs. previous period, one-line "why it matters" caption.

3. **Mandatory tasks** (approval queue)
   Live counts pulled from existing tables:
   - CJ products awaiting approval (`cj_import_queue` where status = pending)
   - Capsules missing hero image / description (`capsules`)
   - Blog drafts unpublished (`blog_posts`)
   - Viral products missing category (`viral_products`)
   - Site text slots empty (`site_text`)
   - Site image slots empty (`site_images`)
   Each row: task title, count, estimated minutes (rough heuristic: 30s per item), "Open" button that deep-links to the existing admin surface.
   Header shows total estimated time: **"Today's mandatory work: ~X minutes"**.

4. **Optional work**
   Static launcher grid (for now): Build capsule · Write blog · Explore trends · Review analytics · Manage virals · CJ discovery. Each links to the existing admin route.

5. **Pinned notes**
   Free-form notes the owner types in. Persist in a new `frassy_notes` table (id, user_id, body, pinned, created_at, archived_at). Add/pin/archive. Search box.

6. **Footer: today at a glance**
   Simple daily rollup — orders count, revenue, tasks closed today (nothing fancy, no charts yet).

## What is NOT in Phase 1

Chat mode · analytics narratives · memory that learns preferences · product/image approval UI · customer support console · designer/affiliate queues · daily-summary-at-logout · social publishing queues. All deferred to later phases (spec preserved in `NOTES.md`).

## Technical

- New route: `src/routes/_authenticated/frassy.tsx` (admin-role gated in the component, matching `/admin` pattern).
- New server function file: `src/lib/frassy.functions.ts` — one `getDailyBriefing` server fn that runs the count queries in parallel and returns a typed briefing object. Uses `requireSupabaseAuth` + admin role check.
- New table via migration: `frassy_notes` with RLS (owner reads/writes own rows only) and standard GRANTs.
- New components under `src/components/frassy/`: `GreetingBar`, `StatusTile`, `TaskRow`, `NoteList`.
- TanStack Query for the briefing with a 60s stale time and a manual refresh button.
- No changes to the customer `frassy-chat.tsx` widget — kept as-is.

## Data sources (read-only aggregates)

```text
orders                 → today's revenue, order count, status buckets
order_items            → (Phase 2 for best-sellers)
cj_import_queue        → pending approvals count
capsules               → missing description / image count
blog_posts             → draft count
viral_products         → uncategorized count
site_text, site_images → empty slot counts
profiles               → new signups (last 24h)
reward_coupons         → claimed today
```

All queries scoped through `requireSupabaseAuth` + `has_role('admin')`.

## Success looks like

Owner opens `/frassy`, sees warm greeting, one screen tells them exactly what needs their approval today with time estimates and one-click jumps into the existing admin tools. Everything else (chat, product approval UI, analytics narratives) lands in later phases without rearchitecting Phase 1.
