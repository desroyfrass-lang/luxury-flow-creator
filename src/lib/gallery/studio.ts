// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0485A — Frass Gallery Studio. "Create. Paint. Illustrate. Monetize."
//
// This is configuration and vocabulary only. The drawing engine lives in
// paint-engine.ts; the interface lives in components/gallery/studio/*.
//
// Capability benchmark (what the studio is measured against, not copied from):
// professional applications are recognised for customisable brush engines,
// layer systems with blend modes, pressure- and tilt-sensitive stylus input,
// stroke stabilisation, perspective and symmetry assistants, selections and
// transforms, and realistic media simulation. Frass matches those capabilities
// in a Frass-native interface — and adds the one thing none of them have: the
// finished piece walks straight into a gallery with a price on it.
// ─────────────────────────────────────────────────────────────────────────────

export const STUDIO_PRINCIPLE =
  "Frass Gallery is more than a place to sell art. It is also a place to create it. Members should be able to begin with a blank canvas and finish with a monetized work of art.";

export const STUDIO_PLAIN_ENGLISH =
  "Here's how it works: it's a real painting program, not a doodle box — and when you put the brush down, the picture is already standing in your own gallery with a price beside it.";

export const STUDIO_AI_RULE =
  "Frassy organises, titles, describes, tags, groups and prices. Frassy never paints. The artist remains the creator.";

// ── Stylus hardware ──────────────────────────────────────────────────────────
// All of these speak the same browser language: PointerEvent with pressure,
// tiltX/tiltY and pointerType. We support the protocol, so we support the pens.

export const SUPPORTED_STYLI = [
  "Apple Pencil",
  "Surface Pen",
  "Wacom",
  "Huion",
  "XP-Pen",
  "Samsung S Pen",
  "USI stylus",
] as const;

export const STYLUS_NOTE =
  "Pressure, tilt and palm rejection are used wherever your pen and browser report them. A finger or mouse still works — it just draws at even pressure.";

// ── What can be made here ────────────────────────────────────────────────────

export const ART_FORMS = [
  "Pencil sketches",
  "Ink drawings",
  "Oil paintings",
  "Watercolour paintings",
  "Acrylic paintings",
  "Digital paintings",
  "Cartoons",
  "Comics",
  "Manga",
  "Character concepts",
  "Portraits",
  "Landscapes",
  "Pixel art",
  "Concept art",
  "Children's illustrations",
  "Calligraphy",
  "Mixed media",
] as const;

// ── Canvas presets ───────────────────────────────────────────────────────────

export type CanvasPreset = { id: string; label: string; w: number; h: number; note: string };

export const CANVAS_PRESETS: CanvasPreset[] = [
  { id: "sketch", label: "Sketchbook", w: 1536, h: 2048, note: "Quick studies and daily drawing." },
  { id: "square", label: "Square — social", w: 2048, h: 2048, note: "What most people will see first." },
  { id: "canvas-16x20", label: "Canvas 16×20″", w: 2400, h: 3000, note: "Print-safe at 150 dpi." },
  { id: "canvas-24x36", label: "Canvas 24×36″", w: 3600, h: 5400, note: "Gallery wall size." },
  { id: "a4", label: "A4 print", w: 2480, h: 3508, note: "300 dpi, ready for an edition." },
  { id: "comic", label: "Comic page", w: 2550, h: 3900, note: "Standard page with bleed room." },
  { id: "pixel", label: "Pixel art", w: 256, h: 256, note: "Snapped, aliased, nearest-neighbour." },
  { id: "wide", label: "Concept — widescreen", w: 3840, h: 2160, note: "Environments and key art." },
];

/** Practical ceiling: memory per layer is w × h × 4 bytes. */
export const MAX_CANVAS_SIDE = 8192;
export const MAX_CANVAS_PIXELS = 24_000_000;

// ── Brush engine ─────────────────────────────────────────────────────────────

export type BrushFamily = "pencil" | "ink" | "paint" | "wet" | "airbrush" | "texture" | "eraser" | "smudge" | "pixel";

