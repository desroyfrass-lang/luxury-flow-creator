// FRASS-0485A — Frass Gallery Studio. The room where the work actually gets made.
// One canvas, real brushes, real layers. Simple mode hides everything you don't
// need yet; Professional mode gives you the whole bench.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AUTOSAVE_MS,
  BEGINNER_BRUSHES,
  BEGINNER_TOOLS,
  BLEND_MODES,
  BRUSHES,
  brushById,
  CANVAS_PRESETS,
  KEYBOARD_HELP,
  MODE_COPY,
  PALETTES,
  PERSPECTIVE_LABEL,
  STUDIO_STORAGE_KEY,
  SYMMETRY_LABEL,
  TOOLS,
  type BlendMode,
  type PerspectiveMode,
  type ShapeMode,
  type StudioMode,
  type SymmetryMode,
  type ToolId,
} from "@/lib/gallery/studio";
import {
  hexToHsv,
  hsvToHex,
  PaintEngine,
  snapToVanishing,
  type Point,
  type StrokeSettings,
} from "@/lib/gallery/paint-engine";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

type Props = {
  width?: number;
  height?: number;
  /** Called when the artist sends the piece to their gallery. */
  onExport?: (blob: Blob, thumbnail: string) => void | Promise<void>;
};

export function DrawingCanvas({ width = 2048, height = 2560, onExport }: Props) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const displayRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<PaintEngine | null>(null);
  const rafRef = useRef<number | null>(null);
  const dragRef = useRef<{ mode: "draw" | "pan" | "shape" | "select"; from: Point } | null>(null);

  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<StudioMode>("beginner");
  const [tool, setTool] = useState<ToolId>("brush");
  const [brushId, setBrushId] = useState("graphite");
  const [color, setColor] = useState("#141210");
  const [recent, setRecent] = useState<string[]>([]);
  const [sizeScale, setSizeScale] = useState(1);
  const [opacity, setOpacity] = useState(1);
  const [flow, setFlow] = useState(1);
  const [stabilize, setStabilize] = useState(0.25);
  const [symmetry, setSymmetry] = useState<SymmetryMode>("off");
  const [radial, setRadial] = useState(8);
  const [perspective, setPerspective] = useState<PerspectiveMode>("off");
  const [shape, setShape] = useState<ShapeMode>("line");
  const [shapeFill, setShapeFill] = useState(false);
  const [zoom, setZoom] = useState(0.3);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [tick, setTick] = useState(0);
  const [pressureSeen, setPressureSeen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ a: Point; b: Point } | null>(null);

  const brush = brushById(brushId);
  const activeBrush = useMemo(() => {
    if (tool === "eraser") return brushById("eraser");
    if (tool === "smudge") return brushById("smudge");
    return brush;
  }, [tool, brush]);

  const settings: StrokeSettings = useMemo(
    () => ({
      brush: activeBrush,
      color,
      sizeScale,
      stabilize,
      opacity,
      flow,
      symmetry,
      radialSegments: radial,
      pixelSnap: activeBrush.family === "pixel",
    }),
    [activeBrush, color, sizeScale, stabilize, opacity, flow, symmetry, radial],
  );
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  // ── Engine boot + restore ──────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let engine: PaintEngine | null = null;
      try {
        const raw = window.localStorage.getItem(STUDIO_STORAGE_KEY);
        if (raw) {
          const doc = JSON.parse(raw);
          if (doc?.width && doc?.layers?.length) engine = await PaintEngine.deserialize(doc);
        }
      } catch {
        engine = null;
      }
      if (!engine) engine = new PaintEngine({ width, height, background: "#ffffff" });
      if (cancelled) return;
      engine.onChange = () => setTick((t) => t + 1);
      engineRef.current = engine;
      setReady(true);
      fit(engine.width, engine.height);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fit = useCallback((w: number, h: number) => {
    const box = viewportRef.current?.getBoundingClientRect();
    if (!box) return;
    const z = Math.min((box.width - 48) / w, (box.height - 48) / h);
    setZoom(Math.max(0.05, z));
    setPan({ x: 0, y: 0 });
  }, []);

  // ── Render loop ────────────────────────────────────────────────────────────
  const paintDisplay = useCallback(() => {
    const engine = engineRef.current;
    const canvas = displayRef.current;
    if (!engine || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (canvas.width !== engine.width || canvas.height !== engine.height) {
      canvas.width = engine.width;
      canvas.height = engine.height;
    }
    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, engine.width, engine.height);
    ctx.restore();
    engine.composite(ctx);

    // Assistant overlays live on the display only — never in the artwork.
    if (engine.selection) {
      ctx.save();
      ctx.strokeStyle = "rgba(212,175,55,0.9)";
      ctx.setLineDash([12, 10]);
      ctx.lineWidth = 3 / zoom;
      ctx.strokeRect(engine.selection.x, engine.selection.y, engine.selection.w, engine.selection.h);
      ctx.restore();
    }
    if (symmetry !== "off") {
      ctx.save();
      ctx.strokeStyle = "rgba(212,175,55,0.28)";
      ctx.lineWidth = 2 / zoom;
      if (symmetry === "vertical" || symmetry === "quad" || symmetry === "radial") {
        ctx.beginPath(); ctx.moveTo(engine.width / 2, 0); ctx.lineTo(engine.width / 2, engine.height); ctx.stroke();
      }
      if (symmetry === "horizontal" || symmetry === "quad" || symmetry === "radial") {
        ctx.beginPath(); ctx.moveTo(0, engine.height / 2); ctx.lineTo(engine.width, engine.height / 2); ctx.stroke();
      }
      ctx.restore();
    }
    if (perspective !== "off") {
      ctx.save();
      ctx.strokeStyle = "rgba(120,180,255,0.22)";
      ctx.lineWidth = 1.5 / zoom;
      vanishingPoints(perspective, engine.width, engine.height).forEach((vp) => {
        for (let i = 0; i < 24; i += 1) {
          const a = (Math.PI * 2 * i) / 24;
          ctx.beginPath();
          ctx.moveTo(vp.x, vp.y);
          ctx.lineTo(vp.x + Math.cos(a) * engine.width * 2, vp.y + Math.sin(a) * engine.width * 2);
          ctx.stroke();
        }
      });
      ctx.restore();
    }
    if (preview) {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(1, activeBrush.size * sizeScale * 0.5);
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      if (shape === "line") { ctx.moveTo(preview.a.x, preview.a.y); ctx.lineTo(preview.b.x, preview.b.y); }
      else if (shape === "rect") ctx.rect(Math.min(preview.a.x, preview.b.x), Math.min(preview.a.y, preview.b.y), Math.abs(preview.b.x - preview.a.x), Math.abs(preview.b.y - preview.a.y));
      else ctx.ellipse((preview.a.x + preview.b.x) / 2, (preview.a.y + preview.b.y) / 2, Math.abs(preview.b.x - preview.a.x) / 2, Math.abs(preview.b.y - preview.a.y) / 2, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }, [zoom, symmetry, perspective, preview, color, activeBrush, sizeScale, shape]);

  useEffect(() => {
    if (!ready) return;
    paintDisplay();
  }, [ready, tick, paintDisplay]);

  const schedule = useCallback(() => {
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      paintDisplay();
    });
  }, [paintDisplay]);

  // ── Autosave ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!ready) return;
    const id = window.setInterval(() => {
      const engine = engineRef.current;
      if (!engine) return;
      try {
        window.localStorage.setItem(STUDIO_STORAGE_KEY, JSON.stringify(engine.serialize()));
      } catch {
        /* a full disk should never interrupt the drawing */
      }
    }, AUTOSAVE_MS);
    return () => window.clearInterval(id);
  }, [ready, tick]);

  // ── Pointer plumbing ───────────────────────────────────────────────────────
  const toCanvas = useCallback((e: React.PointerEvent): Point => {
    const canvas = displayRef.current!;
    const rect = canvas.getBoundingClientRect();
    const engine = engineRef.current!;
    return {
      x: ((e.clientX - rect.left) / rect.width) * engine.width,
      y: ((e.clientY - rect.top) / rect.height) * engine.height,
      p: e.pointerType === "pen" ? e.pressure || 0.5 : e.pressure && e.pressure !== 0.5 ? e.pressure : 1,
      tx: (e as unknown as { tiltX?: number }).tiltX ?? 0,
      ty: (e as unknown as { tiltY?: number }).tiltY ?? 0,
      t: e.timeStamp,
    };
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    const engine = engineRef.current;
    if (!engine) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    const pt = toCanvas(e);
    if (e.pointerType === "pen" && e.pressure > 0 && e.pressure !== 0.5) setPressureSeen(true);

    // Palm rejection: once a pen has been seen, ignore stray touches.
    if (pressureSeen && e.pointerType === "touch") return;

    if (tool === "pan" || e.button === 1) {
      dragRef.current = { mode: "pan", from: pt };
      return;
    }
    if (tool === "eyedropper" || e.altKey) {
      const picked = engine.pickColor(pt.x, pt.y);
      if (picked) pushColor(picked);
      return;
    }
    if (tool === "fill") {
      engine.fill(pt.x, pt.y, color);
      return;
    }
    if (tool === "select") {
      dragRef.current = { mode: "select", from: pt };
      engine.selection = { x: pt.x, y: pt.y, w: 0, h: 0 };
      return;
    }
    if (tool === "shape") {
      dragRef.current = { mode: "shape", from: pt };
      setPreview({ a: pt, b: pt });
      return;
    }
    dragRef.current = { mode: "draw", from: pt };
    engine.beginStroke(pt, settingsRef.current);
    schedule();
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const engine = engineRef.current;
    const drag = dragRef.current;
    if (!engine || !drag) return;
    if (pressureSeen && e.pointerType === "touch") return;

    // Coalesced events give tablets their true sampling rate.
    const events = (e.nativeEvent.getCoalescedEvents?.() ?? []) as PointerEvent[];
    const points = events.length
      ? events.map((ev) => toCanvas({ ...e, clientX: ev.clientX, clientY: ev.clientY, pressure: ev.pressure, pointerType: ev.pointerType, timeStamp: ev.timeStamp } as unknown as React.PointerEvent))
      : [toCanvas(e)];

    if (drag.mode === "pan") {
      const last = points[points.length - 1]!;
      setPan((p) => ({ x: p.x + (last.x - drag.from.x) * zoom, y: p.y + (last.y - drag.from.y) * zoom }));
      return;
    }
    if (drag.mode === "select") {
      const last = points[points.length - 1]!;
      engine.selection = {
        x: Math.min(drag.from.x, last.x),
        y: Math.min(drag.from.y, last.y),
        w: Math.abs(last.x - drag.from.x),
        h: Math.abs(last.y - drag.from.y),
      };
      schedule();
      return;
    }
    if (drag.mode === "shape") {
      setPreview({ a: drag.from, b: points[points.length - 1]! });
      schedule();
      return;
    }
    for (const raw of points) {
      const pt = applyAssistants(raw, drag.from, perspective, engine.width, engine.height, e.shiftKey);
      engine.extendStroke(pt, settingsRef.current);
    }
    schedule();
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const engine = engineRef.current;
    const drag = dragRef.current;
    dragRef.current = null;
    if (!engine || !drag) return;
    if (drag.mode === "draw") {
      engine.endStroke();
      pushColor(color);
    } else if (drag.mode === "shape" && preview) {
      engine.drawShape(shape === "polygon" ? "line" : shape, preview.a, toCanvas(e), settingsRef.current, shapeFill);
      setPreview(null);
    } else if (drag.mode === "select" && engine.selection && engine.selection.w < 4) {
      engine.selection = null;
    }
    schedule();
  };

  const pushColor = (hex: string) => {
    setColor(hex);
    setRecent((r) => [hex, ...r.filter((c) => c !== hex)].slice(0, 12));
  };

  // ── Keyboard ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine) return;
      const target = e.target as HTMLElement | null;
      if (target && /INPUT|TEXTAREA|SELECT/.test(target.tagName)) return;
      const k = e.key.toLowerCase();
      if ((e.metaKey || e.ctrlKey) && k === "z") {
        e.preventDefault();
        e.shiftKey ? engine.redo() : engine.undo();
        return;
      }
      if (k === "[") { setSizeScale((s) => Math.max(0.05, s * 0.85)); return; }
      if (k === "]") { setSizeScale((s) => Math.min(8, s * 1.15)); return; }
      const match = TOOLS.find((t) => t.key.toLowerCase() === k);
      if (match && (mode === "pro" || BEGINNER_TOOLS.includes(match.id))) setTool(match.id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode]);

  // ── Export ─────────────────────────────────────────────────────────────────
  const handleExport = async () => {
    const engine = engineRef.current;
    if (!engine || !onExport) return;
    setSaving(true);
    try {
      const blob = await engine.toBlob("image/png", undefined, "#ffffff");
      await onExport(blob, engine.thumbnail());
      setNote("Sent to your gallery. Frassy will help you title and price it.");
    } catch {
      setNote("That didn't send. Your work is safe on this device — try again.");
    } finally {
      setSaving(false);
      window.setTimeout(() => setNote(null), 6000);
    }
  };

  const download = async () => {
    const engine = engineRef.current;
    if (!engine) return;
    const blob = await engine.toBlob("image/png", undefined, "#ffffff");
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `frass-studio-${Date.now()}.png`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const engine = engineRef.current;
  const visibleTools = mode === "pro" ? TOOLS : TOOLS.filter((t) => BEGINNER_TOOLS.includes(t.id));
  const visibleBrushes = mode === "pro" ? BRUSHES : BRUSHES.filter((b) => BEGINNER_BRUSHES.includes(b.id));
  const hsv = hexToHsv(color);

  return (
    <div className="flex h-[calc(100dvh-4rem)] w-full flex-col overflow-hidden bg-background text-foreground">
      {/* Top bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border/60 bg-card/60 px-3 py-2 backdrop-blur">
        <span className="mr-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Gallery Studio
        </span>
        <div className="flex items-center gap-1 rounded-full border border-border/60 p-0.5">
          {(["beginner", "pro"] as StudioMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "rounded-full px-3 py-1 text-xs transition",
                mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {MODE_COPY[m].label}
            </button>
          ))}
        </div>
        <div className="mx-2 h-5 w-px bg-border/60" />
        <Button size="sm" variant="ghost" disabled={!engine?.canUndo} onClick={() => engine?.undo()}>Undo</Button>
        <Button size="sm" variant="ghost" disabled={!engine?.canRedo} onClick={() => engine?.redo()}>Redo</Button>
        <div className="mx-2 h-5 w-px bg-border/60" />
        <Button size="sm" variant="ghost" onClick={() => engine && fit(engine.width, engine.height)}>Fit</Button>
        <span className="text-xs tabular-nums text-muted-foreground">{Math.round(zoom * 100)}%</span>
        <div className="ml-auto flex items-center gap-2">
          {pressureSeen ? (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] text-primary">✒️ Pen pressure active</span>
          ) : null}
          <Button size="sm" variant="outline" onClick={download}>Download</Button>
          {onExport ? (
            <Button size="sm" onClick={handleExport} disabled={saving}>
              {saving ? "Sending…" : "Send to my gallery"}
            </Button>
          ) : null}
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* Tools */}
        <div className="flex w-16 shrink-0 flex-col items-center gap-1 border-r border-border/60 bg-card/40 py-3">
          {visibleTools.map((t) => (
            <button
              key={t.id}
              title={`${t.label} — ${t.hint}`}
              onClick={() => setTool(t.id)}
              className={cn(
                "w-12 rounded-lg px-1 py-2 text-[10px] leading-tight transition",
                tool === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Canvas viewport */}
        <div
          ref={viewportRef}
          className="relative min-w-0 flex-1 overflow-hidden bg-[radial-gradient(circle_at_center,hsl(var(--muted))_0%,hsl(var(--background))_70%)]"
        >
          {!ready ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Preparing your canvas…
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <canvas
                ref={displayRef}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                onPointerLeave={onPointerUp}
                onContextMenu={(e) => e.preventDefault()}
                className="touch-none rounded-sm shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] ring-1 ring-border/60"
                style={{
                  width: (engine?.width ?? width) * zoom,
                  height: (engine?.height ?? height) * zoom,
                  transform: `translate(${pan.x}px, ${pan.y}px)`,
                  cursor: tool === "pan" ? "grab" : "crosshair",
                  imageRendering: activeBrush.family === "pixel" ? "pixelated" : "auto",
                }}
              />
            </div>
          )}
          {note ? (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-card px-4 py-2 text-xs shadow-lg ring-1 ring-border">
              {note}
            </div>
          ) : null}
        </div>

        {/* Right rail */}
        <div className="w-72 shrink-0 space-y-4 overflow-y-auto border-l border-border/60 bg-card/40 p-3">
          {/* Colour */}
          <section className="space-y-2">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Colour</h3>
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-md ring-1 ring-border" style={{ background: color }} />
              <input
                type="color"
                value={color}
                onChange={(e) => pushColor(e.target.value)}
                className="h-10 w-10 cursor-pointer rounded-md border border-border bg-transparent"
                aria-label="Pick a colour"
              />
              <input
                value={color}
                onChange={(e) => /^#[0-9a-f]{0,6}$/i.test(e.target.value) && setColor(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-2 py-1 font-mono text-xs"
                aria-label="Colour hex value"
              />
            </div>
            <label className="block text-[11px] text-muted-foreground">Hue</label>
            <input
              type="range"
              min={0}
              max={359}
              value={Math.round(hsv.h)}
              onChange={(e) => setColor(hsvToHex(Number(e.target.value), Math.max(0.05, hsv.s), Math.max(0.1, hsv.v)))}
              className="w-full"
            />
            <div className="grid grid-cols-6 gap-1">
              {(PALETTES.find((p) => p.id === "frass")?.colors ?? []).concat(recent).slice(0, 18).map((c, i) => (
                <button
                  key={`${c}-${i}`}
                  onClick={() => pushColor(c)}
                  className="h-6 rounded ring-1 ring-border/60"
                  style={{ background: c }}
                  aria-label={`Use colour ${c}`}
                />
              ))}
            </div>
            {mode === "pro" ? (
              <select
                className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
                onChange={(e) => {
                  const p = PALETTES.find((x) => x.id === e.target.value);
                  if (p?.colors[0]) pushColor(p.colors[0]);
                  if (p) setRecent(p.colors);
                }}
                defaultValue=""
              >
                <option value="" disabled>Load a palette…</option>
                {PALETTES.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            ) : null}
          </section>

          {/* Brush */}
          <section className="space-y-2">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Brush</h3>
            <div className="grid grid-cols-2 gap-1">
              {visibleBrushes.map((b) => (
                <button
                  key={b.id}
                  title={b.hint}
                  onClick={() => { setBrushId(b.id); if (b.family !== "eraser" && b.family !== "smudge") setTool("brush"); }}
                  className={cn(
                    "rounded-md px-2 py-1.5 text-left text-[11px] transition",
                    brushId === b.id ? "bg-primary text-primary-foreground" : "bg-muted/60 hover:bg-muted",
                  )}
                >
                  {b.label}
                </button>
              ))}
            </div>
            <Labeled label="Size" value={`${Math.round(activeBrush.size * sizeScale)} px`}>
              <Slider value={[sizeScale]} min={0.05} max={6} step={0.05} onValueChange={([v]) => setSizeScale(v ?? 1)} />
            </Labeled>
            <Labeled label="Opacity" value={`${Math.round(opacity * 100)}%`}>
              <Slider value={[opacity]} min={0.02} max={1} step={0.01} onValueChange={([v]) => setOpacity(v ?? 1)} />
            </Labeled>
            {mode === "pro" ? (
              <>
                <Labeled label="Flow" value={`${Math.round(flow * 100)}%`}>
                  <Slider value={[flow]} min={0.02} max={1} step={0.01} onValueChange={([v]) => setFlow(v ?? 1)} />
                </Labeled>
                <Labeled label="Steadiness" value={`${Math.round(stabilize * 100)}%`}>
                  <Slider value={[stabilize]} min={0} max={1} step={0.01} onValueChange={([v]) => setStabilize(v ?? 0)} />
                </Labeled>
              </>
            ) : (
              <p className="text-[11px] text-muted-foreground">{activeBrush.hint}</p>
            )}
          </section>

          {/* Assistants */}
          {mode === "pro" ? (
            <section className="space-y-2">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Assistants</h3>
              <select
                value={symmetry}
                onChange={(e) => setSymmetry(e.target.value as SymmetryMode)}
                className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
              >
                {Object.entries(SYMMETRY_LABEL).map(([k, v]) => <option key={k} value={k}>{`Symmetry: ${v}`}</option>)}
              </select>
              {symmetry === "radial" ? (
                <Labeled label="Segments" value={String(radial)}>
                  <Slider value={[radial]} min={2} max={24} step={1} onValueChange={([v]) => setRadial(v ?? 8)} />
                </Labeled>
              ) : null}
              <select
                value={perspective}
                onChange={(e) => setPerspective(e.target.value as PerspectiveMode)}
                className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
              >
                {Object.entries(PERSPECTIVE_LABEL).map(([k, v]) => <option key={k} value={k}>{`Perspective: ${v}`}</option>)}
              </select>
              {tool === "shape" ? (
                <div className="flex items-center gap-1">
                  {(["line", "rect", "ellipse"] as ShapeMode[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setShape(s)}
                      className={cn("flex-1 rounded-md px-2 py-1 text-[11px]", shape === s ? "bg-primary text-primary-foreground" : "bg-muted/60")}
                    >
                      {s}
                    </button>
                  ))}
                  <button
                    onClick={() => setShapeFill((f) => !f)}
                    className={cn("rounded-md px-2 py-1 text-[11px]", shapeFill ? "bg-primary text-primary-foreground" : "bg-muted/60")}
                  >
                    fill
                  </button>
                </div>
              ) : null}
            </section>
          ) : null}

          {/* Layers */}
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Layers</h3>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => engine?.addLayer()}>+</Button>
                {mode === "pro" ? (
                  <>
                    <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => engine?.duplicateLayer()}>⧉</Button>
                    <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => engine?.mergeDown()}>⤓</Button>
                  </>
                ) : null}
                <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => engine?.removeLayer()}>🗑</Button>
              </div>
            </div>
            <div className="space-y-1">
              {[...(engine?.layers ?? [])].map((l, i) => i).reverse().map((i) => {
                const l = engine!.layers[i]!;
                return (
                  <div
                    key={l.id}
                    onClick={() => { engineRef.current!.activeIndex = i; setTick((t) => t + 1); }}
                    className={cn(
                      "cursor-pointer rounded-md border px-2 py-1.5 text-[11px] transition",
                      engine!.activeIndex === i ? "border-primary bg-primary/10" : "border-border/60 hover:bg-muted/50",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); l.visible = !l.visible; setTick((t) => t + 1); }}
                        aria-label={l.visible ? "Hide layer" : "Show layer"}
                      >
                        {l.visible ? "👁" : "🚫"}
                      </button>
                      <span className="flex-1 truncate">{l.name}</span>
                      {mode === "pro" ? (
                        <button onClick={(e) => { e.stopPropagation(); engine!.moveLayer(i, 1); }} aria-label="Move layer up">↑</button>
                      ) : null}
                    </div>
                    {mode === "pro" && engine!.activeIndex === i ? (
                      <div className="mt-1.5 space-y-1">
                        <Slider
                          value={[l.opacity]}
                          min={0}
                          max={1}
                          step={0.01}
                          onValueChange={([v]) => { l.opacity = v ?? 1; setTick((t) => t + 1); }}
                        />
                        <select
                          value={l.blend}
                          onChange={(e) => { l.blend = e.target.value as BlendMode; setTick((t) => t + 1); }}
                          className="w-full rounded border border-border bg-background px-1 py-0.5 text-[11px]"
                        >
                          {BLEND_MODES.map((b) => <option key={b} value={b}>{b}</option>)}
                        </select>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Canvas */}
          {mode === "pro" ? (
            <section className="space-y-2">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Canvas</h3>
              <select
                className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
                defaultValue=""
                onChange={(e) => {
                  const preset = CANVAS_PRESETS.find((p) => p.id === e.target.value);
                  if (!preset) return;
                  if (!window.confirm("Start a new canvas? Your current piece is auto-saved on this device only — download it first if you want to keep it.")) return;
                  const next = new PaintEngine({ width: preset.w, height: preset.h, background: "#ffffff" });
                  next.onChange = () => setTick((t) => t + 1);
                  engineRef.current = next;
                  fit(next.width, next.height);
                  setTick((t) => t + 1);
                }}
              >
                <option value="" disabled>New canvas…</option>
                {CANVAS_PRESETS.map((p) => <option key={p.id} value={p.id}>{`${p.label} — ${p.note}`}</option>)}
              </select>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => engine?.flipLayer("x")}>Flip ↔</Button>
                <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => engine?.flipLayer("y")}>Flip ↕</Button>
              </div>
              {engine?.selection ? (
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => engine.fillSelection(color)}>Fill area</Button>
                  <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => engine.clearSelection()}>Clear area</Button>
                </div>
              ) : null}
              <details className="rounded-md bg-muted/40 p-2 text-[11px] text-muted-foreground">
                <summary className="cursor-pointer">Keyboard shortcuts</summary>
                <ul className="mt-1 space-y-0.5">
                  {KEYBOARD_HELP.map((k) => (
                    <li key={k.keys}><span className="font-mono text-foreground">{k.keys}</span> — {k.what}</li>
                  ))}
                </ul>
              </details>
            </section>
          ) : (
            <p className="rounded-md bg-muted/40 p-2 text-[11px] text-muted-foreground">
              {MODE_COPY.beginner.note}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Labeled({ label, value, children }: { label: string; value: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>{label}</span>
        <span className="tabular-nums">{value}</span>
      </div>
      {children}
    </div>
  );
}

function vanishingPoints(mode: PerspectiveMode, w: number, h: number) {
  const y = h * 0.45;
  if (mode === "one") return [{ x: w / 2, y }];
  if (mode === "two") return [{ x: -w * 0.25, y }, { x: w * 1.25, y }];
  if (mode === "three") return [{ x: -w * 0.25, y }, { x: w * 1.25, y }, { x: w / 2, y: h * 1.8 }];
  if (mode === "isometric") return [{ x: -w * 2, y: h / 2 }, { x: w * 3, y: h / 2 }];
  return [];
}

/** Straight-line and perspective snapping, applied before the stroke is stamped. */
function applyAssistants(
  pt: Point,
  from: Point,
  perspective: PerspectiveMode,
  w: number,
  h: number,
  shift: boolean,
): Point {
  if (shift) {
    const dx = pt.x - from.x;
    const dy = pt.y - from.y;
    return Math.abs(dx) > Math.abs(dy) ? { ...pt, y: from.y } : { ...pt, x: from.x };
  }
  if (perspective === "off") return pt;
  const vps = vanishingPoints(perspective, w, h);
  if (!vps.length) return pt;
  let best = pt;
  let bestDist = Infinity;
  for (const vp of vps) {
    const snapped = snapToVanishing(from, pt, vp);
    const d = Math.hypot(snapped.x - pt.x, snapped.y - pt.y);
    if (d < bestDist && d < 40) {
      bestDist = d;
      best = { ...pt, ...snapped };
    }
  }
  return best;
}
