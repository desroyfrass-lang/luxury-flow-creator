// Client-safe attachment intelligence for the Frass Builder Composer.
// Frassy should infer what an asset is — the Builder never has to explain it.

export type BuilderAttachmentKind =
  | "image"
  | "photo"
  | "document"
  | "spreadsheet"
  | "slides"
  | "audio"
  | "video"
  | "archive"
  | "text"
  | "file";

export type BuilderAttachment = {
  id: string;
  name: string;
  mime: string;
  size: number;
  kind: BuilderAttachmentKind;
  /** data: URL — used for previews and for sending to Frassy. */
  dataUrl: string;
  /** Frassy's inferred follow-up offer. */
  suggestion: string;
  /** True when the asset can be sent to the model for direct analysis. */
  analyzable: boolean;
};

export const COMPOSER_ACCEPT =
  ".pdf,.doc,.docx,.txt,.md,.csv,.xls,.xlsx,.ppt,.pptx,.zip,image/*,video/*,audio/*";

export const MAX_ATTACHMENT_BYTES = 20 * 1024 * 1024;

function extOf(name: string) {
  const i = name.lastIndexOf(".");
  return i === -1 ? "" : name.slice(i + 1).toLowerCase();
}

export function inferKind(name: string, mime: string): BuilderAttachmentKind {
  const ext = extOf(name);
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("audio/")) return "audio";
  if (mime.startsWith("video/")) return "video";
  if (ext === "pdf" || ext === "doc" || ext === "docx") return "document";
  if (ext === "csv" || ext === "xls" || ext === "xlsx") return "spreadsheet";
  if (ext === "ppt" || ext === "pptx") return "slides";
  if (ext === "zip" || ext === "rar" || ext === "7z") return "archive";
  if (ext === "txt" || ext === "md") return "text";
  return "file";
}

const SUGGESTIONS: Record<BuilderAttachmentKind, string> = {
  image: "I can analyse this image — draft a Marketplace listing, or file it in your Vault.",
  photo: "Captured. I can read what's here, turn it into notes, or file it in your Vault.",
  document: "I can summarise this document and keep the summary in your Builder Vault.",
  spreadsheet: "I can pull insights and trends out of this sheet.",
  slides: "I can summarise this deck and turn it into a working outline.",
  audio: "I can transcribe this and save the transcript to your Vault.",
  video: "I can work from what you describe here and file the clip in your Vault.",
  archive: "Tell me what's inside and I'll help you organise it.",
  text: "I can read this through and pull out what matters.",
  file: "Tell me what you'd like done with this and I'll take it from there.",
};

/** Model-analyzable inline types (images + PDF). Everything else is described, not parsed. */
export function isAnalyzable(mime: string, name: string) {
  return mime.startsWith("image/") || extOf(name) === "pdf" || mime === "application/pdf";
}

export function readAttachment(file: File, capture = false): Promise<BuilderAttachment> {
  return new Promise((resolve, reject) => {
    if (file.size > MAX_ATTACHMENT_BYTES) {
      reject(new Error(`${file.name} is larger than 20MB.`));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error(`Couldn't read ${file.name}.`));
    reader.onload = () => {
      const kind = capture && file.type.startsWith("image/") ? "photo" : inferKind(file.name, file.type);
      resolve({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: file.name || "capture",
        mime: file.type || "application/octet-stream",
        size: file.size,
        kind,
        dataUrl: String(reader.result ?? ""),
        suggestion: SUGGESTIONS[kind],
        analyzable: isAnalyzable(file.type, file.name),
      });
    };
    reader.readAsDataURL(file);
  });
}

export function describeAttachments(list: BuilderAttachment[]): string {
  if (!list.length) return "";
  return list
    .map((a) => `${a.name} (${a.kind}, ${(a.size / 1024).toFixed(0)}KB)`)
    .join("; ");
}

export function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
