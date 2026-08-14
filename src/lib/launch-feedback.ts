// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0412 — Frass Launch Voice Feedback Program (shared, client-safe).
//
// TEMPORARY BY DESIGN. This is a Founder launch initiative, not a permanent
// platform feature. Everything lives behind `launch_program_settings.enabled`
// so the whole program can be switched off — or deleted — without touching the
// chat, composer, upload or Studio systems it sits beside.
// ─────────────────────────────────────────────────────────────────────────────

export const FEEDBACK_CATEGORIES = [
  { id: "feature", label: "Feature Request" },
  { id: "bug", label: "Bug Report" },
  { id: "general", label: "General Feedback" },
  { id: "experience", label: "User Experience" },
  { id: "performance", label: "Performance" },
  { id: "idea", label: "New Idea" },
  { id: "compliment", label: "Compliment" },
  { id: "other", label: "Other" },
] as const;

export type FeedbackCategoryId = (typeof FEEDBACK_CATEGORIES)[number]["id"];

export function categoryLabel(id: string): string {
  return FEEDBACK_CATEGORIES.find((c) => c.id === id)?.label ?? "Other";
}

/** Surfaces allowed to open the recorder. Used for founder-side reporting. */
export const FEEDBACK_SOURCES = ["daily", "chat", "studio", "workspace"] as const;
export type FeedbackSource = (typeof FEEDBACK_SOURCES)[number];

export const FEEDBACK_STATUSES = [
  { id: "new", label: "New" },
  { id: "reviewing", label: "Reviewing" },
  { id: "planned", label: "Planned" },
  { id: "implemented", label: "Implemented" },
  { id: "archived", label: "Archived" },
] as const;

export type FeedbackStatusId = (typeof FEEDBACK_STATUSES)[number]["id"];

export function statusLabel(id: string): string {
  return FEEDBACK_STATUSES.find((s) => s.id === id)?.label ?? id;
}

/** Consent copy shown before the mic ever opens. everyday language, on purpose. */
export const CONSENT_POINTS = [
  "Your recording is used only to improve Frass during the launch program.",
  "Nothing you send is published anywhere without your explicit permission.",
  "Taking part is completely voluntary.",
  "This program is temporary and will be retired after launch.",
];

export const LAUNCH_FEEDBACK_BUCKET = "launch-feedback";

export const MAX_AUDIO_BYTES = 24 * 1024 * 1024; // long-form feedback welcome
export const MAX_ATTACHMENT_BYTES = 24 * 1024 * 1024;

export type FeedbackAttachment = {
  path: string;
  name: string;
  type: string;
  size: number;
};

export type VoiceFeedbackRecord = {
  id: string;
  user_id: string;
  category: string;
  source: string;
  status: string;
  audio_path: string | null;
  attachments: FeedbackAttachment[];
  duration_seconds: number | null;
  transcript: string | null;
  summary: string | null;
  themes: string[];
  sentiment: string | null;
  founder_note: string | null;
  implemented_at: string | null;
  created_at: string;
};
