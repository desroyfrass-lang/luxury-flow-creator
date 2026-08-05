import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { ThumbsUp, ThumbsDown, AlertCircle, MessageSquare, Loader2 } from "lucide-react";
import { listPageFeedback } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/feedback")({
  component: FeedbackAdminPage,
});

function FeedbackAdminPage() {
  const listFn = useServerFn(listPageFeedback);
  const { data: items, isLoading, error } = useQuery({
    queryKey: ["admin", "page-feedback"],
    queryFn: () => listFn(),
  });

  return (
    <div>
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
            Owner console · Feedback
          </div>
          <h2 className="mt-2 font-display text-4xl">Page feedback</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Thumbs up/down votes and issue reports from across the site.
          </p>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center gap-3 py-12 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading feedback…</span>
        </div>
      )}

      {error && (
        <div className="rounded-sm border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-200">
          Could not load feedback: {error instanceof Error ? error.message : "Unknown error"}
        </div>
      )}

      {!isLoading && !error && items && items.length === 0 && (
        <div className="rounded-sm border border-dashed border-border bg-background/60 p-12 text-center">
          <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground" />
          <h3 className="mt-4 font-display text-2xl">No feedback yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Feedback appears here once visitors start using the widget on key pages.
          </p>
        </div>
      )}

      {!isLoading && !error && items && items.length > 0 && (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-sm border border-white/10 bg-white/[0.03] p-5 transition hover:border-white/15"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                    <span>{item.created_at ? new Date(item.created_at).toLocaleString() : "—"}</span>
                    <span className="text-white/30">·</span>
                    <Link
                      to={item.page_path}
                      className="max-w-[280px] truncate text-[color:var(--gold)] hover:underline"
                      title={item.page_path}
                    >
                      {item.page_path}
                    </Link>
                  </div>
                  {item.page_title && (
                    <div className="mt-1 text-sm text-white/80">{item.page_title}</div>
                  )}
                  {item.issue_text && (
                    <div className="mt-3 flex items-start gap-2 rounded-sm bg-red-500/10 p-3 text-sm text-red-100">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                      <p>{item.issue_text}</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {item.helpful === true && (
                    <span className="inline-flex items-center gap-1 rounded-sm bg-emerald-500/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-emerald-400">
                      <ThumbsUp className="h-3 w-3" /> Helpful
                    </span>
                  )}
                  {item.helpful === false && (
                    <span className="inline-flex items-center gap-1 rounded-sm bg-red-500/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-red-400">
                      <ThumbsDown className="h-3 w-3" /> Not helpful
                    </span>
                  )}
                  {item.helpful === null && (
                    <span className="inline-flex items-center gap-1 rounded-sm bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      <MessageSquare className="h-3 w-3" /> Issue only
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
