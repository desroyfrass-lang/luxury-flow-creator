import { useEffect, useRef, useState } from "react";
import {
  Plus,
  Camera,
  Mic,
  Send,
  X,
  FileText,
  Image as ImageIcon,
  AudioLines,
  StickyNote,
  FolderPlus,
  Workflow,
  Brain,
  ScanLine,
  Cloud,
  Upload,
  Archive,
  Table,
  Presentation,
  Video,
  Loader2,
  Check,
} from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { createVaultItem } from "@/lib/vault.functions";
import {
  COMPOSER_ACCEPT,
  formatSize,
  readAttachment,
  type BuilderAttachment,
  type BuilderAttachmentKind,
} from "@/lib/builder-attachments";

export type ComposerDictation = {
  supported: boolean;
  listening: boolean;
  interim: string;
  start: () => void;
  stop: () => void;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSend: (text: string, attachments: BuilderAttachment[]) => void;
  disabled?: boolean;
  /** "silent" = text only, "voice_text" = voice + text, "voice_only" = hands-free */
  mode: "silent" | "voice_text" | "voice_only" | "text";
  dictation?: ComposerDictation;
  placeholder?: string;
  /** Builder is signed in — Vault filing is available. */
  canSaveToVault?: boolean;
  /** Right-hand status caption under the composer. */
  hint?: string;
  variant?: "floating" | "page";
};

const KIND_ICON: Record<BuilderAttachmentKind, typeof FileText> = {
  image: ImageIcon,
  photo: Camera,
  document: FileText,
  spreadsheet: Table,
  slides: Presentation,
  audio: AudioLines,
  video: Video,
  archive: Archive,
  text: FileText,
  file: FileText,
};

const PROMPT_TEMPLATES: Record<string, string> = {
  note: "Create a note: ",
  project: "Start a new project: ",
  workflow: "Design a workflow for: ",
  memory: "Remember this about my work: ",
};

