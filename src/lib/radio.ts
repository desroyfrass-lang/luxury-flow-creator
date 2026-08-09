// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0408 §3/§4 — Frass Radio: the audio home of Frass.
//
// Not just a radio station. Music, podcasts, audio courses, community news,
// Foundation stories, live sessions, interviews — one place for everything
// people want to hear, and a discovery engine for new artists.
// ─────────────────────────────────────────────────────────────────────────────

export type StationKey =
  | "frass-live"
  | "yaad-riddim"
  | "sunday-gospel"
  | "hill-lounge"
  | "new-releases"
  | "community-playlists";

export type RadioStation = {
  key: StationKey;
  name: string;
  genre: string;
  plain: string;
  live: boolean;
  listeners: number;
};

export const RADIO_STATIONS: RadioStation[] = [
  {
    key: "frass-live",
    name: "Frass Live",
    genre: "The main stream",
    plain: "The always-on station. Music, interviews and community news, all day.",
    live: true,
    listeners: 0,
  },
  {
    key: "yaad-riddim",
    name: "Yaad Riddim",
    genre: "Dancehall · Reggae · Afrobeats",
    plain: "Island music from the Frass community and beyond.",
    live: true,
    listeners: 0,
  },
  {
    key: "sunday-gospel",
    name: "Sunday Morning",
    genre: "Gospel · Choir · Worship",
    plain: "Sunday music, church choirs and Foundation broadcasts.",
    live: false,
    listeners: 0,
  },
  {
    key: "hill-lounge",
    name: "Hill Lounge",
    genre: "Soul · Jazz · Neo-soul",
    plain: "Slow evening listening for the Hill.",
    live: false,
    listeners: 0,
  },
  {
    key: "new-releases",
    name: "New in Frass",
    genre: "New releases",
    plain: "Everything published through the Frass Vision Network this week.",
    live: false,
    listeners: 0,
  },
  {
    key: "community-playlists",
    name: "Community Playlists",
    genre: "Member curated",
    plain: "Playlists built by members, for members.",
    live: false,
    listeners: 0,
  },
];

/** The audio home — Frass Radio is far bigger than a station list. */
export const AUDIO_SHELVES = [
  { key: "music", icon: "🎵", label: "Music", plain: "Songs, albums and singles from Frass artists." },
  { key: "podcasts", icon: "🎙", label: "Podcasts", plain: "Shows made by the community." },
  { key: "courses", icon: "📚", label: "Audio courses", plain: "Academy lessons you can listen to." },
  { key: "news", icon: "📰", label: "News & community updates", plain: "What happened in Frass this week." },
  { key: "foundation", icon: "❤️", label: "Foundation stories", plain: "Where the giving went, told by the people it reached." },
  { key: "dj", icon: "🎧", label: "Live DJ sessions", plain: "Recorded and live sets." },
  { key: "interviews", icon: "🎤", label: "Artist interviews", plain: "Conversations with the people making the work." },
  { key: "audiobooks", icon: "📖", label: "Audiobooks", plain: "Coming later — books read aloud." },
];

/** FRASS-0408 §4 — the premium designation. */
export const ORIGINALS_LABEL = "Frass Vision Studios Originals";

export const ORIGINALS_SCOPE = [
  "Original films",
  "Original documentaries",
  "Original podcasts",
  "Original music",
  "Foundation productions",
];

export const ORIGINALS_RULE =
  "Reserved for works produced or commissioned directly by Frass Vision Studios. No member work carries the Originals mark unless Frass produced or commissioned it.";

/** Artist royalty participation — always governed by the creator agreement. */
export const RADIO_ROYALTY_RULES = [
  "Artists streamed on Frass Radio participate in the royalty programme set out in their creator or artist agreement.",
  "The Financial Center shows streams, estimated earnings, payments received and pending settlements.",
  "Estimated earnings are labelled as estimates until the settlement period closes.",
  "Radio royalties post to the Music Earnings ledger — never merged with any other income.",
];

export const RADIO_REVENUE_SOURCES = [
  { key: "participation", label: "Platform participation", plain: "The agreed share defined in the creator agreement." },
  { key: "licensing", label: "Licensing", plain: "When a song or show is licensed to someone else." },
  { key: "sponsorship", label: "Sponsorship", plain: "A brand paying to support a station or show." },
  { key: "advertising", label: "Advertising", plain: "Only if advertising is ever switched on. Optional." },
  { key: "premium", label: "Premium services", plain: "Optional paid features on top of the free station." },
];

export const RADIO_DISCLOSURE =
  "Every revenue source on Frass Radio is disclosed to creators before their work is streamed. Nothing earns quietly.";

/** Discovery is the point — Radio exists to launch people. */
export const DISCOVERY_ROLES = [
  "A discovery engine for listeners.",
  "A promotional platform for released work.",
  "A launchpad for new artists.",
  "A showcase for documentaries and podcasts.",
];

export type RadioShow = {
  key: string;
  title: string;
  host: string;
  kind: "podcast" | "interview" | "session" | "foundation" | "course";
  minutes: number;
  original?: boolean;
};

export const FEATURED_SHOWS: RadioShow[] = [
  { key: "hill-talk", title: "Hill Talk", host: "Frass Community", kind: "podcast", minutes: 42 },
  { key: "made-in-fv", title: "Made in FV Studios", host: "Frass Vision Studios", kind: "interview", minutes: 28, original: true },
  { key: "foundation-hour", title: "The Foundation Hour", host: "Frass Foundation", kind: "foundation", minutes: 55, original: true },
  { key: "builder-basics", title: "Builder Basics", host: "Frass Academy", kind: "course", minutes: 18 },
  { key: "friday-set", title: "Friday Night Set", host: "Resident DJs", kind: "session", minutes: 90 },
];
