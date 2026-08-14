// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0406 — Phone Content Mode™.
//
// Constitutional principle: creativity should never be limited by equipment.
// A creator with a smartphone should stand beside a creator with a cinema rig.
//
// This module owns three things and nothing else:
//   1. Detection — is this likely a phone recording, and how rough is it?
//   2. Enhancement registry — what we can do today vs. what is reserved for
//      future providers. Modular by design: adding a capability is one entry.
//   3. The Quality Report — current score, potential score, the recommended
//      chain, its cost in AI Credits, and the everyday-language explanation.
//
// Every enhancement maps onto an existing Frass AI Credit operation, so the
// Studio keeps one credit economy and one ledger. No parallel billing.
// ─────────────────────────────────────────────────────────────────────────────

import { buildForecast, type Forecast } from "./credits";

// ── Detection ────────────────────────────────────────────────────────────────

export type MediaProbe = {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  durationSeconds: number;
  width: number;
  height: number;
  hasVideo: boolean;
  hasAudio: boolean;
};

export type DetectionSignal = {
  label: string;
  detail: string;
  /** How strongly this points at a phone recording. */
  weight: number;
};

export type Detection = {
  isLikelyPhone: boolean;
  confidence: number; // 0–100
  signals: DetectionSignal[];
  /** Quality problems worth fixing, in plain language. */
  issues: string[];
  currentScore: number; // 0–100
  potentialScore: number; // 0–100
  orientation: "portrait" | "landscape" | "square";
  resolutionLabel: string;
  bitrateMbps: number;
};

const PHONE_NAME_PATTERNS = [
  /^img[_-]?\d/i,
  /^vid[_-]?\d/i,
  /^mov[_-]?\d/i,
  /^pxl[_-]?\d/i,
  /^dsc[_-]?\d/i,
  /whatsapp/i,
  /^screen[_-]?recording/i,
  /^video[_-]?\d{8}/i,
  /^\d{8}[_-]\d{6}/,
];

/** Common vertical phone capture heights. */
const PHONE_HEIGHTS = [720, 1080, 1280, 1440, 1920, 2160];

export function resolutionLabel(width: number, height: number): string {
  const long = Math.max(width, height);
  if (long >= 3800) return "4K";
  if (long >= 2500) return "1440p";
  if (long >= 1900) return "1080p";
  if (long >= 1200) return "720p";
  if (long > 0) return `${long}p`;
  return "unknown";
}

