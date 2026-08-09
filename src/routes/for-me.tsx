import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Sparkles, PenLine } from "lucide-react";
import { getMyProfile } from "@/lib/profiles.functions";
import { usePublishedStories } from "@/hooks/use-for-us-stories";
import { rowToStory, resolveForUsWeather } from "@/lib/for-us";

/**
 * FRASS-0421 — FOR ME.
 *
 * For Us is the community. For Me is the same warmth turned toward one Builder:
 * your face, your story, and the moments the Hill picked out for you today.
 */
export const Route = createFileRoute("/for-me")({
  head: () => ({
    meta: [
      { title: "For Me — Your Corner of Frass Hill" },
      {
        name: "description",
        content:
          "Your own page on Frass Hill: your profile, your story, and the community moments chosen for you today.",
      },
      { property: "og:title", content: "For Me — Your Corner of Frass Hill" },
      {
        property: "og:description",
        content: "Your profile, your story, and the moments Frass Hill picked out for you.",
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

  const profileQuery = useQuery({
    queryKey: ["my-profile", "for-me"],
    queryFn: () => loadProfile(),
    retry: false,
  });

  const { data: rows } = usePublishedStories();
  const mine = useMemo(() => (rows ?? []).slice(0, 6).map(rowToStory), [rows]);

  const profile = profileQuery.data as
    | { display_name?: string | null; handle?: string | null; bio?: string | null; avatar_url?: string | null }
    | undefined;

  const name = profile?.display_name?.trim() || "Builder";

  return (
    <div className="for-us-tropical min-h-screen bg-[#07100f] text-foreground">
      <div className="sticky top-0 z-20 bg-gradient-to-b from-black/60 to-transparent">
        <div className="mx-auto flex max-w-[1100px] items-center gap-4 px-6 py-3 lg:px-10">
          <Link
            to="/for-us"
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
        {/* Hero — your face, large, unhurried */}
        <section className="chrome-glow relative overflow-hidden rounded-[2rem] ring-1 ring-white/10">
          <div className="grid gap-8 bg-black/40 p-8 md:grid-cols-[220px_1fr] md:p-12">
            <div className="mx-auto h-[200px] w-[200px] overflow-hidden rounded-full ring-2 ring-[color:var(--gold)]/50">
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
              <p className="text-[10px] uppercase tracking-[0.4em] text-[color:var(--gold)]">
                For Me · Your corner of the Hill
              </p>
              <h1 className="mt-3 text-4xl font-black md:text-6xl">{name}</h1>
              {profile?.handle && (
                <p className="mt-2 text-sm text-white/70">@{profile.handle}</p>
              )}
              <p className="mt-5 max-w-xl text-base leading-relaxed text-white/85">
                {profile?.bio?.trim() ||
                  "You haven't written your story yet. Every Builder on the Hill has one — where you started, what you're making, and who you're making it for."}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/workspace/profile"
                  className="inline-flex items-center gap-2 rounded-full bg-[color:var(--gold)] px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.25em] text-black transition hover:scale-[1.03]"
                >
                  <PenLine className="h-3.5 w-3.5" />
                  My Story
                </Link>
                <Link
                  to="/for-us"
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.25em] text-white/85 transition hover:border-[color:var(--gold)] hover:text-white"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Back to For Us
                </Link>
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

        {/* Chosen for you */}
        <section className="mt-12">
          <h2 className="text-2xl font-black md:text-3xl">Chosen for you today</h2>
          <p className="mt-2 max-w-xl text-sm text-white/75">
            Not an algorithm chasing your attention — just a handful of moments from the community,
            picked because you walk these streets.
          </p>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {mine.map((story) => (
              <article
                key={story.id}
                className="chrome-glow overflow-hidden rounded-2xl bg-black/40 p-6 ring-1 ring-white/10"
              >
                <span className="text-[10px] uppercase tracking-[0.28em] text-[color:var(--gold)]">
                  {story.source ?? "Frass Hill"}
                </span>
                <h3 className="mt-3 text-lg font-bold">{story.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/80">{story.summary}</p>
              </article>
            ))}

            {mine.length === 0 && (
              <p className="text-sm text-white/70">
                Nothing published yet. When the community shares, it will land here first.
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
