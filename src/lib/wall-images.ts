// Per-category shelf photography for the Frass Kicks wall.
// Each age group / gender gets its own Casual, Classic and Street shelf so the
// three bays never read as one universal wall of white sneakers.

import k03bCas from "@/assets/wall/kids-0-3-boys-casual.jpg";
import k03bCla from "@/assets/wall/kids-0-3-boys-classic.jpg";
import k03bStr from "@/assets/wall/kids-0-3-boys-street.jpg";
import k03gCas from "@/assets/wall/kids-0-3-girls-casual.jpg";
import k03gCla from "@/assets/wall/kids-0-3-girls-classic.jpg";
import k03gStr from "@/assets/wall/kids-0-3-girls-street.jpg";
import k36bCas from "@/assets/wall/kids-3-6-boys-casual.jpg";
import k36bCla from "@/assets/wall/kids-3-6-boys-classic.jpg";
import k36bStr from "@/assets/wall/kids-3-6-boys-street.jpg";
import k36gCas from "@/assets/wall/kids-3-6-girls-casual.jpg";
import k36gCla from "@/assets/wall/kids-3-6-girls-classic.jpg";
import k36gStr from "@/assets/wall/kids-3-6-girls-street.jpg";
import k612bCas from "@/assets/wall/kids-6-12-boys-casual.jpg";
import k612bCla from "@/assets/wall/kids-6-12-boys-classic.jpg";
import k612bStr from "@/assets/wall/kids-6-12-boys-street.jpg";
import k612gCas from "@/assets/wall/kids-6-12-girls-casual.jpg";
import k612gCla from "@/assets/wall/kids-6-12-girls-classic.jpg";
import k612gStr from "@/assets/wall/kids-6-12-girls-street.jpg";
import k12bCas from "@/assets/wall/kids-12-plus-boys-casual.jpg";
import k12bCla from "@/assets/wall/kids-12-plus-boys-classic.jpg";
import k12bStr from "@/assets/wall/kids-12-plus-boys-street.jpg";
import k12gCas from "@/assets/wall/kids-12-plus-girls-casual.jpg";
import k12gCla from "@/assets/wall/kids-12-plus-girls-classic.jpg";
import k12gStr from "@/assets/wall/kids-12-plus-girls-street.jpg";
import pmCas from "@/assets/wall/plus-men-casual.jpg";
import pmCla from "@/assets/wall/plus-men-classic.jpg";
import pmStr from "@/assets/wall/plus-men-street.jpg";
import pwCas from "@/assets/wall/plus-women-casual.jpg";
import pwCla from "@/assets/wall/plus-women-classic.jpg";
import pwStr from "@/assets/wall/plus-women-street.jpg";

export type WallCategory = "casual" | "classic" | "street";

type Trio = Record<WallCategory, string>;

const KIDS_WALL: Record<string, Trio> = {
  "0-3-boys": { casual: k03bCas, classic: k03bCla, street: k03bStr },
  "0-3-girls": { casual: k03gCas, classic: k03gCla, street: k03gStr },
  "3-6-boys": { casual: k36bCas, classic: k36bCla, street: k36bStr },
  "3-6-girls": { casual: k36gCas, classic: k36gCla, street: k36gStr },
  "6-12-boys": { casual: k612bCas, classic: k612bCla, street: k612bStr },
  "6-12-girls": { casual: k612gCas, classic: k612gCla, street: k612gStr },
  "12-plus-boys": { casual: k12bCas, classic: k12bCla, street: k12bStr },
  "12-plus-girls": { casual: k12gCas, classic: k12gCla, street: k12gStr },
};

const PLUS_WALL: Record<"men" | "women", Trio> = {
  men: { casual: pmCas, classic: pmCla, street: pmStr },
  women: { casual: pwCas, classic: pwCla, street: pwStr },
};

/** Accent light colour per bay — casual is warm gold, classic is champagne,
 *  street runs neon so the three bays never blur together. */
export const WALL_ACCENT: Record<WallCategory, string> = {
  casual: "oklch(0.82 0.13 80)",
  classic: "oklch(0.90 0.04 95)",
  street: "oklch(0.72 0.22 320)",
};

export function kidsWallImages(segmentSlug: string): Trio | undefined {
  return KIDS_WALL[segmentSlug];
}

export function plusWallImages(gender: "men" | "women"): Trio {
  return PLUS_WALL[gender];
}
