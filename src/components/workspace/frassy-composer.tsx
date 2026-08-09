// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0400 — Frassy Workspace Composer.
//
// The universal AI workstation input. Not a chat box: one persistent composer
// that accepts text, voice, captures, files, folders, clipboard pastes and
// bulk drops, and hands everything to the Upload Manager for background
// processing and Frassy indexing. Every workspace uses this same component;
// only the tools shift with role permissions.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  Plus,
  Send,
  Square,
  Mic,
  Pause,
  Play,
  Loader2,
  Volume2,
  VolumeX,
  Camera,
  Video,
  Music,
  FileText,
  Image as ImageIcon,
  FolderOpen,
  FolderTree,
  Clipboard,
  Layers,
  Clapperboard,
} from "lucide-react";
import { UploadManager } from "@/components/workspace/upload-manager";
import { describeIntake, useUploadQueue, type UploadQueue } from "@/lib/workspace/upload-queue";
import { usePushToTalk } from "@/hooks/use-push-to-talk";
import { FrassyAvatar, type FrassyMood } from "@/components/workspace/frassy-avatar";


export type ComposerTool =
  | "files"
  | "folders"
  | "images"
  | "video"
  | "audio"
  | "documents"
  | "camera"
  | "record-video"
  | "clipboard";

const ALL_TOOLS: ComposerTool[] = [
  "files",
  "folders",
  "images",
  "video",
  "audio",
  "documents",
  "camera",
  "record-video",
  "clipboard",
];

const TOOL_META: Record<
  ComposerTool,
  { label: string; icon: typeof Plus; accept?: string; capture?: boolean; folder?: boolean }
> = {
  files: { label: "Files", icon: FolderOpen, accept: "" },
  folders: { label: "Folders", icon: FolderTree, folder: true },
  images: { label: "Images", icon: ImageIcon, accept: "image/*" },
  video: { label: "Video", icon: Video, accept: "video/*" },
  audio: { label: "Audio & Music", icon: Music, accept: "audio/*" },
  documents: {
    label: "Documents",
    icon: FileText,
    accept: ".pdf,.doc,.docx,.txt,.md,.csv,.xls,.xlsx,.ppt,.pptx,.zip,.json,.xml",
  },
  camera: { label: "Capture Photo", icon: Camera, accept: "image/*", capture: true },
  "record-video": { label: "Record Video", icon: Video, accept: "video/*", capture: true },
  clipboard: { label: "Paste", icon: Clipboard },
};

export type FrassyComposerProps = {
  value: string;
  onChange: (v: string) => void;
  onSend: (text: string, intake: string) => void;
  onStop?: () => void;
  loading?: boolean;
  placeholder?: string;
  tools?: ComposerTool[];
  onMic?: () => void;
  micActive?: boolean;
  micAvailable?: boolean;
  speaking?: boolean;
  onToggleSpeech?: () => void;
  onNewTopic?: () => void;
  /** Rendered above the intake bar — awareness rail, notes, project context. */
  header?: ReactNode;
  inputRef?: React.RefObject<HTMLTextAreaElement | null>;
  /** Shows the 🎬 entry that opens Frass Vision Studios (FV Studios) without losing this conversation. */
  studio?: boolean;
  /** Lets the surrounding workspace observe intake (Vault, Projects, Search). */
  onIntake?: (summary: string, queue: UploadQueue) => void;
  /**
   * Built-in voice: a microphone beside the + (dictate straight into the box)
   * and a pause/play control at the far end for Frassy's speech, plus the
   * animated Frassy presence. Used by The Daily.
   */
  voice?: boolean;
};

