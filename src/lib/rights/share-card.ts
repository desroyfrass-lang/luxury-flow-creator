/**
 * FRASS-0492 — Frassy makes the screenshot.
 *
 * The platform rule: members should never need to screenshot Frass to share
 * something. When they want to share something they own or are authorised to
 * share, Frassy renders an approved, branded, rights-aware image instead.
 *
 * This is the single share-image renderer for the whole platform. Card, Money
 * Moves milestones, product previews, artwork previews, certificates and QR
 * codes all pass through here. Never build a second one.
 */

import type { ShareKind } from "./protection";

export type ShareCardSpec = {
  kind: ShareKind;
  /** Small line above the headline — "Frass Card", "Milestone", "Verified". */
  eyebrow: string;
  headline: string;
  /** Up to three supporting lines of everyday language. */
  lines?: string[];
  /** Optional image (avatar, product, watermarked artwork preview). */
  imageUrl?: string | null;
  /** Where this leads — printed at the foot of the card. */
  footer?: string;
  /** Present only when the creator allows their work to be previewed outward. */
  watermark?: string | null;
};

const W = 1080;
const H = 1350;

const INK = "#0b0b0c";
const GOLD = "#c9a227";
const PAPER = "#f4f1ea";

function loadImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const attempt = line ? `${line} ${word}` : word;
    if (ctx.measureText(attempt).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = attempt;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/**
 * Renders the share card and returns a PNG blob. Runs in the browser only.
 */
export async function renderShareCard(spec: ShareCardSpec): Promise<Blob | null> {
  if (typeof document === "undefined") return null;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Ground: the Frass dark field, never a bright white card.
  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, W, H);

  const art = spec.imageUrl ? await loadImage(spec.imageUrl) : null;
  const artBottom = 760;

  if (art) {
    const scale = Math.max(W / art.width, artBottom / art.height);
    const dw = art.width * scale;
    const dh = art.height * scale;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, W, artBottom);
    ctx.clip();
    ctx.drawImage(art, (W - dw) / 2, (artBottom - dh) / 2, dw, dh);
    // Scrim so the type always reads.
    const grad = ctx.createLinearGradient(0, artBottom * 0.35, 0, artBottom);
    grad.addColorStop(0, "rgba(11,11,12,0)");
    grad.addColorStop(1, INK);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, artBottom);
    ctx.restore();

    if (spec.watermark) {
      ctx.save();
      ctx.translate(W / 2, artBottom / 2);
      ctx.rotate(-0.42);
      ctx.font = "900 64px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(255,255,255,0.16)";
      ctx.fillText(`${spec.watermark.toUpperCase()} · FRASS`, 0, 0);
      ctx.restore();
    }
  }

  const top = art ? artBottom + 70 : 300;

  ctx.textAlign = "left";
  ctx.fillStyle = GOLD;
  ctx.font = "700 26px system-ui, sans-serif";
  ctx.fillText(spec.eyebrow.toUpperCase(), 80, top);

  ctx.fillStyle = PAPER;
  ctx.font = "900 76px system-ui, sans-serif";
  let y = top + 96;
  for (const line of wrap(ctx, spec.headline, W - 160).slice(0, 3)) {
    ctx.fillText(line, 80, y);
    y += 86;
  }

  ctx.fillStyle = "rgba(244,241,234,0.72)";
  ctx.font = "400 32px system-ui, sans-serif";
  y += 16;
  for (const raw of (spec.lines ?? []).slice(0, 3)) {
    for (const line of wrap(ctx, raw, W - 160).slice(0, 2)) {
      ctx.fillText(line, 80, y);
      y += 44;
    }
    y += 8;
  }

  // Foot: the mark, and where this leads.
  ctx.fillStyle = GOLD;
  ctx.fillRect(80, H - 150, 90, 3);
  ctx.fillStyle = PAPER;
  ctx.font = "900 34px system-ui, sans-serif";
  ctx.fillText("FRASS", 80, H - 90);
  if (spec.footer) {
    ctx.fillStyle = "rgba(244,241,234,0.6)";
    ctx.font = "400 26px system-ui, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(spec.footer, W - 80, H - 90);
  }

  return await new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/png", 0.95));
}

/** Share it through the device sheet where possible, otherwise download it. */
export async function shareCard(spec: ShareCardSpec, filename = "frass-share.png"): Promise<"shared" | "saved" | "failed"> {
  const blob = await renderShareCard(spec);
  if (!blob) return "failed";
  const file = new File([blob], filename, { type: "image/png" });

  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  if (nav.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: spec.headline });
      return "shared";
    } catch {
      // The member closed the sheet — fall through to saving.
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  return "saved";
}
