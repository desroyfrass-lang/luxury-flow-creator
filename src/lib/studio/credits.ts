// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0402 — Frass AI Credits.
//
// One credit economy for every AI-powered service on the platform. Credits are
// an accounting unit for real compute, not a game score.
//
// Anchor: 1,000 Frass AI Credits ≈ US$1.00 of member-facing AI compute.
// Each rate below is derived from the underlying provider's usage price with a
// sustainability margin, so the ledger stays tied to actual infrastructure cost.
// Manual editing is always free — only AI operations consume credits.
// ─────────────────────────────────────────────────────────────────────────────

export const CREDITS_PER_USD = 1000;

export type CreditUnit = "second" | "minute" | "image" | "job" | "1k-chars";

export type StudioOperation = {
  key: string;
  label: string;
  /** Everyday-language description shown in the forecast. */
  what: string;
  group: "generation" | "editing" | "audio" | "language" | "delivery" | "intelligence";
  unit: CreditUnit;
  /** Credits per unit of work. */
  rate: number;
  /** Sensible default quantity when Frassy forecasts without a stated length. */
  defaultQty: number;
  /** Rough seconds of processing per unit — used for the time estimate. */
  secondsPerUnit: number;
};

export const STUDIO_OPERATIONS: StudioOperation[] = [
  // Generation — the expensive end. Video generation dominates every forecast.
  {
    key: "ai-video-generation",
    label: "AI video generation",
    what: "Frassy generates new footage from your direction.",
    group: "generation",
    unit: "second",
    rate: 120,
    defaultQty: 8,
    secondsPerUnit: 12,
  },
  {
    key: "ai-broll",
    label: "AI B-roll",
    what: "Supporting shots generated to cover cuts.",
    group: "generation",
    unit: "second",
    rate: 90,
    defaultQty: 8,
    secondsPerUnit: 10,
  },
  {
    key: "ai-image",
    label: "AI image generation",
    what: "Stills, thumbnails, illustrations, motion backgrounds.",
    group: "generation",
    unit: "image",
    rate: 40,
    defaultQty: 1,
    secondsPerUnit: 8,
  },
  {
    key: "ai-animation",
    label: "AI animation",
    what: "Animated titles, logos, and graphic moves.",
    group: "generation",
    unit: "second",
    rate: 35,
    defaultQty: 5,
    secondsPerUnit: 4,
  },
  {
    key: "ai-music",
    label: "AI music & sound design",
    what: "Original score or sound effects built for the cut.",
    group: "generation",
    unit: "minute",
    rate: 220,
    defaultQty: 1,
    secondsPerUnit: 25,
  },
  {
    key: "ai-avatar",
    label: "AI avatar presenter",
    what: "A presenter performs your script on camera.",
    group: "generation",
    unit: "minute",
    rate: 900,
    defaultQty: 1,
    secondsPerUnit: 60,
  },

  // Editing
  {
    key: "background-replace",
    label: "Background replacement",
    what: "Frassy isolates the subject and rebuilds the scene behind them.",
    group: "editing",
    unit: "minute",
    rate: 84,
    defaultQty: 1,
    secondsPerUnit: 45,
  },
  {
    key: "object-removal",
    label: "Object removal",
    what: "Unwanted elements painted out frame by frame.",
    group: "editing",
    unit: "minute",
    rate: 96,
    defaultQty: 1,
    secondsPerUnit: 50,
  },
  {
    key: "smart-reframe",
    label: "Smart reframing",
    what: "Reframes for vertical, square, or wide without losing the subject.",
    group: "editing",
    unit: "minute",
    rate: 18,
    defaultQty: 1,
    secondsPerUnit: 8,
  },
  {
    key: "color-grade",
    label: "Colour match & grade",
    what: "Shots matched to one consistent look.",
    group: "editing",
    unit: "minute",
    rate: 12,
    defaultQty: 1,
    secondsPerUnit: 6,
  },
  {
    key: "upscale",
    label: "Video upscaling",
    what: "Resolution and detail rebuilt to a higher standard.",
    group: "editing",
    unit: "minute",
    rate: 140,
    defaultQty: 1,
    secondsPerUnit: 60,
  },
  {
    key: "silence-removal",
    label: "Silence & filler removal",
    what: "Dead air and filler words cut automatically.",
    group: "editing",
    unit: "minute",
    rate: 6,
    defaultQty: 1,
    secondsPerUnit: 3,
  },
  {
    key: "scene-detect",
    label: "Scene detection & chapters",
    what: "The cut is read and broken into chapters.",
    group: "editing",
    unit: "minute",
    rate: 5,
    defaultQty: 1,
    secondsPerUnit: 3,
  },

  // Audio
  {
    key: "voice-enhance",
    label: "Voice enhancement",
    what: "Noise reduction, levelling, and clarity on the voice track.",
    group: "audio",
    unit: "minute",
    rate: 35,
    defaultQty: 1,
    secondsPerUnit: 10,
  },
  {
    key: "ai-master",
    label: "AI mastering",
    what: "Final loudness, EQ, and dynamics for the destination.",
    group: "audio",
    unit: "minute",
    rate: 22,
    defaultQty: 1,
    secondsPerUnit: 8,
  },
  {
    key: "voice-generation",
    label: "AI voice generation",
    what: "Narration performed from your script.",
    group: "audio",
    unit: "1k-chars",
    rate: 60,
    defaultQty: 1,
    secondsPerUnit: 12,
  },
  {
    key: "voice-clone",
    label: "Voice cloning",
    what: "Your own voice, with written consent on file.",
    group: "audio",
    unit: "minute",
    rate: 180,
    defaultQty: 1,
    secondsPerUnit: 40,
  },

  // Language
  {
    key: "subtitles",
    label: "Subtitle generation",
    what: "Accurate captions, timed to the cut.",
    group: "language",
    unit: "minute",
    rate: 8,
    defaultQty: 1,
    secondsPerUnit: 5,
  },
  {
    key: "translation",
    label: "Translation",
    what: "Subtitles and script translated to another language.",
    group: "language",
    unit: "minute",
    rate: 14,
    defaultQty: 1,
    secondsPerUnit: 6,
  },
  {
    key: "dubbing",
    label: "Dubbing",
    what: "A translated voice track performed over the cut.",
    group: "language",
    unit: "minute",
    rate: 210,
    defaultQty: 1,
    secondsPerUnit: 50,
  },
  {
    key: "lip-sync",
    label: "Lip-sync",
    what: "Mouth movement matched to the new language.",
    group: "language",
    unit: "minute",
    rate: 320,
    defaultQty: 1,
    secondsPerUnit: 70,
  },

  // Intelligence & delivery
  {
    key: "script",
    label: "Script & story pass",
    what: "Frassy writes or restructures the story.",
    group: "intelligence",
    unit: "job",
    rate: 25,
    defaultQty: 1,
    secondsPerUnit: 15,
  },
  {
    key: "highlights",
    label: "Highlight & clip finder",
    what: "The strongest moments pulled out as social clips.",
    group: "intelligence",
    unit: "minute",
    rate: 16,
    defaultQty: 1,
    secondsPerUnit: 6,
  },
  {
    key: "doc-assembly",
    label: "Documentary assembly",
    what: "A long-form edit assembled from your footage library.",
    group: "intelligence",
    unit: "minute",
    rate: 65,
    defaultQty: 5,
    secondsPerUnit: 20,
  },
  {
    key: "multi-export",
    label: "Multi-format export",
    what: "One cut rendered for every destination you publish to.",
    group: "delivery",
    unit: "job",
    rate: 30,
    defaultQty: 1,
    secondsPerUnit: 20,
  },

  // FRASS-0406 — Phone Content Mode™ restoration passes. Priced low on purpose:
  // rescuing a phone recording must never cost more than the shoot did.
  {
    key: "phone-stabilise",
    label: "AI stabilisation",
    what: "Handheld shake removed and camera movement smoothed.",
    group: "editing",
    unit: "minute",
    rate: 20,
    defaultQty: 1,
    secondsPerUnit: 12,
  },
  {
    key: "phone-exposure",
    label: "Exposure & dynamic range",
    what: "Brightness evened out where the phone re-metered mid-shot.",
    group: "editing",
    unit: "minute",
    rate: 10,
    defaultQty: 1,
    secondsPerUnit: 6,
  },
  {
    key: "phone-lowlight",
    label: "Low-light & video denoise",
    what: "Dark footage lifted and sensor grain cleaned.",
    group: "editing",
    unit: "minute",
    rate: 26,
    defaultQty: 1,
    secondsPerUnit: 14,
  },
  {
    key: "phone-detail",
    label: "Detail recovery",
    what: "Edge detail rebuilt after in-camera compression.",
    group: "editing",
    unit: "minute",
    rate: 16,
    defaultQty: 1,
    secondsPerUnit: 9,
  },
  {
    key: "phone-optics",
    label: "Lens & rolling-shutter correction",
    what: "Edge distortion straightened and pan wobble removed.",
    group: "editing",
    unit: "minute",
    rate: 22,
    defaultQty: 1,
    secondsPerUnit: 12,
  },
  {
    key: "phone-noise",
    label: "Environment noise removal",
    what: "Wind, traffic, hum, and room echo taken off the recording.",
    group: "audio",
    unit: "minute",
    rate: 18,
    defaultQty: 1,
    secondsPerUnit: 8,
  },
  {
    key: "phone-stems",
    label: "Vocal & instrument separation",
    what: "The recording split into vocal and backing stems.",
    group: "audio",
    unit: "minute",
    rate: 45,
    defaultQty: 1,
    secondsPerUnit: 20,
  },
];


