import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { Play, Headphones, Radio, Mic2 } from "lucide-react";

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

const TRACKS = [
  { title: "Showroom Anthem", artist: "Frass Hill", length: "3:42", tag: "New" },
  { title: "Chrome Block", artist: "Frass Hill x DJ Lane", length: "4:08", tag: "Mix" },
  { title: "Original Street Luxury", artist: "Frass Hill", length: "2:56", tag: "Single" },
  { title: "Bare Drip Riddim", artist: "Frass Hill", length: "3:24", tag: "Visual" },
];

const MEDIA = [
  { title: "Behind the lookbook", kind: "Film", length: "06:12" },
  { title: "Late night in the showroom", kind: "Mix", length: "42:00" },
  { title: "Frass Hill on the block", kind: "Interview", length: "11:24" },
];

function MusicMedia() {
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
          {TRACKS.map((t, i) => (
            <div key={t.title} className="group flex items-center gap-5 px-5 md:px-8 py-5 hover:bg-secondary/40 transition">
              <button className="h-11 w-11 inline-flex items-center justify-center rounded-full border border-border group-hover:border-[color:var(--gold)] group-hover:text-[color:var(--gold)] transition">
                <Play className="h-4 w-4" />
              </button>
              <div className="w-8 text-xs tabular-nums text-muted-foreground">{String(i + 1).padStart(2, "0")}</div>
              <div className="flex-1 min-w-0">
                <div className="font-display text-xl md:text-2xl truncate">{t.title}</div>
                <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground mt-1">{t.artist}</div>
              </div>
              <span className="hidden md:inline-flex text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)] border border-[color:var(--gold)]/40 px-2 py-1 rounded">{t.tag}</span>
              <div className="text-sm tabular-nums text-muted-foreground">{t.length}</div>
            </div>
          ))}
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
          {MEDIA.map((m) => (
            <div key={m.title} className="group relative overflow-hidden rounded-2xl border border-border/60 bg-secondary/40 aspect-[4/5]">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/90" />
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <div className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]">{m.kind} · {m.length}</div>
                <div className="mt-2 font-display text-2xl md:text-3xl leading-tight">{m.title}</div>
              </div>
              <button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-16 w-16 rounded-full border border-[color:var(--gold)] bg-background/40 backdrop-blur inline-flex items-center justify-center group-hover:scale-110 transition">
                <Play className="h-5 w-5 text-[color:var(--gold)]" />
              </button>
            </div>
          ))}
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
