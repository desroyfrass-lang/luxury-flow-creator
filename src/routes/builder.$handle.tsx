import { createFileRoute, notFound } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { MapPin, Shield, Sparkles } from "lucide-react";
import { getPublicProfileByHandle } from "@/lib/profiles.functions";

const profileQueryOptions = (handle: string) =>
  queryOptions({
    queryKey: ["builder-profile", handle],
    queryFn: () => getPublicProfileByHandle({ data: { handle } }),
  });

export const Route = createFileRoute("/builder/$handle")({
  head: ({ params }) => ({
    meta: [
      { title: `@${params.handle} — Frass Builder` },
      { name: "description", content: `Discover @${params.handle} on Frass OS.` },
      { property: "og:title", content: `@${params.handle} — Frass Builder` },
      { property: "og:description", content: `Discover @${params.handle} on Frass OS.` },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: async ({ params, context }) => {
    const profile = await context.queryClient.ensureQueryData(profileQueryOptions(params.handle));
    if (!profile) throw notFound();
    return profile;
  },
  errorComponent: ({ error }) => (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-3xl uppercase tracking-[0.12em]">Builder not found</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "That handle isn't public or doesn't exist yet."}
        </p>
      </div>
    </div>
  ),
  component: BuilderProfilePage,
});

function BuilderProfilePage() {
  const { handle } = Route.useParams();
  const { data: profile } = useSuspenseQuery(profileQueryOptions(handle));

  if (!profile) return null;

  const stageLabel = profile.builder_stage
    ? profile.builder_stage.charAt(0).toUpperCase() + profile.builder_stage.slice(1)
    : "Builder";

  return (
    <div className="relative min-h-screen px-6 py-16 lg:px-12">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto mb-6 h-28 w-28 overflow-hidden rounded-full border-2 border-[color:var(--gold)] bg-foreground/5">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.display_name ?? profile.handle ?? undefined}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-3xl font-display uppercase text-muted-foreground">
              {(profile.display_name ?? profile.handle ?? "?").charAt(0)}
            </div>
          )}
        </div>

        <h1 className="font-display text-4xl uppercase tracking-[0.1em]">
          {profile.display_name ?? profile.handle}
        </h1>
        <p className="mt-2 text-sm uppercase tracking-[0.2em] text-muted-foreground">@{profile.handle}</p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--gold)]/40 bg-[color:var(--gold)]/10 px-3 py-1 text-xs uppercase tracking-[0.15em] text-[color:var(--gold)]">
            <Sparkles className="h-3.5 w-3.5" />
            {stageLabel}
          </span>
          {profile.primary_district && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-3 py-1 text-xs uppercase tracking-[0.15em] text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {profile.primary_district}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-3 py-1 text-xs uppercase tracking-[0.15em] text-muted-foreground">
            <Shield className="h-3.5 w-3.5" />
            Verified Builder
          </span>
        </div>

        {profile.bio && (
          <p className="mt-8 text-base leading-relaxed text-muted-foreground">{profile.bio}</p>
        )}

        <div className="mt-12 rounded-2xl border border-border/60 bg-background/40 p-8 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Frass OS</p>
          <p className="mt-3 text-sm text-muted-foreground">
            This Builder is part of the Frass Operating System ecosystem. More districts, achievements, and
            public work will appear here as their journey unfolds.
          </p>
        </div>
      </div>
    </div>
  );
}
