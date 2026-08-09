// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0412 — "Send Voice Feedback" launch widget.
//
// Deliberately self-contained: it owns its own recorder, its own upload and its
// own dialog. Deleting this file and its four mount points retires the whole
// program without touching Frassy chat, the composer or the Studio uploader.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Mic, Paperclip, Square, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { startWavRecording, type WavRecorder } from "@/lib/voice/wav-recorder";
import {
  CONSENT_POINTS,
  FEEDBACK_CATEGORIES,
  LAUNCH_FEEDBACK_BUCKET,
  MAX_ATTACHMENT_BYTES,
  MAX_AUDIO_BYTES,
  type FeedbackAttachment,
  type FeedbackSource,
} from "@/lib/launch-feedback";
import {
  getFeedbackProgramStatus,
  submitVoiceFeedback,
} from "@/lib/launch-feedback.functions";

function useProgramOpen() {
  const statusFn = useServerFn(getFeedbackProgramStatus);
  const { data } = useQuery({
    queryKey: ["launch-feedback-status"],
    queryFn: () => statusFn(),
    staleTime: 5 * 60_000,
    retry: false,
  });
  return data?.enabled ?? false;
}

async function uploadFile(userId: string, file: Blob, name: string): Promise<string> {
  const path = `${userId}/${Date.now()}-${name.replace(/[^\w.\-]+/g, "_")}`;
  const { error } = await supabase.storage
    .from(LAUNCH_FEEDBACK_BUCKET)
    .upload(path, file, { contentType: (file as File).type || "application/octet-stream" });
  if (error) throw new Error(error.message);
  return path;
}

export function VoiceFeedbackButton({
  source,
  className = "",
  label = "Send Voice Feedback",
}: {
  source: FeedbackSource;
  className?: string;
  label?: string;
}) {
  const open = useProgramOpen();
  const [dialogOpen, setDialogOpen] = useState(false);
  if (!open) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setDialogOpen(true)}
        className={`inline-flex items-center gap-2 rounded-full border border-[color:var(--gold)]/40 bg-black/40 px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-white/80 transition hover:border-[color:var(--gold)] hover:text-white ${className}`}
      >
        <span aria-hidden>🎤</span>
        {label}
      </button>
      {dialogOpen && <VoiceFeedbackDialog source={source} onClose={() => setDialogOpen(false)} />}
    </>
  );
}