export function detectPhoneMedia(probe: MediaProbe): Detection {
  const signals: DetectionSignal[] = [];
  const issues: string[] = [];

  const width = probe.width || 0;
  const height = probe.height || 0;
  const ratio = width && height ? width / height : 0;
  const orientation: Detection["orientation"] =
    ratio === 0 ? "landscape" : ratio < 0.95 ? "portrait" : ratio > 1.05 ? "landscape" : "square";

  const bitrateMbps =
    probe.durationSeconds > 0
      ? (probe.sizeBytes * 8) / probe.durationSeconds / 1_000_000
      : 0;

  // Filename fingerprints — the most reliable free signal we have in-browser.
  if (PHONE_NAME_PATTERNS.some((p) => p.test(probe.fileName))) {
    signals.push({
      label: "Camera-roll filename",
      detail: `“${probe.fileName}” matches how phones name their own recordings.`,
      weight: 30,
    });
  }

  // Container: .mov / HEVC from iPhone, 3gp from older Android.
  if (/quicktime|3gpp|x-m4v/i.test(probe.mimeType) || /\.(mov|3gp|m4v)$/i.test(probe.fileName)) {
    signals.push({
      label: "Phone container format",
      detail: "This file is wrapped the way phone cameras wrap their captures.",
      weight: 20,
    });
  }

  if (probe.hasVideo && orientation === "portrait") {
    signals.push({
      label: "Vertical framing",
      detail: "Shot upright — almost always a handheld phone.",
      weight: 25,
    });
  }

  if (probe.hasVideo && PHONE_HEIGHTS.includes(Math.max(width, height))) {
    signals.push({
      label: "Standard phone resolution",
      detail: `${resolutionLabel(width, height)} is a stock phone capture size.`,
      weight: 15,
    });
  }

  if (probe.hasVideo && bitrateMbps > 0 && bitrateMbps < 12) {
    signals.push({
      label: "Compressed capture",
      detail: `About ${bitrateMbps.toFixed(1)} Mbps — phones compress hard in-camera.`,
      weight: 15,
    });
    issues.push("Compression artefacts around edges and in shadow areas.");
  }

  if (!probe.hasVideo && probe.hasAudio) {
    signals.push({
      label: "Handheld audio recording",
      detail: "Voice memo or phone recorder capture.",
      weight: 25,
    });
  }

  const confidence = Math.min(100, signals.reduce((s, x) => s + x.weight, 0));
  const isLikelyPhone = confidence >= 35;

  // ── Quality read. Honest, conservative, and always explained.
  let score = 78;
  if (probe.hasVideo) {
    const long = Math.max(width, height);
    if (long < 1200) {
      score -= 16;
      issues.push("Resolution is below 1080p — detail will soften on large screens.");
    } else if (long < 1900) {
      score -= 6;
    }
    if (bitrateMbps > 0 && bitrateMbps < 8) {
      score -= 10;
      issues.push("Low bitrate — fast motion will smear.");
    }
    if (orientation === "portrait") {
      issues.push("Vertical framing needs reframing for wide destinations.");
      score -= 3;
    }
    issues.push("Handheld movement — the frame will drift without stabilisation.");
    issues.push("Auto-exposure shifts as the phone re-meters mid-shot.");
    score -= 8;
  }
  if (probe.hasAudio) {
    issues.push("Built-in microphone: room echo, wind, and uneven levels are likely.");
    score -= 12;
  }
  if (probe.durationSeconds > 0 && probe.durationSeconds < 3) {
    issues.push("Very short clip — there is little material to analyse.");
  }

  const currentScore = Math.max(18, Math.min(96, Math.round(score)));
  const potentialScore = Math.min(97, currentScore + (probe.hasVideo ? 22 : 26));

  return {
    isLikelyPhone,
    confidence,
    signals,
    issues,
    currentScore,
    potentialScore,
    orientation,
    resolutionLabel: probe.hasVideo ? resolutionLabel(width, height) : "audio only",
    bitrateMbps,
  };
}

// ── Enhancement registry ─────────────────────────────────────────────────────
// `availability` is deliberately explicit. We never imply a capability we
// cannot run today — a provider audit moves an entry from "future" to "live".

export type Enhancement = {
  key: string;
  label: string;
  /** Plain-English: what this actually does to the recording. */
  plain: string;
  lane: "video" | "audio" | "music";
  /** The Frass AI Credit operation this bills against. */
  operation: string;
  /** Quantity multiplier per minute of material. */
  perMinute: number;
  availability: "live" | "future";
  /** Why we would apply it — used in Learning Mode. */
  because: string;
};

