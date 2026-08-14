/**
 * FRASS-0535 — Progress Without Exposure. Constitutional amendment, P0.
 *
 * Members celebrate together without anyone's money, notes or identity being
 * put on display. Whenever Frass shows a community accomplishment publicly it
 * defaults to celebration, never disclosure.
 *
 * Founder principle: celebrate the achievement, protect the individual.
 */

export const PROGRESS_WITHOUT_EXPOSURE_PRINCIPLE =
  "Celebrate the achievement, protect the individual. Frass inspires through success stories while preserving every member's privacy and financial dignity.";

export const PROGRESS_WITHOUT_EXPOSURE_PLAIN_ENGLISH =
  "Here's how it works: the community can see that something good happened — a gift was sent, a book was published, a first product launched — the same way you'd hear applause from another room. You hear the celebration; you don't see anybody's bank statement.";

/** Who is allowed to see a community event. The member chooses whenever appropriate. */
export type ProgressAudience = "private" | "connections" | "partners" | "public";

export const PROGRESS_AUDIENCES: {
  id: ProgressAudience;
  glyph: string;
  label: string;
  detail: string;
}[] = [
  { id: "private", glyph: "🔒", label: "Private", detail: "Only you ever see this." },
  {
    id: "connections",
    glyph: "👥",
    label: "Connections only",
    detail: "Members you are connected with see it. Nobody else does.",
  },
  {
    id: "partners",
    glyph: "🤝",
    label: "Partners",
    detail: "Signed-in Frass partners see it. Visitors from outside do not.",
  },
  {
    id: "public",
    glyph: "🌍",
    label: "Public",
    detail: "Anyone visiting Frass can see the celebration.",
  },
];

export const DEFAULT_PROGRESS_AUDIENCE: ProgressAudience = "partners";

export function audienceMeta(id: string | null | undefined) {
  return (
    PROGRESS_AUDIENCES.find((a) => a.id === id) ??
    PROGRESS_AUDIENCES.find((a) => a.id === DEFAULT_PROGRESS_AUDIENCE)!
  );
}

/** Viewer tiers, from the outside world inwards. */
export type ProgressViewer = "visitor" | "connection" | "partner" | "self";

const RANK: Record<ProgressViewer, number> = {
  visitor: 0,
  connection: 1,
  partner: 2,
  self: 3,
};

const REQUIRED: Record<ProgressAudience, number> = {
  public: 0,
  connections: 1,
  partners: 2,
  private: 3,
};

/** Can this viewer see the event at all? */
export function canSeeProgress(audience: ProgressAudience, viewer: ProgressViewer): boolean {
  return RANK[viewer] >= REQUIRED[audience];
}

/**
 * Can this viewer see the numbers behind the event? Money, balances, private
 * notes and internal Founder comments are never part of a public celebration.
 */
export function canSeeProgressDetail(viewer: ProgressViewer): boolean {
  return viewer === "partner" || viewer === "self";
}

/** Things a public celebration may never contain, whatever the surface. */
export const NEVER_PUBLIC = [
  "Dollar amounts and credit totals",
  "Account balances and wallet figures",
  "Personal notes attached to a gift or milestone",
  "Private identities the member did not choose to reveal",
  "Internal Founder comments",
] as const;

export type ProgressEventKind =
  | "gift"
  | "milestone"
  | "vault_completed"
  | "book_published"
  | "product_launched"
  | "first_sale";

const CELEBRATION: Record<ProgressEventKind, string> = {
  gift: "🎉 A gift was sent",
  milestone: "🎉 A member reached a milestone",
  vault_completed: "🎉 A Business Vault was completed",
  book_published: "🎉 Someone published their first book",
  product_launched: "🎉 Someone launched their first product",
  first_sale: "🎉 Someone made their first sale",
};

/**
 * The one wording used for a public celebration. No amounts, no balances, no
 * identity unless the member explicitly chose to be recognised.
 */
export function celebrationLine(
  kind: ProgressEventKind,
  options: { name?: string | null; named?: boolean } = {},
): string {
  const base = CELEBRATION[kind];
  if (options.named && options.name) return `${base} — ${options.name}`;
  return base;
}
