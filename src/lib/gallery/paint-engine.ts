// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0485A — the Frass Gallery Studio paint engine.
//
// A real raster painting engine: stamped brush strokes with pressure, tilt and
// velocity response, per-layer compositing with blend modes, stabilisation,
// symmetry, wet colour pickup, flood fill, selections and undo history.
//
// Deliberately framework-free — it owns pixels, React owns the interface.
// Everything is 2D canvas so it runs on any tablet a member already owns.
// ─────────────────────────────────────────────────────────────────────────────

import { canvasBlend, type BlendMode, type Brush, type SymmetryMode } from "./studio";

export type Point = { x: number; y: number; p: number; tx: number; ty: number; t: number };

export type LayerInit = { name?: string; visible?: boolean; opacity?: number; blend?: BlendMode };

export class Layer {
  readonly id: string;
  name: string;
  visible = true;
  locked = false;
  alphaLock = false;
  opacity = 1;
  blend: BlendMode = "normal";
  readonly canvas: HTMLCanvasElement;
  readonly ctx: CanvasRenderingContext2D;

  constructor(w: number, h: number, init: LayerInit = {}) {
    this.id = `l_${Math.random().toString(36).slice(2, 10)}`;
    this.name = init.name ?? "Layer";
    this.visible = init.visible ?? true;
    this.opacity = init.opacity ?? 1;
    this.blend = init.blend ?? "normal";
    this.canvas = document.createElement("canvas");
    this.canvas.width = w;
    this.canvas.height = h;
    const ctx = this.canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("Canvas is not available in this browser.");
    this.ctx = ctx;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  snapshot(): ImageData {
    return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  }

  restore(data: ImageData) {
    this.ctx.putImageData(data, 0, 0);
  }
}

type HistoryEntry = { layerId: string; before: ImageData; after: ImageData };

export type StrokeSettings = {
  brush: Brush;
  /** #rrggbb */
  color: string;
  /** Multiplies brush.size. */
  sizeScale: number;
  /** 0–1, overrides brush default when set. */
  stabilize: number;
  opacity: number;
  flow: number;
  symmetry: SymmetryMode;
  radialSegments: number;
  /** Pixel-art mode: no anti-aliasing, integer stamps. */
  pixelSnap: boolean;
};

export type EngineOptions = { width: number; height: number; background?: string | null };

const MAX_HISTORY = 40;

export class PaintEngine {
  readonly width: number;
  readonly height: number;
  layers: Layer[] = [];
  activeIndex = 0;
  /** Selection mask — null means the whole canvas is live. */
  selection: { x: number; y: number; w: number; h: number } | null = null;

  private undoStack: HistoryEntry[] = [];
  private redoStack: HistoryEntry[] = [];
  private strokeBefore: ImageData | null = null;
  private strokeLayer: Layer | null = null;

  private last: Point | null = null;
  private carry = 0;
  private smoothBuf: Point[] = [];
  private grainTile: HTMLCanvasElement | null = null;
  /** Wet brushes carry the colour they picked up. */
  private wetColor: [number, number, number] | null = null;

  onChange: (() => void) | null = null;

  constructor(opts: EngineOptions) {
    this.width = opts.width;
    this.height = opts.height;
    const base = new Layer(this.width, this.height, { name: "Background" });
    if (opts.background) {
      base.ctx.fillStyle = opts.background;
      base.ctx.fillRect(0, 0, this.width, this.height);
    }
    this.layers = [base, new Layer(this.width, this.height, { name: "Layer 1" })];
    this.activeIndex = 1;
  }

  // ── Layers ────────────────────────────────────────────────────────────────

  get active(): Layer {
    return this.layers[this.activeIndex] ?? this.layers[this.layers.length - 1]!;
  }

  addLayer(name?: string): Layer {
    const l = new Layer(this.width, this.height, { name: name ?? `Layer ${this.layers.length}` });
    this.layers.splice(this.activeIndex + 1, 0, l);
    this.activeIndex += 1;
    this.onChange?.();
    return l;
  }

