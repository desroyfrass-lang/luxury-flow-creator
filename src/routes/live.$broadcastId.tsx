import { createFileRoute, Link } from "@tanstack/react-router";
import { MemberName } from "@/components/card/member-identity";
import { useState } from "react";
import { SiteShell } from "@/components/site-shell";
import { Users, Gift, Send, Square, Sparkles } from "lucide-react";
import { LiveBadge } from "@/components/live/live-status";
import {
  useBroadcast,
  useEndBroadcast,
  useLiveComments,
  useLiveGifts,
  useLiveIdentity,
  usePostComment,
  useSendGift,
} from "@/hooks/use-live";
import { LIVE_GIFTS, REPURPOSE_FORMATS, liveElapsed, purposeOf } from "@/lib/live";
import { canSeeProgressDetail, celebrationLine } from "@/lib/privacy/progress-without-exposure";

/** FRASS-0416 — the broadcast room: comments, gifts, products, and life after the stream. */
export const Route = createFileRoute("/live/$broadcastId")({
  head: () => ({
    meta: [
      { title: "Live Broadcast — Frass" },
      { name: "description", content: "Watch a live Frass broadcast, join the conversation and send gifts." },
      { property: "og:title", content: "Live Broadcast — Frass" },
      { property: "og:description", content: "Community streaming, live gifting and products in one room." },
      { property: "og:type", content: "video.other" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BroadcastRoom,
});

function BroadcastRoom() {
  const { broadcastId } = Route.useParams();
  const { data: b, isLoading } = useBroadcast(broadcastId);
  const { data: comments = [] } = useLiveComments(broadcastId);
  const { data: gifts = [] } = useLiveGifts(broadcastId);
  const { userId, name, handle } = useLiveIdentity();
  const post = usePostComment();
  const send = useSendGift();
  const end = useEndBroadcast();
  const [draft, setDraft] = useState("");

  if (isLoading) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-3xl px-6 py-24 text-center text-sm text-muted-foreground">
          Opening the room…
        </div>
      </SiteShell>
    );
  }

  if (!b) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <p className="text-lg font-semibold">That broadcast isn't here.</p>
          <Link to="/live" className="mt-4 inline-block text-sm text-red-600 underline-offset-4 hover:underline">
            See what's live now
          </Link>
        </div>
      </SiteShell>
    );
  }

  const purpose = purposeOf(b.purpose);
  const ended = b.status !== "live";
  const isHost = userId === b.host_id;
  // FRASS-0535 — Progress Without Exposure: visitors see the celebration, members see the numbers.
  const isMember = Boolean(userId);
  const canSeeGiftDetail = canSeeProgressDetail(isMember ? "partner" : "visitor");
  const totalCredits = gifts.reduce((sum, g) => sum + (g.credits ?? 0), 0);

  return (
    <SiteShell>
      <div className="mx-auto grid max-w-[1400px] gap-8 px-6 py-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-12">
        <div className="space-y-6">
          <div className="relative aspect-video overflow-hidden rounded-[1.75rem] border border-border bg-black">
            <div className="absolute inset-0 grid place-items-center text-center">
              <div>
                <p className="text-4xl" aria-hidden>
                  {purpose.glyph}
                </p>
                <p className="mt-3 text-sm uppercase tracking-[0.28em] text-white/60">
                  {ended ? "Broadcast ended" : "Live stage"}
                </p>
                <p className="mt-2 text-xs text-white/40">
                  {b.destination === "radio" ? "Frass Radio broadcast" : "For Us community stream"}
                </p>
              </div>
            </div>
            {!ended && (
              <div className="absolute left-4 top-4">
                <LiveBadge />
              </div>
            )}
          </div>

          <header>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold md:text-3xl">{b.title}</h1>
              {!ended && <LiveBadge />}
            </div>
            <p className="mt-2 text-[11px] uppercase tracking-[0.22em] text-[color:var(--gold)]">
              <MemberName handle={b.host_handle} name={b.host_name} className="underline-offset-4 hover:underline" />{" · "}{purpose.glyph} {purpose.label}
            </p>
            {b.summary && <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{b.summary}</p>}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                {b.viewer_count} watching
              </span>
              <span>{ended ? "Ended" : `Live ${liveElapsed(b.started_at)}`}</span>
              <span>
                {canSeeGiftDetail
                  ? `${totalCredits.toLocaleString()} credits gifted`
                  : `${gifts.length} ${gifts.length === 1 ? "gift" : "gifts"} sent`}
              </span>
              {isHost && !ended && (
                <button
                  type="button"
                  onClick={() => end.mutate(b.id)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-1.5 transition hover:border-red-500 hover:text-red-600"
                >
                  <Square className="h-3 w-3" />
                  End broadcast
                </button>
              )}
            </div>
          </header>

          {b.product_links.length > 0 && (
            <section className="rounded-[1.5rem] border border-border bg-card p-6">
              <h2 className="text-[11px] uppercase tracking-[0.26em] text-muted-foreground">Shop this stream</h2>
              <div className="mt-4 flex flex-wrap gap-3">
                {b.product_links.map((p) => (
                  <Link
                    key={p.to}
                    to={p.to as never}
                    className="rounded-full border border-[color:var(--gold)]/60 px-5 py-2 text-[11px] uppercase tracking-[0.2em] transition hover:bg-[color:var(--gold)] hover:text-[color:var(--primary-foreground)]"
                  >
                    {p.label} {p.price ? `· ${p.price}` : ""}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {ended && (
            <section className="rounded-[1.5rem] border border-border bg-card p-6">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-1 h-5 w-5 shrink-0 text-[color:var(--gold)]" />
                <div>
                  <h2 className="text-lg font-semibold">Turn this into lasting content</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {isHost
                      ? "Take it into FV Studios and give it a second life."
                      : "The host can repurpose this broadcast in FV Studios."}
                  </p>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {REPURPOSE_FORMATS.map((f) => (
                  <Link
                    key={f.key}
                    to={f.to as never}
                    className="rounded-2xl border border-border p-4 text-sm transition hover:border-[color:var(--gold)]/60"
                  >
                    <span aria-hidden className="mr-2">
                      {f.glyph}
                    </span>
                    {f.label}
                    <span className="mt-1 block text-xs text-muted-foreground">{f.note}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Live rail — conversation and gifting */}
        <aside className="space-y-6">
          <section className="rounded-[1.5rem] border border-border bg-card p-5">
            <h2 className="text-[11px] uppercase tracking-[0.26em] text-muted-foreground">Live chat</h2>
            <div className="mt-4 max-h-80 space-y-3 overflow-y-auto pr-1">
              {comments.length === 0 && (
                <p className="text-sm text-muted-foreground">Say the first thing.</p>
              )}
              {comments.map((c) => (
                <p key={c.id} className="text-sm leading-relaxed">
                  <MemberName
                    handle={c.author_handle}
                    name={c.author_name}
                    className="font-semibold text-[color:var(--gold)] hover:underline"
                  />{" "}
                  <span className="text-muted-foreground">{c.body}</span>
                </p>
              ))}
            </div>
            {userId ? (
              <form
                className="mt-4 flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!draft.trim()) return;
                  post.mutate({ broadcastId, authorId: userId, authorName: name, authorHandle: handle, body: draft.trim() });
                  setDraft("");
                }}
              >
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Add a comment"
                  aria-label="Add a comment"
                  className="min-w-0 flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm outline-none focus:border-red-500"
                />
                <button
                  type="submit"
                  aria-label="Send comment"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-red-600 text-white transition hover:bg-red-500"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            ) : (
              <p className="mt-4 text-xs text-muted-foreground">
                <Link to="/auth" search={{ next: "/live" }} className="text-red-600 underline-offset-4 hover:underline">
                  Sign in
                </Link>{" "}
                to join the conversation.
              </p>
            )}
          </section>

          <section className="rounded-[1.5rem] border border-[color:var(--gold)]/50 bg-card p-5">
            <h2 className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.26em] text-muted-foreground">
              <Gift className="h-3.5 w-3.5" />
              Send a gift
            </h2>
            <p className="mt-2 text-xs text-muted-foreground">
              Gifts settle through the Frass Wallet under the existing gifting revenue rules.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {LIVE_GIFTS.map((g) => (
                <button
                  key={g.key}
                  type="button"
                  disabled={!userId || send.isPending}
                  onClick={() =>
                    userId &&
                    send.mutate({
                      broadcastId,
                      senderId: userId,
                      senderName: name,
                      senderHandle: handle,
                      giftKey: g.key,
                      credits: g.credits,
                      amount: g.amount,
                    })
                  }
                  className="rounded-2xl border border-border p-3 text-center text-sm transition hover:border-[color:var(--gold)] disabled:opacity-40"
                >
                  <span className="text-lg" aria-hidden>
                    {g.glyph}
                  </span>
                  <span className="mt-1 block text-xs font-semibold">{g.label}</span>
                  <span className="block text-[10px] text-muted-foreground">
                    {g.credits.toLocaleString()} credits
                  </span>
                </button>
              ))}
            </div>
            {gifts.length > 0 && (
              <ul className="mt-4 space-y-1 border-t border-border pt-3">
                {gifts.slice(0, 6).map((g) => (
                  <li key={g.id} className="text-xs text-muted-foreground">
                    <MemberName handle={g.sender_handle} name={g.sender_name} className="hover:underline" /> sent {g.gift_key.replace("_", " ")}
                  </li>
                ))}
              </ul>
            )}
            <Link
              to="/financial-center"
              className="mt-4 inline-block text-[10px] uppercase tracking-[0.22em] text-[color:var(--gold)] underline-offset-4 hover:underline"
            >
              See earnings in the Wallet →
            </Link>
          </section>

          <section className="rounded-[1.5rem] border border-border bg-card p-5">
            <h2 className="text-[11px] uppercase tracking-[0.26em] text-muted-foreground">Also live</h2>
            <Link
              to="/live"
              className="mt-3 inline-block text-sm text-red-600 underline-offset-4 hover:underline"
            >
              Open the Live Directory →
            </Link>
          </section>
        </aside>
      </div>
    </SiteShell>
  );
}