export type Brush = {
  id: string;
  label: string;
  family: BrushFamily;
  /** Base diameter in canvas pixels. */
  size: number;
  /** Fraction of size at zero pressure (pressure → size curve floor). */
  minSizeRatio: number;
  /** Paint laid per stamp. */
  flow: number;
  /** Overall stroke opacity ceiling. */
  opacity: number;
  /** 0 = feathered cloud, 1 = hard disc. */
  hardness: number;
  /** Stamp interval as a fraction of diameter. Lower = smoother, heavier. */
  spacing: number;
  /** Pressure → opacity coupling. */
  pressureOpacity: number;
  /** Random offset perpendicular to the stroke, in diameters. */
  scatter: number;
  /** Grain strength, 0–1. */
  grain: number;
  /** Tilt widens the tip like a real pencil edge. */
  tiltShape: number;
  /** Picks up colour already on the layer (oil, watercolour). */
  wet: number;
  /** Default stabilisation for this brush, 0–1. */
  stabilize: number;
  hint: string;
};

export const BRUSHES: Brush[] = [
  {
    id: "graphite", label: "HB Graphite", family: "pencil", size: 8, minSizeRatio: 0.35, flow: 0.55, opacity: 0.9,
    hardness: 0.55, spacing: 0.06, pressureOpacity: 0.85, scatter: 0.04, grain: 0.55, tiltShape: 0.8, wet: 0,
    stabilize: 0.15, hint: "Tilt it and it shades like the side of a pencil.",
  },
  {
    id: "6b", label: "6B Soft Pencil", family: "pencil", size: 16, minSizeRatio: 0.3, flow: 0.5, opacity: 0.95,
    hardness: 0.35, spacing: 0.05, pressureOpacity: 0.9, scatter: 0.08, grain: 0.75, tiltShape: 1, wet: 0,
    stabilize: 0.12, hint: "Dark, dusty, forgiving. Good for first passes.",
  },
  {
    id: "ink", label: "Studio Ink", family: "ink", size: 10, minSizeRatio: 0.15, flow: 1, opacity: 1,
    hardness: 0.95, spacing: 0.03, pressureOpacity: 0.2, scatter: 0, grain: 0, tiltShape: 0.15, wet: 0,
    stabilize: 0.45, hint: "Tapered, confident lines. Stabilisation is on by default.",
  },
  {
    id: "brushpen", label: "Brush Pen", family: "ink", size: 22, minSizeRatio: 0.08, flow: 1, opacity: 1,
    hardness: 0.8, spacing: 0.03, pressureOpacity: 0.1, scatter: 0, grain: 0.05, tiltShape: 0.4, wet: 0,
    stabilize: 0.5, hint: "Press for weight, release for a hairline.",
  },
  {
    id: "acrylic", label: "Acrylic Flat", family: "paint", size: 40, minSizeRatio: 0.6, flow: 0.85, opacity: 1,
    hardness: 0.7, spacing: 0.05, pressureOpacity: 0.4, scatter: 0.05, grain: 0.3, tiltShape: 0.5, wet: 0.15,
    stabilize: 0.1, hint: "Opaque and quick-drying, like the real thing.",
  },
  {
    id: "oil", label: "Oil Bristle", family: "wet", size: 56, minSizeRatio: 0.55, flow: 0.7, opacity: 1,
    hardness: 0.5, spacing: 0.04, pressureOpacity: 0.5, scatter: 0.12, grain: 0.45, tiltShape: 0.6, wet: 0.55,
    stabilize: 0.08, hint: "Drags the colour underneath into the new stroke.",
  },
  {
    id: "watercolour", label: "Watercolour Wash", family: "wet", size: 90, minSizeRatio: 0.7, flow: 0.18, opacity: 0.55,
    hardness: 0.12, spacing: 0.08, pressureOpacity: 0.7, scatter: 0.18, grain: 0.35, tiltShape: 0.7, wet: 0.4,
    stabilize: 0.1, hint: "Builds in layers. Let it pool — don't fight it.",
  },
  {
    id: "airbrush", label: "Airbrush", family: "airbrush", size: 120, minSizeRatio: 0.9, flow: 0.06, opacity: 0.5,
    hardness: 0.02, spacing: 0.05, pressureOpacity: 0.9, scatter: 0, grain: 0.1, tiltShape: 0.2, wet: 0,
    stabilize: 0.2, hint: "Soft gradients, glows, skin.",
  },
  {
    id: "charcoal", label: "Charcoal", family: "texture", size: 48, minSizeRatio: 0.4, flow: 0.6, opacity: 0.95,
    hardness: 0.3, spacing: 0.05, pressureOpacity: 0.8, scatter: 0.25, grain: 0.95, tiltShape: 1, wet: 0.1,
    stabilize: 0.05, hint: "Filthy in the best way. Smudge it after.",
  },
  {
    id: "pixel", label: "Pixel Pen", family: "pixel", size: 1, minSizeRatio: 1, flow: 1, opacity: 1,
    hardness: 1, spacing: 0.9, pressureOpacity: 0, scatter: 0, grain: 0, tiltShape: 0, wet: 0,
    stabilize: 0, hint: "Hard square pixels, no anti-aliasing.",
  },
  {
    id: "calligraphy", label: "Calligraphy Nib", family: "ink", size: 26, minSizeRatio: 0.2, flow: 1, opacity: 1,
    hardness: 0.9, spacing: 0.03, pressureOpacity: 0.15, scatter: 0, grain: 0, tiltShape: 1, wet: 0,
    stabilize: 0.35, hint: "Angled nib — direction changes the thickness.",
  },
  {
    id: "eraser", label: "Eraser", family: "eraser", size: 40, minSizeRatio: 0.4, flow: 1, opacity: 1,
    hardness: 0.6, spacing: 0.04, pressureOpacity: 0.6, scatter: 0, grain: 0, tiltShape: 0.3, wet: 0,
    stabilize: 0.1, hint: "Pressure controls how much it lifts.",
  },
  {
    id: "smudge", label: "Smudge", family: "smudge", size: 60, minSizeRatio: 0.5, flow: 0.6, opacity: 1,
    hardness: 0.4, spacing: 0.03, pressureOpacity: 0.7, scatter: 0, grain: 0, tiltShape: 0.4, wet: 1,
    stabilize: 0.1, hint: "Pushes wet colour around. Blends edges.",
  },
];

