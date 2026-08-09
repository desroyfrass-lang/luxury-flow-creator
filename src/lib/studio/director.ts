// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0401 — Frass Vision Studios (FV Studio) AI Director.
//
// The Director is the primary editing interface: the creator says what they
// want, Frassy translates it into concrete operations, forecasts the cost, and
// explains her reasoning in plain language (Learning Mode).
// ─────────────────────────────────────────────────────────────────────────────

import { buildForecast, type Forecast } from "./credits";

export type DirectorPlan = {
  understanding: string;
  forecast: Forecast;
  /** Learning Mode — why she is making these calls. */
  reasoning: string[];
  manual: string;
};

type Rule = {
  match: RegExp;
  ops: Array<{ key: string; qty?: number }>;
  understanding: string;
  reasoning: string[];
  manual: string;
};

const RULES: Rule[] = [
  {
    match: /cinematic|film look|movie|dramatic/i,
    ops: [{ key: "color-grade", qty: 3 }, { key: "ai-music", qty: 1 }, { key: "ai-master" }],
    understanding: "Give the cut a cinematic finish.",
    reasoning: [
      "Cinematic reads mostly as colour and sound, not new footage — so I grade first and score second.",
      "I mastered the audio afterwards because a graded picture with thin sound still feels amateur.",
    ],
    manual: "Every grade node and music cue lands on the timeline as an editable clip.",
  },
  {
    match: /background|beach|jamaic|replace the (room|scene|set)/i,
    ops: [{ key: "background-replace", qty: 2 }, { key: "color-grade", qty: 2 }],
    understanding: "Replace the background behind the subject.",
    reasoning: [
      "I matched colour after the replacement — a new background almost always shifts the skin tones.",
    ],
    manual: "The matte is a normal mask layer; you can refine edges by hand.",
  },
  {
    match: /pause|silence|filler|um|dead air|tighten/i,
    ops: [{ key: "silence-removal", qty: 5 }],
    understanding: "Remove pauses and filler words.",
    reasoning: [
      "Retention drops fastest in the first thirty seconds, so I cut hardest at the top.",
      "I left breaths under 300ms in — removing those makes speech sound robotic.",
    ],
    manual: "Every cut is a ripple edit you can undo individually.",
  },
  {
    match: /(\d+)[- ]?second|short version|cut it down|shorter/i,
    ops: [{ key: "highlights", qty: 5 }, { key: "smart-reframe", qty: 1 }, { key: "multi-export" }],
    understanding: "Build a shorter version from the strongest moments.",
    reasoning: [
      "I chose moments by emotional peak and clarity of the sentence, not by position in the file.",
    ],
    manual: "The short version opens as a nested timeline over the original.",
  },
  {
    match: /tiktok|reel|vertical|shorts|instagram/i,
    ops: [{ key: "highlights", qty: 4 }, { key: "smart-reframe", qty: 2 }, { key: "subtitles", qty: 2 }, { key: "multi-export" }],
    understanding: "Turn this into vertical social content.",
    reasoning: [
      "Vertical needs the subject re-centred every time the framing changes, so reframing runs per scene.",
      "Most social viewing is sound-off — captions are not optional here.",
    ],
    manual: "Reframe keyframes are editable; drag the safe box wherever you want it.",
  },
  {
    match: /subtitle|caption/i,
    ops: [{ key: "subtitles", qty: 5 }],
    understanding: "Generate subtitles for the whole cut.",
    reasoning: ["I time captions to phrase breaks, not fixed durations — it reads faster."],
    manual: "Each caption is a text clip you can retype or restyle.",
  },
  {
    match: /translat|spanish|french|patois|dub|another language/i,
    ops: [{ key: "translation", qty: 5 }, { key: "dubbing", qty: 5 }, { key: "lip-sync", qty: 5 }],
    understanding: "Produce a translated, dubbed version.",
    reasoning: [
      "Dubbing without lip-sync looks off on close-ups, so I included it — drop it to save most of this cost.",
    ],
    manual: "The translated track sits on its own audio lane; the original stays untouched.",
  },
  {
    match: /b-?roll|cutaway|footage to cover/i,
    ops: [{ key: "ai-broll", qty: 12 }, { key: "color-grade", qty: 2 }],
    understanding: "Generate B-roll to cover the cuts.",
    reasoning: ["Generated shots are graded to your main footage so they don't read as stock."],
    manual: "Generated clips are labelled AI and trim like any other clip.",
  },
  {
    match: /generate|create a video|make a (video|commercial|ad)|scene/i,
    ops: [{ key: "script" }, { key: "ai-video-generation", qty: 24 }, { key: "ai-music", qty: 1 }, { key: "voice-generation", qty: 2 }, { key: "multi-export" }],
    understanding: "Generate a new video from your direction.",
    reasoning: [
      "I write the story pass first — generating footage before the story is decided wastes the most credits.",
      "Twenty-four seconds is three eight-second shots, which is the shortest cut that still tells a story.",
    ],
    manual: "Every generated shot lands on the timeline separately, so you can regenerate one without touching the rest.",
  },
  {
    match: /clean(up)? the audio|noise|hiss|voice/i,
    ops: [{ key: "voice-enhance", qty: 5 }, { key: "ai-master", qty: 5 }],
    understanding: "Clean up and master the audio.",
    reasoning: ["Noise reduction before mastering — the other order amplifies the hiss first."],
    manual: "Each processor is a mixer insert you can bypass or adjust.",
  },
  {
    match: /remove (the )?(object|person|logo|sign)/i,
    ops: [{ key: "object-removal", qty: 2 }],
    understanding: "Remove an unwanted object from the shot.",
    reasoning: ["I track the object across frames so the fill stays stable rather than flickering."],
    manual: "The removal is a masked layer — reshape it by hand at any frame.",
  },
  {
    match: /upscale|sharper|higher quality|4k/i,
    ops: [{ key: "upscale", qty: 3 }],
    understanding: "Upscale the footage.",
    reasoning: ["Upscaling is priced per minute of runtime — trim first and this gets much cheaper."],
    manual: "The upscaled render replaces the source non-destructively.",
  },
  {
    match: /podcast|documentar|long form/i,
    ops: [{ key: "doc-assembly", qty: 10 }, { key: "silence-removal", qty: 10 }, { key: "voice-enhance", qty: 10 }, { key: "subtitles", qty: 10 }],
    understanding: "Assemble a long-form edit.",
    reasoning: ["Assembly first, then cleanup — cleaning footage that ends up on the floor is wasted spend."],
    manual: "The assembly is a normal sequence; every selection can be replaced.",
  },
];

