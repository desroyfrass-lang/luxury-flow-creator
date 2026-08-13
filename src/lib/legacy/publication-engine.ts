// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0534 — Legacy Publication Engine
//
// "Never let knowledge end with the project. Every completed Business Vault can
// become a book."
//
// When a member completes a Business Vault — or reaches a significant milestone —
// Frassy asks the one constitutional question:
//
//   "Congratulations! You've completed this journey. Would you like me to turn
//    everything we've built together into an e-book?"
//
// The member always chooses. Nothing is published automatically.
//
// The member creates the knowledge once. Frassy helps repurpose it into multiple
// products that keep earning long after the original work is complete.
//
// Frassy is the EDITOR, never the author. The member reviews every draft and
// retains ownership of their work.
// ─────────────────────────────────────────────────────────────────────────────

import { vaultByKey, type BusinessVault, type VaultMove } from "@/lib/business/vault-family";

/** Every format the same knowledge can become. Create once, repurpose many. */
export const PUBLICATION_FORMATS = [
  { id: "ebook", emoji: "📖", label: "E-book", plain: "A downloadable book people read on any device." },
  { id: "audiobook", emoji: "🎧", label: "Audiobook", plain: "Narrated by the member, or by Frassy's voice." },
  { id: "workbook", emoji: "📚", label: "Printable workbook", plain: "Exercises and worksheets people fill in." },
  { id: "course", emoji: "🎓", label: "Online course", plain: "Lessons with progress tracking." },
  { id: "video-course", emoji: "🎥", label: "Video course", plain: "Taught on camera, in FV Studios." },
  { id: "podcast", emoji: "🎙️", label: "Podcast series", plain: "The journey, told episode by episode." },
  { id: "email-course", emoji: "📱", label: "Email course", plain: "One lesson a day, straight to the inbox." },
  { id: "blog", emoji: "📝", label: "Blog series", plain: "Published in instalments on the web." },
  { id: "guide", emoji: "📄", label: "Downloadable guide", plain: "A short, focused how-to." },
  { id: "knowledge-hub", emoji: "🌐", label: "Knowledge Hub", plain: "A living reference inside Frass." },
] as const;

export type PublicationFormatId = (typeof PUBLICATION_FORMATS)[number]["id"];

/** The publication pipeline. Frassy as editor, the member as author. */
export const PUBLICATION_STAGES = [
  {
    id: "gather",
    emoji: "📦",
    label: "Gather",
    plain:
      "Collect everything the journey already produced — goals, decisions, lessons, templates, photos, milestones.",
  },
  {
    id: "structure",
    emoji: "🗂️",
    label: "Structure",
    plain: "Organise the material into chapters and a table of contents.",
  },
  {
    id: "edit",
    emoji: "✍️",
    label: "Edit",
    plain:
      "Frassy improves clarity, organises chapters, writes introductions and summaries, formats consistently.",
  },
  {
    id: "review",
    emoji: "👁️",
    label: "Review",
    plain: "The member reviews and approves every draft before anything is published.",
  },
  {
    id: "publish",
    emoji: "🚀",
    label: "Publish",
    plain:
      "Download a PDF, sell through the Marketplace, offer it on the Frass Card, or publish externally.",
  },
] as const;

export type PublicationStageId = (typeof PUBLICATION_STAGES)[number]["id"];

/** The kind of book a publication is. */
export type PublicationKind = "new-book" | "republish";

export const PUBLICATION_KIND_LABEL: Record<PublicationKind, string> = {
  "new-book": "New book",
  republish: "Republish & reclaim",
};

/** Where a manuscript stands in the pipeline. */
export type ManuscriptStatus =
  | "outline"
  | "drafting"
  | "editing"
  | "review"
  | "published";

export const MANUSCRIPT_STATUS_LABEL: Record<ManuscriptStatus, string> = {
  outline: "Outline ready",
  drafting: "Writing chapters",
  editing: "Frassy is editing",
  review: "Waiting for your review",
  published: "Published",
};

/** A single chapter of a manuscript. */
export type ManuscriptChapter = {
  n: number;
  title: string;
  /** The current draft text. Empty until drafted. */
  draft_text: string | null;
  /** outline | drafting | drafted | edited | approved */
  status: string;
};

/** A point-in-time snapshot of the manuscript. Nothing is ever lost. */
export type ManuscriptVersion = {
  n: number;
  created_at: string;
  summary: string;
  /** Chapter numbers changed in this version. */
  changed_chapters: number[];
};

