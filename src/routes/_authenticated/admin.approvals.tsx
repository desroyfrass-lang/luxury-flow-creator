import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getDailyBriefing } from "@/lib/frassy.functions";
import { CheckCircle2, ArrowRight, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/approvals")({
  head: () => ({
    meta: [{ title: "Approval Queue — Frass Hill Admin" }, { name: "robots", content: "noindex" }],
  }),
  component: ApprovalsPage,
});

function ApprovalsPage() {
  const briefingFn = useServerFn(getDailyBriefing);
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["approvals-queue"],
    queryFn: () => briefingFn(),
    staleTime: 30_000,
  });

  const tasks = data?.tasks ?? [];
  const totalCount = tasks.reduce((s, t) => s + t.count, 0);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-[color:var(--gold)] mb-2">
            Approval Queue
          </p>
          <h1 className="text-3xl font-bold">What needs your eyes today</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isLoading
              ? "Scanning the queue…"
              : totalCount === 0
                ? "Nothing pending. Ship something new."
                : `${totalCount} item${totalCount === 1 ? "" : "s"} across ${tasks.length} queue${tasks.length === 1 ? "" : "s"} · ~${data?.totalMinutes} min`}
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-muted-foreground hover:text-[color:var(--gold)]"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 rounded-2xl border border-border/50 bg-foreground/[0.02] animate-pulse" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="border border-border/60 rounded-2xl px-8 py-16 text-center">
          <CheckCircle2 className="h-10 w-10 text-[color:var(--gold)] mx-auto mb-4" />
          <p className="text-lg font-medium">Inbox zero.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            No pending approvals across CJ, capsules, blog, virals, or CMS slots.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {tasks.map((t) => (
            <li key={t.key}>
              <Link
                to={t.href}
                className="group flex items-center justify-between gap-4 rounded-2xl border border-border/60 bg-background/60 backdrop-blur px-5 py-4 hover:border-[color:var(--gold)] transition"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="shrink-0 h-12 w-12 rounded-xl border border-[color:var(--gold)]/40 bg-[color:var(--gold)]/5 flex items-center justify-center">
                    <span className="text-lg font-bold text-[color:var(--gold)] font-mono">
                      {t.count}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{t.title}</div>
                    <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mt-1">
                      ~{t.minutes} min
                    </div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-[color:var(--gold)] transition shrink-0" />
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-10 pt-6 border-t border-border/50">
        <Link
          to="/frassy"
          className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground hover:text-[color:var(--gold)]"
        >
          ← Back to Frassy OS
        </Link>
      </div>
    </div>
  );
}
