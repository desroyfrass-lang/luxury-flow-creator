// FRASS-0412 — Launch Voice Feedback Program server functions.
//
// The browser uploads audio (and optional screenshots / screen recordings)
// straight into the private `launch-feedback` bucket under its own user folder.
// This module then transcribes, summarises and files the submission.

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  LAUNCH_FEEDBACK_BUCKET,
  type FeedbackAttachment,
  type VoiceFeedbackRecord,
} from "@/lib/launch-feedback";

type AnySupabase = {
  from: (t: string) => any;
  rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown }>;
  storage: { from: (b: string) => any };
};

const GATEWAY = "https://ai.gateway.lovable.dev/v1";

async function isFounder(sb: AnySupabase, userId: string): Promise<boolean> {
  const [admin, superAdmin] = await Promise.all([
    sb.rpc("has_role", { _user_id: userId, _role: "admin" }),
    sb.rpc("has_role", { _user_id: userId, _role: "super_admin" }),
  ]);
  return Boolean(admin.data) || Boolean(superAdmin.data);
}

async function transcribe(file: Blob, filename: string, key: string): Promise<string> {
  const form = new FormData();
  form.append("model", "openai/gpt-4o-transcribe");
  form.append("file", file, filename);
  form.append(
    "prompt",
    "Transcribe this product feedback recording clearly. Domain vocabulary: Frass, Frassy, FrassKicks, Frass Hill, FV Studios, Frass Vision Studios, The Daily, For Us, Builder Vault, Marketplace, Frass Radio.",
  );
  const res = await fetch(`${GATEWAY}/audio/transcriptions`, {
    method: "POST",
    headers: { "Lovable-API-Key": key },
    body: form,
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(detail.slice(0, 300) || `Transcription failed (${res.status})`);
  }
  const data = (await res.json().catch(() => ({}))) as { text?: unknown };
  return typeof data.text === "string" ? data.text.trim() : "";
}

type Analysis = { summary: string; themes: string[]; sentiment: string; category: string | null };

async function analyse(transcript: string, key: string): Promise<Analysis> {
  const res = await fetch(`${GATEWAY}/chat/completions`, {
    method: "POST",
    headers: { "Lovable-API-Key": key, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-3.6-flash",
      messages: [
        {
          role: "system",
          content:
            "You triage launch feedback for the Frass platform. Reply with JSON only: " +
            '{"summary": "one or two everyday-language sentences", "themes": ["short topic tags"], ' +
            '"sentiment": "positive|neutral|negative|mixed", ' +
            '"category": "feature|bug|general|experience|performance|idea|compliment|other"}',
        },
        { role: "user", content: transcript.slice(0, 12000) },
      ],
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) return { summary: "", themes: [], sentiment: "neutral", category: null };
  const json = (await res.json().catch(() => null)) as any;
  const raw = json?.choices?.[0]?.message?.content;
  try {
    const parsed = JSON.parse(typeof raw === "string" ? raw : "{}");
    return {
      summary: typeof parsed.summary === "string" ? parsed.summary : "",
      themes: Array.isArray(parsed.themes) ? parsed.themes.slice(0, 6).map(String) : [],
      sentiment: typeof parsed.sentiment === "string" ? parsed.sentiment : "neutral",
      category: typeof parsed.category === "string" ? parsed.category : null,
    };
  } catch {
    return { summary: "", themes: [], sentiment: "neutral", category: null };
  }
}

type SubmitInput = {
  category: string;
  source: string;
  audioPath?: string | null;
  audioName?: string | null;
  durationSeconds?: number | null;
  note?: string | null;
  attachments?: FeedbackAttachment[];
};

export const submitVoiceFeedback = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: SubmitInput) => {
    if (!input?.category) throw new Error("Pick a feedback category first.");
    if (!input.audioPath && !input.note?.trim()) {
      throw new Error("Record a voice note or write a short message.");
    }
    return {
      category: String(input.category).slice(0, 40),
      source: String(input.source ?? "daily").slice(0, 40),
      audioPath: input.audioPath ?? null,
      audioName: input.audioName ?? "feedback.wav",
      durationSeconds: input.durationSeconds ?? null,
      note: (input.note ?? "").slice(0, 4000),
      attachments: (input.attachments ?? []).slice(0, 8),
    };
  })
  .handler(async ({ data, context }) => {
    const sb = context.supabase as unknown as AnySupabase;

    const { data: settings } = await sb
      .from("launch_program_settings")
      .select("enabled")
      .eq("id", "voice_feedback")
      .maybeSingle();
    if (settings && settings.enabled === false) {
      throw new Error("The launch feedback program is currently closed. Thank you for helping.");
    }

    let transcript = data.note.trim();
    let analysis: Analysis = { summary: "", themes: [], sentiment: "neutral", category: null };
    const key = process.env["LOVABLE_API_KEY"];

    if (data.audioPath && key) {
      const dl = await sb.storage.from(LAUNCH_FEEDBACK_BUCKET).download(data.audioPath);
      if (dl.error) throw new Error("I couldn't read that recording. Try uploading it again.");
      const spoken = await transcribe(dl.data as Blob, data.audioName || "feedback.wav", key);
      transcript = [spoken, data.note.trim()].filter(Boolean).join("\n\n");
    }

    if (transcript && key) analysis = await analyse(transcript, key);

    const { data: row, error } = await sb
      .from("voice_feedback")
      .insert({
        user_id: context.userId,
        category: data.category,
        source: data.source,
        audio_path: data.audioPath,
        attachments: data.attachments,
        duration_seconds: data.durationSeconds,
        transcript: transcript || null,
        summary: analysis.summary || null,
        themes: analysis.themes,
        sentiment: analysis.sentiment,
      })
      .select("id, summary, transcript")
      .single();
    if (error) throw new Error(error.message);

    return {
      id: row.id as string,
      summary: (row.summary as string | null) ?? "",
      transcript: (row.transcript as string | null) ?? "",
    };
  });

export const listMyVoiceFeedback = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<VoiceFeedbackRecord[]> => {
    const sb = context.supabase as unknown as AnySupabase;
    const { data, error } = await sb
      .from("voice_feedback")
      .select("*")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return (data ?? []) as VoiceFeedbackRecord[];
  });