/** A handwritten-correction amendment (Founder republishing workflow). */
export type ManuscriptAmendment = {
  /** 1-based page or chapter the note refers to. */
  page: number;
  /** Stored image of the handwritten note (storage path or URL). */
  image_url: string | null;
  /** What Frassy read from the note. */
  extracted: string;
  /** The change Frassy proposes. */
  proposed: string;
  /** The original wording being replaced, if any. */
  original: string | null;
  /** null = proposed, ISO date = approved/applied. */
  approved_at: string | null;
  /** Why the change was made. */
  reason: string | null;
};

/** A finished format produced from the same knowledge. */
export type PublishedFormat = {
  format: PublicationFormatId;
  /** pending | ready | published */
  status: string;
  /** Where the artifact lives (Marketplace listing, file URL, etc.). */
  artifact_url: string | null;
};

/** The full manuscript record. */
export type LegacyPublication = {
  id: string;
  blueprint_id: string | null;
  owner_id: string;
  title: string;
  kind: PublicationKind;
  status: ManuscriptStatus;
  chapters: ManuscriptChapter[];
  versions: ManuscriptVersion[];
  amendments: ManuscriptAmendment[];
  formats: PublishedFormat[];
  created_at: string;
  updated_at: string;
};

// ── Editor principles ────────────────────────────────────────────────────────

export const EDITOR_PRINCIPLES = [
  "Frassy edits, never authors. She improves what the member wrote; she does not write it for them.",
  "The member reviews and approves every draft before publication.",
  "The member retains full ownership of their work.",
  "Nothing is published automatically.",
  "Every revision creates a new version. The original is never lost.",
  "Frassy can act as copy editor, structural editor and formatting assistant — but the voice is always the member's.",
] as const;

// ── Gather-from-Vault ────────────────────────────────────────────────────────

/** What Frassy gathers from a completed Vault to propose a book outline. */
export type GatheredMaterial = {
  vaultKey: string;
  vaultLabel: string;
  /** The concrete outcome the Vault ended at — the spine of the book. */
  outcome: string;
  /** The moves the member actually completed — each can become a chapter. */
  moves: { title: string; stage: string; minutes: number }[];
  /** A plain-English summary of what the journey produced. */
  summary: string;
};

/** Read a Vault's pathway and outcome and propose what a book could be made of. */
export function gatherFromVault(vaultKey: string): GatheredMaterial | null {
  const vault = vaultByKey(vaultKey);
  if (!vault) return null;
  return {
    vaultKey: vault.key,
    vaultLabel: vault.label,
    outcome: vault.monetizationOutcome,
    moves: vault.moves.map((m: VaultMove) => ({
      title: m.title,
      stage: m.stage,
      minutes: m.minutes,
    })),
    summary: `${vault.label} produced: ${vault.monetizationOutcome}`,
  };
}

/** Propose a chapter outline from gathered Vault material. */
export function proposeOutline(gathered: GatheredMaterial): { title: string; plain: string }[] {
  const chapters = gathered.moves.map((m, i) => ({
    title: `Chapter ${i + 1}: ${m.title}`,
    plain: `Based on the ${m.stage} step: ${m.title}.`,
  }));
  // Always add a closing reflection chapter.
  chapters.push({
    title: `Chapter ${chapters.length + 1}: Lessons and what I'd do differently`,
    plain: "The honest reflection that only someone who finished the journey can write.",
  });
  return chapters;
}

// ── Completion trigger ───────────────────────────────────────────────────────

/** The constitutional question Frassy asks when a journey completes. */
export const COMPLETION_QUESTION =
  "Congratulations! You've completed this journey. Would you like me to turn everything we've built together into an e-book?";

/** The repurposing question — same knowledge, many products. */
export const REPURPOSE_QUESTION =
  "Would you like to publish your journey? I can turn the same knowledge into an e-book, an audiobook, a workbook, a course and more.";

export const PUBLICATION_PRINCIPLE = {
  id: "FRASS-0534",
  headline: "Never let knowledge end with the project.",
  plain:
    "What this means in plain English: when you finish a Business Vault, that's not the end — it's raw material " +
    "for a book, a course, an audiobook. Frassy gathers everything you already built, organises it into chapters, " +
    "edits it with you (never for you), and helps you publish it in as many formats as you want. You create the " +
    "knowledge once; it keeps earning for years.",
  founderPrinciple:
    "Every completed journey contains knowledge worth preserving. Frass exists to help members transform their " +
    "experience into intellectual property that educates others, creates new opportunities, and continues " +
    "generating value long after the original work is complete.",
} as const;