  duplicateLayer(index = this.activeIndex) {
    const src = this.layers[index];
    if (!src) return;
    const copy = new Layer(this.width, this.height, { name: `${src.name} copy`, opacity: src.opacity, blend: src.blend });
    copy.ctx.drawImage(src.canvas, 0, 0);
    this.layers.splice(index + 1, 0, copy);
    this.activeIndex = index + 1;
    this.onChange?.();
  }

  removeLayer(index = this.activeIndex) {
    if (this.layers.length <= 1) return;
    this.layers.splice(index, 1);
    this.activeIndex = Math.max(0, Math.min(this.activeIndex, this.layers.length - 1));
    this.onChange?.();
  }

  moveLayer(index: number, dir: -1 | 1) {
    const to = index + dir;
    if (to < 0 || to >= this.layers.length) return;
    const [l] = this.layers.splice(index, 1);
    if (!l) return;
    this.layers.splice(to, 0, l);
    this.activeIndex = to;
    this.onChange?.();
  }

  mergeDown(index = this.activeIndex) {
    const upper = this.layers[index];
    const lower = this.layers[index - 1];
    if (!upper || !lower) return;
    this.pushHistoryFor(lower, () => {
      lower.ctx.save();
      lower.ctx.globalAlpha = upper.opacity;
      lower.ctx.globalCompositeOperation = canvasBlend(upper.blend);
      lower.ctx.drawImage(upper.canvas, 0, 0);
      lower.ctx.restore();
    });
    this.layers.splice(index, 1);
    this.activeIndex = index - 1;
    this.onChange?.();
  }

  // ── History ───────────────────────────────────────────────────────────────

  private pushHistoryFor(layer: Layer, mutate: () => void) {
    const before = layer.snapshot();
    mutate();
    const after = layer.snapshot();
    this.undoStack.push({ layerId: layer.id, before, after });
    if (this.undoStack.length > MAX_HISTORY) this.undoStack.shift();
    this.redoStack = [];
  }

  private layerById(id: string) {
    return this.layers.find((l) => l.id === id) ?? null;
  }

  undo(): boolean {
    const e = this.undoStack.pop();
    if (!e) return false;
    this.layerById(e.layerId)?.restore(e.before);
    this.redoStack.push(e);
    this.onChange?.();
    return true;
  }

  redo(): boolean {
    const e = this.redoStack.pop();
    if (!e) return false;
    this.layerById(e.layerId)?.restore(e.after);
    this.undoStack.push(e);
    this.onChange?.();
    return true;
  }

  get canUndo() { return this.undoStack.length > 0; }
  get canRedo() { return this.redoStack.length > 0; }

  // ── Stroke lifecycle ──────────────────────────────────────────────────────

  beginStroke(pt: Point, s: StrokeSettings) {
    const layer = this.active;
    if (layer.locked) return;
    this.strokeLayer = layer;
    this.strokeBefore = layer.snapshot();
    this.last = null;
    this.carry = 0;
    this.smoothBuf = [pt];
    this.wetColor = null;
    this.extendStroke(pt, s);
  }

  extendStroke(raw: Point, s: StrokeSettings) {
    const layer = this.strokeLayer;
    if (!layer) return;
    const pt = this.stabilise(raw, s.stabilize);
    if (!this.last) {
      this.last = pt;
      this.stampSymmetric(layer, pt, pt, s);
      return;
    }
    const from = this.last;
    const dx = pt.x - from.x;
    const dy = pt.y - from.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 0.01) return;

    const diameter = Math.max(0.6, s.brush.size * s.sizeScale);
    const step = Math.max(s.brush.family === "pixel" ? 1 : 0.5, diameter * s.brush.spacing);
    let travelled = this.carry;
    while (travelled + step <= dist) {
      travelled += step;
      const t = travelled / dist;
      const at: Point = {
        x: from.x + dx * t,
        y: from.y + dy * t,
        p: from.p + (pt.p - from.p) * t,
        tx: pt.tx,
        ty: pt.ty,
        t: pt.t,
      };
      this.stampSymmetric(layer, at, from, s);
    }
    this.carry = travelled - dist;
    this.last = pt;
  }

