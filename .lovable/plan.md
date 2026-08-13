# FRASS-0534 — Legacy Publication Engine

**Status:** Constitutional Amendment · **Priority:** P0
**Principle:** Every completed journey contains knowledge worth preserving. Frass turns experience into intellectual property that educates, creates opportunities, and keeps earning long after the original work ends.

## Audit (reuse-before-build) — what already exists

| System | Location | Reuse decision |
|--------|----------|----------------|
| Business Vaults | `src/lib/business/vault-family.ts` (13 vaults) | Each Vault gains a publication capability; no new route. Add an **Author Vault** to the family. |
| Knowledge Vault | `/vault` route | Already holds sketches, photos, documents. The Publication Engine **gathers from** it. |
| Money Moves | `src/lib/daily/*` | Publishing becomes a Money Move (Legacy layer, FRASS-0501). |
| Marketplace | `/marketplace`, `/services` | Published books sell through the **existing** Marketplace — no second catalog. |
| Digital Legacy | `src/lib/daily/tradesperson.ts` (`DIGITAL_LEGACY`) | The 10 legacy forms (checklists, courses, templates) already exist. Publication is the **capstone** of Digital Legacy — it bundles those assets into a book. |
| Creator Manufacturing Network | `src/lib/manufacturing/network.ts` | Audiobook/print production routes through manufacturing categories. |
| Frassy | `src/lib/frassy-*-tools.server.ts` | Frassy becomes the **editor** (gather → structure → edit → review). New tool set. |
| Blueprints | `src/lib/blueprints/member-blueprint.ts` (`creative_projects`) | A book project is a **Legacy Publication** on the Blueprint — same pattern as `creative_projects`, different shape (chapters, drafts, versions). |
| Daily customization | `src/lib/daily/customization.ts` | New `legacy-publication` section, Blueprint-driven. |
| Publishing workflows | **none** | **New** — this is the one thing that doesn't exist yet. |

**Reuse verdict:** No new route, no new dashboard, no duplicate catalog. The Engine is a library + a Blueprint field + a Daily section + Frassy tools. The only genuinely new artifact is the publication workflow logic and a manuscript table.

## What we build (one approval cycle)

### 1. Publication Engine library — `src/lib/legacy/publication-engine.ts`
- **Format catalog:** e-book, audiobook, printable workbook, online course, video course, podcast series, email course, blog series, downloadable guide, Knowledge Hub. The member creates knowledge once; Frassy repurposes into multiple products.
- **Workflow stages:** Gather (from the completed Vault: goals, decisions, lessons, templates, photos, milestones) → Structure (chapters + TOC) → Edit (Frassy as editor, not author: clarity, consistency, intros, summaries) → Review (member approves every draft) → Publish (PDF / Marketplace / Frass Card / lead magnet / course / external).
- **Gather-from-Vault helper:** reads a Vault's `monetizationOutcome` + moves + any Knowledge Vault assets already captured, and proposes a chapter outline. Nothing auto-publishes.
- **Editor principles:** Frassy edits, never authors; the member reviews every draft; member retains ownership.
- **Completion trigger:** the constitutional question — when a member completes a Vault or milestone, Frassy asks: *"Congratulations — would you like me to turn everything we built together into an e-book?"* The member always chooses.

### 2. Author Vault — added to `vault-family.ts`
A new Business Vault (`author`): Discover → Build → Monetize for writers. Paths: e-books, audiobooks, workbooks, courses, lead magnets. Monetization outcome: a published book in the Marketplace with at least one repurposed format. The Founder's *My Different Shades of Black* republishing journey is the proof-of-concept that shapes this Vault — exactly as *I Am Not My Hair* shaped the Creative Series Vault.

### 3. Blueprint field — `legacy_publications`
Mirror the proven `creative_projects` pattern. Add a `LegacyPublication` type (title, kind: `new-book` | `republish`, status, cadence, chapters count, current chapter, draft status, formats wanted, notes) and a `legacy_publications` JSONB column on `member_success_blueprints`. Update `member-blueprint.ts`, `member-blueprint.functions.ts` (Zod), `frassy-blueprint-tools.server.ts`, and the Blueprints UI (`/blueprints`) so Frassy can manage these conversationally. Migration: `ALTER TABLE member_success_blueprints ADD COLUMN legacy_publications jsonb DEFAULT '[]'`.

### 4. Manuscript table — `legacy_publications`
A dedicated table for real manuscript work (too heavy for Blueprint JSONB):
```
public.legacy_publications (
  id uuid pk, blueprint_id uuid, owner_id uuid,
  title text, kind text,            -- new-book | republish
  status text,                       -- outline | drafting | editing | review | published
  chapters jsonb,                    -- [{n, title, draft_text, status}]
  versions jsonb,                    -- [{n, created_at, summary, changed_chapters[]}]
  amendments jsonb,                  -- [{page, image_url, extracted, proposed, approved_at}]
  formats jsonb,                     -- [{format, status, artifact_url}]
  created_at, updated_at
)
```
With RLS (owner + Founder admin via `has_role`), GRANT to `authenticated` + `service_role`. This holds chapters, version history, the Founder's handwritten-correction amendments, and the final published formats.

### 5. Daily section — `legacy-publication`
Registered in `customization.ts`. Blueprint-driven (renders only if the Blueprint carries a `legacy_publications` entry):
- **Mother (voice-first):** a "Tell me a story" card. Frassy converts spoken memories into organized chapters for review. No pressure — even five minutes counts. The card reads the active book + current chapter from the Blueprint.
- **Founder (republish):** a "Review another page of *My Different Shades of Black*" card with an amendment-upload flow (image → Frassy reads handwritten notes → proposes revision → waits for approval → applies → records version). One page a day counts as progress.

### 6. Frassy publication tools — `src/lib/frassy-publication-tools.server.ts`
Frassy tools (Founder-gated where needed, FRASS-0530): gather-from-vault, propose-chapter-outline, draft-chapter, edit-chapter, propose-amendment (OCR of handwritten photo via AI Gateway vision), apply-amendment (after approval), copy-edit, prepare-publication-files. All follow the "editor not author, member approves everything" rule.

### 7. Constitution + memory
Codify FRASS-0534 in `FRASS_OS_CONSTITUTION.md`: "Never let knowledge end with the project. Every completed Business Vault can become a book." Add the Founder's republishing project and Mother's book as Blueprint-driven legacy publications (not hardcoded). Update project memory index.

## What this does NOT do (scoped out of this cycle)
- No standalone "/publish" dashboard route (reuse the Daily section + Blueprints page).
- No duplicate Marketplace listing type (books are Marketplace products).
- No auto-publishing — ever.
- The full OCR-amendment pipeline is scaffolded + wired to the AI Gateway but the Founder's actual manuscript text is seeded by him during testing, not invented by us.

## Plain English
Right now, when someone finishes a Business Vault, that's the end. FRASS-0534 makes it the *beginning*: Frassy takes everything they built — the goals, the lessons, the templates, the photos — and helps turn it into an e-book, an audiobook, a course, a workbook. The member creates the knowledge once; Frassy helps repurpose it into products that keep earning. Your mother's lifelong dream of writing a book becomes a voice-first daily ritual: she tells a story, Frassy organizes it into a chapter, and over time those chapters become a finished book. Your own *My Different Shades of Black* becomes the proof-of-concept: you upload photos of handwritten corrections, Frassy reads them, proposes the changes, and waits for your approval before touching a single word — with full version history so nothing is ever lost. The workflow you perfect becomes the Author Vault every future Frass writer inherits.
