import { Link } from "@tanstack/react-router";
import { useLiveNow } from "@/hooks/use-live";
import { liveButtonLabel } from "@/lib/live";

/**
 * FRASS-0416 — the permanent live entry point.
 * When nobody is live it invites you to go live; when the town is broadcasting
 * it becomes 🔴 Live Now (X) and takes you to the Live Directory instead.
 */
export function GoLiveButton({ className = "" }: { className?: string }) {
  const { data = [] } = useLiveNow();
  const active = data.length;
  const label = liveButtonLabel(active);

  return (
    <Link
      to={active > 0 ? "/live" : "/live/go"}
      className={`inline-flex items-center gap-2 rounded-full border border-red-500/70 bg-red-500/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.24em] text-red-600 transition hover:bg-red-500 hover:text-white ${className}`}
    >
      {active > 0 && (
        <span aria-hidden className="h-2 w-2 animate-pulse rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.9)]" />
      )}
      {label}
    </Link>
  );
}

/** The subtle 🔴 LIVE badge that follows a creator everywhere in Frass. */
export function LiveBadge({
  to,
  label = "Live",
  className = "",
}: {
  to?: string;
  label?: string;
  className?: string;
}) {
  const content = (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-red-600 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.22em] text-white ${className}`}
    >
      <span aria-hidden className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
      {label}
    </span>
  );
  if (!to) return content;
  return (
    <Link to={to} aria-label="Watch the live broadcast">
      {content}
    </Link>
  );
}

/**
 * Platform-wide status: drop this beside any creator's name and it shows
 * 🔴 LIVE the moment they start broadcasting, one click from the stream.
 */
export function CreatorLiveStatus({ hostId, className }: { hostId: string; className?: string }) {
  const { data = [] } = useLiveNow();
  const stream = data.find((b) => b.host_id === hostId);
  if (!stream) return null;
  return <LiveBadge to={`/live/${stream.id}`} className={className} />;
}
