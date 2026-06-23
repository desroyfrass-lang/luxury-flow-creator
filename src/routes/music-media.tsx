import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { SiteShell } from "@/components/site-shell";
import { Play, Pause, Headphones, Radio, Mic2 } from "lucide-react";
import { useMediaItems, type MediaItem } from "@/hooks/use-media-items";

export const Route = createFileRoute("/music-media")({
  head: () => ({
    meta: [
      { title: "Music & Media — Frass Hill" },
      { name: "description", content: "Frass Hill music, mixes, visuals and media." },
      { property: "og:title", content: "Music & Media — Frass Hill" },
      { property: "og:description", content: "Latest drops, mixes, visuals and stories from the Frass Hill universe." },
    ],
  }),
  component: MusicMedia,
});

function isEmbed(url: string | null | undefined) {
  if (!url) return false;
  return /youtube\.com|youtu\.be|vimeo\.com|spotify\.com|soundcloud\.com/.test(url);
}

function toEmbedUrl(url: string) {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  const spotify = url.match(/open\.spotify\.com\/(track|album|playlist|episode)\/([\w]+)/);
  if (spotify) return `https://open.spotify.com/embed/${spotify[1]}/${spotify[2]}`;
  if (/soundcloud\.com/.test(url))
    return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23d4af37`;
  return url;
}

function MusicMedia() {
  const { data: items } = useMediaItems();
  const tracks = useMemo(() => (items ?? []).filter((i) => i.kind === "track"), [items]);
  const videos = useMemo(() => (items ?? []).filter((i) => i.kind === "video"), [items]);

  return (
    <SiteShell>
      <section className="mx-auto max-w-[1600px] px-6 lg:px-12 pt-16">
        <div className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-gradient-to-br from-background via-secondary/40 to-background p-10 md:p-16">
          <div className="absolute inset-0 opacity-40" style={{ background: "radial-gradient(60% 70% at 30% 30%, oklch(0.78 0.14 78 / 0.22), transparent 70%)" }} />
          <div className="relative">
            <div className="text-[11px] uppercase tracking-[0.35em] text-[color:var(--gold)]">Frass Hill Audio</div>
            <h1 className="mt-4 font-display text-6xl md:text-8xl leading-[0.9]">Music &amp; Media.</h1>
            <p className="mt-5 max-w-xl text-sm md:text-base text-muted-foreground">
              The soundtrack of the showroom. Tracks, mixes, films and visuals straight from the Frass Hill camp.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-6 lg:px-12 mt-20">
        <div className="flex items-end justify-between gap-6 mb-8">
          <div>
            <div className="mb-3 inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
              <span className="h-px w-8 bg-[color:var(--gold)]" />
              Latest Drops
            </div>
            <h2 className="font-display text-4xl md:text-6xl leading-[0.95]">On rotation.</h2>
          </div>
          <Headphones className="hidden md:block h-10 w-10 text-[color:var(--gold)]" />
        </div>

        <div className="rounded-2xl border border-border/60 bg-background/60 backdrop-blur divide-y divide-border/60 overflow-hidden">
          {tracks.map((t, i) => (
            <TrackRow key={t.id} item={t} index={i} />
          ))}
          {tracks.length === 0 && (
            <div className="p-10 text-center text-sm text-muted-foreground">No tracks yet.</div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-6 lg:px-12 mt-24">
        <div className="flex items-end justify-between gap-6 mb-8">
          <div>
            <div className="mb-3 inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
              <span className="h-px w-8 bg-[color:var(--gold)]" />
              Visuals &amp; Media
            </div>
            <h2 className="font-display text-4xl md:text-6xl leading-[0.95]">Watch the world.</h2>
          </div>
          <Radio className="hidden md:block h-10 w-10 text-[color:var(--gold)]" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {videos.map((m) => (
            <VideoCard key={m.id} item={m} />
          ))}
          {videos.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-border/60 p-10 text-center text-sm text-muted-foreground">
              No visuals yet.
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-6 lg:px-12 mt-24 mb-16">
        <div className="relative overflow-hidden rounded-[2rem] border border-[color:var(--gold)]/40 p-10 md:p-16 bg-secondary/40">
          <Mic2 className="absolute -right-6 -bottom-6 h-48 w-48 text-[color:var(--gold)]/10" />
          <div className="relative max-w-2xl">
            <div className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--gold)]">Studio Sessions</div>
            <h2 className="mt-3 font-display text-4xl md:text-6xl leading-[0.95]">Tune into Frass Hill radio.</h2>
            <p className="mt-5 text-sm md:text-base text-muted-foreground max-w-md">
              Weekly mixes, guest sets and exclusive previews from artists in the Frass Hill orbit.
            </p>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

function TrackRow({ item, index }: { item: MediaItem; index: number }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);

  const toggle = () => {
    if (!item.source_url) return;
    if (isEmbed(item.source_url)) {
      setShowEmbed((s) => !s);
      return;
    }
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      a.play();
      setPlaying(true);
    } else {
      a.pause();
      setPlaying(false);
    }
  };

  return (
    <div className="group">
      <div className="flex items-center gap-5 px-5 md:px-8 py-5 hover:bg-secondary/40 transition">
        <button
          onClick={toggle}
          disabled={!item.source_url}
          className="h-11 w-11 inline-flex items-center justify-center rounded-full border border-border group-hover:border-[color:var(--gold)] group-hover:text-[color:var(--gold)] transition disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
        <div className="w-8 text-xs tabular-nums text-muted-foreground">{String(index + 1).padStart(2, "0")}</div>
        <div className="flex-1 min-w-0">
          <div className="font-display text-xl md:text-2xl truncate">{item.title}</div>
          {item.subtitle && (
            <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground mt-1">{item.subtitle}</div>
          )}
        </div>
        {item.tag && (
          <span className="hidden md:inline-flex text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)] border border-[color:var(--gold)]/40 px-2 py-1 rounded">
            {item.tag}
          </span>
        )}
        {item.length && <div className="text-sm tabular-nums text-muted-foreground">{item.length}</div>}
      </div>

      {item.source_url && !isEmbed(item.source_url) && (
        <audio
          ref={audioRef}
          src={item.source_url}
          onEnded={() => setPlaying(false)}
          onPause={() => setPlaying(false)}
          onPlay={() => setPlaying(true)}
          preload="none"
          className="hidden"
        />
      )}
      {showEmbed && item.source_url && isEmbed(item.source_url) && (
        <div className="px-5 md:px-8 pb-5">
          <iframe
            src={toEmbedUrl(item.source_url)}
            className="w-full rounded-lg border border-border/60"
            style={{ height: /spotify/.test(item.source_url) ? 152 : 166 }}
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
            loading="lazy"
          />
        </div>
      )}
    </div>
  );
}

function VideoCard({ item }: { item: MediaItem }) {
  const [open, setOpen] = useState(false);
  const hasSource = Boolean(item.source_url);
  const embed = item.source_url && isEmbed(item.source_url);

  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-border/60 bg-secondary/40 aspect-[4/5]"
      style={
        item.poster_url
          ? { backgroundImage: `url(${item.poster_url})`, backgroundSize: "cover", backgroundPosition: "center" }
          : undefined
      }
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/90" />

      {open && hasSource && embed && (
        <iframe
          src={toEmbedUrl(item.source_url!)}
          className="absolute inset-0 h-full w-full"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          loading="lazy"
        />
      )}
      {open && hasSource && !embed && (
        <video src={item.source_url!} className="absolute inset-0 h-full w-full object-cover" controls autoPlay />
      )}

      {!open && (
        <>
          <div className="absolute inset-0 flex flex-col justify-end p-6">
            <div className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
              {item.tag ?? "Video"}{item.length ? ` · ${item.length}` : ""}
            </div>
            <div className="mt-2 font-display text-2xl md:text-3xl leading-tight">{item.title}</div>
          </div>
          <button
            onClick={() => hasSource && setOpen(true)}
            disabled={!hasSource}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-16 w-16 rounded-full border border-[color:var(--gold)] bg-background/40 backdrop-blur inline-flex items-center justify-center group-hover:scale-110 transition disabled:opacity-40"
            aria-label="Play"
          >
            <Play className="h-5 w-5 text-[color:var(--gold)]" />
          </button>
        </>
      )}
    </div>
  );
}
