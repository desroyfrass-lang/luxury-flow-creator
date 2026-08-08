// FRASS-0400 — Upload Manager.
// Every intake is visible: waiting, processing, indexing, ready, failed.
// Pause, resume, retry, cancel, storage used, estimated time.

import { Pause, Play, RotateCcw, X, CheckCircle2, AlertTriangle, Loader2, Brain } from "lucide-react";
import {
  formatBytes,
  formatEta,
  type UploadItem,
  type UploadQueue,
} from "@/lib/workspace/upload-queue";

const LABEL: Record<UploadItem["status"], string> = {
  queued: "Waiting",
  processing: "Processing",
  paused: "Paused",
  indexing: "Frassy indexing",
  ready: "Ready",
  failed: "Failed",
  cancelled: "Cancelled",
};

function StatusIcon({ status }: { status: UploadItem["status"] }) {
  if (status === "ready") return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />;
  if (status === "failed") return <AlertTriangle className="h-3.5 w-3.5 text-red-400" />;
  if (status === "indexing") return <Brain className="h-3.5 w-3.5 animate-pulse text-[color:var(--ws-gold)]" />;
  if (status === "processing") return <Loader2 className="h-3.5 w-3.5 animate-spin opacity-70" />;
  return <Pause className="h-3.5 w-3.5 opacity-50" />;
}

export function UploadManager({ queue }: { queue: UploadQueue }) {
  const { items, stats, paused } = queue;
  if (!items.length) return null;

  return (
    <div className="ws-uploads">
      <div className="ws-uploads-head">
        <span>
          Upload Manager · {stats.waiting} waiting · {stats.active} processing · {stats.ready} ready
          {stats.failed ? ` · ${stats.failed} failed` : ""}
        </span>
        <span className="flex items-center gap-2">
          <span className="opacity-60">{formatBytes(stats.stored)} stored</span>
          <button
            type="button"
            className="ws-chip"
            onClick={() => (paused ? queue.resumeAll() : queue.pauseAll())}
          >
            {paused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
            <span className="hidden sm:inline">{paused ? "Resume all" : "Pause all"}</span>
          </button>
          <button type="button" className="ws-chip" onClick={queue.clearFinished}>
            Clear done
          </button>
        </span>
      </div>

      <ul className="ws-uploads-list">
        {items.map((i) => (
          <li key={i.id} className="ws-upload-row">
            {i.previewUrl ? (
              <img src={i.previewUrl} alt="" className="h-8 w-8 rounded object-cover" />
            ) : (
              <span className="ws-upload-kind">{i.kind.slice(0, 3)}</span>
            )}
            <span className="min-w-0 flex-1">
              <span className="ws-upload-name">{i.path}</span>
              <span className="ws-upload-meta">
                <StatusIcon status={i.status} />
                {LABEL[i.status]} · {formatBytes(i.size)}
                {i.status === "processing" && ` · ${i.progress}% · ${formatEta(i.eta)} left`}
                {i.error ? ` · ${i.error}` : ""}
              </span>
              <span className="ws-upload-bar">
                <span
                  className="ws-upload-fill"
                  style={{ width: `${i.status === "ready" ? 100 : i.progress}%` }}
                />
              </span>
            </span>
            <span className="flex items-center gap-1">
              {(i.status === "failed" || i.status === "cancelled") && (
                <button type="button" className="ws-icon" aria-label="Retry" onClick={() => queue.retry(i.id)}>
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              )}
              {i.status === "paused" && (
                <button type="button" className="ws-icon" aria-label="Resume" onClick={() => queue.resumeOne(i.id)}>
                  <Play className="h-3.5 w-3.5" />
                </button>
              )}
              <button type="button" className="ws-icon" aria-label="Remove" onClick={() => queue.cancel(i.id)}>
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
