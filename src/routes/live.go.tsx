import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteShell } from "@/components/site-shell";
import { Sparkles, Loader2 } from "lucide-react";
import { useLiveIdentity, useStartBroadcast } from "@/hooks/use-live";
import { LIVE_DESTINATIONS, LIVE_PURPOSES, type LiveDestination } from "@/lib/live";

/** FRASS-0416 — Frassy asks one question first: "What are you going live for today?" */
export const Route = createFileRoute("/live/go")({
  head: () => ({
    meta: [
      { title: "Go Live — Share Your Story With Frass" },
      {
        name: "description",
        content:
          "Start a live broadcast in Frass. Frassy prepares the right tools for community streams, product launches, tutorials, podcasts and more.",
      },
      { property: "og:title", content: "Go Live in Frass" },
      { property: "og:description", content: "Every creator should be able to share their story live." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GoLivePage,
});

function GoLivePage() {
  const navigate = useNavigate();
  const { userId, name, ready } = useLiveIdentity();
  const start = useStartBroadcast();

  const [purpose, setPurpose] = useState("community");
  const [destination, setDestination] = useState<LiveDestination>("for_us");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");

  const chosen = LIVE_PURPOSES.find((p) => p.key === purpose)!;

  const choosePurpose = (key: string) => {
    setPurpose(key);
    const p = LIVE_PURPOSES.find((x) => x.key === key);
    if (p) setDestination(p.destination);
  };

  const begin = async () => {
    if (!userId || !title.trim()) return;
    const created = await start.mutateAsync({
      hostId: userId,
      hostName: name,
      destination,
      purpose,
      title: title.trim(),
      summary: summary.trim() || undefined,
    });
    navigate({ to: "/live/$broadcastId", params: { broadcastId: created.id } });
  };

  return (
    <SiteShell>
      <div className="mx-auto max-w-3xl space-y-10 px-6 py-12">
        <header>
          <p className="text-[10px] uppercase tracking-[0.35em] text-red-600">FRASS-0416</p>
          <h1 className="mt-3 text-4xl font-black uppercase tracking-[0.1em]">Go Live</h1>
        </header>

        <PlatformProtectionBanner domain="broadcasting" />


        <div className="flex items-start gap-3 rounded-[1.5rem] border border-[color:var(--gold)]/50 bg-card p-6">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-[color:var(--gold)]" />
          <p className="text-sm leading-relaxed text-muted-foreground">
            <span className="text-foreground">Frassy:</span> What are you going live for today? Tell me and I
            will set the room up with the right tools before you start.
          </p>
        </div>

        <section>
          <h2 className="text-[11px] uppercase tracking-[0.26em] text-muted-foreground">Purpose</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {LIVE_PURPOSES.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => choosePurpose(p.key)}
                className={`rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.18em] transition ${
                  purpose === p.key
                    ? "border-red-500 bg-red-500 text-white"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {p.glyph} {p.label}
              </button>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Frassy prepares: {chosen.tools.join(" · ")}
          </p>
        </section>

        <section>
          <h2 className="text-[11px] uppercase tracking-[0.26em] text-muted-foreground">Where it airs</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {LIVE_DESTINATIONS.map((d) => (
              <button
                key={d.key}
                type="button"
                onClick={() => setDestination(d.key)}
                className={`rounded-2xl border p-5 text-left transition ${
                  destination === d.key
                    ? "border-red-500 bg-red-500/5"
                    : "border-border hover:border-[color:var(--gold)]/50"
                }`}
              >
                <span className="text-lg" aria-hidden>
                  {d.glyph}
                </span>
                <p className="mt-2 text-sm font-semibold">{d.name}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{d.plain}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <label htmlFor="live-title" className="text-[11px] uppercase tracking-[0.26em] text-muted-foreground">
              Stream title
            </label>
            <input
              id="live-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Sunday drop — behind the scenes"
              className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-red-500"
            />
          </div>
          <div>
            <label htmlFor="live-summary" className="text-[11px] uppercase tracking-[0.26em] text-muted-foreground">
              What should people expect?
            </label>
            <textarea
              id="live-summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={3}
              className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-red-500"
            />
          </div>
        </section>

        {ready && !userId ? (
          <p className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
            You need to be signed in to broadcast.{" "}
            <Link to="/auth" search={{ next: "/live/go" }} className="text-red-600 underline-offset-4 hover:underline">
              Sign in
            </Link>{" "}
            and come back — your stream will carry your Builder name.
          </p>
        ) : (
          <button
            type="button"
            onClick={begin}
            disabled={!title.trim() || start.isPending || !userId}
            className="inline-flex items-center gap-2 rounded-full bg-red-600 px-8 py-3 text-[11px] font-bold uppercase tracking-[0.26em] text-white transition hover:bg-red-500 disabled:opacity-40"
          >
            {start.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            🔴 Start broadcasting
          </button>
        )}

        {start.isError && (
          <p className="text-sm text-red-600">That didn't start. Try again in a moment.</p>
        )}
      </div>
    </SiteShell>
  );
}
