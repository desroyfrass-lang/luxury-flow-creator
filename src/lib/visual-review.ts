/* FRASS-0226 — Founder Daily · Visual Excellence Review
   Frass is a luxury platform. Visual quality is never "finished". Every asset
   passes through this review, one at a time, and re-enters the queue whenever
   it changes or the standard moves. */

export const VISUAL_EXCELLENCE_PRINCIPLE =
  "Every image tells the Frass story. Every visual asset must communicate excellence, luxury, authenticity and purpose. Visual quality is not a milestone to complete, but a permanent commitment to continuous refinement.";

export const VISUAL_EXCELLENCE_BRIEF =
  "One image at a time, we will review every visual asset across the Frass ecosystem. Together we evaluate resolution, storytelling, luxury presentation, Caribbean atmosphere, accessibility, consistency and emotional impact. Every asset can be approved, enhanced, redesigned or replaced. Progress is permanently saved.";

/** Frassy reviews as Creative Director and Brand Guardian — she recommends, never publishes. */
export const CREATIVE_DIRECTOR_WATCHES = [
  "Low-resolution assets",
  "Outdated imagery",
  "Inconsistent styles",
  "Visual duplication",
  "Weak compositions",
  "Poor lighting",
  "Brand inconsistencies",
  "Accessibility issues",
  "Missed storytelling opportunities",
] as const;

export const REVIEW_CHECKLIST = [
  "Resolution",
  "Sharpness",
  "Lighting",
  "Composition",
  "Color Harmony",
  "Luxury Presentation",
  "Brand Consistency",
  "Caribbean Atmosphere",
  "Emotional Impact",
  "Accessibility",
  "Mobile Appearance",
  "Desktop Appearance",
  "Animation Quality",
  "Loading Performance",
  "Editorial Quality",
] as const;

export type ReviewDecision =
  | "approve"
  | "replace"
  | "redesign"
  | "enhance"
  | "resolution"
  | "caribbean"
  | "luxury"
  | "lighting"
  | "atmosphere"
  | "new-artwork"
  | "later"
  | "archive";

export const REVIEW_DECISIONS: { id: ReviewDecision; icon: string; label: string }[] = [
  { id: "approve", icon: "✅", label: "Approve" },
  { id: "replace", icon: "🖼", label: "Replace entire image" },
  { id: "redesign", icon: "🎨", label: "Redesign" },
  { id: "enhance", icon: "✨", label: "Enhance" },
  { id: "resolution", icon: "📈", label: "Increase resolution" },
  { id: "caribbean", icon: "🌴", label: "Add Caribbean influence" },
  { id: "luxury", icon: "💎", label: "Make more luxurious" },
  { id: "lighting", icon: "🌅", label: "Improve lighting" },
  { id: "atmosphere", icon: "🎭", label: "Improve atmosphere" },
  { id: "new-artwork", icon: "📸", label: "Schedule new artwork" },
  { id: "later", icon: "⏸", label: "Review later" },
  { id: "archive", icon: "🗂", label: "Archive" },
];

export type VisualAsset = {
  /** Stable id — the source path. */
  id: string;
  name: string;
  url: string;
  group: string;
  source: "Lovable-generated" | "Founder upload" | "Unknown";
};

const GROUPS: { match: RegExp; group: string }[] = [
  { match: /^bridal|district-bridal/, group: "Frass Bridal" },
  { match: /^kids|district-kids|school/, group: "Kids World & Kids Shop" },
  { match: /luxury|estate|wing/, group: "Luxury House" },
  { match: /kicks|shoe|shelf/, group: "Frass Kicks" },
  { match: /drip|bare|store-/, group: "Frass Drip & Bare Drip" },
  { match: /plus/, group: "Frass Plus+" },
  { match: /hill|district|gateway|arch|frass-world/, group: "Frass Hill & Districts" },
  { match: /afro/, group: "Afro Designers" },
  { match: /merch|logo|frassy/, group: "Brand & Merch" },
  { match: /card|hero|banner|cover/, group: "Editorial & Campaign" },
];

function groupFor(name: string): string {
  const lower = name.toLowerCase();
  return GROUPS.find((g) => g.match.test(lower))?.group ?? "Unsorted";
}

/** Build the review queue from every image and video shipped in src/assets. */
export function buildVisualQueue(files: Record<string, string>): VisualAsset[] {
  return Object.entries(files)
    .map(([path, url]) => {
      const name = path.split("/").pop() ?? path;
      return {
        id: path,
        name,
        url,
        group: groupFor(name),
        source: "Lovable-generated" as const,
      };
    })
    .sort((a, b) => a.group.localeCompare(b.group) || a.name.localeCompare(b.name));
}

/* ── Saved progress ─────────────────────────────────────────────────────── */

export type ReviewRecord = { decision: ReviewDecision; note?: string; at: string };
export type VisualReviewState = { index: number; records: Record<string, ReviewRecord> };

const KEY = "frass-visual-review-v1";

export function loadVisualReview(): VisualReviewState {
  if (typeof window === "undefined") return { index: 0, records: {} };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { index: 0, records: {} };
    return { index: 0, records: {}, ...(JSON.parse(raw) as Partial<VisualReviewState>) };
  } catch {
    return { index: 0, records: {} };
  }
}

export function saveVisualReview(state: VisualReviewState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable */
  }
}
