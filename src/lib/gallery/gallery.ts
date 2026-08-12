// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0485 — Frass Gallery. "Build Art. Share Art. Monetize Art."
//
// Audited before writing a single line (nothing below duplicates them):
//   · Marketplace (frass-district, product routes, cart-store)  → checkout stays there
//   · Business Vaults (business/future-vaults.ts, accelerator.ts) → Artist vault is a seed, not a new engine
//   · Money Moves (business/money-moves.ts, monetization.ts)     → "gallery" outcome already exists; we feed it
//   · Frass Cards (card.ts, card-commerce.ts)                    → the Artist block is a card section, not a new profile
//   · Creator tools (creation.ts, studio.ts)                     → unchanged
//   · FV Studios (routes/fv-studios.tsx)                         → FV makes MEDIA; Gallery Studio makes VISUAL ART
//   · NFT support                                                → none existed; added here as an OPTIONAL flag only
//   · Existing artwork features                                  → none; galleries had no home before this
//
// Constitutional rule: every artist should be able to transform creativity into
// opportunity. Following FRASS-0480, every artwork carries a clear path toward
// monetization — whenever the artist chooses it.
// ─────────────────────────────────────────────────────────────────────────────

export const GALLERY_PRINCIPLE =
  "Every artist deserves more than a product listing. Frass Gallery gives artists a place to tell their story, exhibit their work, connect with collectors, and build a sustainable creative business.";

export const GALLERY_LEGACY_LINE =
  "Every brushstroke should have the opportunity to become both a legacy and a livelihood.";

export const GALLERY_PLAIN_ENGLISH =
  "What this means in plain English: instead of squeezing a painting into a shop listing beside a t-shirt, you get your own gallery — walls, rooms, a story beside every piece — and the till is quietly at the door.";

export const GALLERY_NO_DUPLICATE_RULE =
  "Frass Gallery is part of the Marketplace. It uses the existing checkout, Financial Center, receipts, shipping and Frass Cards. No duplicate commerce systems.";

export const FV_BOUNDARY =
  "FV Studios creates media. Frass Gallery Studio creates visual artwork. They never merge.";

// ── Visual Creator disciplines (FRASS-0495) ───────────────────────────────────────────────────────
// Business Discovery listens for these. When one is heard, Frassy makes one
// offer: "Would you like me to build your Frass Gallery?"

export type DisciplineId =
  | "painter"
  | "illustrator"
  | "sculptor"
  | "photographer"
  | "mixed-media"
  | "digital";

export type Discipline = {
  id: DisciplineId;
  emoji: string;
  label: string;
  /** How Frassy recognises it in ordinary conversation. */
  cues: RegExp;
  /** The first room of the gallery Frassy builds for this discipline. */
  firstRoom: string;
};

export const DISCIPLINES: Discipline[] = [
  {
    id: "painter",
    emoji: "🎨",
    label: "Painter",
    cues: /paint|painter|canvas|acrylic|oil on|watercolou?r|gouache|mural/i,
    firstRoom: "Originals on canvas",
  },
  {
    id: "illustrator",
    emoji: "✏️",
    label: "Illustrator",
    cues: /illustrat|draw|drawing|sketch|comic|manga|cartoon|character design/i,
    firstRoom: "Illustration & character work",
  },
  {
    id: "sculptor",
    emoji: "🗿",
    label: "Sculptor",
    cues: /sculpt|clay|ceramic|pottery|carv|bronze|resin|3d print/i,
    firstRoom: "Sculpture & form",
  },
  {
    id: "photographer",
    emoji: "📷",
    label: "Photographer",
    cues: /photograph|photo shoot|film camera|darkroom|portrait session|street photo/i,
    firstRoom: "Photographic prints",
  },
  {
    id: "mixed-media",
    emoji: "🧵",
    label: "Mixed-media creator",
    cues: /mixed media|collage|textile|fabric art|assemblage|found object/i,
    firstRoom: "Mixed-media works",
  },
  {
    id: "digital",
    emoji: "🖥",
    label: "Digital creator",
    cues: /digital art|procreate|photoshop|concept art|pixel art|nft art|digital paint/i,
    firstRoom: "Digital works & editions",
  },
];

export function disciplineById(id: string): Discipline | undefined {
  return DISCIPLINES.find((d) => d.id === id);
}

/** Reads a sentence and returns the artistic disciplines it reveals. */
export function detectDisciplines(text: string): Discipline[] {
  if (!text.trim()) return [];
  return DISCIPLINES.filter((d) => d.cues.test(text));
}

/** Frassy's single, unpushy offer. Never repeated in the same session. */
export const GALLERY_OFFER = "Would you like me to build your Frass Gallery?";