export const ENHANCEMENTS: Enhancement[] = [
  // Video — live today through the existing editing operations.
  {
    key: "stabilise",
    label: "AI stabilisation & motion smoothing",
    plain: "Takes the shake out of handheld footage so the frame sits still.",
    lane: "video",
    operation: "phone-stabilise",
    perMinute: 1,
    availability: "live",
    because: "Handheld drift is the single clearest sign a video was shot on a phone.",
  },
  {
    key: "exposure",
    label: "Exposure balancing & dynamic range",
    plain: "Evens out the brightness when the phone re-meters mid-shot.",
    lane: "video",
    operation: "phone-exposure",
    perMinute: 1,
    availability: "live",
    because: "Phone auto-exposure pumps; locking it after the fact makes the shot read as intentional.",
  },
  {
    key: "lowlight",
    label: "Low-light enhancement & noise reduction",
    plain: "Lifts dark footage without turning it into grain soup.",
    lane: "video",
    operation: "phone-lowlight",
    perMinute: 1,
    availability: "live",
    because: "Small sensors starve in low light — this is where phone footage loses most quality.",
  },
  {
    key: "colour",
    label: "Colour correction & grade",
    plain: "Fixes the colour cast and gives every shot one consistent look.",
    lane: "video",
    operation: "color-grade",
    perMinute: 1,
    availability: "live",
    because: "Consistent colour is what separates a production from a collection of clips.",
  },
  {
    key: "sharpen",
    label: "Detail recovery & sharpening",
    plain: "Rebuilds edge detail lost to in-camera compression.",
    lane: "video",
    operation: "phone-detail",
    perMinute: 1,
    availability: "live",
    because: "Phones compress hard in-camera; recovering edges buys back apparent resolution cheaply.",
  },
  {
    key: "upscale",
    label: "Resolution enhancement",
    plain: "Rebuilds the footage at a higher resolution.",
    lane: "video",
    operation: "upscale",
    perMinute: 1,
    availability: "live",
    because: "Only worth it when the finished cut is going to a big screen — it is the priciest step here.",
  },
  {
    key: "reframe",
    label: "Smart reframing for each platform",
    plain: "Recentres the subject so one recording works vertical, square, and wide.",
    lane: "video",
    operation: "smart-reframe",
    perMinute: 1,
    availability: "live",
    because: "One phone recording should be able to serve every destination without reshooting.",
  },
  {
    key: "lens",
    label: "Lens distortion & rolling-shutter correction",
    plain: "Straightens the bend at the edges and the wobble on fast pans.",
    lane: "video",
    operation: "phone-optics",
    perMinute: 1,
    availability: "future",
    because: "Reserved until a provider we trust can do this without warping faces.",
  },
  {
    key: "hdr",
    label: "HDR optimisation",
    plain: "Maps the footage into a high dynamic range delivery format.",
    lane: "video",
    operation: "phone-exposure",
    perMinute: 1,
    availability: "future",
    because: "Waiting on end-to-end HDR delivery support across the platforms we publish to.",
  },

  // Audio
  {
    key: "voice-isolate",
    label: "Voice isolation",
    plain: "Pulls your voice forward and pushes the world behind it.",
    lane: "audio",
    operation: "voice-enhance",
    perMinute: 1,
    availability: "live",
    because: "Clear speech matters more to an audience than picture quality. Always first.",
  },
  {
    key: "wind",
    label: "Wind, traffic & hum removal",
    plain: "Strips outdoor rumble, road noise, and electrical hum.",
    lane: "audio",
    operation: "phone-noise",
    perMinute: 1,
    availability: "live",
    because: "Outdoor and street recording is normal here — wind should not cost you the take.",
  },
  {
    key: "echo",
    label: "Echo & room reduction",
    plain: "Takes the hollow bounce out of a hard, untreated room.",
    lane: "audio",
    operation: "phone-noise",
    perMinute: 1,
    availability: "live",
    because: "Most creators record in rooms that were never built for sound.",
  },
  {
    key: "levels",
    label: "Levelling, compression & EQ",
    plain: "Keeps quiet parts audible and loud parts under control.",
    lane: "audio",
    operation: "ai-master",
    perMinute: 1,
    availability: "live",
    because: "Phone mics ride level badly; consistent loudness is what sounds expensive.",
  },
  {
    key: "loudness",
    label: "Loudness normalisation for the destination",
    plain: "Matches the platform's loudness target so nothing is turned down on upload.",
    lane: "audio",
    operation: "ai-master",
    perMinute: 1,
    availability: "live",
    because: "Every platform re-levels on ingest — meeting the target keeps your mix intact.",
  },
  {
    key: "stereo",
    label: "Stereo enhancement",
    plain: "Opens the width, where the recording can carry it.",
    lane: "audio",
    operation: "ai-master",
    perMinute: 1,
    availability: "future",
    because: "Phone mics are effectively mono; faking width usually hurts more than it helps.",
  },

  // Music Mode
  {
    key: "stems",
    label: "Vocal & instrument separation",
    plain: "Splits the recording into vocals and backing so each can be treated.",
    lane: "music",
    operation: "phone-stems",
    perMinute: 1,
    availability: "live",
    because: "You cannot clean a vocal properly while the riddim is glued to it.",
  },
  {
    key: "vocal-clean",
    label: "Vocal clean-up & clarity",
    plain: "Removes room and hiss from the vocal, then brings its presence forward.",
    lane: "music",
    operation: "voice-enhance",
    perMinute: 1,
    availability: "live",
    because: "The performance is already there — we are only removing what is in front of it.",
  },
  {
    key: "balance",
    label: "Instrumental balance & rhythm definition",
    plain: "Sets the levels between the parts and tightens the low end.",
    lane: "music",
    operation: "ai-master",
    perMinute: 1,
    availability: "live",
    because: "Definition in the bass and drums is what makes a phone recording sound produced.",
  },
  {
    key: "master-prep",
    label: "Mix-ready preparation",
    plain: "Prepares clean stems and headroom for a professional mixing engineer.",
    lane: "music",
    operation: "ai-master",
    perMinute: 1,
    availability: "live",
    because: "We improve the technical quality and stop short of replacing the artist's decisions.",
  },
];

