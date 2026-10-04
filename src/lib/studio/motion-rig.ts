// FRASS Native Motion Rig v1 — Frass-owned animation machine.
// Runs on the member's own device (like A1 Clean): it reads an approved Frassy
// picture, renders real frames with a deterministic breathing curve, and
// encodes them into a playable WebM video. No outside service, no model, no cost.
// The source picture is only read, never changed.

export const MOTION_RIG_ENGINE = {
  type: "frass_native" as const,
  slug: "frass_motion_rig_v1",
  version: "1.0.0",
  runtime: "browser",
} as const;

export const MOTION_RIG_BUCKET = "studio-motion";
export const MOTION_LOOP_SECONDS = 3;
const FPS = 30;

export function motionRigPaths(userId: string, jobId: string) {
  return { output: `${userId}/${jobId}/idle-breathing.webm` };
}

/** Breathing curve: 0 at start and end of every loop, so the loop is seamless. */
export function breathAt(t: number, period = MOTION_LOOP_SECONDS): number {
  return (1 - Math.cos((2 * Math.PI * t) / period)) / 2; // 0 → 1 → 0
}

/** Transform for one frame, anchored at the bottom centre (seated body). */
export function breathTransform(t: number) {
  const b = breathAt(t);
  return { scaleX: 1 + 0.004 * b, scaleY: 1 + 0.014 * b, liftPx: -1.5 * b };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("The approved Frassy picture could not be loaded."));
    img.src = src;
  });
}

function pickMime(): string {
  for (const m of ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"]) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(m)) return m;
  }
  throw new Error("This browser cannot run the Motion Rig (no WebM recorder).");
}

/** Render a real idle-breathing loop from an approved picture. */
export async function renderIdleBreathing(sourceUrl: string, width = 480): Promise<Blob> {
  const img = await loadImage(sourceUrl);
  const height = Math.round((img.naturalHeight / img.naturalWidth) * width / 2) * 2;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("This browser cannot draw Motion Rig frames.");
  const mime = pickMime();
  const stream = canvas.captureStream(FPS);
  const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 2_500_000 });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data);

  const draw = (t: number) => {
    const { scaleX, scaleY, liftPx } = breathTransform(t);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#f6f1e7";
    ctx.fillRect(0, 0, width, height);
    ctx.setTransform(scaleX, 0, 0, scaleY, (width * (1 - scaleX)) / 2, height * (1 - scaleY) + liftPx);
    ctx.drawImage(img, 0, 0, width, height);
  };

  draw(0);
  const done = new Promise<Blob>((resolve) => {
    recorder.onstop = () => resolve(new Blob(chunks, { type: "video/webm" }));
  });
  recorder.start(250);
  const start = performance.now();
  await new Promise<void>((resolve) => {
    const tick = () => {
      const t = (performance.now() - start) / 1000;
      draw(Math.min(t, MOTION_LOOP_SECONDS));
      if (t >= MOTION_LOOP_SECONDS) return resolve();
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  recorder.stop();
  stream.getTracks().forEach((tr) => tr.stop());
  return done;
}

export type MotionCheck = { durationSeconds: number; width: number; height: number };

/** Playback check: the file must decode, report a real length, and show a real picture. */
export async function verifyPlayable(blob: Blob): Promise<MotionCheck> {
  const url = URL.createObjectURL(blob);
  const video = document.createElement("video");
  video.muted = true;
  video.preload = "auto";
  const once = (ev: string) =>
    new Promise<void>((resolve, reject) => {
      const t = setTimeout(() => reject(new Error("The motion file did not play back.")), 10000);
      video.addEventListener(ev, () => { clearTimeout(t); resolve(); }, { once: true });
      video.addEventListener("error", () => { clearTimeout(t); reject(new Error("The motion file could not be decoded.")); }, { once: true });
    });
  try {
    const meta = once("loadedmetadata");
    video.src = url;
    await meta;
    if (!Number.isFinite(video.duration)) {
      const s = once("seeked");
      video.currentTime = 1e6; // MediaRecorder files learn their length after a seek
      await s;
    }
    const durationSeconds = video.duration;
    if (!Number.isFinite(durationSeconds) || durationSeconds < 2) throw new Error("The motion file has no real length.");
    const s2 = once("seeked");
    video.currentTime = durationSeconds / 2;
    await s2;
    const c = document.createElement("canvas");
    c.width = video.videoWidth;
    c.height = video.videoHeight;
    const cx = c.getContext("2d")!;
    cx.drawImage(video, 0, 0);
    const px = cx.getImageData(0, 0, c.width, c.height).data;
    let min = 255, max = 0;
    for (let i = 0; i < px.length; i += 400) { min = Math.min(min, px[i]!); max = Math.max(max, px[i]!); }
    if (max - min < 20) throw new Error("The motion file shows no picture.");
    return { durationSeconds: Math.round(durationSeconds * 100) / 100, width: video.videoWidth, height: video.videoHeight };
  } finally {
    URL.revokeObjectURL(url);
  }
}
