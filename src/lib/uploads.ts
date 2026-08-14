// FRASS-0473 — Upload safety.
//
// One place decides what a Frass upload is allowed to be. Every picker in the
// platform runs a file through here before it ever reaches storage, and the
// server re-checks the stored object afterwards — the browser is a convenience,
// never the guard.

export const IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/heic",
  "image/heif",
] as const;

export const MEDIA_MIME_TYPES = [
  ...IMAGE_MIME_TYPES,
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "audio/mpeg",
  "audio/mp4",
  "audio/wav",
  "audio/webm",
  "audio/ogg",
] as const;

/** 8 MB for a photo, 200 MB for a recording. */
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export const MAX_MEDIA_BYTES = 200 * 1024 * 1024;

export const IMAGE_ACCEPT = IMAGE_MIME_TYPES.join(",");

function mb(bytes: number) {
  return `${Math.round(bytes / (1024 * 1024))}MB`;
}

export function isAllowedMime(mime: string | null | undefined, allowed: readonly string[]) {
  return Boolean(mime && allowed.includes(mime.toLowerCase()));
}

/**
 * Throws a everyday-language error when a file is the wrong kind or too big.
 * Here's the takeaway: we check the label and the weight before it goes in the van.
 */
export function assertImageFile(file: File, maxBytes = MAX_IMAGE_BYTES) {
  if (!isAllowedMime(file.type, IMAGE_MIME_TYPES)) {
    throw new Error("That file is not a photo. Use a JPG, PNG, WEBP, HEIC, AVIF or GIF.");
  }
  if (file.size > maxBytes) {
    throw new Error(`That photo is larger than ${mb(maxBytes)}. Try a smaller one.`);
  }
}

export function assertMediaFile(file: File, maxBytes = MAX_MEDIA_BYTES) {
  if (!isAllowedMime(file.type, MEDIA_MIME_TYPES)) {
    throw new Error("That file type isn't supported. Use a photo, video or audio recording.");
  }
  if (file.size > maxBytes) {
    throw new Error(`That file is larger than ${mb(maxBytes)}. Try a smaller one.`);
  }
}
