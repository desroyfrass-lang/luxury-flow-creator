// FRASS Content Experience Engine
//
// Constitutional principle: Lovable builds the publishing platform.
// Frassy and the Founder build the learning experiences.
//
// Nothing about an activity is hardcoded. Every activity is a content object
// stored in the database and rendered through one consistent Activity Player.
// The same engine is designed to power every learning district — only the
// `district` value changes.

export type ActivityStatus =
  | "draft"
  | "founder_review"
  | "approved"
  | "published"
  | "archived"
  | "retired";

/** Draft → Founder Review → Approved → Published → Archived → Retired */
export const ACTIVITY_LIFECYCLE: { status: ActivityStatus; label: string; note: string }[] = [
  { status: "draft", label: "Draft", note: "Frassy or the Founder is still writing it." },
  { status: "founder_review", label: "Founder Review", note: "Waiting for the Founder to read it." },
  { status: "approved", label: "Approved", note: "Approved, not yet visible to children." },
  { status: "published", label: "Published", note: "Live inside Kids World." },
  { status: "archived", label: "Archived", note: "Taken down, kept for reference." },
  { status: "retired", label: "Retired", note: "No longer part of the curriculum." },
];

export const ACTIVITY_STATUSES = ACTIVITY_LIFECYCLE.map((s) => s.status);

export function nextStatus(status: ActivityStatus): ActivityStatus | null {
  const i = ACTIVITY_STATUSES.indexOf(status);
  return i >= 0 && i < ACTIVITY_STATUSES.length - 1 ? ACTIVITY_STATUSES[i + 1] : null;
}

/** Districts the engine can publish into. Only the content changes. */
export const CONTENT_DISTRICTS = [
  { slug: "kids_world", label: "Children's Village · Kids World" },
  { slug: "builder_academy", label: "Builder Academy" },
  { slug: "farm_district", label: "Farm District" },
  { slug: "studio_district", label: "Studio District" },
  { slug: "dj_academy", label: "DJ Academy" },
  { slug: "builders_village", label: "Builders Village" },
  { slug: "foundation", label: "Foundation District" },
] as const;

export const DIFFICULTIES = ["gentle", "easy", "growing", "challenge"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const ACTIVITY_CATEGORIES = [
  "story",
  "music",
  "art",
  "science",
  "nature",
  "movement",
  "numbers",
  "words",
  "kindness",
  "building",
  "culture",
  "money",
] as const;

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: number;
}

export interface MediaFile {
  label: string;
  url: string;
}

export interface Slide {
  title?: string;
  body?: string;
  image?: string;
}

export interface ActivityBadge {
  name?: string;
  emoji?: string;
  description?: string;
}

/** The full content object. New fields can be added without redesign. */
export interface LearningActivity {
  id: string;
  slug: string;
  title: string;
  district: string;
  age_group: string;
  place_slug: string | null;
  category: string | null;
  difficulty: string;
  duration_minutes: number;
  learning_objective: string | null;
  description: string | null;
  hero_image: string | null;
  thumbnail: string | null;
  video_url: string | null;
  audio_url: string | null;
  story: string | null;
  instructions: string[];
  materials: string[];
  parent_guide: string | null;
  teacher_guide: string | null;
  discussion_questions: string[];
  reflection_questions: string[];
  worksheets: MediaFile[];
  coloring_pages: MediaFile[];
  downloads: MediaFile[];
  slides: Slide[];
  quiz: QuizQuestion[];
  badge: ActivityBadge;
  skills: string[];
  follow_up_slugs: string[];
  related_slugs: string[];
  seasonal_tags: string[];
  themes: string[];
  /** Extensible bucket — future media types and fields land here first. */
  extras: Record<string, unknown>;
  status: ActivityStatus;
  version: number;
  position: number;
  featured: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

const arr = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

/** Normalises a database row into a fully-populated activity object. */
export function toActivity(row: Record<string, unknown>): LearningActivity {
  return {
    ...(row as unknown as LearningActivity),
    instructions: arr<string>(row.instructions),
    materials: arr<string>(row.materials),
    discussion_questions: arr<string>(row.discussion_questions),
    reflection_questions: arr<string>(row.reflection_questions),
    worksheets: arr<MediaFile>(row.worksheets),
    coloring_pages: arr<MediaFile>(row.coloring_pages),
    downloads: arr<MediaFile>(row.downloads),
    slides: arr<Slide>(row.slides),
    quiz: arr<QuizQuestion>(row.quiz),
    badge: (row.badge as ActivityBadge) ?? {},
    skills: arr<string>(row.skills),
    follow_up_slugs: arr<string>(row.follow_up_slugs),
    related_slugs: arr<string>(row.related_slugs),
    seasonal_tags: arr<string>(row.seasonal_tags),
    themes: arr<string>(row.themes),
    extras: (row.extras as Record<string, unknown>) ?? {},
  };
}

export function durationBand(minutes: number) {
  if (minutes <= 5) return "under-5";
  if (minutes <= 15) return "5-15";
  if (minutes <= 30) return "15-30";
  return "30-plus";
}

export const DURATION_BANDS = [
  { key: "under-5", label: "Under 5 min" },
  { key: "5-15", label: "5–15 min" },
  { key: "15-30", label: "15–30 min" },
  { key: "30-plus", label: "30 min +" },
];

/** Which panels the Activity Player should show for a given activity. */
export function playerSections(a: LearningActivity) {
  return {
    video: Boolean(a.video_url),
    audio: Boolean(a.audio_url),
    read: Boolean(a.story),
    slides: a.slides.length > 0,
    steps: a.instructions.length > 0,
    questions: a.discussion_questions.length > 0 || a.reflection_questions.length > 0,
    quiz: a.quiz.length > 0,
    downloads: a.worksheets.length + a.coloring_pages.length + a.downloads.length > 0,
  };
}
