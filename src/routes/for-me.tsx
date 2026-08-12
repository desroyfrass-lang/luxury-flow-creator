import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FoundingBadge } from "@/components/founding/founding-badge";
import { TrustProfilePanel } from "@/components/trust/trust-profile";
import { MyTrustSummary } from "@/components/trust/my-trust-summary";
import { getMyFoundingStatus } from "@/lib/founding.functions";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, MessageCircle, PenLine, Play } from "lucide-react";
import { getMyProfile } from "@/lib/profiles.functions";
import { resolveForUsWeather } from "@/lib/for-us";
import { ForMeAbout } from "@/components/for-me-about";
import { FrassCardWidget } from "@/components/card/frass-card-widget";
import { FrassLinkWidget } from "@/components/link/frass-link-widget";

/**
 * FRASS-0421 — FOR ME.
 *
 * For Us is the community. For Me is one Builder's own page: everything about
 * you, in the order a person would tell their own story. Nothing here is
 * "chosen for you" — an algorithm has no business on someone's own page.
 */

type SectionId =
  | "hero"
  | "bio"
  | "stories"
  | "posts"
  | "photos"
  | "videos"
  | "collections"
  | "saved"
  | "followers"
  | "following"
  | "achievements"
  | "journey"
  | "media"
  | "about"
  | "reputation"
  | "message";

const SECTIONS: { id: SectionId; label: string; glyph: string; line: string; empty: string }[] = [
  { id: "hero", label: "Hero Video", glyph: "🎬", line: "The first thing people see when they arrive at your page.", empty: "No hero video yet. Record one in FV Studios and set it as your welcome." },
  { id: "bio", label: "Bio", glyph: "✍️", line: "Who you are, in your own words.", empty: "Your bio is empty. A few honest lines beat a polished paragraph." },
  { id: "stories", label: "Stories", glyph: "🌅", line: "Longer pieces you've written or been featured in.", empty: "No stories yet. Anything you publish to For Us lands here too." },
  { id: "posts", label: "Posts", glyph: "🗒", line: "Short updates from your day.", empty: "No posts yet. Say what you're working on today." },
  { id: "photos", label: "Photos", glyph: "📷", line: "Your pictures, kept in your own gallery.", empty: "No photos yet. Upload from the composer or shoot straight from your phone." },
  { id: "videos", label: "Videos", glyph: "📹", line: "Clips, shows and anything you've cut in FV Studios.", empty: "No videos yet. Phone Content Mode turns a phone clip into something broadcast-ready." },
  { id: "collections", label: "Collections", glyph: "🗂", line: "Things you've grouped together on purpose.", empty: "No collections yet. Group your work the way you'd hang it on a wall." },
  { id: "saved", label: "Saved", glyph: "🔖", line: "What you kept for later — private to you.", empty: "Nothing saved yet. Anything you bookmark across Frass Hill shows up here." },
  { id: "followers", label: "Followers", glyph: "👥", line: "People who follow your work.", empty: "No followers yet. They arrive once you start showing the work." },
  { id: "following", label: "Following", glyph: "🧭", line: "The Builders, brands and places you keep up with.", empty: "You're not following anyone yet. The square is a good place to start." },
  { id: "achievements", label: "Achievements", glyph: "🏅", line: "Certificates, streaks and milestones you've earned.", empty: "No achievements yet. Academy paths and Builder milestones fill this in." },
  { id: "journey", label: "Creator Journey", glyph: "🛤", line: "Where you started, where you are, what's next.", empty: "Your journey hasn't been recorded yet. Start it in the Academy or with Frassy." },
  { id: "media", label: "Media", glyph: "🎧", line: "Music, podcasts and broadcasts you've made.", empty: "No media yet. Go live once and the replay lives here forever." },
  { id: "about", label: "About", glyph: "ℹ️", line: "Your living bio — your story, your business, your links, your photos and videos. Separate from your posts, and always editable.", empty: "Your About page is blank. Write it once, then keep it alive." },
  { id: "reputation", label: "Reputation", glyph: "🏆", line: "Your story is above. This is your reliability — verified work only. Followers, likes and views never count towards it.", empty: "Nothing verified yet. Reputation on Frass starts with your first completed commitment." },
  { id: "message", label: "Message", glyph: "✉️", line: "How people reach you directly.", empty: "Messaging opens from here — your inbox stays yours." },
];

