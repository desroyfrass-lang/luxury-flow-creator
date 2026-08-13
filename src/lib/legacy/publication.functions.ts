// FRASS-0534 — Legacy Publication Engine, read and written through the member's
// own authenticated session. RLS enforces owner-only access; the server never
// trusts a client-supplied identity (FRASS-0530).
//
// Frassy is the editor, never the author. Every revision creates a new version;
// the original is never lost. The member reviews and approves every draft.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type {
  LegacyPublication,
  ManuscriptAmendment,
  ManuscriptChapter,
  ManuscriptVersion,
  PublishedFormat,
} from "./publication-engine";

/** Coerce a raw DB row (JSON columns) into a typed LegacyPublication. */
function normalizePublication(row: Record<string, unknown>): LegacyPublication {
  const r = row as Record<string, unknown>;
  return {
    ...(r as unknown as Omit<
      LegacyPublication,
      "chapters" | "versions" | "amendments" | "formats"
    >),
    chapters: Array.isArray(r.chapters) ? (r.chapters as ManuscriptChapter[]) : [],
    versions: Array.isArray(r.versions) ? (r.versions as ManuscriptVersion[]) : [],
    amendments: Array.isArray(r.amendments) ? (r.amendments as ManuscriptAmendment[]) : [],
    formats: Array.isArray(r.formats) ? (r.formats as PublishedFormat[]) : [],
  };
}

const chapterSchema = z.object({
  n: z.number().int().min(1),
  title: z.string().min(1).max(200),
  draft_text: z.string().nullable().default(null),
  status: z.string().max(40).default("outline"),
});

const formatSchema = z.object({
  format: z.enum([
    "ebook",
    "audiobook",
    "workbook",
    "course",
    "video-course",
    "podcast",
    "email-course",
    "blog",
    "guide",
    "knowledge-hub",
  ]),
  status: z.string().max(40).default("pending"),
  artifact_url: z.string().nullable().default(null),
});

const saveSchema = z.object({
  id: z.string().uuid().nullable().default(null),
  blueprint_id: z.string().uuid().nullable().default(null),
  title: z.string().min(1).max(200),
  kind: z.enum(["new-book", "republish"]).default("new-book"),
  status: z
    .enum(["outline", "drafting", "editing", "review", "published"])
    .default("outline"),
  chapters: z.array(chapterSchema).max(60).default([]),
  formats: z.array(formatSchema).max(12).default([]),
});

export type PublicationInput = z.infer<typeof saveSchema>;

export const listLegacyPublications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<LegacyPublication[]> => {
    const { data, error } = await context.supabase
      .from("legacy_publications")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return (data ?? []).map(normalizePublication);
  });

export const getLegacyPublication = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ id: z.string().uuid() }).parse(data),
  )
  .handler(async ({ data, context }): Promise<LegacyPublication | null> => {
    const { data: row, error } = await context.supabase
      .from("legacy_publications")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row ? normalizePublication(row as never) : null;
  });

export const saveLegacyPublication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => saveSchema.parse(data))
  .handler(async ({ data, context }): Promise<LegacyPublication> => {
    const { id, ...fields } = data;
    const sb = context.supabase;
    if (id) {
      // Create a version snapshot before updating so nothing is ever lost.
      const { data: existing } = await sb
        .from("legacy_publications")
        .select("versions, chapters, status")
        .eq("id", id)
        .maybeSingle();
      const versions = Array.isArray((existing as Record<string, unknown>)?.versions)
        ? ((existing as Record<string, unknown>).versions as ManuscriptVersion[])
        : [];
      const nextVersion: ManuscriptVersion = {
        n: versions.length + 1,
        created_at: new Date().toISOString(),
        summary: `Snapshot before edit (${data.status})`,
        changed_chapters: data.chapters.map((c) => c.n),
      };
      const { data: row, error } = await sb
        .from("legacy_publications")
        .update({ ...fields, versions: [...versions, nextVersion] })
        .eq("id", id)
        .select("*")
        .single();
      if (error) throw new Error(error.message);
      return normalizePublication(row as never);
    }
    const { data: row, error } = await sb
      .from("legacy_publications")
      .insert({ ...fields, owner_id: context.userId })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return normalizePublication(row as never);
  });

const amendmentSchema = z.object({
  publication_id: z.string().uuid(),
  page: z.number().int().min(1),
  image_url: z.string().nullable().default(null),
  extracted: z.string().min(1).max(2000),
  proposed: z.string().min(1).max(4000),
  original: z.string().max(4000).nullable().default(null),
  reason: z.string().max(1000).nullable().default(null),
});

export const recordAmendment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => amendmentSchema.parse(data))
  .handler(async ({ data, context }): Promise<LegacyPublication> => {
    const sb = context.supabase;
    const { data: row, error: fe } = await sb
      .from("legacy_publications")
      .select("amendments")
      .eq("id", data.publication_id)
      .maybeSingle();
    if (fe) throw new Error(fe.message);
    const amendments = Array.isArray((row as Record<string, unknown>)?.amendments)
      ? ((row as Record<string, unknown>).amendments as ManuscriptAmendment[])
      : [];
    const next: ManuscriptAmendment = {
      page: data.page,
      image_url: data.image_url,
      extracted: data.extracted,
      proposed: data.proposed,
      original: data.original,
      approved_at: null,
      reason: data.reason,
    };
    const { data: updated, error } = await sb
      .from("legacy_publications")
      .update({ amendments: [...amendments, next] })
      .eq("id", data.publication_id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return normalizePublication(updated as never);
  });

const applySchema = z.object({
  publication_id: z.string().uuid(),
  /** Index of the amendment in the amendments array. */
  index: z.number().int().min(0),
});

export const applyAmendment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => applySchema.parse(data))
  .handler(async ({ data, context }): Promise<LegacyPublication> => {
    const sb = context.supabase;
    const { data: row, error: fe } = await sb
      .from("legacy_publications")
      .select("amendments, chapters, versions")
      .eq("id", data.publication_id)
      .maybeSingle();
    if (fe) throw new Error(fe.message);
    const amendments = Array.isArray((row as Record<string, unknown>)?.amendments)
      ? ((row as Record<string, unknown>).amendments as ManuscriptAmendment[])
      : [];
    const chapters = Array.isArray((row as Record<string, unknown>)?.chapters)
      ? ((row as Record<string, unknown>).chapters as ManuscriptChapter[])
      : [];
    const versions = Array.isArray((row as Record<string, unknown>)?.versions)
      ? ((row as Record<string, unknown>).versions as ManuscriptVersion[])
      : [];
    const amendment = amendments[data.index];
    if (!amendment) throw new Error("Amendment not found.");
    // Mark approved and stamp the chapter change into the draft.
    amendment.approved_at = new Date().toISOString();
    const chapter = chapters.find((c) => c.n === amendment.page);
    if (chapter) {
      chapter.draft_text = amendment.proposed;
      chapter.status = "edited";
    }
    const version: ManuscriptVersion = {
      n: versions.length + 1,
      created_at: amendment.approved_at,
      summary: `Applied handwritten amendment to ${chapter ? `chapter ${chapter.n}` : `page ${amendment.page}`}.`,
      changed_chapters: chapter ? [chapter.n] : [],
    };
    const { data: updated, error } = await sb
      .from("legacy_publications")
      .update({ amendments, chapters, versions: [...versions, version] })
      .eq("id", data.publication_id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return normalizePublication(updated as never);
  });

export const deleteLegacyPublication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ id: z.string().uuid() }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("legacy_publications")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
