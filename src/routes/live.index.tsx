import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { PageFeedback } from "@/components/page-feedback";
import { Radio, Users, Sparkles } from "lucide-react";
import { LiveBadge } from "@/components/live/live-status";
import { useLiveArchive, useLiveNow } from "@/hooks/use-live";
import {
  LIVE_DESTINATIONS,
  LIVE_PRINCIPLE,
  REPURPOSE_FORMATS,
  liveElapsed,
  purposeOf,
  type LiveBroadcast,
} from "@/lib/live";

/** FRASS-0416 — the Live Directory: everything broadcasting in Frass right now. */
export const Route = createFileRoute("/live/")({
  head: () => ({
    meta: [
      { title: "Live in Frass — For Us Live & Frass Radio Live" },
      {
        name: "description",
        content:
          "The Frass Live Directory: community broadcasts from For Us and scheduled programming on Frass Radio, all in one place.",
      },
      { property: "og:title", content: "Live in Frass" },
      {
        property: "og:description",
        content: "Community streaming in For Us. Curated broadcasts on Frass Radio. One directory for both.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LiveDirectory,
});

function BroadcastCard({ b, ended }: { b: LiveBroadcast; ended?: boolean }) {
  const purpose = purposeOf(b.purpose);
  return (
    <article className="group rounded-[1.75rem] border border-border bg-card p-6 transition hover:-translate-y-1 hover:border-red-500/50">
      <div className="flex flex-wrap items-center gap-2">
        {ended ? (
          <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
            Replay
          </span>
        ) : (
          <LiveBadge />
        )}
        <span className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
          {purpose.glyph} {purpose.label}
        </span>
        <span className="ml-auto text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
          {b.destination === "radio" ? "📻 Frass Radio" : "🔴 For Us"}
        </span>
      </div>
      <h3 className="mt-4 text-xl font-semibold leading-snug">{b.title}</h3>
      <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-[color:var(--gold)]">{b.host_name}</p>
      {b.summary && <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{b.summary}</p>}
      <div className="mt-5 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          {b.viewer_count} watching · {ended ? "ended" : liveElapsed(b.started_at)}
        </span>
        <Link
          to="/live/$broadcastId"
          params={{ broadcastId: b.id }}
          className="rounded-full border border-red-500/60 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-red-600 transition hover:bg-red-500 hover:text-white"
        >
          {ended ? "Open replay" : "Watch live"}
        </Link>
      </div>
    </article>
  );
}

function LiveDirectory() {
  const { data: live = [] } = useLiveNow();
  const { data: archive = [] } = useLiveArchive();
  const forUs = live.filter((b) => b.destination === "for_us");
  const radio = live.filter((b) => b.destination === "radio");

  return (
    <SiteShell>
      <div className="mx-auto max-w-[1400px] space-y-14 px-6 py-12 lg:px-12">
        <header>
          <p className="text-[10px] uppercase tracking-[0.35em] text-red-600">FRASS-0416 · Live Directory</p>
          <h1 className="mt-3 text-4xl font-black uppercase tracking-[0.1em] md:text-6xl">Live in Frass</h1>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
            Frass supports two distinct forms of live broadcasting. One is community-driven. One is
            broadcast-driven. Both live in the same ecosystem, and this is where you find either.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/live/go"
              className="rounded-full bg-red-600 px-6 py-2.5 text-[10px] font-bold uppercase tracking-[0.24em] text-white transition hover:bg-red-500"
            >
              🔴 Go Live
            </Link>
            <Link
              to="/frass-radio"
              className="rounded-full border border-border px-6 py-2.5 text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground transition hover:text-foreground"
            >
              📻 Frass Radio
            </Link>
          </div>
        </header>

        {/* The distinction, stated so nobody confuses the two */}
        <section className="grid gap-5 md:grid-cols-2">
          {LIVE_DESTINATIONS.map((d) => (
            <div key={d.key} className="rounded-[1.75rem] border border-border bg-card p-7">
              <p className="text-2xl" aria-hidden>
                {d.glyph}
              </p>
              <h2 className="mt-2 text-xl font-bold uppercase tracking-[0.14em]">{d.name}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{d.purpose}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                <strong className="text-foreground">Here's what this means:</strong> {d.plain}
              </p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {d.examples.map((e) => (
                  <li
                    key={e}
                    className="rounded-full bg-secondary px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-secondary-foreground"
                  >
                    {e}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section>
          <h2 className="text-2xl font-bold uppercase tracking-[0.16em]">🔴 For Us Live</h2>
          <p className="mt-1 text-xs text-muted-foreground">Community broadcasting — anyone, any moment.</p>
          {forUs.length === 0 ? (
            <p className="mt-5 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Nobody is live in the community right now.{" "}
              <Link to="/live/go" className="text-red-600 underline-offset-4 hover:underline">
                Be the first.
              </Link>
            </p>
          ) : (
            <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {forUs.map((b) => (
                <BroadcastCard key={b.id} b={b} />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-bold uppercase tracking-[0.16em]">📻 Frass Radio Live</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Curated, scheduled programming — DJ sets, podcasts, interviews and broadcasts.
          </p>
          {radio.length === 0 ? (
            <p className="mt-5 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No scheduled broadcast on air.{" "}
              <Link to="/frass-radio" className="text-[color:var(--gold)] underline-offset-4 hover:underline">
                See the station schedule.
              </Link>
            </p>
          ) : (
            <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {radio.map((b) => (
                <BroadcastCard key={b.id} b={b} />
              ))}
            </div>
          )}
        </section>

        {archive.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold uppercase tracking-[0.16em]">Recent broadcasts</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Every finished stream is kept, so it can become something lasting.
            </p>
            <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {archive.map((b) => (
                <BroadcastCard key={b.id} b={b} ended />
              ))}
            </div>
          </section>
        )}

        {/* Moments into long-term value */}
        <section className="rounded-[2rem] border border-border bg-card p-8">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-1 h-5 w-5 shrink-0 text-[color:var(--gold)]" />
            <div>
              <h2 className="text-xl font-bold uppercase tracking-[0.16em]">After the broadcast</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Every stream can be edited in FV Studios and repurposed. Nothing is spent once.
              </p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {REPURPOSE_FORMATS.map((f) => (
              <Link
                key={f.key}
                to={f.to as never}
                className="rounded-2xl border border-border p-5 transition hover:border-[color:var(--gold)]/60"
              >
                <span className="text-lg" aria-hidden>
                  {f.glyph}
                </span>
                <p className="mt-2 text-sm font-semibold">{f.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{f.note}</p>
              </Link>
            ))}
          </div>
          <ul className="mt-8 space-y-1 border-t border-border pt-6">
            {LIVE_PRINCIPLE.map((line) => (
              <li key={line} className="text-sm italic text-muted-foreground">
                {line}
              </li>
            ))}
          </ul>
        </section>

        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
          <Radio className="h-3.5 w-3.5" />
          Live status is platform-wide — a creator shows 🔴 LIVE everywhere while broadcasting.
        </div>

        <PageFeedback pageTitle="Live Directory" />
      </div>
    </SiteShell>
  );
}