function VoiceFeedbackDialog({
  source,
  onClose,
}: {
  source: FeedbackSource;
  onClose: () => void;
}) {
  const submit = useServerFn(submitVoiceFeedback);
  const [category, setCategory] = useState<string>("general");
  const [note, setNote] = useState("");
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [audio, setAudio] = useState<{ blob: Blob; name: string; seconds: number } | null>(null);
  const [extras, setExtras] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const recorderRef = useRef<WavRecorder | null>(null);

  useEffect(() => {
    if (!recording) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [recording]);

  useEffect(
    () => () => {
      recorderRef.current?.cancel();
      recorderRef.current = null;
    },
    [],
  );

  const start = useCallback(async () => {
    try {
      recorderRef.current = await startWavRecording();
      setSeconds(0);
      setRecording(true);
    } catch {
      toast.error("I couldn't reach your microphone. Check the browser permission.");
    }
  }, []);

  const stop = useCallback(async () => {
    const rec = recorderRef.current;
    recorderRef.current = null;
    setRecording(false);
    if (!rec) return;
    const blob = await rec.stop();
    if (blob.size < 2048) {
      toast.error("That recording was too short — hold the mic a moment longer.");
      return;
    }
    setAudio({ blob, name: "voice-feedback.wav", seconds });
  }, [seconds]);

  const pickAudio = (file: File) => {
    if (file.size > MAX_AUDIO_BYTES) return toast.error("That audio file is too large.");
    setAudio({ blob: file, name: file.name, seconds: 0 });
  };

  const pickExtras = (files: FileList | null) => {
    if (!files) return;
    const next = Array.from(files).filter((f) => {
      if (f.size > MAX_ATTACHMENT_BYTES) {
        toast.error(`${f.name} is too large.`);
        return false;
      }
      return true;
    });
    setExtras((cur) => [...cur, ...next].slice(0, 6));
  };

  const send = async () => {
    if (!audio && !note.trim()) {
      toast.error("Record a voice note or write a short message first.");
      return;
    }
    setBusy(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;
      if (!userId) throw new Error("Please sign in again.");

      let audioPath: string | null = null;
      if (audio) audioPath = await uploadFile(userId, audio.blob, audio.name);

      const attachments: FeedbackAttachment[] = [];
      for (const f of extras) {
        const path = await uploadFile(userId, f, f.name);
        attachments.push({ path, name: f.name, type: f.type, size: f.size });
      }

      const res = await submit({
        data: {
          category,
          source,
          audioPath,
          audioName: audio?.name ?? null,
          durationSeconds: audio?.seconds || null,
          note: note.trim() || null,
          attachments,
        },
      });
      setDone(res.summary || "Thank you — your feedback is with the Founder review queue.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong sending that.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/75 p-3 sm:items-center">
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[color:var(--gold)]/35 bg-[#0b0b0c] p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-black uppercase tracking-[0.16em] text-white">
              Send Voice Feedback
            </h2>
            <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-[color:var(--gold)]/80">
              Temporary launch program
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1 text-white/60 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {done ? (
          <div className="mt-6 space-y-4">
            <p className="text-sm text-white/85">
              Thank you — your voice is now part of how Frass gets better.
            </p>
            <p className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white/70">
              {done}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-full bg-[color:var(--gold)] px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-black"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <ul className="mt-4 space-y-1 rounded-lg border border-white/10 bg-white/5 p-3 text-[12px] leading-relaxed text-white/65">
              {CONSENT_POINTS.map((p) => (
                <li key={p}>• {p}</li>
              ))}
            </ul>

            <label className="mt-4 block text-[11px] uppercase tracking-[0.2em] text-white/50">
              What kind of feedback is this?
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-2 w-full rounded-lg border border-white/15 bg-black/60 px-3 py-2 text-sm text-white"
            >
              {FEEDBACK_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              {!recording ? (
                <button
                  type="button"
                  onClick={start}
                  className="inline-flex items-center gap-2 rounded-full border border-[color:var(--gold)]/50 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white"
                >
                  <Mic className="h-4 w-4" /> {audio ? "Record again" : "Record"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stop}
                  className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white"
                >
                  <Square className="h-4 w-4" /> Stop · {seconds}s
                </button>
              )}

              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.18em] text-white/70 hover:text-white">
                Upload audio
                <input
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && pickAudio(e.target.files[0])}
                />
              </label>
            </div>

            {audio && (
              <p className="mt-2 text-xs text-white/60">
                Attached: {audio.name}
                {audio.seconds ? ` · ${audio.seconds}s` : ""}
              </p>
            )}

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Add anything you'd rather type (optional)…"
              className="mt-4 w-full rounded-lg border border-white/15 bg-black/60 px-3 py-2 text-sm text-white placeholder:text-white/35"
            />

            <label className="mt-3 inline-flex cursor-pointer items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/60 hover:text-white">
              <Paperclip className="h-4 w-4" /> Add screenshot or screen recording
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={(e) => pickExtras(e.target.files)}
              />
            </label>
            {extras.length > 0 && (
              <ul className="mt-2 space-y-1 text-xs text-white/55">
                {extras.map((f, i) => (
                  <li key={`${f.name}-${i}`} className="flex items-center justify-between gap-2">
                    <span className="truncate">{f.name}</span>
                    <button
                      type="button"
                      className="text-white/40 hover:text-white"
                      onClick={() => setExtras((cur) => cur.filter((_, j) => j !== i))}
                    >
                      remove
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <button
              type="button"
              onClick={send}
              disabled={busy || recording}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--gold)] px-4 py-2.5 text-xs font-black uppercase tracking-[0.2em] text-black disabled:opacity-50"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {busy ? "Sending to Frassy" : "Send to Frassy"}
            </button>
            <p className="mt-2 text-center text-[11px] text-white/40">
              Frassy transcribes and summarises this for the Founder review queue.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
