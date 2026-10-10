// R2 — durable human-written design brief for one verified product + variant.
import { z } from "zod";

export const FASHION_BRIEF_MAX = 4000;
const text = z.string().max(FASHION_BRIEF_MAX).transform((s) => s.trim());

export const fashionBriefIdsSchema = z.object({ productId: z.string().uuid(), variantId: z.string().uuid() });
export const fashionBriefSaveSchema = fashionBriefIdsSchema.extend({
  concept: text,
  stylingDirection: text,
  notes: text,
});

export type FashionBrief = { concept: string; stylingDirection: string; notes: string; updatedAt: string | null };
export const EMPTY_FASHION_BRIEF: FashionBrief = { concept: "", stylingDirection: "", notes: "", updatedAt: null };
