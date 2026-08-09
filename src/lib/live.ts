/**
 * FRASS-0416 — Live Broadcasting Architecture.
 *
 * Frass supports two distinct forms of live broadcasting:
 *   🔴 Go Live (For Us)      — community-driven, instant, social.
 *   📻 Live on Frass Radio   — curated, scheduled, broadcast-oriented.
 *
 * Constitutional principle:
 *   Every creator should be able to share their story live.
 *   Every broadcast should have the opportunity to become lasting content.
 *   Frass transforms moments into long-term value.
 */

export type LiveDestination = "for_us" | "radio";
export type LiveStatus = "live" | "ended" | "scheduled";

export type LiveBroadcast = {
  id: string;
  host_id: string;
  host_name: string;
  host_handle: string | null;
  destination: LiveDestination;
  purpose: string;
  title: string;
  summary: string | null;
  status: LiveStatus;
  viewer_count: number;
  cover_url: string | null;
  product_links: LiveProductLink[];
  affiliate_url: string | null;
  scheduled_for: string | null;
  started_at: string;
  ended_at: string | null;
  replay_url: string | null;
  repurposed_as: string[];
  created_at: string;
};

export type LiveProductLink = {
  label: string;
  to: string;
  price?: string;
  kind?: "marketplace" | "affiliate" | "partnership";
};

export type LiveComment = {
  id: string;
  broadcast_id: string;
  author_id: string;
  author_name: string;
  body: string;
  created_at: string;
};

export type LiveGift = {
  id: string;
  broadcast_id: string;
  sender_id: string;
  sender_name: string;
  gift_key: string;
  credits: number;
  amount: number;
  currency: string;
  note: string | null;
  created_at: string;
};

/** The two destinations, stated plainly so nobody confuses them. */
export const LIVE_DESTINATIONS: {
  key: LiveDestination;
  glyph: string;
  name: string;
  home: string;
  purpose: string;
  plain: string;
  examples: string[];
}[] = [
  {
    key: "for_us",
    glyph: "🔴",
    name: "Go Live (For Us)",
    home: "/for-us",
    purpose: "Community broadcasting. Members share moments with the Frass community instantly.",
    plain:
      "Like standing up in the community hall and saying 'come see this'. No booking, no schedule — you just start.",
    examples: [
      "Creator updates",
      "Product launches",
      "Artist performances",
      "Foundation events",
      "Community celebrations",
      "Business announcements",
      "Tutorials",
      "Q&A sessions",
      "Behind-the-scenes",
      "Personal milestones",
    ],
  },
  {
    key: "radio",
    glyph: "📻",
    name: "Live on Frass Radio",
    home: "/frass-radio",
    purpose: "Professional scheduled broadcasts. Curated and broadcast-oriented rather than social.",
    plain:
      "Like a radio show with a time slot. Someone programmed it, people tune in, and it goes into the schedule.",
    examples: [
      "DJ sessions",
      "Music premieres",
      "Podcasts",
      "Artist interviews",
      "Foundation broadcasts",
      "Wellness talks",
      "Community news",
      "Educational programming",
      "Live events",
    ],
  },
];

/** Frassy's first question before any stream: "What are you going live for today?" */
export const LIVE_PURPOSES: {
  key: string;
  glyph: string;
  label: string;
  tools: string[];
  destination: LiveDestination;
}[] = [
  { key: "community", glyph: "🤝", label: "Community", destination: "for_us", tools: ["Comments", "Gifts", "Story archive"] },
  { key: "music", glyph: "🎶", label: "Music", destination: "for_us", tools: ["Audio boost", "Gifts", "Radio replay"] },
  { key: "product_launch", glyph: "🛍️", label: "Product Launch", destination: "for_us", tools: ["Marketplace products", "Affiliate links", "Checkout link"] },
  { key: "tutorial", glyph: "🧰", label: "Tutorial", destination: "for_us", tools: ["Screen notes", "Chapters", "Course export"] },
  { key: "foundation", glyph: "🌍", label: "Foundation", destination: "for_us", tools: ["Gifting", "Impact note", "Wallet routing"] },
  { key: "podcast", glyph: "🎙️", label: "Podcast", destination: "radio", tools: ["Audio-first capture", "Radio schedule", "Podcast export"] },
  { key: "gaming", glyph: "🎮", label: "Gaming", destination: "for_us", tools: ["Comments", "Clip markers"] },
  { key: "interview", glyph: "🗣️", label: "Interview", destination: "radio", tools: ["Two-guest layout", "Transcript", "Radio replay"] },
  { key: "shopping", glyph: "💫", label: "Shopping", destination: "for_us", tools: ["Live product rail", "Affiliate links", "Brand partnerships"] },
  { key: "wellness", glyph: "🌿", label: "Wellness", destination: "radio", tools: ["Calm mode", "Care Network links"] },
  { key: "other", glyph: "✨", label: "Other", destination: "for_us", tools: ["Comments", "Gifts"] },
];

export function purposeOf(key: string) {
  return LIVE_PURPOSES.find((p) => p.key === key) ?? LIVE_PURPOSES[LIVE_PURPOSES.length - 1]!;
}

/** Gifts a member can send during a For Us live stream. Credits flow through the Wallet. */
export const LIVE_GIFTS: { key: string; glyph: string; label: string; credits: number; amount: number }[] = [
  { key: "clap", glyph: "👏", label: "Clap", credits: 100, amount: 0.1 },
  { key: "palm", glyph: "🌴", label: "Palm", credits: 500, amount: 0.5 },
  { key: "gold_star", glyph: "⭐", label: "Gold Star", credits: 2_000, amount: 2 },
  { key: "crown", glyph: "👑", label: "Frass Crown", credits: 10_000, amount: 10 },
];

/** What a finished broadcast can become in FV Studios. Moments into long-term value. */
export const REPURPOSE_FORMATS: { key: string; glyph: string; label: string; note: string; to: string }[] = [
  { key: "podcast", glyph: "🎙️", label: "Podcast", note: "Audio cut, published to Frass Radio", to: "/studio" },
  { key: "clips", glyph: "✂️", label: "Short Clips", note: "Vertical highlights for socials", to: "/studio" },
  { key: "youtube", glyph: "▶️", label: "YouTube Video", note: "Full edit with intro and captions", to: "/studio" },
  { key: "course", glyph: "🎓", label: "Course", note: "Chapters become Academy lessons", to: "/academy" },
  { key: "story", glyph: "📰", label: "For Us Story", note: "Written recap in the community feed", to: "/for-us" },
  { key: "replay", glyph: "📻", label: "Frass Radio Replay", note: "Scheduled back into the station", to: "/frass-radio" },
];

/** The label the Go Live button wears, based on how many streams are running. */
export function liveButtonLabel(activeCount: number) {
  return activeCount > 0 ? `🔴 Live Now (${activeCount})` : "🔴 Go Live";
}

export function liveElapsed(startedAt: string, now = Date.now()) {
  const mins = Math.max(0, Math.floor((now - new Date(startedAt).getTime()) / 60_000));
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

export const LIVE_PRINCIPLE = [
  "Every creator should be able to share their story live.",
  "Every broadcast should have the opportunity to become lasting content.",
  "Frass transforms moments into long-term value.",
];