export function BuilderComposer({
  value,
  onChange,
  onSend,
  disabled,
  mode,
  dictation,
  placeholder = "Ask Frassy anything, describe an idea, upload a file, or start creating…",
  canSaveToVault = false,
  hint,
  variant = "floating",
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [attachments, setAttachments] = useState<BuilderAttachment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyRead, setBusyRead] = useState(false);
  const [saved, setSaved] = useState<Record<string, "saving" | "saved" | "error">>({});

  const fileRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const scanRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const saveToVault = useServerFn(createVaultItem);

  const voiceOnly = mode === "voice_only";
  const voiceEnabled = mode === "voice_text" || mode === "voice_only";

  // Auto-expanding text field.
  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, variant === "page" ? 220 : 128)}px`;
  }, [value, variant]);

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [menuOpen]);

  const ingest = async (files: FileList | null, capture = false) => {
    if (!files?.length) return;
    setError(null);
    setBusyRead(true);
    try {
      const read = await Promise.all(
        Array.from(files).slice(0, 5).map((f) => readAttachment(f, capture)),
      );
      setAttachments((prev) => [...prev, ...read].slice(0, 8));
    } catch (e) {
      setError(e instanceof Error ? e.message : "That file couldn't be read.");
    } finally {
      setBusyRead(false);
    }
  };

  const submit = () => {
    const text = value.trim();
    if (disabled || (!text && attachments.length === 0)) return;
    onSend(text, attachments);
    setAttachments([]);
    setSaved({});
  };

  const runMenu = (action: string) => {
    setMenuOpen(false);
    switch (action) {
      case "upload":
        fileRef.current?.click();
        break;
      case "photo":
        cameraRef.current?.click();
        break;
      case "image":
        imageRef.current?.click();
        break;
      case "scan":
        scanRef.current?.click();
        break;
      case "audio-file":
        audioRef.current?.click();
        break;
      case "record":
        dictation?.start();
        break;
      case "cloud":
        setError("Cloud import is coming to the Composer — attach the file for now.");
        break;
      default: {
        const seed = PROMPT_TEMPLATES[action];
        if (seed) {
          onChange(value ? `${value}\n${seed}` : seed);
          textRef.current?.focus();
        }
      }
    }
  };

  const fileToVault = async (a: BuilderAttachment) => {
    setSaved((s) => ({ ...s, [a.id]: "saving" }));
    try {
      await saveToVault({
        data: {
          title: a.name,
          kind: "asset",
          body: `${a.kind} · ${formatSize(a.size)} · filed from the Builder Composer.`,
          tags: [a.kind, "composer"],
        },
      });
      setSaved((s) => ({ ...s, [a.id]: "saved" }));
    } catch {
      setSaved((s) => ({ ...s, [a.id]: "error" }));
    }
  };

  const menuItems: Array<{ id: string; label: string; icon: typeof Plus; soon?: boolean }> = [
    { id: "upload", label: "Upload File", icon: Upload },
    { id: "photo", label: "Take Photo", icon: Camera },
    { id: "image", label: "Choose Image", icon: ImageIcon },
    { id: "record", label: "Record Audio", icon: AudioLines },
    { id: "note", label: "Create Note", icon: StickyNote },
    { id: "project", label: "Create Project", icon: FolderPlus },
    { id: "workflow", label: "Create Workflow", icon: Workflow },
    { id: "memory", label: "Add Memory", icon: Brain },
    { id: "scan", label: "Scan Document", icon: ScanLine },
    { id: "cloud", label: "Import from Cloud", icon: Cloud, soon: true },
  ];

  const iconBtn =
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:border-[color:var(--gold)]/60 hover:text-foreground disabled:opacity-40";

  return (
    <div
      className={
        variant === "page"
          ? "border-t border-border bg-background px-6 py-4"
          : "border-t border-border bg-background px-3 py-2"
      }
    >
      {/* hidden pickers */}
      <input
        ref={fileRef}
        type="file"
        multiple
        accept={COMPOSER_ACCEPT}
        className="hidden"
        onChange={(e) => {
          void ingest(e.target.files);
          e.target.value = "";
        }}
      />
      <input
        ref={imageRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          void ingest(e.target.files);
          e.target.value = "";
        }}
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          void ingest(e.target.files, true);
          e.target.value = "";
        }}
      />
      <input
        ref={scanRef}
        type="file"
        accept="image/*,application/pdf"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          void ingest(e.target.files, true);
          e.target.value = "";
        }}
      />
      <input
        ref={audioRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={(e) => {
          void ingest(e.target.files);
          e.target.value = "";
        }}
      />

      {/* attachment tray */}
      {attachments.length > 0 && (
        <div className="mb-2 space-y-1.5">
          {attachments.map((a) => {
            const Icon = KIND_ICON[a.kind];
            const state = saved[a.id];
            return (
              <div
                key={a.id}
                className="flex items-start gap-2 rounded-xl border border-border bg-secondary/40 px-2.5 py-2"
              >
                {a.kind === "image" || a.kind === "photo" ? (
                  <img
                    src={a.dataUrl}
                    alt={a.name}
                    className="h-10 w-10 shrink-0 rounded-md object-cover"
                  />
                ) : (
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-background text-[color:var(--gold)]">
                    <Icon className="h-4 w-4" />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-medium">{a.name}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {a.kind} · {formatSize(a.size)}
                  </div>
                  <div className="mt-1 text-[11px] leading-snug text-muted-foreground">
                    {a.suggestion}
                  </div>
                  {canSaveToVault && (
                    <button
                      type="button"
                      onClick={() => void fileToVault(a)}
                      disabled={state === "saving" || state === "saved"}
                      className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--gold)] disabled:opacity-60"
                    >
                      {state === "saving" && <Loader2 className="h-3 w-3 animate-spin" />}
                      {state === "saved" && <Check className="h-3 w-3" />}
                      {state === "saved"
                        ? "In your Vault"
                        : state === "error"
                          ? "Couldn't file it — retry"
                          : "Save to Builder Vault"}
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setAttachments((p) => p.filter((x) => x.id !== a.id))}
                  className="rounded-full p-1 text-muted-foreground hover:text-foreground"
                  aria-label={`Remove ${a.name}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {error && <p className="mb-2 text-[11px] text-destructive">{error}</p>}
      {busyRead && <p className="mb-2 text-[11px] text-muted-foreground">Reading your file…</p>}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="flex items-end gap-2"
      >
        {/* ➕ universal action menu */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Open Builder actions"
            aria-expanded={menuOpen}
            className={iconBtn}
          >
            <Plus className={`h-4 w-4 transition-transform ${menuOpen ? "rotate-45" : ""}`} />
          </button>
          {menuOpen && (
            <div className="absolute bottom-11 left-0 z-50 w-56 overflow-hidden rounded-xl border border-border bg-background p-1 shadow-2xl">
              {menuItems.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => runMenu(m.id)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs hover:bg-secondary/60"
                >
                  <m.icon className="h-3.5 w-3.5 text-[color:var(--gold)]" />
                  <span className="flex-1">{m.label}</span>
                  {m.soon && (
                    <span className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                      soon
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 📷 camera */}
        <button
          type="button"
          onClick={() => cameraRef.current?.click()}
          aria-label="Capture a photo or scan"
          className={iconBtn}
        >
          <Camera className="h-4 w-4" />
        </button>

        {/* 🎤 voice */}
        {dictation?.supported && mode !== "text" && mode !== "silent" && (
          <button
            type="button"
            onClick={() => (dictation.listening ? dictation.stop() : dictation.start())}
            aria-label={dictation.listening ? "Stop listening" : "Talk to Frassy"}
            aria-pressed={dictation.listening}
            className={`${iconBtn} ${
              dictation.listening
                ? "border-[color:var(--gold)] bg-[color:var(--gold)]/10 text-[color:var(--gold)]"
                : ""
            }`}
          >
            <Mic className="h-4 w-4" />
          </button>
        )}

        {/* text field */}
        {!voiceOnly ? (
          <textarea
            ref={textRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            rows={1}
            placeholder={placeholder}
            className="max-h-56 min-h-9 flex-1 resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--gold)]/30"
          />
        ) : (
          <div className="flex min-h-9 flex-1 items-center justify-center rounded-xl border border-dashed border-border px-3 text-xs text-muted-foreground">
            {dictation?.listening
              ? dictation.interim || "Listening…"
              : "Hands-free — Frassy is with you."}
          </div>
        )}

        {/* ➤ send — only when there's something to send */}
        {(value.trim().length > 0 || attachments.length > 0) && (
          <button
            type="submit"
            disabled={disabled}
            aria-label="Send"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        )}
      </form>

      {(hint || (voiceEnabled && dictation?.listening && !voiceOnly)) && (
        <p className="mt-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          {dictation?.listening && !voiceOnly ? `Listening… ${dictation.interim}` : hint}
        </p>
      )}
    </div>
  );
}