/** Founder-only queue. */
export const listAllVoiceFeedback = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<VoiceFeedbackRecord[]> => {
    const sb = context.supabase as unknown as AnySupabase;
    if (!(await isFounder(sb, context.userId))) throw new Error("Founder access only.");
    const { data, error } = await sb
      .from("voice_feedback")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(400);
    if (error) throw new Error(error.message);
    return (data ?? []) as VoiceFeedbackRecord[];
  });

export const updateVoiceFeedback = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; status?: string; founderNote?: string }) => {
    if (!input?.id) throw new Error("Missing feedback id.");
    return {
      id: input.id,
      status: input.status ?? null,
      founderNote: input.founderNote ?? null,
    };
  })
  .handler(async ({ data, context }) => {
    const sb = context.supabase as unknown as AnySupabase;
    if (!(await isFounder(sb, context.userId))) throw new Error("Founder access only.");
    const patch: Record<string, unknown> = {};
    if (data.status) {
      patch.status = data.status;
      patch.implemented_at = data.status === "implemented" ? new Date().toISOString() : null;
    }
    if (data.founderNote !== null) patch.founder_note = data.founderNote;
    const { error } = await sb.from("voice_feedback").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getFeedbackProgramStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase as unknown as AnySupabase;
    const { data } = await sb
      .from("launch_program_settings")
      .select("enabled, notice")
      .eq("id", "voice_feedback")
      .maybeSingle();
    return {
      enabled: data ? Boolean(data.enabled) : true,
      notice: (data?.notice as string | null) ?? null,
    };
  });

export const setFeedbackProgramEnabled = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { enabled: boolean }) => ({ enabled: Boolean(input?.enabled) }))
  .handler(async ({ data, context }) => {
    const sb = context.supabase as unknown as AnySupabase;
    if (!(await isFounder(sb, context.userId))) throw new Error("Founder access only.");
    const { error } = await sb
      .from("launch_program_settings")
      .upsert({ id: "voice_feedback", enabled: data.enabled, updated_at: new Date().toISOString() });
    if (error) throw new Error(error.message);
    return { enabled: data.enabled };
  });
