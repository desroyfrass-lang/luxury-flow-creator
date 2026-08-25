// FRASS-0600 — Frassy Studios.
//
// Frass Hill's permanent media production, publishing, monetization and
// content-management engine. Founder/Admin only. This file is the single map
// of the studio's vocabulary: every list the interface offers lives here, so
// the studio never drifts into two different sets of words.

export type StudioNavItem = {
  id: string;
  label: string;
  icon: string;
  /** Route path, already resolved. */
  to: string;
  /** Optional query the destination page understands. */
  search?: Record<string, string>;
  /** Everyday language — what this door is for. */
  plain: string;
};

export const STUDIO_NAV: StudioNavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: "🎬", to: "/studios", plain: "The whole studio at a glance." },
  { id: "productions", label: "Productions", icon: "🎞️", to: "/studios/productions", plain: "Everything being made." },
  { id: "create", label: "Create", icon: "✨", to: "/studios/create", plain: "Start a new production." },
  { id: "series", label: "Series", icon: "📚", to: "/studios/series", plain: "Shows, and their permanent story rules." },
  { id: "episodes", label: "Episodes", icon: "📺", to: "/studios/productions", search: { type: "full_episode" }, plain: "Only the full episodes." },
  { id: "scene-studio", label: "Scene Studio", icon: "🎥", to: "/studios/productions", plain: "Open a production and work scene by scene." },
  { id: "characters", label: "Characters", icon: "🧑🏾‍🎤", to: "/studios/characters", plain: "Recurring characters and their permanent look." },
  { id: "voices", label: "Voices", icon: "🎙️", to: "/studios/voices", plain: "Saved voices and narration." },
  { id: "locations", label: "Locations", icon: "🌴", to: "/studios/assets", search: { type: "location" }, plain: "Places your stories happen." },
  { id: "animation", label: "Animation Library", icon: "🌀", to: "/studios/animations", plain: "Reusable movement and animation." },
  { id: "assets", label: "Assets", icon: "🗂️", to: "/studios/assets", plain: "Everything reusable, in one library." },
  { id: "music", label: "Music & SFX", icon: "🎵", to: "/studios/assets", search: { type: "music" }, plain: "Music beds and sound effects." },
  { id: "thumbnails", label: "Thumbnails", icon: "🖼️", to: "/studios/assets", search: { type: "thumbnail" }, plain: "Cover art and thumbnail variants." },
  { id: "review", label: "Review Queue", icon: "✅", to: "/studios/review", plain: "What is waiting on your word." },
  { id: "publishing", label: "Publishing", icon: "🚀", to: "/studios/publishing", plain: "The queue and the calendar." },
  { id: "distribution", label: "Distribution Network", icon: "🛰️", to: "/studios/distribution", plain: "Where everything goes, and where it already went." },
  { id: "calendar", label: "Content Calendar", icon: "🗓️", to: "/studios/calendar", plain: "Every release, by day, week or month." },
  { id: "connections", label: "Platform Connections", icon: "🔌", to: "/studios/connections", plain: "Where Frass can publish, once connected." },
  { id: "monetization", label: "Frass Media Revenue", icon: "💰", to: "/studios/monetization", plain: "What the work actually earns." },
  { id: "performance", label: "Media Performance", icon: "🏆", to: "/studios/performance", plain: "What is really working, from real numbers." },
  { id: "analytics", label: "Analytics", icon: "📈", to: "/studios/analytics", plain: "How the work performs." },
  { id: "library", label: "Content Library", icon: "📦", to: "/studios/assets", search: { type: "video" }, plain: "Finished media you own." },
  { id: "jobs", label: "Generation Queue", icon: "⏳", to: "/studios/jobs", plain: "Every job waiting, running or failed." },
  { id: "providers", label: "Generation Services", icon: "🔧", to: "/studios/providers", plain: "Which service does which job." },
  { id: "usage", label: "Generation Usage", icon: "⚡", to: "/studios/usage", plain: "What generation costs, and what reuse saved." },
  { id: "settings", label: "Settings", icon: "⚙️", to: "/studios/settings", plain: "How the studio behaves." },
];