export function galleryOfferFor(d: Discipline): string {
  return `${d.emoji} You're a ${d.label.toLowerCase()}. ${GALLERY_OFFER} I'll start with a room called “${d.firstRoom}”.`;
}

// ── Gallery Builder ──────────────────────────────────────────────────────────
// What Frassy assembles the moment the artist says yes. Nothing here is a form
// the artist has to fill in first; she drafts, they edit.

export type BuilderStep = {
  id: string;
  label: string;
  frassy: string;
  /** Frassy can draft this herself; the artist only edits. */
  aiDrafted: boolean;
};

export const GALLERY_BUILDER_STEPS: BuilderStep[] = [
  { id: "profile", label: "Visual Creator profile", frassy: "Your name, your disciplines, where you work from.", aiDrafted: false },
  { id: "biography", label: "Biography", frassy: "Tell me how you started. I'll write the first draft; you make it true.", aiDrafted: true },
  { id: "statement", label: "Artist statement", frassy: "What your work is about. Short, honest, yours.", aiDrafted: true },
  { id: "home", label: "Gallery homepage", frassy: "Your hero wall — the first thing a collector sees.", aiDrafted: false },
  { id: "collections", label: "Collections", frassy: "Rooms in your gallery. Start with one; add more as the work grows.", aiDrafted: true },
  { id: "featured", label: "Featured works", frassy: "The pieces you'd hang at the entrance.", aiDrafted: false },
  { id: "categories", label: "Categories & tags", frassy: "So collectors searching for what you make actually find you.", aiDrafted: true },
  { id: "contact", label: "Contact information", frassy: "How a collector reaches you without you posting your phone number publicly.", aiDrafted: false },
  { id: "card", label: "Frass Card integration", frassy: "Your card gains a 🎨 Visual Creator block that opens straight into this gallery.", aiDrafted: false },
];

// ── Artwork ──────────────────────────────────────────────────────────────────

export type Availability = "available" | "reserved" | "sold" | "not_for_sale" | "exhibition_only";

export const AVAILABILITY: Record<Availability, { label: string; note: string; tone: string }> = {
  available: { label: "Available", note: "Ready for a new home.", tone: "text-emerald-300" },
  reserved: { label: "Reserved", note: "Held for a collector.", tone: "text-amber-300" },
  sold: { label: "Sold", note: "In a private collection.", tone: "text-muted-foreground" },
  not_for_sale: { label: "Not for sale", note: "Part of the artist's own collection.", tone: "text-muted-foreground" },
  exhibition_only: { label: "Exhibition only", note: "On show, not on the market.", tone: "text-sky-300" },
};

