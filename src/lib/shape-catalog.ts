// Frass Shape™ — the wellness & sculpting flagship inside Frass District.
// FRASS-1015. Mirrors the Frass department architecture: store → wing →
// showroom → products, with a "Shop by Goal" layer on top.

import type { DripCategory } from "./drip-catalog";
import type { ShowroomTheme } from "./showroom-themes";

export type ShapeGender = "men" | "women";

export const SHAPE_WOMEN_CATEGORIES: Record<string, DripCategory> = {
  "sculpt-essentials": {
    title: "Women's Sculpt Essentials",
    tagline: "The core sculpting layer — bodysuits, waist shapers and shorts.",
    subs: [
      ["shaping-bodysuits", "Shaping Bodysuits"],
      ["waist-shapers", "Waist Shapers"],
      ["shaping-shorts", "Shaping Shorts"],
      ["thigh-shapers", "Thigh Shapers"],
      ["shaping-slips", "Shaping Slips"],
      ["shaping-camis", "Shaping Camis"],
    ],
  },
  "everyday-smoothing": {
    title: "Women's Everyday Smoothing",
    tagline: "Light, invisible support you forget you're wearing.",
    subs: [
      ["seamless-briefs", "Seamless Briefs"],
      ["smoothing-tanks", "Smoothing Tanks"],
      ["light-control-leggings", "Light-Control Leggings"],
      ["slip-dresses", "Slip Dresses"],
      ["seamless-sets", "Seamless Sets"],
    ],
  },
  "occasion-bridal": {
    title: "Women's Occasion & Bridal Shape",
    tagline: "Built for the dress — smooth lines from ceremony to last dance.",
    subs: [
      ["bridal-bodysuits", "Bridal Bodysuits"],
      ["strapless-shapers", "Strapless Shapers"],
      ["backless-solutions", "Backless Solutions"],
      ["long-leg-shapers", "Long-Leg Shapers"],
      ["event-slips", "Event Slips"],
    ],
  },
  "postpartum-recovery": {
    title: "Women's Postpartum & Recovery",
    tagline: "Gentle compression for healing, posture and everyday comfort.",
    subs: [
      ["postpartum-belts", "Postpartum Belts"],
      ["recovery-bodysuits", "Recovery Bodysuits"],
      ["nursing-friendly", "Nursing-Friendly Shape"],
      ["high-waist-support", "High-Waist Support"],
    ],
  },
  "active-support": {
    title: "Women's Active Support",
    tagline: "Compression that trains with you and recovers after.",
    subs: [
      ["compression-leggings", "Compression Leggings"],
      ["support-sports-bras", "Support Sports Bras"],
      ["compression-shorts", "Compression Shorts"],
      ["recovery-layers", "Recovery Layers"],
    ],
  },
};

export const SHAPE_MEN_CATEGORIES: Record<string, DripCategory> = {
  "core-compression": {
    title: "Men's Core Compression",
    tagline: "The base layer — engineered compression that holds the line.",
    subs: [
      ["compression-shirts", "Compression Shirts"],
      ["compression-tanks", "Compression Tanks"],
      ["compression-shorts", "Compression Shorts"],
      ["compression-briefs", "Compression Briefs"],
    ],
  },
  "everyday-smoothing": {
    title: "Men's Everyday Smoothing",
    tagline: "Invisible under a shirt. Sharper all day.",
    subs: [
      ["slimming-undershirts", "Slimming Undershirts"],
      ["seamless-tees", "Seamless Tees"],
      ["core-control-briefs", "Core-Control Briefs"],
      ["smoothing-tanks", "Smoothing Tanks"],
    ],
  },
  "posture-support": {
    title: "Men's Posture & Back Support",
    tagline: "Stand taller — support built into the fabric, not strapped on.",
    subs: [
      ["posture-shirts", "Posture Shirts"],
      ["back-support-layers", "Back Support Layers"],
      ["core-support-bands", "Core Support Bands"],
    ],
  },
  "suit-layers": {
    title: "Men's Suit Layers",
    tagline: "What goes under the tailoring — clean lines, zero bulk.",
    subs: [
      ["dress-shirt-base-layers", "Dress Shirt Base Layers"],
      ["sweat-proof-undershirts", "Sweat-Proof Undershirts"],
      ["waist-smoothing", "Waist Smoothing"],
    ],
  },
  "active-recovery": {
    title: "Men's Active & Recovery",
    tagline: "Train, compress, recover, repeat.",
    subs: [
      ["training-compression", "Training Compression"],
      ["recovery-tights", "Recovery Tights"],
      ["calf-arm-sleeves", "Calf & Arm Sleeves"],
      ["gym-base-layers", "Gym Base Layers"],
    ],
  },
};

export function shapeCategories(gender: ShapeGender) {
  return gender === "men" ? SHAPE_MEN_CATEGORIES : SHAPE_WOMEN_CATEGORIES;
}

/** Collection handle for a Frass Shape sub-collection. */
export function shapeHandle(gender: ShapeGender, category: string, sub: string) {
  return `${gender === "men" ? "mens" : "womens"}-frass-shape-${category}-${sub}`;
}

export interface ShapeGoal {
  slug: string;
  title: string;
  blurb: string;
  /** Shopify search query used for the goal product wall. */
  query: string;
}

