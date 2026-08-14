// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0408 §1 — FV Studios Watermark System.
//
// Constitutional rule: the watermark is ALWAYS optional. Creators are never
// forced to advertise Frass. They are rewarded when they choose to.
// ─────────────────────────────────────────────────────────────────────────────

export type WatermarkKey = "none" | "created-in" | "produced-with" | "custom";

export type WatermarkOption = {
  key: WatermarkKey;
  label: string;
  /** The literal text burned into the export. */
  mark: string | null;
  /** Everyday-language explanation for the export dialog. */
  plain: string;
  /** Percentage discount applied to the AI credit cost of qualifying exports. */
  creditDiscountPct: number;
  /** Only available to paid creators / business accounts. */
  requiresBusiness?: boolean;
};

export const WATERMARK_OPTIONS: WatermarkOption[] = [
  {
    key: "none",
    label: "No watermark",
    mark: null,
    plain: "Your export leaves clean. Nothing on it but your work.",
    creditDiscountPct: 0,
  },
  {
    key: "created-in",
    label: "Created in FV Studios",
    mark: "Created in FV Studios",
    plain: "A small, tasteful mark in the corner. You get cheaper AI exports for carrying it.",
    creditDiscountPct: 10,
  },
  {
    key: "produced-with",
    label: "Produced with Frass Vision Studios",
    mark: "Produced with Frass Vision Studios",
    plain: "The full studio signature — the one used on films, documentaries and releases.",
    creditDiscountPct: 15,
  },
  {
    key: "custom",
    label: "Custom brand watermark",
    mark: "Your own logo",
    plain: "Your own logo instead of ours. For paid creators and business accounts.",
    creditDiscountPct: 0,
    requiresBusiness: true,
  },
];

export const WATERMARK_BY_KEY = new Map(WATERMARK_OPTIONS.map((o) => [o.key, o]));

/** Placement of the mark inside the frame. */
export const WATERMARK_POSITIONS = [
  { key: "bottom-right", label: "Bottom right", note: "The industry default." },
  { key: "bottom-left", label: "Bottom left" },
  { key: "top-right", label: "Top right" },
  { key: "top-left", label: "Top left" },
  { key: "end-card", label: "End card only", note: "Appears for 3 seconds at the very end." },
] as const;

export type WatermarkPosition = (typeof WATERMARK_POSITIONS)[number]["key"];

export const WATERMARK_FINISHES = [
  { key: "gold", label: "Brushed gold", swatch: "#e9c46a" },
  { key: "white", label: "Ivory white", swatch: "#f5f2ea" },
  { key: "black", label: "Matte black", swatch: "#111111" },
] as const;

export type WatermarkFinish = (typeof WATERMARK_FINISHES)[number]["key"];

/** Non-monetary benefits earned by carrying an FV Studios mark. */
export const WATERMARK_INCENTIVES = [
  "Reduced AI Credit cost on qualifying exports.",
  "Greater discoverability across Frass — search, Radio and the Marketplace.",
  "Eligibility for the “Made in FV Studios” showcases.",
  "Priority consideration for creator spotlights and Frass Radio features.",
];

export const WATERMARK_RULES = [
  "Watermarking is optional. It is never required to export, publish or sell.",
  "The mark is small, tasteful and professional — never distracting.",
  "Carrying the mark is rewarded, never enforced.",
  "A custom brand watermark replaces the FV mark entirely and earns no discount.",
];

export type WatermarkChoice = {
  key: WatermarkKey;
  position: WatermarkPosition;
  finish: WatermarkFinish;
  opacity: number;
};

export const DEFAULT_WATERMARK: WatermarkChoice = {
  key: "created-in",
  position: "bottom-right",
  finish: "gold",
  opacity: 0.55,
};

/** Apply the watermark incentive to a forecast total. */
export function discountedCredits(credits: number, key: WatermarkKey): number {
  const pct = WATERMARK_BY_KEY.get(key)?.creditDiscountPct ?? 0;
  return Math.round(credits * (1 - pct / 100));
}