export const Route = createFileRoute("/for-me")({
  head: () => ({
    meta: [
      { title: "For Me — Your Corner of Frass Hill" },
      {
        name: "description",
        content:
          "Your own page on Frass Hill: hero video, bio, stories, posts, photos, videos, collections, achievements and your creator journey.",
      },
      { property: "og:title", content: "For Me — Your Corner of Frass Hill" },
      {
        property: "og:description",
        content: "Everything about you, in one place — not what an algorithm picked.",
      },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://frasskicks.com/for-me" }],
  }),
  component: ForMePage,
});

function ForMePage() {
  const loadProfile = useServerFn(getMyProfile);
  const weather = useMemo(() => resolveForUsWeather(), []);
  const [active, setActive] = useState<SectionId>("hero");

  // FRASS-0490 — recognition appears here only when the member allows it.
  const loadFounding = useServerFn(getMyFoundingStatus);
  const foundingQuery = useQuery({
    queryKey: ["my-founding-status"],
    queryFn: () => loadFounding(),
    retry: false,
  });

  const profileQuery = useQuery({
    queryKey: ["my-profile", "for-me"],
    queryFn: () => loadProfile(),
    retry: false,
  });

  const profile = profileQuery.data as
    | { display_name?: string | null; handle?: string | null; bio?: string | null; avatar_url?: string | null }
    | undefined;

  const name = profile?.display_name?.trim() || "Builder";
  const section = SECTIONS.find((s) => s.id === active)!;

  return (
    <div className="for-us-tropical min-h-screen bg-[#07100f] text-foreground">
      <div className="sticky top-0 z-20 bg-gradient-to-b from-black/60 to-transparent">
        <div className="mx-auto flex max-w-[1100px] items-center gap-4 px-6 py-3 lg:px-10">
          <Link
            to="/for-us"
            search={{ from: "/for-me" }}
            className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-white/85 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            For Us
          </Link>
          <span className="text-[10px] uppercase tracking-[0.25em] text-white/70">
            <span aria-hidden className="mr-1.5">
              {weather.glyph}
            </span>
            {weather.label}
          </span>
        </div>
      </div>

      <main className="mx-auto max-w-[1100px] px-6 pb-24 lg:px-10">
        {/* FRASS-0426 — the card is always one click away */}
        <div className="mb-8 space-y-4">
          <FrassLinkWidget context="FOR ME" />
          <FrassCardWidget context="FOR ME" />
        </div>
        {/* Hero — your face and your welcome video */}
        <section className="chrome-glow relative overflow-hidden rounded-[2rem] ring-1 ring-white/10">
          <div className="grid gap-8 bg-black/40 p-8 md:grid-cols-[220px_1fr] md:p-12">
            <div className="mx-auto h-[200px] w-[200px] overflow-hidden rounded-full ring-2 ring-white/25">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={`${name}'s portrait`}
                  width={400}
                  height={400}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-white/5 text-5xl font-black">
                  {name.slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-white/70">
                For Me · Everything about me
              </p>
              <h1 className="mt-3 text-4xl font-black md:text-6xl">{name}</h1>
              {profile?.handle && <p className="mt-2 text-sm text-white/70">@{profile.handle}</p>}
              {foundingQuery.data && foundingQuery.data.visibility !== "private" && (
                <div className="mt-4">
                  <FoundingBadge sequence={foundingQuery.data.sequence} size="sm" />
                </div>
              )}
              <p className="mt-5 max-w-xl text-base leading-relaxed text-white/85">
                {profile?.bio?.trim() ||
                  "You haven't written your story yet. Every Builder on the Hill has one — where you started, what you're making, and who you're making it for."}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/workspace/profile"
                  className="chrome-glow inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.25em] text-white transition hover:scale-[1.03]"
                >
                  <PenLine className="h-3.5 w-3.5" />
                  Edit my page
                </Link>
                <Link
                  to="/studio"
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.25em] text-white/85 transition hover:text-white"
                >
                  <Play className="h-3.5 w-3.5" />
                  Record hero video
                </Link>
                <button
                  type="button"
                  onClick={() => setActive("message")}
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.25em] text-white/85 transition hover:text-white"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  Message
                </button>
              </div>

              {profileQuery.isError && (
                <p className="mt-6 text-xs text-white/60">
                  Sign in to see your own page —{" "}
                  <Link to="/auth" search={{ next: "/for-me" }} className="underline">
                    sign in here
                  </Link>
                  .
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Your page, section by section */}
        <nav aria-label="My page sections" className="mt-10 flex flex-wrap gap-2">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActive(s.id)}
              aria-pressed={active === s.id}
              className={`rounded-full border px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] transition ${
                active === s.id
                  ? "border-white bg-white text-black"
                  : "border-white/25 text-white/75 hover:text-white"
              }`}
            >
              <span aria-hidden className="mr-1.5">
                {s.glyph}
              </span>
              {s.label}
            </button>
          ))}
        </nav>

        <section className="chrome-glow mt-6 rounded-2xl bg-black/40 p-8 ring-1 ring-white/10">
          <h2 className="text-2xl font-black md:text-3xl">
            <span aria-hidden className="mr-2">
              {section.glyph}
            </span>
            {section.label}
          </h2>
          <p className="mt-2 max-w-xl text-sm text-white/75">{section.line}</p>

          {section.id === "bio" && profile?.bio?.trim() ? (
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/90">{profile.bio}</p>
          ) : section.id === "about" ? (
            <>
              <dl className="mt-6 grid max-w-xl gap-3 text-sm">
                <div className="flex justify-between gap-6 border-b border-white/10 pb-2">
                  <dt className="text-white/60">Name</dt>
                  <dd className="text-white/90">{name}</dd>
                </div>
                <div className="flex justify-between gap-6 border-b border-white/10 pb-2">
                  <dt className="text-white/60">Handle</dt>
                  <dd className="text-white/90">{profile?.handle ? `@${profile.handle}` : "Not set"}</dd>
                </div>
                <div className="flex justify-between gap-6">
                  <dt className="text-white/60">Home</dt>
                  <dd className="text-white/90">Frass Hill</dd>
                </div>
              </dl>
              <ForMeAbout raw={(profile as { about?: unknown } | null)?.about} canEdit={Boolean(profile)} />
            </>

          ) : section.id === "reputation" ? (
            /* FRASS-0493 — the same Trust Profile as the Frass Card. One engine, two windows. */
            <div className="mt-6">
              <MyTrustSummary />
              {profile?.handle && <TrustProfilePanel handle={profile.handle} />}
            </div>
          ) : (
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-white/70">{section.empty}</p>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/workspace/profile"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.25em] text-white/85 transition hover:text-white"
            >
              Manage this section
            </Link>
            <Link
              to="/town-square"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.25em] text-white/85 transition hover:text-white"
            >
              Back to Town Square
            </Link>
          </div>
        </section>

        <p className="mt-10 max-w-2xl text-sm leading-relaxed text-white/70">
          <strong className="text-white">What this means in plain English:</strong> this page is
          yours the way a room in your house is yours. Nothing is here because software decided you
          would like it — everything here is something you made, kept or earned.
        </p>
      </main>
    </div>
  );
}
