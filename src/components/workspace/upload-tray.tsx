// Workspace Upload Tray — permanently docked beside the composer.
// Every intake path lives here; nothing opens another page.

import {
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  FolderOpen,
  Clipboard,
  MousePointerSquareDashed,
  Camera,
  MonitorUp,
  Mic,
  Boxes,
} from "lucide-react";

const TRAY = [
  { id: "docs", label: "Documents", icon: FileText, accept: ".pdf,.doc,.docx,.txt,.md" },
  { id: "images", label: "Images", icon: ImageIcon, accept: "image/*" },
  { id: "video", label: "Videos", icon: Video, accept: "video/*" },
  { id: "audio", label: "Audio", icon: Music, accept: "audio/*" },
  { id: "files", label: "Files", icon: FolderOpen, accept: "" },
  { id: "clipboard", label: "Clipboard", icon: Clipboard, accept: null },
  { id: "drop", label: "Drag & Drop", icon: MousePointerSquareDashed, accept: null },
  { id: "camera", label: "Camera", icon: Camera, accept: "image/*" },
  { id: "screen", label: "Screen Capture", icon: MonitorUp, accept: null },
  { id: "composer", label: "Builder Composer", icon: Boxes, accept: null },
  { id: "voice", label: "Voice", icon: Mic, accept: null },
] as const;

export function UploadTray({
  onPick,
  onMic,
  micActive,
}: {
  onPick: (label: string, files?: FileList | null) => void;
  onMic?: () => void;
  micActive?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {TRAY.map((t) => {
        const Icon = t.icon;
        const isMic = t.id === "voice";
        const chip = (
          <span className="inline-flex items-center gap-1.5">
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t.label}</span>
          </span>
        );
        const cls = `ws-chip ${isMic && micActive ? "ws-chip-live" : ""}`;

        if (t.accept) {
          return (
            <label key={t.id} className={`${cls} cursor-pointer`}>
              {chip}
              <input
                type="file"
                multiple
                accept={t.accept}
                className="sr-only"
                onChange={(e) => onPick(t.label, e.target.files)}
              />
            </label>
          );
        }
        return (
          <button
            key={t.id}
            type="button"
            className={cls}
            onClick={() => (isMic && onMic ? onMic() : onPick(t.label))}
          >
            {chip}
          </button>
        );
      })}
    </div>
  );
}