  endStroke() {
    const layer = this.strokeLayer;
    if (layer && this.strokeBefore) {
      const after = layer.snapshot();
      this.undoStack.push({ layerId: layer.id, before: this.strokeBefore, after });
      if (this.undoStack.length > MAX_HISTORY) this.undoStack.shift();
      this.redoStack = [];
    }
    this.strokeLayer = null;
    this.strokeBefore = null;
    this.last = null;
    this.smoothBuf = [];
    this.wetColor = null;
    this.onChange?.();
  }

  /** Weighted trailing average — the "the line follows your hand a beat later" feel. */
  private stabilise(pt: Point, amount: number): Point {
    if (amount <= 0.01) return pt;
    const window = Math.max(2, Math.round(2 + amount * 22));
    this.smoothBuf.push(pt);
    if (this.smoothBuf.length > window) this.smoothBuf.shift();
    let wx = 0, wy = 0, wp = 0, sum = 0;
    this.smoothBuf.forEach((q, i) => {
      const w = i + 1;
      wx += q.x * w; wy += q.y * w; wp += q.p * w; sum += w;
    });
    return { ...pt, x: wx / sum, y: wy / sum, p: wp / sum };
  }

  // ── Stamping ──────────────────────────────────────────────────────────────

  private stampSymmetric(layer: Layer, at: Point, from: Point, s: StrokeSettings) {
    this.stamp(layer, at, from, s);
    if (s.symmetry === "off") return;
    const cx = this.width / 2;
    const cy = this.height / 2;
    const mirrors: Point[] = [];
    if (s.symmetry === "vertical" || s.symmetry === "quad") mirrors.push({ ...at, x: 2 * cx - at.x });
    if (s.symmetry === "horizontal" || s.symmetry === "quad") mirrors.push({ ...at, y: 2 * cy - at.y });
    if (s.symmetry === "quad") mirrors.push({ ...at, x: 2 * cx - at.x, y: 2 * cy - at.y });
    if (s.symmetry === "radial") {
      const n = Math.max(2, Math.min(24, s.radialSegments));
      const vx = at.x - cx;
      const vy = at.y - cy;
      for (let i = 1; i < n; i += 1) {
        const a = (Math.PI * 2 * i) / n;
        mirrors.push({ ...at, x: cx + vx * Math.cos(a) - vy * Math.sin(a), y: cy + vx * Math.sin(a) + vy * Math.cos(a) });
      }
    }
    mirrors.forEach((m) => this.stamp(layer, m, from, s));
  }

  private stamp(layer: Layer, at: Point, from: Point, s: StrokeSettings) {
    const b = s.brush;
    const ctx = layer.ctx;
    if (this.selection) {
      const sel = this.selection;
      if (at.x < sel.x || at.y < sel.y || at.x > sel.x + sel.w || at.y > sel.y + sel.h) return;
    }

    const pressure = clamp(at.p <= 0 ? 0.5 : at.p, 0.01, 1);
    const base = Math.max(0.6, b.size * s.sizeScale);
    const size = base * (b.minSizeRatio + (1 - b.minSizeRatio) * pressure);
    const alpha =
      clamp(s.opacity * b.opacity, 0, 1) *
      clamp(s.flow * b.flow, 0, 1) *
      (1 - b.pressureOpacity + b.pressureOpacity * pressure);
    if (alpha <= 0.001 || size <= 0) return;

    ctx.save();
    if (this.selection) {
      const sel = this.selection;
      ctx.beginPath();
      ctx.rect(sel.x, sel.y, sel.w, sel.h);
      ctx.clip();
    }
    if (layer.alphaLock) ctx.globalCompositeOperation = "source-atop";

    // Eraser lifts pixels rather than painting them.
    if (b.family === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.globalAlpha = alpha;
      this.paintTip(ctx, at, from, size, b, "#000000", s);
      ctx.restore();
      return;
    }

    // Smudge and wet media sample what is already on the layer.
    let color = s.color;
    if (b.wet > 0) {
      const picked = this.samplePixel(layer, from.x, from.y);
      if (picked) {
        const target = b.family === "smudge" ? picked : mixHex(s.color, picked, b.wet * 0.7);
        this.wetColor = hexToRgb(this.wetColor ? mixHex(rgbToHex(this.wetColor), target, 0.5) : target);
        color = rgbToHex(this.wetColor);
      }
    }
    if (b.family === "smudge" && !this.wetColor) {
      ctx.restore();
      return;
    }

    ctx.globalAlpha = b.family === "smudge" ? alpha * 0.55 : alpha;
    this.paintTip(ctx, at, from, size, b, color, s);
    ctx.restore();
  }