export const OPERATION_BY_KEY = new Map(STUDIO_OPERATIONS.map((o) => [o.key, o]));

/** Things that are always free. Listed so the Studio can say so out loud. */
export const FREE_CAPABILITIES = [
  "Opening the Studio",
  "Uploading and organising media",
  "Manual timeline editing — trim, split, ripple, slip, slide",
  "Keyframes, speed ramps, markers, multicam",
  "Preview and playback",
  "Saving drafts and versions",
  "Brand library and templates",
  "Sharing and commenting",
];

export type ForecastLine = {
  key: string;
  label: string;
  what: string;
  qty: number;
  unit: CreditUnit;
  credits: number;
};

export type Forecast = {
  request: string;
  lines: ForecastLine[];
  total: number;
  seconds: number;
  /** Frassy's cheaper alternative, when one exists. */
  saving?: { note: string; credits: number };
};

export function unitLabel(unit: CreditUnit, qty: number): string {
  const plural = qty === 1 ? "" : "s";
  if (unit === "1k-chars") return `${qty}k character${plural}`;
  return `${qty} ${unit}${plural}`;
}

export function buildForecast(
  request: string,
  items: Array<{ key: string; qty?: number }>,
): Forecast {
  const lines: ForecastLine[] = [];
  let seconds = 0;
  for (const item of items) {
    const op = OPERATION_BY_KEY.get(item.key);
    if (!op) continue;
    const qty = Math.max(1, Math.round(item.qty ?? op.defaultQty));
    lines.push({
      key: op.key,
      label: op.label,
      what: op.what,
      qty,
      unit: op.unit,
      credits: op.rate * qty,
    });
    seconds += op.secondsPerUnit * qty;
  }
  const total = lines.reduce((sum, l) => sum + l.credits, 0);

  // Credit Intelligence — the cheapest honest alternative Frassy can offer.
  let saving: Forecast["saving"];
  const generative = lines.filter((l) => l.key === "ai-video-generation" || l.key === "ai-broll");
  if (generative.length > 0) {
    const reuse = generative.reduce((s, l) => s + Math.round(l.credits * 0.6), 0);
    saving = {
      note: "Reuse footage already in your Vault instead of generating new shots.",
      credits: reuse,
    };
  }

  return { request, lines, total, seconds, saving };
}

export function usdFor(credits: number): string {
  return `$${(credits / CREDITS_PER_USD).toFixed(2)}`;
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.max(5, Math.round(seconds))} seconds`;
  const mins = Math.round(seconds / 60);
  return `${mins} minute${mins === 1 ? "" : "s"}`;
}