export function brushById(id: string): Brush {
  return BRUSHES.find((b) => b.id === id) ?? BRUSHES[0]!;
}

// ── Tools ────────────────────────────────────────────────────────────────────

export type ToolId =
  | "brush"
  | "eraser"
  | "smudge"
  | "fill"
  | "eyedropper"
  | "select"
  | "move"
  | "shape"
  | "text"
  | "pan";

export const TOOLS: { id: ToolId; label: string; key: string; beginner: boolean; hint: string }[] = [
  { id: "brush", label: "Brush", key: "B", beginner: true, hint: "Draw and paint." },
  { id: "eraser", label: "Eraser", key: "E", beginner: true, hint: "Lift paint back off." },
  { id: "smudge", label: "Smudge", key: "S", beginner: false, hint: "Push and blend colour." },
  { id: "fill", label: "Fill", key: "G", beginner: true, hint: "Flood an area with colour." },
  { id: "eyedropper", label: "Pick colour", key: "I", beginner: true, hint: "Take a colour off the canvas." },
  { id: "select", label: "Select", key: "M", beginner: false, hint: "Work inside one area only." },
  { id: "move", label: "Transform", key: "V", beginner: false, hint: "Move, scale and rotate the layer." },
  { id: "shape", label: "Shapes", key: "U", beginner: true, hint: "Straight lines, rectangles, ellipses." },
  { id: "text", label: "Text", key: "T", beginner: true, hint: "Titles, signatures, speech bubbles." },
  { id: "pan", label: "Pan", key: "H", beginner: true, hint: "Move the canvas around." },
];

// ── Layer blend modes (a real subset, all natively supported by canvas) ──────

export const BLEND_MODES = [
  "normal", "multiply", "screen", "overlay", "darken", "lighten",
  "color-dodge", "color-burn", "hard-light", "soft-light",
  "difference", "exclusion", "hue", "saturation", "color", "luminosity",
] as const;
export type BlendMode = (typeof BLEND_MODES)[number];

export function canvasBlend(mode: BlendMode): GlobalCompositeOperation {
  return (mode === "normal" ? "source-over" : mode) as GlobalCompositeOperation;
}

// ── Assistants ───────────────────────────────────────────────────────────────

