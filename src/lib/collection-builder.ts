// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0464 — Coco Vintage Collection Builder · One Piece at a Time
//
// Not a catalogue uploader. A storytelling ritual: a few pieces a day, each one
// photographed, talked about and published as a page worth reading.
//
// Extension, not replacement. Pieces are ordinary Frass Card Shop listings
// (card_listings) with a brand, a collection name, a gallery and a details
// object. Nothing about Quick Sell, the Wallet or the Marketplace is rebuilt.
//
// Architecture note: Coco Vintage is Kanko's own brand selling *through*
// FrassKicks. It is not a Frass department.
// ─────────────────────────────────────────────────────────────────────────────

export const COLLECTION_BRAND = "Coco Vintage";

/** The daily mission. Small on purpose. */
export const DAILY_GOAL = 2;
/** Honest average from photograph → published page. */
export const MINUTES_PER_PIECE = 9;

/* ── Step 1 · the shot list ──────────────────────────────────────────────── */

export type Shot = { id: string; label: string; plain: string; required: boolean };

export const SHOT_LIST: Shot[] = [
  { id: "front", label: "Front", plain: "The whole garment, flat or on a hanger, straight on.", required: true },
  { id: "back", label: "Back", plain: "Same distance, same light. Buyers always ask.", required: true },
  { id: "detail", label: "Detail", plain: "Buttons, stitching, a collar — whatever makes it special.", required: true },
  { id: "label", label: "Label", plain: "The brand tag. This is what proves the piece.", required: false },
  { id: "fabric", label: "Fabric", plain: "Close enough to see the weave.", required: false },
  { id: "special", label: "Special feature", plain: "A flaw told honestly, or the thing you fell for.", required: false },
];

export const REQUIRED_SHOTS = SHOT_LIST.filter((s) => s.required).map((s) => s.id);

/* ── Step 3 · the conversation ───────────────────────────────────────────── */

export type Prompt = { id: string; question: string; hint: string };

export const STORY_PROMPTS: Prompt[] = [
  { id: "found", question: "Where did you find it?", hint: "A market, an estate sale, a friend's attic." },
  { id: "loved", question: "Why did you love it?", hint: "First thing you noticed." },
  { id: "unique", question: "What makes it unique?", hint: "Cut, fabric, era, a detail nobody repeats." },
  { id: "style", question: "How would you style it?", hint: "What you'd wear it with." },
  { id: "season", question: "What season is it perfect for?", hint: "Warm evenings, cold mornings…" },
  { id: "reminds", question: "Does it remind you of anything?", hint: "A film, a person, a decade." },
];

/** The few facts that must be true, not invented. */
export type PieceFacts = {
  size: string;
  condition: string;
  material: string;
  price: string;
  quantity: string;
};

export const EMPTY_FACTS: PieceFacts = {
  size: "",
  condition: "",
  material: "",
  price: "",
  quantity: "1",
};

export const CONDITIONS = [
  "Excellent — barely worn",
  "Very good — light wear",
  "Good — honest vintage wear",
  "Fair — loved, with flaws noted",
] as const;

/* ── Step 4 · what Frassy drafts ─────────────────────────────────────────── */

export type PieceDraft = {
  title: string;
  description: string;
  story: string;
  styling: string[];
  features: string[];
  condition_summary: string;
  size_info: string;
  material_info: string;
  care: string;
  seo_description: string;
  keywords: string[];
  tags: string[];
};

export const EMPTY_DRAFT: PieceDraft = {
  title: "",
  description: "",
  story: "",
  styling: [],
  features: [],
  condition_summary: "",
  size_info: "",
  material_info: "",
  care: "",
  seo_description: "",
  keywords: [],
  tags: [],
};

/* ── Progress · a collection coming alive, never a percentage ────────────── */

export type CollectionProgress = {
  published: number;
  target: number;
  todayPublished: number;
  todayRemaining: number;
  estimatedMinutes: number;
  launchReady: boolean;
  sentence: string;
};

export function progressOf(
  published: number,
  target: number,
  todayPublished: number,
): CollectionProgress {
  const remaining = Math.max(0, DAILY_GOAL - todayPublished);
  const launchReady = target > 0 && published >= target;
  return {
    published,
    target,
    todayPublished,
    todayRemaining: remaining,
    estimatedMinutes: remaining * MINUTES_PER_PIECE,
    launchReady,
    sentence: launchReady
      ? `${published} pieces published. The boutique is launch ready.`
      : `${published} of ${target || "—"} pieces published.`,
  };
}

/* ── Photography coach · read the photo, then say something useful ───────── */

export type PhotoReading = { brightness: number; contrast: number; busy: number };
export type PhotoNote = { tone: "good" | "fix"; text: string };

/**
 * Measures a photo in the browser: average brightness, spread of tones, and how
 * busy the edges of the frame are (a proxy for a distracting background).
 */
export async function readPhoto(file: File): Promise<PhotoReading | null> {
  if (typeof document === "undefined") return null;
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("unreadable"));
      i.src = url;
    });
    const w = 64;
    const h = Math.max(1, Math.round((img.height / img.width) * w)) || 64;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, w, h);
    const { data } = ctx.getImageData(0, 0, w, h);

    let sum = 0;
    let sumSq = 0;
    let edge = 0;
    let edgeCount = 0;
    let prev = 0;
    const n = w * h;
    for (let p = 0; p < n; p++) {
      const i = p * 4;
      const lum = (0.2126 * data[i]! + 0.7152 * data[i + 1]! + 0.0722 * data[i + 2]!) / 255;
      sum += lum;
      sumSq += lum * lum;
      const x = p % w;
      const y = Math.floor(p / w);
      if (x < w * 0.15 || x > w * 0.85 || y < h * 0.15 || y > h * 0.85) {
        edge += Math.abs(lum - prev);
        edgeCount++;
      }
      prev = lum;
    }
    const brightness = sum / n;
    const contrast = Math.sqrt(Math.max(0, sumSq / n - brightness * brightness));
    const busy = edgeCount ? edge / edgeCount : 0;
    return { brightness, contrast, busy };
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function coachNotes(r: PhotoReading | null): PhotoNote[] {
  if (!r) return [];
  const notes: PhotoNote[] = [];
  if (r.brightness < 0.28)
    notes.push({ tone: "fix", text: "This one is dark. Move to a window and shoot with the light behind you." });
  else if (r.brightness > 0.9)
    notes.push({ tone: "fix", text: "The light has blown out the detail. Step out of direct sun." });
  if (r.contrast < 0.08)
    notes.push({ tone: "fix", text: "The garment is blending into the background. Try a plain wall in a different tone." });
  if (r.busy > 0.06)
    notes.push({ tone: "fix", text: "There's a lot happening around the edges. A cleaner backdrop makes the piece the subject." });
  if (notes.length === 0) notes.push({ tone: "good", text: "Lovely — clean light, clean background. That will photograph well on the page." });
  return notes;
}

/** Which of the three required angles are still missing. */
export function missingShots(taken: string[]): Shot[] {
  return SHOT_LIST.filter((s) => s.required && !taken.includes(s.id));
}

export function readyToTalk(taken: string[]): boolean {
  return missingShots(taken).length === 0;
}

/** Enough of the conversation to write something honest. */
export function readyToDraft(answers: Record<string, string>): boolean {
  return Object.values(answers).filter((a) => a.trim().length > 2).length >= 3;
}