  private paintTip(
    ctx: CanvasRenderingContext2D,
    at: Point,
    from: Point,
    size: number,
    b: Brush,
    color: string,
    s: StrokeSettings,
  ) {
    // Tilt and stroke direction shape the tip like a real nib or pencil edge.
    const tilt = Math.min(1, Math.hypot(at.tx, at.ty) / 60);
    const stretch = 1 + tilt * b.tiltShape * 1.6;
    const dirAngle = Math.atan2(at.y - from.y, at.x - from.x);
    const tiltAngle = at.tx || at.ty ? Math.atan2(at.ty, at.tx) : dirAngle;
    const angle = b.family === "ink" || b.family === "pencil" ? tiltAngle : dirAngle;

    let x = at.x;
    let y = at.y;
    if (b.scatter > 0) {
      const r = (Math.random() - 0.5) * size * b.scatter * 2;
      x += Math.cos(dirAngle + Math.PI / 2) * r;
      y += Math.sin(dirAngle + Math.PI / 2) * r;
    }

    if (s.pixelSnap || b.family === "pixel") {
      const px = Math.max(1, Math.round(size));
      ctx.fillStyle = color;
      ctx.fillRect(Math.round(x - px / 2), Math.round(y - px / 2), px, px);
      return;
    }

    const r = size / 2;
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.scale(stretch, 1 / Math.max(1, stretch * 0.75));

    if (b.hardness >= 0.94) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const g = ctx.createRadialGradient(0, 0, r * b.hardness * 0.9, 0, 0, r);
      const [cr, cg, cb] = hexToRgb(color);
      g.addColorStop(0, `rgba(${cr},${cg},${cb},1)`);
      g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
    }

