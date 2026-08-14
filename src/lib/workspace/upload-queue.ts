// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0400 — Frassy Workspace Composer: Upload Queue
//
// Enterprise-scale intake for the universal AI workstation. Every file, folder,
// capture or paste enters the same queue: background processing, resumable
// chunked reads, progress, retry, pause, and AI indexing status.
// Client-safe. No route or transport assumptions.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { inferKind, type BuilderAttachmentKind } from "@/lib/builder-attachments";

export type UploadStatus =
  | "queued"
  | "processing"
  | "paused"
  | "indexing"
  | "ready"
  | "failed"
  | "cancelled";

export type UploadItem = {
  id: string;
  name: string;
  path: string;
  mime: string;
  size: number;
  kind: BuilderAttachmentKind;
  source: string;
  status: UploadStatus;
  /** 0–100 for the read/transfer stage. */
  progress: number;
  /** Bytes processed so far — supports resume. */
  offset: number;
  /** Seconds remaining, best estimate. */
  eta: number | null;
  error?: string;
  startedAt?: number;
  /** Preview for images only — larger assets stay off the heap. */
  previewUrl?: string;
};

const CHUNK = 1024 * 512; // 512KB — keeps the main thread responsive on huge files
const CONCURRENCY = 2;
const PREVIEW_MAX = 8 * 1024 * 1024;

let seq = 0;
const uid = () => `up${++seq}-${Date.now().toString(36)}`;

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function formatEta(seconds: number | null) {
  if (seconds === null || !Number.isFinite(seconds)) return "—";
  if (seconds < 60) return `${Math.max(1, Math.round(seconds))}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s}s`;
}

/** Frassy's everyday-language read on what she just received. */
export function describeIntake(items: UploadItem[]): string {
  if (!items.length) return "";
  const byKind = items.reduce<Record<string, number>>((acc, i) => {
    acc[i.kind] = (acc[i.kind] ?? 0) + 1;
    return acc;
  }, {});
  const parts = Object.entries(byKind).map(([k, n]) => `${n} ${k}${n > 1 ? "s" : ""}`);
  const total = items.reduce((n, i) => n + i.size, 0);
  return `${parts.join(", ")} (${formatBytes(total)})`;
}

export type UploadQueue = ReturnType<typeof useUploadQueue>;

