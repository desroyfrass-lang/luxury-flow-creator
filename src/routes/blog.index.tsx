import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { useBlogPosts } from "@/hooks/use-blog-posts";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Journal — Frass" },
      { name: "description", content: "Dispatches from Frass Hill — drops, sessions, and street culture." },
      { property: "og:title", content: "Journal — Frass" },
      { property: "og:description", content: "Dispatches from Frass Hill — drops, sessions, and street culture." },
    ],
  }),
  component: BlogIndex,
});

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function BlogIndex() {
  const { data, isLoading } = useBlogPosts();

  return (
    <SiteShell>
      <div className="mx-auto max-w-[1200px] px-6 lg:px-12 py-16 lg:py-24">
        <div className="text-center">
          <div className="text-[11px] uppercase tracking-[0.4em] text-[color:var(--gold)]">Frass Hill</div>
          <h1 className="mt-3 font-display text-5xl lg:text-7xl title-glow">Journal</h1>
          <p className="mt-4 text-sm text-muted-foreground max-w-xl mx-auto">
            Dispatches from the hill — drops, sessions, and culture from the Frass world.
          </p>
        </div>

        <div className="mt-16">
          {isLoading && <p className="text-center text-sm text-muted-foreground">Loading…</p>}
          {!isLoading && (data ?? []).length === 0 && (
            <div className="rounded-xl border border-dashed border-border/60 p-16 text-center text-sm text-muted-foreground">
              No posts published yet. Check back soon.
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(data ?? []).map((post) => (
              <Link
                key={post.id}
                to="/blog/$slug"
                params={{ slug: post.slug }}
                className="group lux-card block overflow-hidden rounded-xl border border-border/60 bg-background/60 transition"
              >
                {post.cover_url && (
                  <div className="aspect-[4/3] overflow-hidden bg-muted">
                    <img
                      src={post.cover_url}
                      alt={post.title}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="p-6">
                  {post.tag && (
                    <div className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]">{post.tag}</div>
                  )}
                  <h2 className="mt-2 font-display text-2xl title-glow">{post.title}</h2>
                  {post.excerpt && (
                    <p className="mt-3 text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>
                  )}
                  <div className="mt-4 flex items-center justify-between text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                    <span>{post.author ?? "Frass Hill"}</span>
                    <span>{formatDate(post.published_at ?? post.created_at)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