export type SymmetryMode = "off" | "vertical" | "horizontal" | "quad" | "radial";
export const SYMMETRY_LABEL: Record<SymmetryMode, string> = {
  off: "Off",
  vertical: "Vertical mirror",
  horizontal: "Horizontal mirror",
  quad: "Four-way",
  radial: "Radial",
};

export type PerspectiveMode = "off" | "one" | "two" | "three" | "isometric";
export const PERSPECTIVE_LABEL: Record<PerspectiveMode, string> = {
  off: "Off",
  one: "One-point",
  two: "Two-point",
  three: "Three-point",
  isometric: "Isometric",
};

export type ShapeMode = "line" | "rect" | "ellipse" | "polygon";

// ── Interface modes ──────────────────────────────────────────────────────────

export type StudioMode = "beginner" | "pro";

export const MODE_COPY: Record<StudioMode, { label: string; note: string }> = {
  beginner: {
    label: "Simple",
    note: "Big buttons, six tools, nothing to break. More appears as you're ready.",
  },
  pro: {
    label: "Professional",
    note: "Full brush engine, layers, blend modes, selections, assistants and shortcuts.",
  },
};

/** Tools shown in Simple mode. Everything else is still there — just hidden. */
export const BEGINNER_TOOLS: ToolId[] = TOOLS.filter((t) => t.beginner).map((t) => t.id);
export const BEGINNER_BRUSHES = ["graphite", "ink", "acrylic", "watercolour", "airbrush", "eraser"];

// ── Frassy's studio assistance (never the brush) ────────────────────────────

export const FRASSY_STUDIO_HELP = [
  { id: "title", label: "Suggest a title", why: "Three options, in your voice, not gallery-speak." },
  { id: "describe", label: "Write the description", why: "A draft you edit — never published without you." },
  { id: "keywords", label: "Suggest keywords", why: "So collectors searching for this kind of work find it." },
  { id: "collection", label: "Group into a collection", why: "I notice when six pieces belong on the same wall." },
  { id: "price", label: "Suggest a pricing approach", why: "Based on size, medium, edition and what you've sold before." },
  { id: "list", label: "Prepare the Marketplace listing", why: "Images, sizes, shipping notes — ready for you to approve." },
] as const;

// ── Palettes ─────────────────────────────────────────────────────────────────

export const PALETTES: { id: string; label: string; colors: string[] }[] = [
  { id: "frass", label: "Frass House", colors: ["#0a0a0b", "#1c1c1f", "#d4af37", "#c8c8cc", "#8a8a90", "#f5f5f0"] },
  { id: "island", label: "Island Light", colors: ["#0b3d3b", "#118a7e", "#f2c14e", "#f78154", "#e6f2ef", "#1b1b1b"] },
  { id: "earth", label: "Earth & Ochre", colors: ["#2b1d14", "#7a4b2a", "#b07d44", "#d9b382", "#efe3d0", "#141210"] },
  { id: "skin", label: "Skin Tones", colors: ["#3b2219", "#6b3f2a", "#a3684a", "#c98d66", "#e5b894", "#f6ddc7"] },
  { id: "night", label: "Night Study", colors: ["#05070f", "#101a33", "#22406b", "#4a76a8", "#8fb3d9", "#dfe9f5"] },
  { id: "pop", label: "Comic Pop", colors: ["#111111", "#ff2e4c", "#ffb703", "#0aa1dd", "#2ec4b6", "#ffffff"] },
];

// ── Session vocabulary ───────────────────────────────────────────────────────

export const STUDIO_STORAGE_KEY = "frass.studio.session.v1";
export const AUTOSAVE_MS = 20_000;

export const KEYBOARD_HELP: { keys: string; what: string }[] = [
  { keys: "B / E / G / I", what: "Brush · Eraser · Fill · Pick colour" },
  { keys: "[ / ]", what: "Smaller / larger brush" },
  { keys: "Ctrl+Z · Ctrl+Shift+Z", what: "Undo · Redo" },
  { keys: "Space + drag", what: "Pan the canvas" },
  { keys: "Alt + click", what: "Pick a colour without switching tool" },
  { keys: "Shift + drag", what: "Straight line from the last point" },
];