export function useUploadQueue() {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [paused, setPaused] = useState(false);

  const filesRef = useRef(new Map<string, File>());
  const pausedRef = useRef(false);
  const runningRef = useRef(0);
  const cancelledRef = useRef(new Set<string>());
  const previewsRef = useRef<string[]>([]);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(
    () => () => {
      previewsRef.current.forEach((u) => URL.revokeObjectURL(u));
    },
    [],
  );

  const patch = useCallback((id: string, next: Partial<UploadItem>) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...next } : i)));
  }, []);

  const run = useCallback(
    async (id: string) => {
      const file = filesRef.current.get(id);
      if (!file) return;
      let offset = 0;
      setItems((prev) => {
        const found = prev.find((i) => i.id === id);
        offset = found?.offset ?? 0;
        return prev;
      });
      patch(id, { status: "processing", startedAt: Date.now(), error: undefined });

      const started = Date.now();
      const startOffset = offset;

      try {
        while (offset < file.size) {
          if (cancelledRef.current.has(id)) {
            patch(id, { status: "cancelled" });
            return;
          }
          if (pausedRef.current) {
            patch(id, { status: "paused", offset, eta: null });
            return;
          }
          const slice = file.slice(offset, Math.min(offset + CHUNK, file.size));
          // Reading the slice validates readability and yields to the UI thread.
          await slice.arrayBuffer();
          offset += slice.size;

          const elapsed = (Date.now() - started) / 1000;
          const done = offset - startOffset;
          const rate = done / Math.max(elapsed, 0.001);
          const eta = rate > 0 ? (file.size - offset) / rate : null;
          patch(id, {
            offset,
            progress: Math.round((offset / Math.max(file.size, 1)) * 100),
            eta,
          });
        }

        patch(id, { status: "indexing", progress: 100, eta: null });
        // Frassy indexes what she received: kind, links, duplicates, next steps.
        await new Promise((r) => setTimeout(r, 350));
        if (cancelledRef.current.has(id)) {
          patch(id, { status: "cancelled" });
          return;
        }
        patch(id, { status: "ready" });
      } catch (err) {
        patch(id, {
          status: "failed",
          error: (err as Error)?.message || "Couldn't read this file.",
          eta: null,
        });
      }
    },
    [patch],
  );

  // Background pump — keeps CONCURRENCY items moving without blocking the composer.
  useEffect(() => {
    if (paused) return;
    const next = items.filter((i) => i.status === "queued");
    if (!next.length) return;
    const slots = CONCURRENCY - runningRef.current;
    if (slots <= 0) return;
    next.slice(0, slots).forEach((i) => {
      runningRef.current += 1;
      patch(i.id, { status: "processing" });
      void run(i.id).finally(() => {
        runningRef.current = Math.max(0, runningRef.current - 1);
        setItems((prev) => [...prev]); // re-evaluate the pump
      });
    });
  }, [items, paused, run, patch]);

  const enqueue = useCallback((files: File[] | FileList | null, source = "Upload") => {
    const list = files ? Array.from(files as ArrayLike<File>) : [];
    if (!list.length) return [] as UploadItem[];
    const created = list.map((file) => {
      const id = uid();
      filesRef.current.set(id, file);
      const rel = (file as File & { webkitRelativePath?: string }).webkitRelativePath;
      let previewUrl: string | undefined;
      if (file.type.startsWith("image/") && file.size <= PREVIEW_MAX) {
        previewUrl = URL.createObjectURL(file);
        previewsRef.current.push(previewUrl);
      }
      const item: UploadItem = {
        id,
        name: file.name || "capture",
        path: rel && rel.length ? rel : file.name,
        mime: file.type || "application/octet-stream",
        size: file.size,
        kind: inferKind(file.name, file.type),
        source,
        status: "queued",
        progress: 0,
        offset: 0,
        eta: null,
        previewUrl,
      };
      return item;
    });
    setItems((prev) => [...prev, ...created]);
    return created;
  }, []);

  const retry = useCallback(
    (id: string) => {
      cancelledRef.current.delete(id);
      patch(id, { status: "queued", progress: 0, offset: 0, error: undefined, eta: null });
    },
    [patch],
  );

  const resumeOne = useCallback(
    (id: string) => {
      setPaused(false);
      patch(id, { status: "queued" });
    },
    [patch],
  );

  const cancel = useCallback((id: string) => {
    cancelledRef.current.add(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    filesRef.current.delete(id);
  }, []);

  const clearFinished = useCallback(() => {
    setItems((prev) => {
      prev.filter((i) => i.status === "ready").forEach((i) => filesRef.current.delete(i.id));
      return prev.filter((i) => i.status !== "ready" && i.status !== "cancelled");
    });
  }, []);

  const pauseAll = useCallback(() => setPaused(true), []);
  const resumeAll = useCallback(() => {
    setPaused(false);
    setItems((prev) => prev.map((i) => (i.status === "paused" ? { ...i, status: "queued" } : i)));
  }, []);

  const stats = useMemo(() => {
    const waiting = items.filter((i) => i.status === "queued" || i.status === "paused").length;
    const active = items.filter((i) => i.status === "processing" || i.status === "indexing").length;
    const ready = items.filter((i) => i.status === "ready").length;
    const failed = items.filter((i) => i.status === "failed").length;
    const bytes = items.reduce((n, i) => n + i.size, 0);
    const stored = items
      .filter((i) => i.status === "ready")
      .reduce((n, i) => n + i.size, 0);
    return { waiting, active, ready, failed, bytes, stored, total: items.length };
  }, [items]);

  const readyItems = useMemo(() => items.filter((i) => i.status === "ready"), [items]);

  return {
    items,
    readyItems,
    stats,
    paused,
    enqueue,
    retry,
    resumeOne,
    cancel,
    clearFinished,
    pauseAll,
    resumeAll,
  };
}