const FALLBACK: Rule = {
  match: /.*/,
  ops: [{ key: "script" }, { key: "highlights", qty: 3 }],
  understanding: "Read the project and propose an edit.",
  reasoning: [
    "I wasn't certain what you wanted, so I planned the cheapest useful step: read the material and come back with a proposal.",
  ],
  manual: "Nothing is applied until you approve the plan.",
};

export function planFromDirection(request: string): DirectorPlan {
  const rule = RULES.find((r) => r.match.test(request)) ?? FALLBACK;

  // Honour an explicit duration when the creator states one.
  const minutes = request.match(/(\d+)\s*(?:-|\s)?minute/i);
  const scale = minutes ? Math.max(1, Math.min(60, Number(minutes[1]))) : null;
  const ops = scale
    ? rule.ops.map((o) => (o.qty && o.qty > 1 ? { ...o, qty: scale } : o))
    : rule.ops;

  return {
    understanding: rule.understanding,
    forecast: buildForecast(request, ops),
    reasoning: rule.reasoning,
    manual: rule.manual,
  };
}

export const DIRECTOR_EXAMPLES = [
  "Make this more cinematic.",
  "Replace the background with a Jamaican beach.",
  "Remove every pause.",
  "Create a 30-second version.",
  "Translate this into Spanish.",
  "Generate subtitles.",
  "Turn this into a TikTok.",
];