export const ENHANCEMENT_BY_KEY = new Map(ENHANCEMENTS.map((e) => [e.key, e]));

// ── Creator presets ──────────────────────────────────────────────────────────

export type Preset = {
  key: string;
  icon: string;
  label: string;
  /** What this preset protects above everything else. */
  priority: string;
  enhancements: string[];
};

export const PRESETS: Preset[] = [
  {
    key: "music",
    icon: "🎤",
    label: "Music Performance",
    priority: "Protect the performance; clean around it, never through it.",
    enhancements: ["stems", "vocal-clean", "balance", "master-prep", "exposure", "colour"],
  },
  {
    key: "podcast",
    icon: "🎙",
    label: "Podcast",
    priority: "Speech intelligibility above all else.",
    enhancements: ["voice-isolate", "echo", "levels", "loudness"],
  },
  {
    key: "documentary",
    icon: "📹",
    label: "Documentary",
    priority: "Truthful picture, consistent voice, no gloss.",
    enhancements: ["stabilise", "exposure", "colour", "voice-isolate", "wind", "levels"],
  },
  {
    key: "short-film",
    icon: "🎬",
    label: "Short Film",
    priority: "Cinematic picture; sound that carries emotion.",
    enhancements: ["stabilise", "exposure", "lowlight", "colour", "sharpen", "voice-isolate", "levels"],
  },
  {
    key: "social",
    icon: "📱",
    label: "Social Media",
    priority: "Reads instantly on a small screen, sound-off or sound-on.",
    enhancements: ["stabilise", "exposure", "colour", "reframe", "voice-isolate", "loudness"],
  },
  {
    key: "product",
    icon: "🛍",
    label: "Product Demo",
    priority: "The product must be true to colour and sharply seen.",
    enhancements: ["stabilise", "exposure", "colour", "sharpen", "voice-isolate", "levels"],
  },
  {
    key: "education",
    icon: "🎓",
    label: "Educational Content",
    priority: "Every word understood, start to finish.",
    enhancements: ["voice-isolate", "echo", "levels", "loudness", "exposure"],
  },
  {
    key: "commercial",
    icon: "📢",
    label: "Commercial",
    priority: "Highest finish the source can honestly support.",
    enhancements: ["stabilise", "exposure", "lowlight", "colour", "sharpen", "upscale", "voice-isolate", "levels", "loudness"],
  },
  {
    key: "live",
    icon: "🎵",
    label: "Live Performance",
    priority: "Keep the room's energy; remove only what fights the music.",
    enhancements: ["stabilise", "lowlight", "colour", "stems", "vocal-clean", "balance", "wind"],
  },
];

export const PRESET_BY_KEY = new Map(PRESETS.map((p) => [p.key, p]));