    if (b.grain > 0.02) {
      ctx.globalAlpha *= b.grain * 0.5;
      ctx.globalCompositeOperation = "destination-out";
      const tile = this.grain();
      const pat = ctx.createPattern(tile, "repeat");
      if (pat) {
        ctx.fillStyle = pat;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  /** A stable noise tile so texture doesn't crawl between stamps. */
  private grain(): HTMLCanvasElement {
    if (this.grainTile) return this.grainTile;
    const t = document.createElement("canvas");
    t.width = 64;
    t.height = 64;
    const c = t.getContext("2d")!;
    const img = c.createImageData(64, 64);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.random() * 255;
      img.data[i] = 0;
      img.data[i + 1] = 0;
      img.data[i + 2] = 0;
      img.data[i + 3] = v > 150 ? v : 0;
    }
    c.putImageData(img, 0, 0);
    this.grainTile = t;
    return t;
  }

  private samplePixel(layer: Layer, x: number, y: number): string | null {
    const ix = Math.round(x);
    const iy = Math.round(y);
    if (ix < 0 || iy < 0 || ix >= this.width || iy >= this.height) return null;
    const d = layer.ctx.getImageData(ix, iy, 1, 1).data;
    if (d[3] === 0) return null;
    return rgbToHex([d[0]!, d[1]!, d[2]!]);
  }

  /** Colour under the cursor across the whole composite (eyedropper). */
  pickColor(x: number, y: number): string | null {
    const flat = this.flatten();
    const ix = Math.round(x);
    const iy = Math.round(y);
    if (ix < 0 || iy < 0 || ix >= this.width || iy >= this.height) return null;
    const d = flat.getContext("2d")!.getImageData(ix, iy, 1, 1).data;
    if (d[3] === 0) return null;
    return rgbToHex([d[0]!, d[1]!, d[2]!]);
  }

  // ── Shapes & text ─────────────────────────────────────────────────────────

  drawShape(kind: "line" | "rect" | "ellipse", a: { x: number; y: number }, bpt: { x: number; y: number }, s: StrokeSettings, fill: boolean) {
    const layer = this.active;
    if (layer.locked) return;
    this.pushHistoryFor(layer, () => {
      const ctx = layer.ctx;
      ctx.save();
      ctx.globalAlpha = s.opacity;
      ctx.strokeStyle = s.color;
      ctx.fillStyle = s.color;
      ctx.lineWidth = Math.max(1, s.brush.size * s.sizeScale * 0.5);
      ctx.lineCap = "round";
      ctx.beginPath();
      if (kind === "line") {
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(bpt.x, bpt.y);
        ctx.stroke();
      } else if (kind === "rect") {
        ctx.rect(Math.min(a.x, bpt.x), Math.min(a.y, bpt.y), Math.abs(bpt.x - a.x), Math.abs(bpt.y - a.y));
        fill ? ctx.fill() : ctx.stroke();
      } else {
        ctx.ellipse((a.x + bpt.x) / 2, (a.y + bpt.y) / 2, Math.abs(bpt.x - a.x) / 2, Math.abs(bpt.y - a.y) / 2, 0, 0, Math.PI * 2);
        fill ? ctx.fill() : ctx.stroke();
      }
      ctx.restore();
    });
    this.onChange?.();
  }

  drawText(text: string, x: number, y: number, opts: { color: string; size: number; font: string }) {
    const layer = this.active;
    if (layer.locked) return;
    this.pushHistoryFor(layer, () => {
      const ctx = layer.ctx;
      ctx.save();
      ctx.fillStyle = opts.color;
      ctx.font = `${opts.size}px ${opts.font}`;
      ctx.textBaseline = "top";
      text.split("\n").forEach((line, i) => ctx.fillText(line, x, y + i * opts.size * 1.2));
      ctx.restore();
    });
    this.onChange?.();
  }

  // ── Fill ──────────────────────────────────────────────────────────────────

  /** Scanline flood fill with tolerance, respecting the selection rectangle. */
  fill(x: number, y: number, hex: string, tolerance = 32) {
    const layer = this.active;
    if (layer.locked) return;
    const sx = Math.round(x);
    const sy = Math.round(y);
    if (sx < 0 || sy < 0 || sx >= this.width || sy >= this.height) return;

    this.pushHistoryFor(layer, () => {
      const img = layer.ctx.getImageData(0, 0, this.width, this.height);
      const data = img.data;
      const idx = (px: number, py: number) => (py * this.width + px) * 4;
      const start = idx(sx, sy);
      const target = [data[start]!, data[start + 1]!, data[start + 2]!, data[start + 3]!];
      const [fr, fg, fb] = hexToRgb(hex);
      if (Math.abs(target[0] - fr) < 2 && Math.abs(target[1] - fg) < 2 && Math.abs(target[2] - fb) < 2 && target[3] === 255) return;

      const bounds = this.selection ?? { x: 0, y: 0, w: this.width, h: this.height };
      const minX = Math.max(0, Math.round(bounds.x));
      const minY = Math.max(0, Math.round(bounds.y));
      const maxX = Math.min(this.width - 1, Math.round(bounds.x + bounds.w));
      const maxY = Math.min(this.height - 1, Math.round(bounds.y + bounds.h));

      const matches = (i: number) =>
        Math.abs(data[i]! - target[0]) <= tolerance &&
        Math.abs(data[i + 1]! - target[1]) <= tolerance &&
        Math.abs(data[i + 2]! - target[2]) <= tolerance &&
        Math.abs(data[i + 3]! - target[3]) <= tolerance;

      const stack: [number, number][] = [[sx, sy]];
      const seen = new Uint8Array(this.width * this.height);
      while (stack.length) {
        const [cx, cy] = stack.pop()!;
        if (cy < minY || cy > maxY) continue;
        let left = cx;
        while (left > minX && matches(idx(left - 1, cy))) left -= 1;
        let right = cx;
        while (right < maxX && matches(idx(right + 1, cy))) right += 1;
        for (let px = left; px <= right; px += 1) {
          const flat = cy * this.width + px;
          if (seen[flat]) continue;
          seen[flat] = 1;
          const i = flat * 4;
          data[i] = fr; data[i + 1] = fg; data[i + 2] = fb; data[i + 3] = 255;
          if (cy > minY && matches(idx(px, cy - 1))) stack.push([px, cy - 1]);
          if (cy < maxY && matches(idx(px, cy + 1))) stack.push([px, cy + 1]);
        }
      }
      layer.ctx.putImageData(img, 0, 0);
    });
    this.onChange?.();
  }

  fillSelection(hex: string) {
    const layer = this.active;
    const sel = this.selection ?? { x: 0, y: 0, w: this.width, h: this.height };
    this.pushHistoryFor(layer, () => {
      layer.ctx.save();
      layer.ctx.fillStyle = hex;
      layer.ctx.fillRect(sel.x, sel.y, sel.w, sel.h);
      layer.ctx.restore();
    });
    this.onChange?.();
  }

  clearSelection() {
    const layer = this.active;
    const sel = this.selection ?? { x: 0, y: 0, w: this.width, h: this.height };
    this.pushHistoryFor(layer, () => layer.ctx.clearRect(sel.x, sel.y, sel.w, sel.h));
    this.onChange?.();
  }

  // ── Transform (whole layer, non-destructive until committed) ──────────────

  transformLayer(dx: number, dy: number, scale: number, rotation: number) {
    const layer = this.active;
    if (layer.locked) return;
    this.pushHistoryFor(layer, () => {
      const src = document.createElement("canvas");
      src.width = this.width;
      src.height = this.height;
      src.getContext("2d")!.drawImage(layer.canvas, 0, 0);
      layer.clear();
      const ctx = layer.ctx;
      ctx.save();
      ctx.translate(this.width / 2 + dx, this.height / 2 + dy);
      ctx.rotate(rotation);
      ctx.scale(scale, scale);
      ctx.drawImage(src, -this.width / 2, -this.height / 2);
      ctx.restore();
    });
    this.onChange?.();
  }

  flipLayer(axis: "x" | "y") {
    const layer = this.active;
    this.pushHistoryFor(layer, () => {
      const src = document.createElement("canvas");
      src.width = this.width;
      src.height = this.height;
      src.getContext("2d")!.drawImage(layer.canvas, 0, 0);
      layer.clear();
      const ctx = layer.ctx;
      ctx.save();
      ctx.translate(axis === "x" ? this.width : 0, axis === "y" ? this.height : 0);
      ctx.scale(axis === "x" ? -1 : 1, axis === "y" ? -1 : 1);
      ctx.drawImage(src, 0, 0);
      ctx.restore();
    });
    this.onChange?.();
  }

  placeImage(img: CanvasImageSource, w: number, h: number) {
    const layer = this.active;
    this.pushHistoryFor(layer, () => {
      const scale = Math.min(this.width / w, this.height / h);
      const dw = w * scale;
      const dh = h * scale;
      layer.ctx.drawImage(img, (this.width - dw) / 2, (this.height - dh) / 2, dw, dh);
    });
    this.onChange?.();
  }

  // ── Composite & export ────────────────────────────────────────────────────

  /** Draws the whole document into a target context (used by the viewport). */
  composite(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, this.width, this.height);
    for (const l of this.layers) {
      if (!l.visible || l.opacity <= 0) continue;
      ctx.save();
      ctx.globalAlpha = l.opacity;
      ctx.globalCompositeOperation = canvasBlend(l.blend);
      ctx.drawImage(l.canvas, 0, 0);
      ctx.restore();
    }
  }

