// FRASS-0486C — the only way video plays inside FRASS STREET.
//
// The child never leaves the street. Nothing autoplays, nothing recommends a
// next video, and an unapproved curation slot simply says so instead of
// falling back to an open search. Frassy brings content to the child; the child
// never goes out browsing for it.

import { useState } from "react";
import { embedUrl, isPlayable, type CuratedVideo } from "@/lib/kids/frass-street";

export function SafeVideo({ video }: { video: CuratedVideo }) {
  const [playing, setPlaying] = useState(false);
  const src = embedUrl(video);

  if (!isPlayable(video) || !src) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-6 text-center">
        <p className="text-3xl" aria-hidden>🎬</p>
        <p className="mt-2 text-sm font-semibold">Frassy is still choosing this one</p>
        <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
          Only videos a grown-up at Frass has watched and approved can play on this street.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-foreground/5 ring-1 ring-border">
      {playing ? (
        <div className="relative aspect-video w-full">
          <iframe
            src={src}
            title={video.title}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            sandbox="allow-scripts allow-same-origin allow-presentation"
            loading="lazy"
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="flex aspect-video w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-primary/15 to-accent/15 transition hover:from-primary/25"
        >
          <span className="grid h-16 w-16 place-items-center rounded-full bg-background/90 text-2xl shadow-lg" aria-hidden>
            ▶
          </span>
          <span className="px-6 text-center text-sm font-semibold">{video.title}</span>
          <span className="text-xs text-muted-foreground">{video.minutes} minutes · plays right here</span>
        </button>
      )}
      <p className="px-4 py-2 text-[11px] text-muted-foreground">
        Chosen by Frassy · {video.creditedTo}
      </p>
    </div>
  );
}
