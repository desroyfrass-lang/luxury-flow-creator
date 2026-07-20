import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useNotifications } from "@/hooks/use-notifications";

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

export function NotificationBell() {
  const { items, unreadCount, isSignedIn, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!isSignedIn) return null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/70 backdrop-blur hover:border-[color:var(--gold)] transition"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[color:var(--gold)] text-[10px] font-bold text-[color:var(--ink)] flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-3 w-80 max-h-[70vh] overflow-auto rounded-2xl border border-border/70 bg-background/95 backdrop-blur-xl shadow-2xl z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
            <span className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllRead()}
                className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--gold)] hover:text-foreground"
              >
                Mark all read
              </button>
            )}
          </div>
          {items.length === 0 ? (
            <div className="px-4 py-8 text-center text-xs text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            <ul className="divide-y divide-border/50">
              {items.map((n) => {
                const body = (
                  <div className="px-4 py-3 hover:bg-foreground/5 transition">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-medium leading-tight">{n.title}</span>
                      <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground shrink-0">
                        {timeAgo(n.created_at)}
                      </span>
                    </div>
                    {n.body && (
                      <p className="mt-1 text-xs text-muted-foreground leading-snug">{n.body}</p>
                    )}
                    {!n.read_at && (
                      <span className="mt-2 inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--gold)]" />
                    )}
                  </div>
                );
                return (
                  <li key={n.id} onClick={() => !n.read_at && markRead(n.id)}>
                    {n.url ? (
                      <Link to={n.url} onClick={() => setOpen(false)}>
                        {body}
                      </Link>
                    ) : (
                      body
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
