// FRASS-P002-E — input validation for the First Business Venture.

import { z } from "zod";
import { ASSET_CATEGORIES } from "./hidden-assets";

const categoryIds = ASSET_CATEGORIES.map((c) => c.id) as [string, ...string[]];

const text = (max: number) => z.string().trim().max(max).optional().nullable();

export const createAssetSchema = z.object({
  venture: z.string().trim().max(64).default("coin-collection"),
  category: z.enum(categoryIds).default("coins"),
  name: z.string().trim().min(1).max(160),
  notes: text(2000),
  frontPath: text(400),
  backPath: text(400),
});

export const updateAssetSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1).max(160).optional(),
  notes: text(2000),
  country: text(80),
  yearText: text(40),
  denomination: text(80),
  markings: text(300),
  conditionNote: text(300),
  frontPath: text(400),
  backPath: text(400),
  listingTitle: text(160),
  listingDescription: text(4000),
  listingPrice: z.number().min(0).max(1_000_000).optional().nullable(),
  soldAmount: z.number().min(0).max(1_000_000).optional().nullable(),
  status: z
    .enum(["documented", "identified", "valued", "listed", "sold", "kept"])
    .optional(),
});

export const idSchema = z.object({ id: z.string().uuid() });

export const signPathsSchema = z.object({
  paths: z.array(z.string().trim().min(1).max(400)).max(60),
});

export type CreateAssetInput = z.infer<typeof createAssetSchema>;
export type UpdateAssetInput = z.infer<typeof updateAssetSchema>;

export const parseCreateAsset = (d: unknown): CreateAssetInput => createAssetSchema.parse(d);
export const parseUpdateAsset = (d: unknown): UpdateAssetInput => updateAssetSchema.parse(d);
export const parseId = (d: unknown) => idSchema.parse(d);
export const parseSignPaths = (d: unknown) => signPathsSchema.parse(d);
