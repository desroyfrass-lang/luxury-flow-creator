// ─────────────────────────────────────────────────────────────────────────────
// STEP 4 — THE RESULT LINK CONTRACT.
//
// A specialist tool may tell the original work item: "a real, saved thing now
// exists, and here it is." Nothing more. A result NEVER means money, payment,
// verification, settlement or commission — only that an object was persisted.
//
// A result is only written when:
//   • the specialist actually saved a row in its own table, and
//   • that row belongs to the same signed-in Builder, and
//   • the work item belongs to that Builder too.
// ─────────────────────────────────────────────────────────────────────────────

export const RESULT_KINDS = [
  "card-listing",
  "hidden-asset",
  "gallery-artwork",
  "studio-production",
] as const;

export type WorkResultKind = (typeof RESULT_KINDS)[number];

export function isWorkResultKind(v: unknown): v is WorkResultKind {
  return typeof v === "string" && (RESULT_KINDS as readonly string[]).includes(v);
}

/**
 * How the server proves the saved row belongs to the Builder before it is ever
 * linked. `ownerColumn: null` means ownership is proved through another table
 * (see `ownerVia`), never assumed.
 */
export type ResultKindSpec = {
  kind: WorkResultKind;
  table: string;
  ownerColumn: string | null;
  /** Ownership proved through a parent table (child column → parent table.column). */
  ownerVia?: { column: string; table: string; ownerColumn: string };
  titleColumn: string;
  /** Plain-English wording for Daily and the Workshop. Never financial. */
  label: string;
  note: string;
  /** Where the Builder goes to reopen what they made. */
  reopen: (ref: string) => string;
};

export const RESULT_KIND_SPECS: Record<WorkResultKind, ResultKindSpec> = {
  "card-listing": {
    kind: "card-listing",
    table: "card_listings",
    ownerColumn: "user_id",
    titleColumn: "title",
    label: "Listed on your card",
    note: "The item is saved and live on your Frass Card. No money has moved yet.",
    reopen: () => "/workspace/wallet?section=sell",
  },
  "hidden-asset": {
    kind: "hidden-asset",
    table: "hidden_assets",
    ownerColumn: "user_id",
    titleColumn: "name",
    label: "Saved in First Venture",
    note: "The piece is documented and saved to your account. Nothing is sold or valued yet.",
    reopen: () => "/workspace/first-venture",
  },
  "gallery-artwork": {
    kind: "gallery-artwork",
    table: "gallery_artworks",
    ownerColumn: null,
    ownerVia: { column: "gallery_id", table: "artist_galleries", ownerColumn: "user_id" },
    titleColumn: "title",
    label: "Filed in your gallery",
    note: "The piece is saved as a private draft in your gallery. Nothing is public or for sale yet.",
    reopen: () => "/gallery/studio",
  },
  "studio-production": {
    kind: "studio-production",
    table: "studio_productions",
    ownerColumn: "created_by",
    titleColumn: "title",
    label: "Production created",
    note: "The production plan is saved. Nothing has been generated, published or earned.",
    reopen: (ref) => `/studios/production/${ref}`,
  },
};

export type WorkResult = {
  kind: WorkResultKind;
  ref: string;
  label?: string | null;
  at?: string | null;
};

/** Reads the result off a work item row, ignoring anything malformed. */
export function readWorkResult(row: {
  result_kind?: string | null;
  result_ref?: string | null;
  result_label?: string | null;
  result_at?: string | null;
}): WorkResult | null {
  if (!isWorkResultKind(row.result_kind) || !row.result_ref) return null;
  return {
    kind: row.result_kind,
    ref: row.result_ref,
    label: row.result_label ?? null,
    at: row.result_at ?? null,
  };
}

/** Truthful wording for Daily and the Workshop. Never says earned or paid. */
export function resultStatus(result: WorkResult): { label: string; note: string; href: string } {
  const spec = RESULT_KIND_SPECS[result.kind];
  return {
    label: result.label ? `${spec.label}: ${result.label}` : spec.label,
    note: spec.note,
    href: spec.reopen(result.ref),
  };
}