/**
 * Frass Hill reality: most of our creators are recording outdoors, at community
 * events, at dancehall sessions, in the street. These are the environments the
 * defaults are tuned for — not a treated studio.
 */
export const MOBILE_FIRST_ENVIRONMENTS = [
  "Outdoor recordings",
  "Community events",
  "Dancehall sessions",
  "Live performances",
  "Interviews",
  "Street content",
  "Cultural storytelling",
];

// ── Preferences ──────────────────────────────────────────────────────────────

export type PhoneModePreference = "always" | "ask" | "off";

export const PREFERENCE_STORAGE_KEY = "frass.phone-content-mode.preference";
export const PRESET_STORAGE_KEY = "frass.phone-content-mode.preset";

export function readPreference(): PhoneModePreference {
  if (typeof window === "undefined") return "ask";
  const raw = window.localStorage.getItem(PREFERENCE_STORAGE_KEY);
  return raw === "always" || raw === "off" ? raw : "ask";
}

export function writePreference(value: PhoneModePreference) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PREFERENCE_STORAGE_KEY, value);
}

// ── Quality Report ───────────────────────────────────────────────────────────

export type QualityReport = {
  preset: Preset;
  detection: Detection;
  minutes: number;
  applied: Enhancement[];
  deferred: Enhancement[];
  forecast: Forecast;
  /** Learning Mode — what she did, and why, in plain language. */
  explanation: string[];
  summary: string;
};

export function buildQualityReport(
  detection: Detection,
  presetKey: string,
  durationSeconds: number,
  options?: { includeUpscale?: boolean; musicMode?: boolean },
): QualityReport {
  const preset = PRESET_BY_KEY.get(presetKey) ?? PRESETS[4]!;
  const minutes = Math.max(1, Math.ceil((durationSeconds || 60) / 60));

  const chosen = preset.enhancements
    .map((k) => ENHANCEMENT_BY_KEY.get(k))
    .filter((e): e is Enhancement => Boolean(e))
    .filter((e) => (options?.includeUpscale ? true : e.key !== "upscale"))
    .filter((e) => (options?.musicMode === false ? e.lane !== "music" : true))
    .filter((e) => (detection.orientation === "portrait" ? true : e.key !== "reframe"));

  const applied = chosen.filter((e) => e.availability === "live");
  const deferred = chosen.filter((e) => e.availability === "future");

  const forecast = buildForecast(
    `Phone Content Mode™ — ${preset.label}`,
    applied.map((e) => ({ key: e.operation, qty: Math.round(e.perMinute * minutes) })),
  );

  const explanation = applied.map((e) => `${e.label}: ${e.plain} ${e.because}`);
  const summary =
    `I read this as ${detection.currentScore}/100 today. Running the ${preset.label} chain should ` +
    `bring it to about ${detection.potentialScore}/100. ${preset.priority}`;

  return { preset, detection, minutes, applied, deferred, forecast, explanation, summary };
}

/** Probe a media file in the browser without uploading it anywhere. */
export function probeFile(file: File): Promise<MediaProbe> {
  const isVideo = file.type.startsWith("video/") || /\.(mp4|mov|m4v|webm|3gp|avi)$/i.test(file.name);
  return new Promise((resolve) => {
    const base: MediaProbe = {
      fileName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      durationSeconds: 0,
      width: 0,
      height: 0,
      hasVideo: isVideo,
      hasAudio: true,
    };
    if (typeof document === "undefined") {
      resolve(base);
      return;
    }
    const el = document.createElement(isVideo ? "video" : "audio") as HTMLVideoElement;
    const url = URL.createObjectURL(file);
    const done = () => {
      URL.revokeObjectURL(url);
      resolve({
        ...base,
        durationSeconds: Number.isFinite(el.duration) ? el.duration : 0,
        width: el.videoWidth ?? 0,
        height: el.videoHeight ?? 0,
      });
    };
    el.preload = "metadata";
    el.onloadedmetadata = done;
    el.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(base);
    };
    el.src = url;
  });
}