export const STUDIO_PRIMARY_NAV = ["dashboard", "create", "productions", "review", "publishing", "performance"] as const;

export const STUDIO_SECONDARY_NAV = [
  { label: "Library", ids: ["assets", "library", "locations", "animation", "music", "thumbnails"] },
  { label: "Series & Characters", ids: ["series", "episodes", "characters", "voices"] },
  { label: "Studio Tools", ids: ["scene-studio", "distribution", "calendar", "monetization", "analytics", "jobs"] },
  { label: "Settings", ids: ["settings", "connections", "providers", "usage"] },
] as const;

export function studioNavItems(ids: readonly string[]): StudioNavItem[] {
  return ids.flatMap((id) => {
    const item = STUDIO_NAV.find((candidate) => candidate.id === id);
    return item ? [item] : [];
  });
}

export const PRODUCTION_TYPES = [
  { value: "full_episode", label: "Full Episode" },
  { value: "short_episode", label: "Short Episode" },
  { value: "youtube_video", label: "YouTube Video" },
  { value: "youtube_short", label: "YouTube Short" },
  { value: "reel", label: "Reel" },
  { value: "tiktok", label: "TikTok" },
  { value: "trailer", label: "Trailer" },
  { value: "teaser", label: "Teaser" },
  { value: "promo", label: "Promo" },
  { value: "educational", label: "Educational Video" },
  { value: "music_video", label: "Music Video" },
  { value: "commercial", label: "Commercial" },
  { value: "social_clip", label: "Social Clip" },
  { value: "custom", label: "Custom" },
] as const;

export const PRODUCTION_STATUSES = [
  { value: "idea", label: "Idea", tint: "muted" },
  { value: "draft", label: "Draft", tint: "muted" },
  { value: "script", label: "Script", tint: "info" },
  { value: "storyboard", label: "Storyboard", tint: "info" },
  { value: "generating", label: "Generating", tint: "warn" },
  { value: "editing", label: "Editing", tint: "warn" },
  { value: "review", label: "Review", tint: "gold" },
  { value: "changes_required", label: "Changes Required", tint: "bad" },
  { value: "approved", label: "Approved", tint: "good" },
  { value: "scheduled", label: "Scheduled", tint: "good" },
  { value: "published", label: "Published", tint: "good" },
  { value: "archived", label: "Archived", tint: "muted" },
] as const;

export type ProductionStatus = (typeof PRODUCTION_STATUSES)[number]["value"];

export const AGE_GROUPS = ["0-3", "3-6", "6-12", "12-15", "Teen", "Adult", "General Audience"] as const;

export const AUDIENCES = ["Kids", "Family", "Teen", "Adult", "General Audience", "Builders", "Customers"] as const;