export type ArtworkRow = {
  id: string;
  gallery_id: string;
  collection_id: string | null;
  slug: string;
  title: string;
  description: string | null;
  inspiration: string | null;
  medium: string | null;
  dimensions: string | null;
  year_created: number | null;
  image_url: string | null;
  thumb_url: string | null;
  extra_images: string[];
  tags: string[];
  availability: Availability;
  currency: string;
  original_price: number | null;
  prints_available: boolean;
  print_from_price: number | null;
  edition_size: number | null;
  signed_editions: boolean;
  digital_download: boolean;
  digital_price: number | null;
  license_terms: string | null;
  nft_enabled: boolean;
  coa_offered: boolean;
  commissions_similar: boolean;
  source: "uploaded" | "frass_studio";
  studio_canvas_id: string | null;
  position: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type GalleryRow = {
  id: string;
  user_id: string;
  handle: string;
  display_name: string;
  disciplines: string[];
  biography: string | null;
  artist_statement: string | null;
  hero_url: string | null;
  avatar_url: string | null;
  location: string | null;
  contact_email: string | null;
  current_exhibition: string | null;
  commission_status: "open" | "waitlist" | "closed";
  commission_note: string | null;
  commission_from_price: number | null;
  currency: string;
  theme: string;
  accent: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type CollectionRow = {
  id: string;
  gallery_id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  position: number;
};

export type StoryRow = {
  id: string;
  artwork_id: string;
  gallery_id: string;
  written_story: string | null;
  audio_url: string | null;
  audio_seconds: number | null;
  creation_notes: string | null;
  process_notes: string | null;
  timelapse_url: string | null;
};

export type CommissionRow = {
  id: string;
  gallery_id: string;
  artwork_id: string | null;
  requester_name: string;
  requester_email: string;
  brief: string;
  reference_url: string | null;
  budget_min: number | null;
  budget_max: number | null;
  currency: string;
  deadline: string | null;
  status: "new" | "discussing" | "quoted" | "accepted" | "declined" | "complete";
  artist_note: string | null;
  created_at: string;
};

export const COMMISSION_STATUS_LABEL: Record<CommissionRow["status"], string> = {
  new: "New request",
  discussing: "In conversation",
  quoted: "Quoted",
  accepted: "Accepted",
  declined: "Declined",
  complete: "Complete",
};

// ── The Story Wall ───────────────────────────────────────────────────────────
// The addition that makes a Frass gallery different from a shop shelf.

export const STORY_WALL_PRINCIPLE =
  "Every artwork may carry the artist's own voice. Collectors connect with artists, not just images.";

export const STORY_WALL_PLAIN_ENGLISH =
  "What this means in plain English: instead of reading “acrylic on canvas, 2026”, you hear the artist say why they painted it — and that's usually the moment somebody decides to buy.";

export const STORY_WALL_PROMPTS = [
  "Where were you when this started?",
  "What were you feeling that day?",
  "Which colour came first, and why?",
  "Who is in this piece, even if nobody can see them?",
  "What nearly went wrong?",
  "What do you want a stranger to feel standing in front of it?",
];

/** Suggests a Story Wall prompt without repeating yesterday's. */
export function storyPromptFor(seed: number): string {
  return STORY_WALL_PROMPTS[Math.abs(seed) % STORY_WALL_PROMPTS.length]!;
}

// ── Monetization paths (FRASS-0480: Build it. Monetize it.) ──────────────────
// Every path lands on a surface that already exists. NFT is one path of six —
// never a requirement, never the default.

export type MonetizationPathId =
  | "original"
  | "print"
  | "limited"
  | "digital"
  | "commission"
  | "nft";

export type MonetizationPath = {
  id: MonetizationPathId;
  emoji: string;
  label: string;
  what: string;
  /** The existing Frass surface that carries the money. */
  runsOn: string;
  optional?: boolean;
};

export const MONETIZATION_PATHS: MonetizationPath[] = [
  { id: "original", emoji: "🖼", label: "Original", what: "The one and only piece, sold once.", runsOn: "Marketplace checkout · Financial Center receipts" },
  { id: "print", emoji: "🖨", label: "Prints", what: "Open-edition prints at a friendlier price.", runsOn: "Marketplace checkout · existing shipping" },
  { id: "limited", emoji: "✍️", label: "Limited & signed editions", what: "A numbered run, signed by hand, with a certificate if you offer one.", runsOn: "Marketplace checkout · existing shipping" },
  { id: "digital", emoji: "⬇️", label: "Digital & licensing", what: "Downloads, wallpapers, design assets, licensed use.", runsOn: "Marketplace checkout · digital delivery" },
  { id: "commission", emoji: "🤝", label: "Commissions", what: "Custom work agreed with a collector, coordinated by Frassy.", runsOn: "Payment Requests · Financial Center" },
  { id: "nft", emoji: "⛓", label: "NFT minting", what: "An on-chain edition, if that's a market you want. Entirely your choice.", runsOn: "Optional external mint · never required", optional: true },
];

export const NFT_RULE = "NFTs are an optional monetization path, never a requirement and never a default.";

/** Which paths this artwork already has switched on. */
export function activePaths(a: Pick<ArtworkRow, "original_price" | "prints_available" | "edition_size" | "digital_download" | "commissions_similar" | "nft_enabled">): MonetizationPathId[] {
  const on: MonetizationPathId[] = [];
  if (a.original_price != null) on.push("original");
  if (a.prints_available) on.push("print");
  if (a.edition_size != null) on.push("limited");
  if (a.digital_download) on.push("digital");
  if (a.commissions_similar) on.push("commission");
  if (a.nft_enabled) on.push("nft");
  return on;
}

/**
 * FRASS-0480 in one function: the next monetization step for a piece.
 * Never scolds. Always the smallest honest next action.
 */
export function nextMonetizationStep(a: ArtworkRow): { label: string; why: string } | null {
  if (!a.image_url) return { label: "Photograph this piece", why: "A collector can't buy what they can't see properly." };
  if (!a.is_published) return { label: "Publish it to your gallery", why: "It's finished. Let it be seen." };
  if (a.original_price == null && a.availability === "available")
    return { label: "Set a price for the original", why: "Available with no price reads as “not really for sale”." };
  if (!a.prints_available) return { label: "Prepare a print edition", why: "Prints earn from a piece you've already sold, or one nobody can afford yet." };
  if (!a.commissions_similar) return { label: "Offer similar commissions", why: "People who love this piece often want one of their own." };
  return null;
}

// ── The Visual Creator Business Vault (a seed for the existing engine) ───────────────
// This does NOT create a second vault system. It is the seed row that the
// existing Business Vault / accelerator machinery consumes.

export const ARTIST_VAULT_SEED = {
  key: "artist",
  emoji: "🎨",
  label: "Visual Creator & Frass Gallery",
  summary: "Your work, your gallery, your collectors — built one piece at a time.",
  rationale:
    "You already make the thing people pay for. The business part is showing it well, telling the story, and having somewhere to buy.",
  roadmap: [
    "Build the gallery and publish the first three pieces",
    "Write or record the story behind each one",
    "Price the originals honestly",
    "Prepare a print edition from the strongest piece",
    "Open commissions with a clear starting price",
    "Put the gallery on the Frass Card and share it once",
  ],
} as const;

// ── Daily tasks (fed into the existing Daily engine) ─────────────────────────
// The Daily supports the artist's rhythm. Studio days are quiet; admin days
// are short. Never more than three artist tasks in one morning.

export type ArtistDailySeed = { id: string; icon: string; label: string; why: string; minutes: number; href: string };

const ARTIST_DAILY_POOL: ArtistDailySeed[] = [
  { id: "art-make", icon: "🖌", label: "Make today's work — one hour, no phone", why: "The gallery only grows if the work does.", minutes: 60, href: "/gallery/studio" },
  { id: "art-photo", icon: "📷", label: "Photograph a finished piece", why: "Daylight, flat wall, no flash. Ten minutes now saves a week later.", minutes: 10, href: "/workspace/gallery" },
  { id: "art-story", icon: "🎙", label: "Record the story behind one painting", why: "Sixty seconds in your own voice sells better than any description I can write.", minutes: 5, href: "/workspace/gallery" },
  { id: "art-prints", icon: "🖨", label: "Prepare a print collection", why: "One strong piece can earn twice.", minutes: 30, href: "/workspace/gallery" },
  { id: "art-update", icon: "🖼", label: "Update the gallery — one new piece live", why: "A gallery that changes is a gallery people return to.", minutes: 15, href: "/workspace/gallery" },
  { id: "art-commissions", icon: "🤝", label: "Respond to commission requests", why: "Collectors who wait usually go elsewhere.", minutes: 15, href: "/workspace/gallery" },
  { id: "art-share", icon: "📣", label: "Share one piece with its story", why: "The story travels further than the picture on its own.", minutes: 10, href: "/workspace/card" },
];

/**
 * Three tasks, rotated by the day so the artist never opens the same morning
 * twice — and never opens a morning that feels like homework.
 */
export function artistDaily(dayIndex: number, opts?: { openCommissions?: number; unpublished?: number }): ArtistDailySeed[] {
  const picks: ArtistDailySeed[] = [];
  if (opts?.openCommissions) picks.push(ARTIST_DAILY_POOL.find((t) => t.id === "art-commissions")!);
  if (opts?.unpublished) picks.push(ARTIST_DAILY_POOL.find((t) => t.id === "art-update")!);
  const rest = ARTIST_DAILY_POOL.filter((t) => !picks.some((p) => p.id === t.id));
  let i = Math.abs(dayIndex) % rest.length;
  while (picks.length < 3 && rest.length) {
    picks.push(rest[i % rest.length]!);
    i += 1;
  }
  return picks.slice(0, 3);
}

// ── Frass Card — the 🎨 Visual Creator block ─────────────────────────────────────────

export type ArtistCardBlock = {
  headline: string;
  galleryHref: string;
  collections: number;
  featured: { title: string; thumb: string | null; href: string } | null;
  commissionStatus: GalleryRow["commission_status"];
  exhibition: string | null;
  contactEmail: string | null;
};

export const COMMISSION_BADGE: Record<GalleryRow["commission_status"], string> = {
  open: "Commissions open",
  waitlist: "Commissions — waitlist",
  closed: "Commissions closed",
};

export function galleryPath(handle: string): string {
  return `/gallery/${handle}`;
}

export function artworkPath(handle: string, slug: string): string {
  return `/gallery/${handle}/${slug}`;
}

// ── Small shared helpers ─────────────────────────────────────────────────────

export function slugify(input: string, fallback = "untitled"): string {
  const s = input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 78);
  return s.length >= 2 ? s : fallback;
}

export function formatPrice(value: number | null | undefined, currency = "CAD"): string | null {
  if (value == null) return null;
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 0 }).format(value);
  } catch {
    return `${currency} ${value}`;
  }
}

/** The single line the artwork page shows under the title. */
export function artworkCaption(a: Pick<ArtworkRow, "medium" | "dimensions" | "year_created">): string {
  return [a.medium, a.dimensions, a.year_created ? String(a.year_created) : null].filter(Boolean).join(" · ");
}
