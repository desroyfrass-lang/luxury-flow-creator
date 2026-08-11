// FRASS-0473 — Server-side verification of an already-stored upload.
//
// The browser check is courtesy. This is the guard: before anything is signed,
// analysed or charged for, the server confirms the object belongs to the caller
// and is genuinely the kind and size of file we accept.

import { IMAGE_MIME_TYPES, MAX_IMAGE_BYTES, isAllowedMime } from "@/lib/uploads";

type StoredObject = {
  mimetype: string | null;
  sizeBytes: number;
};

/** Objects are always written as `<userId>/<file>`; anything else is not theirs. */
export function assertOwnedPath(storagePath: string, userId: string) {
  const clean = storagePath.replace(/^\/+/, "");
  if (clean.includes("..") || !clean.startsWith(`${userId}/`)) {
    throw new Error("That upload does not belong to this account.");
  }
  return clean;
}

/**
 * Verify an object inside a private bucket is an image within our size limit.
 * Deletes the object when it isn't, so rejected files don't linger.
 */
export async function assertStoredImage(
  bucket: string,
  storagePath: string,
  userId: string,
  maxBytes = MAX_IMAGE_BYTES,
): Promise<StoredObject> {
  const path = assertOwnedPath(storagePath, userId);
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const slash = path.lastIndexOf("/");
  const folder = path.slice(0, slash);
  const name = path.slice(slash + 1);

  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .list(folder, { search: name, limit: 1 });
  if (error) throw new Error(error.message);

  const obj = (data ?? []).find((o) => o.name === name);
  if (!obj) throw new Error("That upload could not be found.");

  const meta = (obj.metadata ?? {}) as { mimetype?: string; size?: number };
  const mimetype = meta.mimetype ?? null;
  const sizeBytes = Number(meta.size ?? 0);

  const bad =
    !isAllowedMime(mimetype, IMAGE_MIME_TYPES) || sizeBytes <= 0 || sizeBytes > maxBytes;

  if (bad) {
    await supabaseAdmin.storage.from(bucket).remove([path]);
    throw new Error("That file is not an accepted photo, so it was removed.");
  }

  return { mimetype, sizeBytes };
}