export const DESTINATIONS = [
  { value: "frass_hill", label: "Frass Hill" },
  { value: "youtube", label: "YouTube" },
  { value: "youtube_shorts", label: "YouTube Shorts" },
  { value: "tiktok", label: "TikTok" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
] as const;

export const ASPECT_RATIOS = [
  { value: "16:9", label: "Landscape 16:9" },
  { value: "9:16", label: "Portrait 9:16" },
  { value: "1:1", label: "Square 1:1" },
  { value: "custom", label: "Custom" },
] as const;

export const ASSET_TYPES = [
  { value: "character", label: "Character" },
  { value: "character_animation", label: "Character animation" },
  { value: "location", label: "Location" },
  { value: "background", label: "Background" },
  { value: "prop", label: "Prop" },
  { value: "clothing", label: "Clothing" },
  { value: "logo", label: "Logo" },
  { value: "intro", label: "Intro" },
  { value: "outro", label: "Outro" },
  { value: "transition", label: "Transition" },
  { value: "voice", label: "Voice" },
  { value: "music", label: "Music" },
  { value: "sfx", label: "SFX" },
  { value: "image", label: "Image" },
  { value: "video", label: "Video" },
  { value: "thumbnail", label: "Thumbnail" },
  { value: "template", label: "Template" },
] as const;

export const RIGHTS_STATUSES = [
  { value: "frass_owned", label: "Frass Kicks Owned", publishable: true },
  { value: "licensed", label: "Licensed", publishable: true },
  { value: "authorized", label: "Authorized", publishable: true },
  { value: "pending_review", label: "Pending Review", publishable: false },
  { value: "restricted", label: "Restricted", publishable: false },
  { value: "do_not_publish", label: "Do Not Publish", publishable: false },
] as const;

/** Rights gate — restricted work can never enter the publishing queue. */
export function canPublishRights(rights: string | null | undefined): boolean {
  return RIGHTS_STATUSES.find((r) => r.value === rights)?.publishable ?? false;
}

export const MONETIZATION_STATUSES = [
  "unknown",
  "not_eligible",
  "eligible",
  "monetization_enabled",
  "limited",
  "under_review",
  "monetization_disabled",
] as const;

export const PUBLISH_STATUSES = [
  "not_ready",
  "approved",
  "scheduled",
  "publishing",
  "published",
  "failed",
  "needs_attention",
] as const;

export const SCENE_GENERATION_STATUSES = ["not_started", "queued", "generating", "generated", "failed"] as const;
export const SCENE_APPROVAL_STATUSES = ["draft", "review", "changes_required", "approved"] as const;

export const PLATFORMS = [
  { value: "youtube", label: "YouTube", icon: "▶️" },
  { value: "tiktok", label: "TikTok", icon: "🎵" },
  { value: "instagram", label: "Instagram", icon: "📸" },
  { value: "facebook", label: "Facebook", icon: "📘" },
  { value: "frass_hill", label: "Frass Hill", icon: "🏔️" },
] as const;

/** What a master production can be cut down into. */
export const DERIVATIVE_TYPES = [
  { value: "youtube_episode", label: "Full YouTube episode", type: "youtube_video", ratio: "16:9", seconds: 600 },
  { value: "highlight_60", label: "60-second highlight", type: "social_clip", ratio: "16:9", seconds: 60 },
  { value: "youtube_short", label: "YouTube Short", type: "youtube_short", ratio: "9:16", seconds: 45 },
  { value: "instagram_reel", label: "Instagram Reel", type: "reel", ratio: "9:16", seconds: 45 },
  { value: "tiktok_clip", label: "TikTok clip", type: "tiktok", ratio: "9:16", seconds: 40 },
  { value: "teaser_15", label: "15-second teaser", type: "teaser", ratio: "9:16", seconds: 15 },
  { value: "trailer", label: "Trailer", type: "trailer", ratio: "16:9", seconds: 90 },
  { value: "hill_clip", label: "Frass Hill feed clip", type: "social_clip", ratio: "1:1", seconds: 30 },
] as const;

/** What Frassy can develop from a concept — provider-agnostic, nothing vendor-specific. */
export const FRASSY_DEVELOPMENT_OUTPUTS = [
  "Concept",
  "Synopsis",
  "Script",
  "Scene breakdown",
  "Dialogue",
  "Narration",
  "Shot suggestions",
  "Music cues",
  "Sound cues",
  "Caption copy",
  "Thumbnail concepts",
  "Platform descriptions",
  "Titles",
  "Metadata",
] as const;

export function labelFor(
  list: ReadonlyArray<{ value: string; label: string }>,
  value: string | null | undefined,
): string {
  if (!value) return "—";
  return list.find((l) => l.value === value)?.label ?? value;
}

export function prettify(value: string | null | undefined): string {
  if (!value) return "—";
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
