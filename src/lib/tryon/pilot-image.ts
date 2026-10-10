// Try-On Phase C (technical setup) — pure checks, no network, no AI.
// The CJ image servers are allowed ONLY on this Founder-only pilot path.
// The member try-on generator's approved image list is deliberately unchanged.

/** Exact hostnames seen on the saved pilot records and verified to serve images. */
export const CJ_IMAGE_HOSTS = ["cf.cjdropshipping.com", "oss-cf.cjdropshipping.com"] as const;
export const PILOT_IMAGE_MAX_BYTES = 12 * 1024 * 1024;

/** Returns a reason string if the URL is refused, or null if it is acceptable. */
export function refuseCjImageUrl(url: string | null | undefined): string | null {
  if (!url) return "No supplier photo is saved for this size.";
  let u: URL;
  try { u = new URL(url); } catch { return "The saved photo link is not valid."; }
  if (u.protocol !== "https:") return "Photos must be served over https.";
  if (u.username || u.password) return "Photo links with credentials are refused.";
  if (u.port && u.port !== "443") return "Photo links on unusual ports are refused.";
  const host = u.hostname.toLowerCase();
  if (!(CJ_IMAGE_HOSTS as readonly string[]).includes(host)) return "That photo isn't on a verified CJ image server.";
  return null;
}

/** Identify the real file type from its first bytes, not from what the server claims. */
export function sniffImage(bytes: Uint8Array): "jpeg" | "png" | "webp" | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpeg";
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "png";
  if (bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP") return "webp";
  return null;
}

/** Read pixel size from JPEG/PNG headers (null if unknown). */
export function imageSize(bytes: Uint8Array, kind: "jpeg" | "png" | "webp"): { width: number; height: number } | null {
  if (kind === "png" && bytes.length >= 24) {
    const dv = new DataView(bytes.buffer, bytes.byteOffset);
    return { width: dv.getUint32(16), height: dv.getUint32(20) };
  }
  if (kind === "jpeg") {
    let i = 2;
    while (i + 9 < bytes.length) {
      if (bytes[i] !== 0xff) { i++; continue; }
      const m = bytes[i + 1];
      const len = (bytes[i + 2] << 8) | bytes[i + 3];
      if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) {
        return { height: (bytes[i + 5] << 8) | bytes[i + 6], width: (bytes[i + 7] << 8) | bytes[i + 8] };
      }
      i += 2 + len;
    }
  }
  return null;
}