  flatten(background?: string | null): HTMLCanvasElement {
    const out = document.createElement("canvas");
    out.width = this.width;
    out.height = this.height;
    const ctx = out.getContext("2d")!;
    if (background) {
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, this.width, this.height);
    }
    this.composite(ctx);
    return out;
  }

  async toBlob(type = "image/png", quality?: number, background?: string | null): Promise<Blob> {
    const canvas = this.flatten(background);
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Export failed."))), type, quality);
    });
  }

  thumbnail(maxSide = 480): string {
    const flat = this.flatten("#ffffff");
    const scale = Math.min(1, maxSide / Math.max(this.width, this.height));
    const t = document.createElement("canvas");
    t.width = Math.max(1, Math.round(this.width * scale));
    t.height = Math.max(1, Math.round(this.height * scale));
    const c = t.getContext("2d")!;
    c.imageSmoothingQuality = "high";
    c.drawImage(flat, 0, 0, t.width, t.height);
    return t.toDataURL("image/jpeg", 0.72);
  }

  /** Serialises every layer so a session survives a closed tab. */
  serialize() {
    return {
      width: this.width,
      height: this.height,
      activeIndex: this.activeIndex,
      layers: this.layers.map((l) => ({
        name: l.name,
        visible: l.visible,
        locked: l.locked,
        alphaLock: l.alphaLock,
        opacity: l.opacity,
        blend: l.blend,
        data: l.canvas.toDataURL("image/png"),
      })),
    };
  }

  static async deserialize(doc: ReturnType<PaintEngine["serialize"]>): Promise<PaintEngine> {
    const e = new PaintEngine({ width: doc.width, height: doc.height });
    e.layers = [];
    for (const l of doc.layers) {
      const layer = new Layer(doc.width, doc.height, { name: l.name, opacity: l.opacity, blend: l.blend as BlendMode });
      layer.visible = l.visible;
      layer.locked = l.locked;
      layer.alphaLock = l.alphaLock;
      if (l.data) {
        const img = new Image();
        img.src = l.data;
        await img.decode().catch(() => undefined);
        layer.ctx.drawImage(img, 0, 0);
      }
      e.layers.push(layer);
    }
    if (!e.layers.length) e.layers.push(new Layer(doc.width, doc.height, { name: "Layer 1" }));
    e.activeIndex = Math.min(doc.activeIndex, e.layers.length - 1);
    return e;
  }
}

