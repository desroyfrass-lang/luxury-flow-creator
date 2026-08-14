// FRASS-0408 §3 — Frass Radio: the audio home of Frass.
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Radio, Play, Sparkles, Wallet, Headphones, Info } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { CinematicMediaHero } from "@/components/cinematic-media-hero";
import radioMural from "@/assets/frass-radio-blue-mural-wall.jpg.asset.json";
import { LiveBadge } from "@/components/live/live-status";
import { useLiveNow } from "@/hooks/use-live";
import {
  AUDIO_SHELVES,
  DISCOVERY_ROLES,
  FEATURED_SHOWS,
  ORIGINALS_LABEL,
  ORIGINALS_RULE,
  ORIGINALS_SCOPE,
  RADIO_DISCLOSURE,
  RADIO_REVENUE_SOURCES,
  RADIO_ROYALTY_RULES,
  RADIO_STATIONS,
} from "@/lib/radio";

export const Route = createFileRoute("/frass-radio")({
  head: () => ({
    meta: [
      { title: "Frass Radio — The Audio Home of Frass" },
      {
        name: "description",
        content:
          "Music, podcasts, audio courses, community news and Foundation stories — Frass Radio is the audio home of Frass and the discovery engine for new artists.",
      },
      { property: "og:title", content: "Frass Radio — The Audio Home of Frass" },
      {
        property: "og:description",
        content: "One place for everything Frass sounds like. Stations, shows, Originals and artist royalties.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FrassRadioPage,
});

function FrassRadioPage() {
  const [station, setStation] = useState(RADIO_STATIONS[0]!.key);
  const { data: radioLive = [] } = useLiveNow("radio");
  const current = RADIO_STATIONS.find((s) => s.key === station)!;

  return (
    <SiteShell>
      <div className="min-h-screen bg-black text-white">
        <CinematicMediaHero
          image={radioMural.url}
          alt="Blue, chrome and gold Jamaica music mural for Frass Radio"
          eyebrow="Frass Hill · Always in rotation"
          title="Frass Radio"
          subtitle="Music, podcasts, live sessions, community news and stories from the Foundation — one audio home, rooted in Jamaica and heard everywhere."
          focus="wide"
        />

        <div className="media-page-overlap relative z-10 mx-auto max-w-6xl space-y-16 bg-black px-4 py-14 sm:px-6">
          {/* FRASS-0416 — the two kinds of live, kept distinct */}
          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-[11px] uppercase tracking-[0.32em] text-amber-300/70">
              Live on Frass Radio
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              Frass Radio Live is curated and broadcast-oriented: DJ sessions, music premieres, podcasts,
              artist interviews, Foundation broadcasts, wellness talks and community news — scheduled, not
              spontaneous. Community streaming lives somewhere else on purpose.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-white/45">
              <strong className="text-white/70">Here's the practical version:</strong> Radio is a show
              with a time slot. For Us Live is standing up in the community hall and saying "come see this".
            </p>
            {radioLive.length > 0 && (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {radioLive.map((b) => (
                  <Link
                    key={b.id}
                    to="/live/$broadcastId"
                    params={{ broadcastId: b.id }}
                    className="rounded-2xl border border-red-500/40 bg-black/40 p-4 transition hover:border-red-500"
                  >
                    <LiveBadge />
                    <p className="mt-2 text-sm font-semibold text-white">{b.title}</p>
                    <p className="text-[10px] uppercase tracking-[0.22em] text-amber-300/70">{b.host_name}</p>
                  </Link>
                ))}
              </div>
            )}
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/live"
                className="rounded-full border border-white/25 px-5 py-2 text-[10px] font-bold uppercase tracking-[0.24em] text-white/80 transition hover:border-red-500 hover:text-white"
              >
                Live Directory
              </Link>
              <Link
                to="/for-us" search={{ from: "/frass-radio" }}
                className="rounded-full border border-white/25 px-5 py-2 text-[10px] font-bold uppercase tracking-[0.24em] text-white/80 transition hover:border-amber-300 hover:text-white"
              >
                🔴 For Us Live — community streaming
              </Link>
            </div>
          </section>

          {/* Player + stations */}
          <section>
            <div className="rounded-3xl border border-amber-300/25 bg-white/[0.03] p-6">
              <div className="flex flex-wrap items-center gap-4">
                <button
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-300/90 text-black"
                  aria-label={`Play ${current.name}`}
                >
                  <Play className="h-6 w-6" />
                </button>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-amber-300/70">
                    {current.live ? "Live now" : "On demand"}
                  </p>
                  <h2 className="text-xl font-light tracking-wide">{current.name}</h2>
                  <p className="text-xs text-white/50">{current.genre}</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-white/60">{current.plain}</p>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {RADIO_STATIONS.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setStation(s.key)}
                  className={`rounded-2xl border p-5 text-left transition ${
                    s.key === station
                      ? "border-amber-300/60 bg-amber-300/[0.06]"
                      : "border-white/10 bg-white/[0.02] hover:border-amber-300/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-amber-300/70">
                      {s.genre}
                    </p>
                    {s.live && (
                      <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[9px] uppercase tracking-widest text-red-300">
                        Live
                      </span>
                    )}
                  </div>
                  <h3 className="mt-2 text-lg font-light tracking-wide">{s.name}</h3>
                  <p className="mt-1.5 text-xs text-white/50">{s.plain}</p>
                </button>
              ))}
            </div>
          </section>

          {/* Audio shelves */}
          <Section eyebrow="More than a station" title="Everything you can listen to" icon={Headphones}>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {AUDIO_SHELVES.map((a) => (
                <div key={a.key} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                  <span className="text-lg">{a.icon}</span>
                  <h3 className="mt-2 text-sm text-white/85">{a.label}</h3>
                  <p className="mt-1 text-[11px] leading-relaxed text-white/50">{a.plain}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* Featured shows */}
          <Section eyebrow="On air this week" title="Featured shows" icon={Radio}>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURED_SHOWS.map((s) => (
                <article key={s.key} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                  {s.original && (
                    <p className="text-[9px] uppercase tracking-[0.3em] text-amber-300/80">
                      {ORIGINALS_LABEL}
                    </p>
                  )}
                  <h3 className="mt-1.5 text-base font-light tracking-wide">{s.title}</h3>
                  <p className="text-xs text-white/45">{s.host}</p>
                  <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-white/35">
                    {s.kind} · {s.minutes} min
                  </p>
                </article>
              ))}
            </div>
          </Section>

          {/* Originals */}
          <Section eyebrow="Premium designation" title={ORIGINALS_LABEL} icon={Sparkles}>
            <div className="rounded-3xl border border-amber-300/30 bg-amber-300/[0.04] p-6">
              <div className="flex flex-wrap gap-2">
                {ORIGINALS_SCOPE.map((o) => (
                  <span
                    key={o}
                    className="rounded-full border border-amber-300/40 px-3 py-1 text-[11px] text-amber-100/80"
                  >
                    {o}
                  </span>
                ))}
              </div>
              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/70">{ORIGINALS_RULE}</p>
              <p className="mt-2 text-xs text-white/45">
                <strong className="text-white/65">Here's the takeaway:</strong> the Originals badge is like
                &ldquo;A Netflix Original&rdquo;. It only goes on work we actually made or paid to have made.
              </p>
            </div>
          </Section>

          {/* Royalties */}
          <Section eyebrow="Artist earnings" title="How artists get paid for radio play" icon={Wallet}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                <h3 className="text-xs uppercase tracking-[0.25em] text-white/45">Royalty rules</h3>
                <ul className="mt-3 space-y-2">
                  {RADIO_ROYALTY_RULES.map((r) => (
                    <li key={r} className="text-xs leading-relaxed text-white/60">
                      · {r}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/financial-center"
                  className="mt-4 block text-[11px] uppercase tracking-widest text-amber-300/80 hover:text-amber-200"
                >
                  Open your Music Earnings ledger →
                </Link>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                <h3 className="text-xs uppercase tracking-[0.25em] text-white/45">
                  Where Radio revenue comes from
                </h3>
                <ul className="mt-3 space-y-2.5">
                  {RADIO_REVENUE_SOURCES.map((r) => (
                    <li key={r.key}>
                      <p className="text-xs text-white/80">{r.label}</p>
                      <p className="text-[11px] text-white/45">{r.plain}</p>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 rounded-xl border border-emerald-300/25 bg-emerald-300/[0.05] p-3 text-[11px] text-emerald-100/80">
                  {RADIO_DISCLOSURE}
                </p>
              </div>
            </div>
          </Section>

          {/* Discovery */}
          <Section eyebrow="Why it exists" title="Radio is a launchpad" icon={Info}>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {DISCOVERY_ROLES.map((d) => (
                <p
                  key={d}
                  className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-xs leading-relaxed text-white/65"
                >
                  {d}
                </p>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/studio"
                className="rounded-full bg-amber-300/90 px-6 py-3 text-xs font-medium uppercase tracking-[0.25em] text-black"
              >
                Make something to play
              </Link>
              <Link
                to="/fv-studios"
                className="rounded-full border border-white/20 px-6 py-3 text-xs uppercase tracking-[0.25em] text-white/70 hover:border-amber-300/50"
              >
                Publish through the Network
              </Link>
            </div>
          </Section>
        </div>
      </div>
    </SiteShell>
  );
}

function Section({
  eyebrow,
  title,
  icon: Icon,
  children,
}: {
  eyebrow: string;
  title: string;
  icon: typeof Radio;
  children: React.ReactNode;
}) {
  return (
    <section className="scroll-mt-24">
      <p className="text-[10px] uppercase tracking-[0.35em] text-white/35">{eyebrow}</p>
      <h2 className="mt-2 flex items-center gap-3 text-2xl font-light tracking-wide sm:text-3xl">
        <Icon className="h-5 w-5 text-amber-300" /> {title}
      </h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}
