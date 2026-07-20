import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pin, PinOff, Archive, RefreshCw, ArrowUpRight, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { checkIsAdmin } from "@/lib/admin.functions";
import {
  getDailyBriefing,
  listNotes,
  createNote,
  toggleNotePin,
  archiveNote,
  type DailyBriefing,
  type FrassyNote,
} from "@/lib/frassy.functions";

export const Route = createFileRoute("/_authenticated/frassy")({
  component: FrassyOS,
});

function greeting(now = new Date()) {
  const h = now.getHours();
  if (h < 5) return "Still up";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Late night";
}

const WARM_LINES = [
  "Hope you're doing well today.",
  "Let's make it a clean run.",
  "Ready when you are.",
  "Small moves, big day.",
  "The store missed you.",
];

function FrassyOS() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const isAdminFn = useServerFn(checkIsAdmin);
  const briefFn = useServerFn(getDailyBriefing);
  const notesFn = useServerFn(listNotes);
  const createFn = useServerFn(createNote);
  const pinFn = useServerFn(toggleNotePin);
  const archiveFn = useServerFn(archiveNote);

  const [firstName, setFirstName] = useState<string>("");
  const [noteInput, setNoteInput] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      const full = (u?.user_metadata?.full_name as string | undefined) ?? "";
      const short = full.split(" ")[0] || (u?.email?.split("@")[0] ?? "");
      setFirstName(short);
    });
  }, []);

  const admin = useQuery({ queryKey: ["is-admin"], queryFn: () => isAdminFn(), staleTime: 60_000 });

  const brief = useQuery<DailyBriefing>({
    queryKey: ["frassy", "briefing"],
    queryFn: () => briefFn(),
    enabled: !!admin.data,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const notes = useQuery<FrassyNote[]>({
    queryKey: ["frassy", "notes"],
    queryFn: () => notesFn(),
    enabled: !!admin.data,
  });

  const addNote = useMutation({
    mutationFn: (body: string) => createFn({ data: { body } }),
    onSuccess: () => {
      setNoteInput("");
      qc.invalidateQueries({ queryKey: ["frassy", "notes"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const togglePin = useMutation({
    mutationFn: (n: FrassyNote) => pinFn({ data: { id: n.id, pinned: !n.pinned } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["frassy", "notes"] }),
  });

  const archive = useMutation({
    mutationFn: (id: string) => archiveFn({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["frassy", "notes"] }),
  });

  const warm = useMemo(() => WARM_LINES[Math.floor(Math.random() * WARM_LINES.length)], []);

  if (admin.isLoading) {
    return (
      <FrassyShell>
        <div className="mt-32 text-center text-xs uppercase tracking-[0.3em] text-white/40">
          Waking Frassy…
        </div>
      </FrassyShell>
    );
  }

  if (!admin.data) {
    return (
      <FrassyShell>
        <div className="mx-auto mt-32 max-w-md text-center">
          <h1 className="font-display text-3xl text-white">Owner access only</h1>
          <p className="mt-4 text-sm text-white/60">
            Frassy is your private operating console. Only the site owner can enter.
          </p>
          <button
            onClick={() => navigate({ to: "/admin" })}
            className="mt-8 text-[11px] uppercase tracking-[0.3em] text-[color:var(--gold)] hover:underline"
          >
            Go to admin →
          </button>
        </div>
      </FrassyShell>
    );
  }

  const b = brief.data;

  return (
    <FrassyShell>
      {/* Greeting */}
      <header className="flex flex-wrap items-end justify-between gap-6 border-b border-white/10 pb-8">
        <div>
          <div className="text-[10px] uppercase tracking-[0.45em] text-[color:var(--gold)]">
            Frassy · Mission Control
          </div>
          <h1 className="mt-3 font-display text-4xl text-white md:text-5xl">
            {greeting()}{firstName ? `, ${firstName}` : ""}.
          </h1>
          <p className="mt-2 text-sm text-white/50">{warm}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => brief.refetch()}
            className="inline-flex items-center gap-2 rounded-sm border border-white/15 px-3 py-2 text-[10px] uppercase tracking-[0.3em] text-white/70 hover:border-[color:var(--gold)] hover:text-white"
          >
            <RefreshCw className={`h-3 w-3 ${brief.isFetching ? "animate-spin" : ""}`} /> Refresh
          </button>
          <Link
            to="/admin"
            className="text-[10px] uppercase tracking-[0.3em] text-white/50 hover:text-white"
          >
            Admin console →
          </Link>
        </div>
      </header>

      {/* Status strip */}
      <section className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-white/10 bg-white/5 md:grid-cols-3 lg:grid-cols-6">
        <StatusTile label="Orders overnight" value={b?.status.ordersOvernight ?? "—"} caption="last 12h" />
        <StatusTile label="Orders today" value={b?.status.ordersToday ?? "—"} caption="since midnight" />
        <StatusTile label="Revenue today" value={money(b?.status.revenueToday)} caption="gross" />
        <StatusTile label="Revenue · 7d" value={money(b?.status.revenue7d)} caption="rolling" />
        <StatusTile label="Pending orders" value={b?.status.pendingOrders ?? "—"} caption="need attention" />
        <StatusTile label="New customers" value={b?.status.newCustomers24h ?? "—"} caption="last 24h" />
      </section>

      {/* Mandatory */}
      <section className="mt-14">
        <div className="flex items-end justify-between border-b border-white/10 pb-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.4em] text-[color:var(--gold)]">Today</div>
            <h2 className="mt-2 font-display text-2xl text-white">What needs you</h2>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">Est. mandatory work</div>
            <div className="mt-1 font-display text-3xl text-white">
              {b ? `~${b.totalMinutes} min` : "—"}
            </div>
          </div>
        </div>
        <div className="mt-4 divide-y divide-white/5 rounded-sm border border-white/10">
          {b && b.tasks.length === 0 && (
            <div className="px-6 py-10 text-center text-sm text-white/50">
              Inbox zero. Nothing needs approval right now.
            </div>
          )}
          {b?.tasks.map((t) => (
            <Link
              key={t.key}
              to={t.href}
              className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-white/5"
            >
              <div className="flex items-center gap-4">
                <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-sm border border-[color:var(--gold)]/40 px-2 font-mono text-sm text-[color:var(--gold)]">
                  {t.count}
                </span>
                <span className="text-sm text-white">{t.title}</span>
              </div>
              <div className="flex items-center gap-6 text-[11px] uppercase tracking-[0.25em] text-white/40">
                <span className="font-mono">{t.minutes}m</span>
                <ArrowUpRight className="h-4 w-4" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Optional launcher */}
      <section className="mt-14">
        <div className="border-b border-white/10 pb-4">
          <div className="text-[10px] uppercase tracking-[0.4em] text-white/40">Optional</div>
          <h2 className="mt-2 font-display text-2xl text-white">What would you like to work on?</h2>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { to: "/admin/capsules", label: "Build a capsule", sub: "Curate a look" },
            { to: "/admin/blog", label: "Write journal", sub: "Publish a story" },
            { to: "/admin/virals", label: "Manage virals", sub: "Curate trending" },
            { to: "/admin/cj-import", label: "Discover CJ products", sub: "Approve inventory" },
            { to: "/admin/images", label: "Refresh imagery", sub: "Homepage & slots" },
            { to: "/admin/text", label: "Tune copy", sub: "Voice & taglines" },
          ].map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="group flex items-center justify-between rounded-sm border border-white/10 px-5 py-4 transition-colors hover:border-[color:var(--gold)]/50 hover:bg-white/5"
            >
              <div>
                <div className="text-sm text-white">{l.label}</div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.25em] text-white/40">{l.sub}</div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-white/30 group-hover:text-[color:var(--gold)]" />
            </Link>
          ))}
        </div>
      </section>

      {/* Notes */}
      <section className="mt-14 pb-24">
        <div className="border-b border-white/10 pb-4">
          <div className="text-[10px] uppercase tracking-[0.4em] text-white/40">Pinned & scratch</div>
          <h2 className="mt-2 font-display text-2xl text-white">Notes</h2>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const v = noteInput.trim();
            if (!v) return;
            addNote.mutate(v);
          }}
          className="mt-4 flex gap-2"
        >
          <input
            value={noteInput}
            onChange={(e) => setNoteInput(e.target.value)}
            placeholder="Jot an idea, a reminder, something to revisit…"
            className="flex-1 rounded-sm border border-white/15 bg-transparent px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-[color:var(--gold)] focus:outline-none"
          />
          <button
            type="submit"
            disabled={addNote.isPending}
            className="inline-flex items-center gap-2 rounded-sm border border-[color:var(--gold)] bg-[color:var(--gold)] px-4 py-3 text-[11px] uppercase tracking-[0.3em] text-[color:var(--ink)] disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5" /> Save
          </button>
        </form>
        <ul className="mt-6 space-y-2">
          {notes.data?.length === 0 && (
            <li className="rounded-sm border border-dashed border-white/10 px-4 py-6 text-center text-xs text-white/40">
              No notes yet.
            </li>
          )}
          {notes.data?.map((n) => (
            <li
              key={n.id}
              className={`flex items-start justify-between gap-4 rounded-sm border px-4 py-3 ${
                n.pinned ? "border-[color:var(--gold)]/50 bg-[color:var(--gold)]/5" : "border-white/10"
              }`}
            >
              <div className="flex-1">
                <p className="whitespace-pre-wrap text-sm text-white">{n.body}</p>
                <div className="mt-1 text-[10px] uppercase tracking-[0.3em] text-white/30">
                  {new Date(n.created_at).toLocaleString()}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => togglePin.mutate(n)}
                  title={n.pinned ? "Unpin" : "Pin"}
                  className="rounded-sm p-2 text-white/50 hover:bg-white/10 hover:text-white"
                >
                  {n.pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
                </button>
                <button
                  onClick={() => archive.mutate(n.id)}
                  title="Archive"
                  className="rounded-sm p-2 text-white/50 hover:bg-white/10 hover:text-white"
                >
                  <Archive className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </FrassyShell>
  );
}

function FrassyShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#07080a] text-white">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] opacity-60"
        style={{
          background:
            "radial-gradient(ellipse at top, color-mix(in oklab, var(--gold) 20%, transparent), transparent 70%)",
        }}
      />
      <div className="relative mx-auto max-w-[1200px] px-6 py-12 md:px-10 md:py-16">{children}</div>
    </div>
  );
}

function StatusTile({
  label,
  value,
  caption,
}: {
  label: string;
  value: string | number;
  caption: string;
}) {
  return (
    <div className="bg-[#07080a] px-5 py-6">
      <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">{label}</div>
      <div className="mt-3 font-display text-3xl text-white">{value}</div>
      <div className="mt-1 text-[10px] uppercase tracking-[0.25em] text-white/30">{caption}</div>
    </div>
  );
}

function money(n: number | undefined) {
  if (n === undefined || n === null) return "—";
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}
