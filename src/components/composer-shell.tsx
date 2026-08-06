// ─────────────────────────────────────────────────────────────────────────────
// Composer Shell — the Builder Composer *interface* only.
//
// Phase 1 of the conversation-engine rebuild: the ➕ action menu, 📷 camera and
// 🎤 voice controls are rendered exactly as designed, but every non-text action
// is intentionally inert. No file reads, no dictation, no uploads, no timers.
// Only the text field + Send are wired, so the engine keeps strict turn
// ownership. Functionality returns button-by-button after acceptance testing.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import {
  Plus,
  Camera,
  Mic,
  Send,
  Upload,
  Image as ImageIcon,
  AudioLines,
  StickyNote,
  FolderPlus,
  Workflow,
  Brain,
  ScanLine,
  Cloud,
} from "lucide-react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  disabled?: boolean;
  placeholder?: string;
  /** Phase 2 push-to-talk. Omit to keep the mic inert. */
  onMicToggle?: () => void;
  micState?: "idle" | "recording" | "busy";
};

const MENU: Array<{ id: string; label: string; icon: typeof Plus }> = [
  { id: "upload", label: "Upload File", icon: Upload },
  { id: "photo", label: "Take Photo", icon: Camera },
  { id: "image", label: "Choose Image", icon: ImageIcon },
  { id: "record", label: "Record Audio", icon: AudioLines },
  { id: "note", label: "Create Note", icon: StickyNote },
  { id: "project", label: "Create Project", icon: FolderPlus },
  { id: "workflow", label: "Create Workflow", icon: Workflow },
  { id: "memory", label: "Add Memory", icon: Brain },
  { id: "scan", label: "Scan Document", icon: ScanLine },
  { id: "cloud", label: "Import from Cloud", icon: Cloud },
];

const DISABLED_NOTE = "Coming back shortly — Frassy's conversation engine is being rebuilt.";

export function ComposerShell({
  value,
  onChange,
  onSend,
  disabled,
  placeholder,
  onMicToggle,
  micState = "idle",
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  }, [value]);

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [menuOpen]);

  const showNote = () => {
    setMenuOpen(false);
    setNote(DISABLED_NOTE);
    window.setTimeout(() => setNote(null), 2600);
  };

  const iconBtn =
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/45 transition hover:border-[color:var(--gold)]/50 hover:text-white/70";

  return (
    <div className="border-t border-white/10 px-3 py-2">
      {note && <p className="mb-2 text-[10px] leading-snug text-white/40">{note}</p>}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (disabled || !value.trim()) return;
          onSend();
        }}
        className="flex items-end gap-2"
      >
        {/* ➕ Builder actions */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            aria-label="Open Builder actions"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
            className={iconBtn}
          >
            <Plus className={`h-4 w-4 transition-transform ${menuOpen ? "rotate-45" : ""}`} />
          </button>
          {menuOpen && (
            <div className="absolute bottom-11 left-0 z-50 max-h-[min(60vh,22rem)] w-56 overflow-y-auto rounded-xl border border-white/10 bg-[#0b0c0e] p-1 shadow-2xl">
              {MENU.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={showNote}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs text-white/50 hover:bg-white/5"
                >
                  <m.icon className="h-3.5 w-3.5 text-[color:var(--gold)]/60" />
                  <span className="flex-1">{m.label}</span>
                  <span className="text-[9px] uppercase tracking-[0.18em] text-white/25">soon</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 📷 camera */}
        <button
          type="button"
          aria-label="Capture a photo or scan (temporarily unavailable)"
          onClick={showNote}
          className={iconBtn}
        >
          <Camera className="h-4 w-4" />
        </button>

        {/* 🎤 push-to-talk (Phase 2) */}
        <button
          type="button"
          aria-label={
            !onMicToggle
              ? "Talk to Frassy (temporarily unavailable)"
              : micState === "recording"
                ? "Stop recording and send to Frassy"
                : "Hold a thought — press to talk to Frassy"
          }
          onClick={onMicToggle ?? showNote}
          disabled={micState === "busy"}
          className={
            micState === "recording"
              ? "flex h-9 w-9 shrink-0 animate-pulse items-center justify-center rounded-full border border-red-400/70 bg-red-500/20 text-red-200"
              : `${iconBtn} ${micState === "busy" ? "opacity-40" : ""}`
          }
        >
          <Mic className="h-4 w-4" />
        </button>


        <textarea
          ref={textRef}
          value={value}
          rows={1}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (disabled || !value.trim()) return;
              onSend();
            }
          }}
          placeholder={disabled ? "Frassy is replying…" : (placeholder ?? "Type a message…")}
          className="max-h-32 min-h-9 flex-1 resize-none rounded-xl border border-white/15 bg-transparent px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-[color:var(--gold)] focus:outline-none disabled:opacity-60"
        />


        <button
          type="submit"
          disabled={disabled || !value.trim()}
          aria-label="Send"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color:var(--gold)] text-[color:var(--ink)] transition disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
