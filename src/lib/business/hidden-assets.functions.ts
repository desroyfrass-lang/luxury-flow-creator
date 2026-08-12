// FRASS-P002-E — First Business Venture server functions.
//
// Thin wrappers only. Every runtime helper lives in hidden-assets.server.ts.

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  createAsset,
  deleteAsset,
  listAssets,
  prepareListing,
  researchAsset,
  signAssetPhotos,
  updateAsset,
} from "./hidden-assets.server";
import {
  parseCreateAsset,
  parseId,
  parseSignPaths,
  parseUpdateAsset,
} from "./hidden-assets.schema";

export const listMyAssets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => listAssets(context.supabase, context.userId));

export const addAsset = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(parseCreateAsset)
  .handler(async ({ context, data }) => createAsset(context.supabase, context.userId, data));

export const saveAsset = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(parseUpdateAsset)
  .handler(async ({ context, data }) => updateAsset(context.supabase, context.userId, data));

export const removeAsset = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(parseId)
  .handler(async ({ context, data }) => deleteAsset(context.supabase, context.userId, data.id));

export const signMyAssetPhotos = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(parseSignPaths)
  .handler(async ({ context, data }) => signAssetPhotos(context.userId, data.paths));

/** Phase 2 + 3 — identification and organised valuation research. */
export const researchMyAsset = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(parseId)
  .handler(async ({ context, data }) => researchAsset(context.supabase, context.userId, data.id));

/** Phase 4 — listing copy, prepared for her approval. */
export const prepareMyListing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(parseId)
  .handler(async ({ context, data }) => prepareListing(context.supabase, context.userId, data.id));