export function FrassyComposer({
  value,
  onChange,
  onSend,
  onStop,
  loading,
  placeholder,
  tools = ALL_TOOLS,
  onMic,
  micActive,
  micAvailable,
  speaking = true,
  onToggleSpeech,
  onNewTopic,
  header,
  inputRef,
  studio = true,
  onIntake,
  voice = false,
}: FrassyComposerProps) {
  const queue = useUploadQueue();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const ptt = usePushToTalk("daily-composer");
  const menuRef = useRef<HTMLDivElement>(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const localInput = useRef<HTMLTextAreaElement>(null);
  const textRef = inputRef ?? localInput;
  const pending = useRef<{ accept: string; capture: boolean; folder: boolean }>({
    accept: "",
    capture: false,
    folder: false,
  });

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [menuOpen]);

  const accept = (files: FileList | File[] | null, source: string) => {
    const created = queue.enqueue(files, source);
    if (!created.length) return;
    const summary = describeIntake(created);
    setNote(`Received ${summary}. Processing in the background — I'll index and link it to this project.`);
    window.setTimeout(() => setNote(null), 4200);
    onIntake?.(summary, queue);
  };

  const openPicker = (tool: ComposerTool) => {
    setMenuOpen(false);
    const meta = TOOL_META[tool];
    if (tool === "clipboard") {
      setNote("Paste directly into the composer (⌘/Ctrl + V) — files and screenshots both work.");
      window.setTimeout(() => setNote(null), 4200);
      textRef.current?.focus();
      return;
    }
    pending.current = {
      accept: meta.accept ?? "",
      capture: !!meta.capture,
      folder: !!meta.folder,
    };
    const el = fileRef.current;
    if (!el) return;
    el.value = "";
    el.accept = meta.accept ?? "";
    if (meta.capture) el.setAttribute("capture", "environment");
    else el.removeAttribute("capture");
    if (meta.folder) {
      el.setAttribute("webkitdirectory", "");
      el.setAttribute("directory", "");
    } else {
      el.removeAttribute("webkitdirectory");
      el.removeAttribute("directory");
    }
    el.click();
  };

  const submit = () => {
    const text = value.trim();
    if (!text || loading) return;
    onSend(text, describeIntake(queue.readyItems));
  };

  return (
    <div
      className={`ws-composer ${dragging ? "ws-composer-drag" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        accept(e.dataTransfer.files, "Drag & drop");
      }}
      onPaste={(e) => {
        const files = Array.from(e.clipboardData?.files ?? []);
        if (files.length) accept(files, "Clipboard");
      }}
    >
      {header}

      <input
        ref={fileRef}
        type="file"
        multiple
        className="sr-only"
        onChange={(e) => {
          const label = pending.current.folder
            ? "Folder"
            : pending.current.capture
              ? "Capture"
              : "Upload";
          accept(e.target.files, label);
        }}
      />

      <UploadManager queue={queue} />
      {note && <p className="ws-note">{note}</p>}

      {/* Intake bar — the professional toolset, not a chat attachment clip. */}
      <div className="flex flex-wrap items-center gap-1.5">
        {tools.map((t) => {
          const meta = TOOL_META[t];
          const Icon = meta.icon;
          return (
            <button key={t} type="button" className="ws-chip" onClick={() => openPicker(t)}>
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{meta.label}</span>
            </button>
          );
        })}
        {studio && (
          <Link to="/studio" className="ws-chip">
            <Clapperboard className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">FV Studios</span>
          </Link>
        )}
        {onMic && (
          <button
            type="button"
            className={`ws-chip ${micActive ? "ws-chip-live" : ""}`}
            onClick={onMic}
            disabled={!micAvailable}
            aria-label="Talk to Frassy"
          >
            <Mic className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Voice</span>
          </button>
        )}
        {queue.stats.total > 0 && (
          <span className="ws-chip pointer-events-none">
            <Layers className="h-3.5 w-3.5" />
            {queue.stats.ready}/{queue.stats.total}
          </span>
        )}
      </div>

      <form
        className="mt-2 flex items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            className="ws-icon"
            aria-label="Composer actions"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <Plus className={`h-4 w-4 transition-transform ${menuOpen ? "rotate-45" : ""}`} />
          </button>
          {menuOpen && (
            <div className="ws-composer-menu">
              {onNewTopic && (
                <button
                  type="button"
                  className="ws-composer-menu-item"
                  onClick={() => {
                    setMenuOpen(false);
                    onNewTopic();
                  }}
                >
                  <Plus className="h-3.5 w-3.5" /> New working section
                </button>
              )}
              {tools.map((t) => {
                const meta = TOOL_META[t];
                const Icon = meta.icon;
                return (
                  <button
                    key={t}
                    type="button"
                    className="ws-composer-menu-item"
                    onClick={() => openPicker(t)}
                  >
                    <Icon className="h-3.5 w-3.5" /> {meta.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <textarea
          ref={textRef}
          rows={1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder={placeholder ?? "Work with Frassy — type, talk, or drop anything in…"}
          className="ws-input"
        />

        {onToggleSpeech && (
          <button
            type="button"
            className="ws-icon"
            aria-label={speaking ? "Mute Frassy" : "Let Frassy speak"}
            onClick={onToggleSpeech}
          >
            {speaking ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
        )}

        {loading && onStop ? (
          <button type="button" className="ws-send" aria-label="Stop" onClick={onStop}>
            <Square className="h-4 w-4" />
          </button>
        ) : (
          <button type="submit" className="ws-send" aria-label="Send" disabled={!value.trim() || loading}>
            <Send className="h-4 w-4" />
          </button>
        )}
      </form>
    </div>
  );
}
