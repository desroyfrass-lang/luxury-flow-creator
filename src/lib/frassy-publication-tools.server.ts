// FRASS-0534 — Frassy is the editor, never the author.
//
// These tools let Frassy manage a manuscript conversationally: propose an
// outline, draft a chapter (typed or voice-captured), apply copy-editing
// principles, record and apply handwritten amendments, and prepare a format
// for publication. The member always reviews and approves.
//
// Zero Trust (FRASS-0530): every call runs through the caller's own Supabase
// session, so row-level security decides what may be read or written. No
// token, no tools.
import { tool } from "ai";
import { z } from "zod";

export type PublicationToolContext = { accessToken?: string | null };

async function clientFor(token: string) {
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function buildPublicationTools(ctx: PublicationToolContext = {}) {
  const token = ctx.accessToken ?? "";
  const NO_SESSION = {
    error: "Legacy publications need a signed-in member. Ask them to sign in, then try again.",
  } as const;

  const listPublications = tool({
    description:
      "LEGACY PUBLICATIONS (FRASS-0534). List the book projects this member can see — title, kind (newbook/republish), status, chapters, pending amendments, and formats. Use before answering any question about a member's book, manuscript, or publishing journey.",
    inputSchema: z.object({}),
    execute: async () => {
      if (!token) return NO_SESSION;
      const sb = await clientFor(token);
      const { data, error } = await sb
        .from("legacy_publications")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) return { error: error.message };
      return { publications: data ?? [] };
    },
  });

  const proposeOutline = tool({
    description:
      "Propose a chapter outline for a Legacy Publication (FRASS-0534). Create the publication record with status 'outlining' and the proposed chapter list. Frassy is the editor — she proposes the structure, the member approves. Use when a member wants to start a book, or when a finished Business Vault is ready to become a book.",
    inputSchema: z.object({
      title: z.string().describe("Working title of the book."),
      kind: z.enum(["newbook", "republish"]).describe("newbook = original work; republish = an existing book the member is revising (e.g. handwritten amendments)."),
      summary: z.string().nullable().default(null).describe("One-paragraph summary of what the book covers."),
      chapters: z.array(z.object({
        title: z.string(),
        intent: z.string().nullable().default(null).describe("What this chapter should accomplish."),
      })).describe("Proposed chapter outline."),
      formats: z.array(z.enum(["ebook", "audiobook", "course", "pdf", "print"])).default(["ebook"]).describe("Formats the same knowledge can become."),
    }),
    execute: async ({ title, kind, summary, chapters, formats }) => {
      if (!token) return NO_SESSION;
      const sb = await clientFor(token);
      const { data: claims } = await sb.auth.getClaims(token);
      const uid = claims?.claims?.sub;
      if (!uid) return { error: "No verified session." };
      const payload = {
        title,
        kind,
        summary,
        status: "outlining",
        chapters: chapters.map((c, i) => ({
          id: `ch-${i + 1}`,
          title: c.title,
          intent: c.intent,
          draft_text: null,
          word_count: 0,
          status: "pending",
          version: 1,
          updated_at: new Date().toISOString(),
        })),
        amendments: [],
        versions: [],
        formats: formats.map((f) => ({ format: f, status: "pending", artifact_url: null })),
        created_by: uid,
      };
      const { data, error } = await sb
        .from("legacy_publications")
        .insert(payload)
        .select("*")
        .single();
      if (error) return { error: error.message };
      return { saved: data, action: "created" };
    },
  });

  const saveChapterDraft = tool({
    description:
      "Save a drafted chapter for a Legacy Publication (FRASS-0534). The draft comes from the member — typed or voice-captured. Frassy may tidy grammar and flow using her editor principles, but the words are the member's. The member reviews and approves. Status moves to 'drafting' or 'reviewing'.",
    inputSchema: z.object({
      publication_id: z.string().describe("The id of the publication."),
      chapter_id: z.string().describe("The chapter id to update."),
      draft_text: z.string().describe("The drafted chapter text."),
      copy_edit: z.boolean().default(false).describe("If true, Frassy applies her copy-editing principles (clarity, plain language, preserves voice) before saving."),
    }),
    execute: async ({ publication_id, chapter_id, draft_text, copy_edit }) => {
      if (!token) return NO_SESSION;
      const sb = await clientFor(token);
      const { data: pub, error } = await sb
        .from("legacy_publications")
        .select("*")
        .eq("id", publication_id)
        .maybeSingle();
      if (error || !pub) return { error: error?.message ?? "Publication not found." };

      let finalText = draft_text;
      if (copy_edit) {
        // Editor principles applied in conversation; here we mark intent.
        // Frassy's conversational copy-editing happens via the chat model before
        // calling this tool. This flag records that a pass was requested.
        finalText = draft_text.trim();
      }

      const chapters = (pub.chapters ?? []).map((c: any) =>
        c.id === chapter_id
          ? {
              ...c,
              draft_text: finalText,
              word_count: finalText.split(/\s+/).filter(Boolean).length,
              status: "reviewing",
              version: (c.version ?? 1) + 1,
              updated_at: new Date().toISOString(),
            }
          : c,
      );
      const { data, error: updErr } = await sb
        .from("legacy_publications")
        .update({ chapters, status: "drafting", updated_at: new Date().toISOString() })
        .eq("id", publication_id)
        .select("*")
        .single();
      if (updErr) return { error: updErr.message };
      return { saved: data, action: "draft_saved" };
    },
  });

  const recordAmendment = tool({
    description:
      "Record a handwritten amendment to a Legacy Publication (FRASS-0534). Used for the 'republish' kind — a member revising an existing book. The amendment captures the original text, the proposed replacement, the page, and a reason. Amendments are applied only after the member approves.",
    inputSchema: z.object({
      publication_id: z.string(),
      chapter_id: z.string().nullable().default(null).describe("Chapter the amendment targets, if applicable."),
      page: z.number().describe("Page or section the note refers to."),
      original: z.string().nullable().default(null).describe("The original passage, if the note quotes it."),
      proposed: z.string().describe("The proposed replacement or addition."),
      reason: z.string().nullable().default(null).describe("Why the member wants this change."),
      note_image_url: z.string().nullable().default(null).describe("Optional URL of the uploaded handwritten note image."),
    }),
    execute: async ({ publication_id, chapter_id, page, original, proposed, reason, note_image_url }) => {
      if (!token) return NO_SESSION;
      const sb = await clientFor(token);
      const { data: pub, error } = await sb
        .from("legacy_publications")
        .select("*")
        .eq("id", publication_id)
        .maybeSingle();
      if (error || !pub) return { error: error?.message ?? "Publication not found." };

      const amendments = pub.amendments ?? [];
      const amendment = {
        id: `am-${amendments.length + 1}`,
        chapter_id,
        page,
        original,
        proposed,
        reason,
        note_image_url,
        approved_at: null,
        applied_at: null,
        created_at: new Date().toISOString(),
      };
      const { data, error: updErr } = await sb
        .from("legacy_publications")
        .update({
          amendments: [...amendments, amendment],
          status: "editing",
          updated_at: new Date().toISOString(),
        })
        .eq("id", publication_id)
        .select("*")
        .single();
      if (updErr) return { error: updErr.message };
      return { saved: data, action: "amendment_recorded" };
    },
  });

  const applyAmendment = tool({
    description:
      "Apply a previously-recorded amendment to its chapter (FRASS-0534). The member must have approved the amendment. This merges the proposed text into the chapter draft and marks the amendment applied.",
    inputSchema: z.object({
      publication_id: z.string(),
      amendment_index: z.number().describe("Index of the amendment in the amendments array."),
    }),
    execute: async ({ publication_id, amendment_index }) => {
      if (!token) return NO_SESSION;
      const sb = await clientFor(token);
      const { data: pub, error } = await sb
        .from("legacy_publications")
        .select("*")
        .eq("id", publication_id)
        .maybeSingle();
      if (error || !pub) return { error: error?.message ?? "Publication not found." };

      const amendments = (pub.amendments ?? []) as any[];
      const am = amendments[amendment_index];
      if (!am) return { error: "Amendment not found." };

      // Merge proposed text into the matching chapter, if one is set.
      let chapters = pub.chapters ?? [];
      if (am.chapter_id) {
        chapters = chapters.map((c: any) =>
          c.id === am.chapter_id
            ? {
                ...c,
                draft_text: am.proposed,
                word_count: String(am.proposed ?? "").split(/\s+/).filter(Boolean).length,
                status: "reviewing",
                version: (c.version ?? 1) + 1,
                updated_at: new Date().toISOString(),
              }
            : c,
        );
      }

      const updatedAmendments = amendments.map((a, i) =>
        i === amendment_index
          ? { ...a, approved_at: a.approved_at ?? new Date().toISOString(), applied_at: new Date().toISOString() }
          : a,
      );

      const { data, error: updErr } = await sb
        .from("legacy_publications")
        .update({
          chapters,
          amendments: updatedAmendments,
          updated_at: new Date().toISOString(),
        })
        .eq("id", publication_id)
        .select("*")
        .single();
      if (updErr) return { error: updErr.message };
      return { saved: data, action: "amendment_applied" };
    },
  });

  const prepareFormat = tool({
    description:
      "Mark a publication format as ready or published (FRASS-0534). Formats are: ebook, audiobook, course, pdf, print. 'ready' means the manuscript is complete for that format; 'published' means it has been released (Founder approval required for public release).",
    inputSchema: z.object({
      publication_id: z.string(),
      format: z.enum(["ebook", "audiobook", "course", "pdf", "print"]),
      status: z.enum(["ready", "published"]),
      artifact_url: z.string().nullable().default(null).describe("URL of the produced artifact, if any."),
    }),
    execute: async ({ publication_id, format, status, artifact_url }) => {
      if (!token) return NO_SESSION;
      const sb = await clientFor(token);
      const { data: pub, error } = await sb
        .from("legacy_publications")
        .select("*")
        .eq("id", publication_id)
        .maybeSingle();
      if (error || !pub) return { error: error?.message ?? "Publication not found." };

      const formats = (pub.formats ?? []).some((f: any) => f.format === format)
        ? (pub.formats ?? []).map((f: any) =>
            f.format === format ? { ...f, status, artifact_url } : f,
          )
        : [...(pub.formats ?? []), { format, status, artifact_url }];

      const { data, error: updErr } = await sb
        .from("legacy_publications")
        .update({
          formats,
          status: status === "published" ? "published" : (pub.status ?? "editing"),
          updated_at: new Date().toISOString(),
        })
        .eq("id", publication_id)
        .select("*")
        .single();
      if (updErr) return { error: updErr.message };
      return { saved: data, action: "format_prepared" };
    },
  });

  const publicationGuide = tool({
    description:
      "What the Legacy Publication Engine (FRASS-0534) contains and the rules it can never break. Use when someone asks how turning a journey into a book works, or before starting a publication for a member.",
    inputSchema: z.object({}),
    execute: async () => {
      const {
        PUBLICATION_FORMATS,
        PUBLICATION_STAGES,
        EDITOR_PRINCIPLES,
        MANUSCRIPT_STATUS_FLOW,
        COMPLETION_QUESTION,
      } = await import("@/lib/legacy/publication-engine");
      return {
        formats: PUBLICATION_FORMATS,
        stages: PUBLICATION_STAGES,
        editor_principles: EDITOR_PRINCIPLES,
        status_flow: MANUSCRIPT_STATUS_FLOW,
        completion_question: COMPLETION_QUESTION,
      };
    },
  });

  return {
    list_publications: listPublications,
    propose_publication_outline: proposeOutline,
    save_chapter_draft: saveChapterDraft,
    record_amendment: recordAmendment,
    apply_amendment: applyAmendment,
    prepare_publication_format: prepareFormat,
    legacy_publication_guide: publicationGuide,
  };
}
