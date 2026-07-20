import { createFileRoute, Link } from "@tanstack/react-router";
import { useNotifications } from "@/hooks/use-notifications";
import { SiteShell } from "@/components/site-shell";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Frass Hill" }, { name: "robots", content: "noindex" }] }),
  component: NotificationsPage,
});

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function NotificationsPage() {
  const { items, unreadCount, markRead, markAllRead } = useNotifications();

  return (
    <SiteShell>
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-[color:var(--gold)] mb-2">Inbox</p>
            <h1 className="text-4xl font-bold">Notifications</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllRead()}
              className="text-[11px] uppercase tracking-[0.25em] text-[color:var(--gold)] hover:text-foreground"
            >
              Mark all read
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="border border-border/60 rounded-2xl px-6 py-24 text-center text-sm text-muted-foreground">
            No notifications yet
          </div>
        ) : (
          <ul className="divide-y divide-border/50 border border-border/60 rounded-2xl overflow-hidden">
            {items.map((n) => {
              const inner = (
                <div className="px-6 py-4 hover:bg-foreground/5 transition">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      {!n.read_at && (
                        <span className="mt-1.5 h-2 w-2 rounded-full bg-[color:var(--gold)] shrink-0" />
                      )}
                      <div>
                        <div className="text-sm font-medium">{n.title}</div>
                        {n.body && (
                          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{n.body}</p>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground shrink-0">
                      {timeAgo(n.created_at)}
                    </span>
                  </div>
                </div>
              );
              return (
                <li key={n.id} onClick={() => !n.read_at && markRead(n.id)}>
                  {n.url ? <Link to={n.url}>{inner}</Link> : inner}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </SiteShell>
  );
}