export const SHAPE_GOALS: Record<ShapeGender, readonly ShapeGoal[]> = {
  women: [
    {
      slug: "smooth-under-a-dress",
      title: "Smooth under a dress",
      blurb: "Seamless edges, no lines, all-day hold.",
      query: "tag:shape AND (tag:smoothing OR tag:seamless)",
    },
    {
      slug: "snatched-waist",
      title: "A snatched waist",
      blurb: "Firm mid-section control without losing your breath.",
      query: "tag:shape AND (tag:waist OR tag:firm-control)",
    },
    {
      slug: "everyday-comfort",
      title: "Everyday comfort",
      blurb: "Light control you can wear from morning to night.",
      query: "tag:shape AND tag:light-control",
    },
    {
      slug: "wedding-day",
      title: "My wedding day",
      blurb: "Strapless, backless and long-leg solutions for the dress.",
      query: "tag:shape AND (tag:bridal OR tag:occasion)",
    },
    {
      slug: "postpartum",
      title: "Postpartum support",
      blurb: "Gentle compression for healing and posture.",
      query: "tag:shape AND tag:postpartum",
    },
    {
      slug: "gym-recovery",
      title: "Gym & recovery",
      blurb: "Compression that trains with you and recovers after.",
      query: "tag:shape AND (tag:compression OR tag:recovery)",
    },
  ],
  men: [
    {
      slug: "sharper-in-a-suit",
      title: "Sharper in a suit",
      blurb: "Clean lines under tailoring, zero bulk.",
      query: "tag:shape AND (tag:undershirt OR tag:suit-layer)",
    },
    {
      slug: "everyday-confidence",
      title: "Everyday confidence",
      blurb: "Light smoothing that disappears under a shirt.",
      query: "tag:shape AND tag:light-control",
    },
    {
      slug: "back-posture",
      title: "Back & posture support",
      blurb: "Support engineered into the fabric.",
      query: "tag:shape AND (tag:posture OR tag:support)",
    },
    {
      slug: "gym-recovery",
      title: "Gym & recovery",
      blurb: "Training compression and recovery layers.",
      query: "tag:shape AND (tag:compression OR tag:recovery)",
    },
  ],
};

export function findGoal(gender: ShapeGender, slug: string) {
  return SHAPE_GOALS[gender].find((g) => g.slug === slug);
}

/** Education centre — Frass Shape sells understanding before it sells garments. */
export const SHAPE_EDUCATION = [
  {
    title: "Compression levels, explained",
    body: "Light control smooths. Medium control shapes. Firm control sculpts. Pick the lightest level that gives you the line you want — comfort is what makes you wear it twice.",
    plain: "Here's what this means: light is for comfort, firm is for a big night. Start light.",
  },
  {
    title: "How it should fit",
    body: "Shapewear should feel like a firm hug, never a squeeze. If it rolls, digs or leaves marks after ten minutes, it's a size too small — sizing up usually gives a smoother line, not a looser one.",
    plain: "Here's the idea: too tight actually looks worse. Size up if it digs.",
  },
  {
    title: "Fabric & care",
    body: "Sculpting knits rely on elastane memory. Wash cool, never wring, air dry flat. Heat is the one thing that permanently kills compression.",
    plain: "Here's how it works: cold wash, no dryer — heat ruins the stretch.",
  },
  {
    title: "Wellness first",
    body: "Shape is a styling tool, not a shortcut. Never wear firm compression while sleeping, and loosen it if you feel numbness or shortness of breath.",
    plain: "Let's break it down: it's clothing, not a treatment. Take it off if it hurts.",
  },
] as const;

const WOMEN_THEME: ShowroomTheme = {
  accent: "oklch(0.88 0.07 70)",
  accentSoft: "oklch(0.95 0.04 75)",
  backdrop:
    "linear-gradient(180deg, oklch(0.97 0.012 80) 0%, oklch(0.94 0.015 75) 55%, oklch(0.90 0.02 70) 100%)",
  ambient:
    "radial-gradient(120% 60% at 50% 0%, oklch(0.98 0.03 85 / 0.75) 0%, transparent 72%)",
  mood: "Soft stone, brushed gold, daylight. Take your time — fit is personal.",
  room: "The Sculpt Studio",
  wall: "linear-gradient(180deg, oklch(0.98 0.008 80) 0%, oklch(0.93 0.012 75) 100%)",
  panel:
    "repeating-linear-gradient(90deg, oklch(0.75 0.02 70 / 0.10) 0 2px, transparent 2px 150px)",
  floor:
    "linear-gradient(180deg, oklch(0.95 0.008 80) 0%, oklch(0.88 0.01 75) 100%)",
};

const MEN_THEME: ShowroomTheme = {
  accent: "oklch(0.86 0.06 200)",
  accentSoft: "oklch(0.93 0.03 200)",
  backdrop:
    "linear-gradient(180deg, oklch(0.96 0.006 220) 0%, oklch(0.92 0.008 215) 55%, oklch(0.88 0.01 210) 100%)",
  ambient:
    "radial-gradient(120% 60% at 50% 0%, oklch(0.97 0.02 210 / 0.72) 0%, transparent 72%)",
  mood: "Stone, steel and daylight. Support you feel, never see.",
  room: "The Performance Room",
  wall: "linear-gradient(180deg, oklch(0.97 0.006 220) 0%, oklch(0.91 0.008 215) 100%)",
  panel:
    "repeating-linear-gradient(90deg, oklch(0.60 0.02 220 / 0.10) 0 2px, transparent 2px 150px)",
  floor:
    "linear-gradient(180deg, oklch(0.94 0.006 220) 0%, oklch(0.87 0.008 215) 100%)",
};

export function getShapeTheme(gender: ShapeGender): ShowroomTheme {
  return gender === "men" ? MEN_THEME : WOMEN_THEME;
}