// ── Colour helpers ───────────────────────────────────────────────────────────

export function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = Number.parseInt(full.slice(0, 6) || "000000", 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHex(rgb: [number, number, number]): string {
  return `#${rgb.map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, "0")).join("")}`;
}

export function mixHex(a: string, b: string, t: number): string {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  return rgbToHex([ar + (br - ar) * t, ag + (bg - ag) * t, ab + (bb - ab) * t]);
}

export function hsvToHex(h: number, s: number, v: number): string {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  const seg = Math.floor((h % 360) / 60);
  const table: [number, number, number][] = [[c, x, 0], [x, c, 0], [0, c, x], [0, x, c], [x, 0, c], [c, 0, x]];
  const [r, g, b] = table[seg] ?? [0, 0, 0];
  return rgbToHex([(r + m) * 255, (g + m) * 255, (b + m) * 255]);
}

export function hexToHsv(hex: string): { h: number; s: number; v: number } {
  const [r, g, b] = hexToRgb(hex).map((v) => v / 255) as [number, number, number];
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = 60 * (((g - b) / d) % 6);
    else if (max === g) h = 60 * ((b - r) / d + 2);
    else h = 60 * ((r - g) / d + 4);
  }
  if (h < 0) h += 360;
  return { h, s: max === 0 ? 0 : d / max, v: max };
}

/** Perspective assistant: snaps a point onto the ray from a vanishing point. */
export function snapToVanishing(
  from: { x: number; y: number },
  to: { x: number; y: number },
  vanishing: { x: number; y: number },
): { x: number; y: number } {
  const vx = from.x - vanishing.x;
  const vy = from.y - vanishing.y;
  const len = Math.hypot(vx, vy) || 1;
  const ux = vx / len;
  const uy = vy / len;
  const proj = (to.x - vanishing.x) * ux + (to.y - vanishing.y) * uy;
  return { x: vanishing.x + ux * proj, y: vanishing.y + uy * proj };
}
