import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { useBlogPost } from "@/hooks/use-blog-posts";

export const Route = createFileRoute("/blog/$slug")({
  component: BlogPostPage,
  notFoundComponent: () => (
    <SiteShell>
      <div className="mx-auto max-w-md px-6 py-32 text-center">
        <h1 className="font-display text-4xl">Post not found</h1>
        <Link to="/blog" className="mt-6 inline-block text-[11px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
          ← Back to journal
        </Link>
      </div>
    </SiteShell>
  ),
  errorComponent: ({ error }) => (
    <SiteShell>
      <div className="mx-auto max-w-md px-6 py-32 text-center">
        <h1 className="font-display text-3xl">Something went wrong</h1>
        <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
      </div>
    </SiteShell>
  ),
});

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function BlogPostPage() {
  const { slug } = Route.useParams();
  const { data: post, isLoading } = useBlogPost(slug);

  if (isLoading) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-md px-6 py-32 text-center text-sm text-muted-foreground">Loading…</div>
      </SiteShell>
    );
  }

  if (!post) throw notFound();

  return (
    <SiteShell>
      <article className="mx-auto max-w-3xl px-6 lg:px-0 py-16 lg:py-24">
        <Link to="/blog" className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground hover:text-[color:var(--gold)]">
          ← Journal
        </Link>
        <div className="mt-8">
          {post.tag && (
            <div className="text-[11px] uppercase tracking-[0.4em] text-[color:var(--gold)]">{post.tag}</div>
          )}
          <h1 className="mt-3 font-display text-4xl lg:text-6xl title-glow">{post.title}</h1>
          <div className="mt-4 flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            <span>{post.author ?? "Frass Hill"}</span>
            <span>•</span>
            <span>{formatDate(post.published_at ?? post.created_at)}</span>
          </div>
        </div>

        {post.cover_url && (
          <div className="mt-10 overflow-hidden rounded-xl border border-border/60">
            <img src={post.cover_url} alt={post.title} className="h-full w-full object-cover" />
          </div>
        )}

        {post.excerpt && (
          <p className="mt-10 text-lg leading-relaxed text-muted-foreground italic">{post.excerpt}</p>
        )}

        {post.body && (
          <div className="mt-10 whitespace-pre-wrap text-base leading-[1.85] text-foreground/90">
            {post.body}
          </div>
        )}
      </article>
    </SiteShell>
  );
}
