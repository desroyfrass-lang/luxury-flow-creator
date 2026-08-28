// ─────────────────────────────────────────────────────────────────────────────
// WORKSHOP — CANONICAL.  "Where do I go to do the work?"
//
// Workshop is the execution environment: create work, edit it, save it, come
// back to it, finish it. Daily reads the same records — it never edits them
// here. Work belonging to a Vault keeps its Vault; the Vault Engine remains the
// owner of the underlying business record.
// ─────────────────────────────────────────────────────────────────────────────

import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { SiteShell } from "@/components/site-shell";
import {
  createWorkItem,
  listWorkItems,
  setWorkItemState,
  updateWorkItem,
  type WorkItem,
} from "@/lib/daily/work.functions";
import { listMyVaults } from "@/lib/vault-engine/vaults.functions";

export const Route = createFileRoute("/_authenticated/workshop")({
  validateSearch: (search: Record<string, unknown>): { item?: string } =>
    typeof search["item"] === "string" ? { item: search["item"] as string } : {},
  head: () => ({
    meta: [
      { title: "Workshop — Where the work gets done" },
      {
        name: "description",
        content:
          "The Frass Workshop: your real projects and tasks, organised by the Vaults and contexts you actually work in.",
      },
      { property: "og:title", content: "Workshop — Where the work gets done" },
      {
        property: "og:description",
        content: "Create, continue and complete your real work. Daily organises it, Workshop finishes it.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: WorkshopPage,
});

type Tab = "active" | "recent" | "completed";

function WorkshopPage() {
  const { item: focusId } = Route.useSearch();
  const listFn = useServerFn(listWorkItems);
  const createFn = useServerFn(createWorkItem);
  const updateFn = useServerFn(updateWorkItem);
  const stateFn = useServerFn(setWorkItemState);
  const vaultsFn = useServerFn(listMyVaults);
  const qc = useQueryClient();

  const [tab, setTab] = useState<Tab>("active");
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [vaultId, setVaultId] = useState("");
  const [due, setDue] = useState("");
  const [editing, setEditing] = useState<string | null>(focusId ?? null);
  const [editTitle, setEditTitle] = useState("");
  const [editDetail, setEditDetail] = useState("");

  const { data: items, isLoading } = useQuery({ queryKey: ["work-items"], queryFn: () => listFn() });
  const { data: vaults } = useQuery({ queryKey: ["my-vaults"], queryFn: () => vaultsFn() });

  const refresh = () => {
    void qc.invalidateQueries({ queryKey: ["work-items"] });
    void qc.invalidateQueries({ queryKey: ["daily-board"] });
  };

  const create = useMutation({
    mutationFn: () =>
      createFn({
        data: {
          title,
          detail,
          vaultId: vaultId || null,
          dueAt: due ? new Date(due + "T12:00:00").toISOString() : null,
          context: vaultId ? null : "Personal work",
        },
      }),
    onSuccess: () => {
      setTitle("");
      setDetail("");
      setDue("");
      refresh();
    },
  });

  const save = useMutation({
    mutationFn: (input: { id: string; title: string; detail: string }) =>
      updateFn({ data: { id: input.id, title: input.title, detail: input.detail } }),
    onSuccess: () => {
      setEditing(null);
      refresh();
    },
  });

  const state = useMutation({
    mutationFn: (input: { id: string; action: "done" | "reopen" | "archive" }) => stateFn({ data: input }),
    onSuccess: refresh,
  });

  const active = useMemo(() => (items ?? []).filter((i) => i.status === "active"), [items]);
  const completed = useMemo(() => (items ?? []).filter((i) => i.status === "done"), [items]);
  const recent = useMemo(
    () => (items ?? []).slice().sort((a, b) => b.updated_at.localeCompare(a.updated_at)).slice(0, 10),
    [items],
  );

  // Contexts come from the member's real Vaults — never invented categories.
  const grouped = useMemo(() => {
    const byContext = new Map<string, WorkItem[]>();
    for (const i of active) {
      const key =
        (i.vault_id ? (vaults ?? []).find((v) => v.id === i.vault_id)?.name : i.context) || "Personal work";
      byContext.set(key, [...(byContext.get(key) ?? []), i]);
    }
    return [...byContext.entries()];
  }, [active, vaults]);

  const shown: WorkItem[] = tab === "active" ? active : tab === "recent" ? recent : completed;

  function beginEdit(i: WorkItem) {
    setEditing(i.id);
    setEditTitle(i.title);
    setEditDetail(i.detail ?? "");
  }

  const row = (i: WorkItem) => (
    <div key={i.id} className="rounded-2xl border border-border/70 bg-background/70 p-4">
      {editing === i.id ? (
        <div className="grid gap-2">
          <input
            className="w-full rounded-lg border border-border/70 bg-background px-3 py-3 text-base"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            aria-label="Work title"
          />
          <textarea
            className="w-full rounded-lg border border-border/70 bg-background px-3 py-3 text-base"
            rows={3}
            value={editDetail}
            onChange={(e) => setEditDetail(e.target.value)}
            aria-label="Work notes"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-full bg-[color:var(--gold)] px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-background"
              disabled={save.isPending}
              onClick={() => save.mutate({ id: i.id, title: editTitle, detail: editDetail })}
            >
              Save
            </button>
            <button
              type="button"
              className="rounded-full border border-border/70 px-5 py-2 text-xs uppercase tracking-[0.2em]"
              onClick={() => setEditing(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="font-display text-base break-words">{i.title}</div>
          {i.detail ? <p className="mt-1 text-sm text-muted-foreground break-words">{i.detail}</p> : null}
          <div className="mt-2 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            <span className="rounded-full border border-border/70 px-2 py-0.5">
              {(i.vault_id ? (vaults ?? []).find((v) => v.id === i.vault_id)?.name : i.context) || "Personal work"}
            </span>
            {i.due_at ? (
              <span className="rounded-full border border-border/70 px-2 py-0.5">
                Due {new Date(i.due_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              </span>
            ) : null}
            {i.status === "done" ? (
              <span className="rounded-full border border-border/70 px-2 py-0.5">Completed</span>
            ) : null}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-full border border-border/70 px-4 py-2 text-xs uppercase tracking-[0.2em]"
              onClick={() => beginEdit(i)}
            >
              {i.status === "done" ? "View / edit" : "Continue"}
            </button>
            {i.status === "active" ? (
              <button
                type="button"
                className="rounded-full bg-[color:var(--gold)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-background"
                disabled={state.isPending}
                onClick={() => state.mutate({ id: i.id, action: "done" })}
              >
                Complete
              </button>
            ) : (
              <button
                type="button"
                className="rounded-full border border-border/70 px-4 py-2 text-xs uppercase tracking-[0.2em]"
                disabled={state.isPending}
                onClick={() => state.mutate({ id: i.id, action: "reopen" })}
              >
                Reopen
              </button>
            )}
            {i.vault_id ? (
              <Link
                to="/vaults/$vaultId"
                params={{ vaultId: i.vault_id }}
                className="rounded-full border border-border/70 px-4 py-2 text-xs uppercase tracking-[0.2em]"
              >
                Open Vault
              </Link>
            ) : null}
          </div>
        </>
      )}
    </div>
  );

  return (
    <SiteShell>
      <div className="mx-auto w-full max-w-3xl px-4 pb-24 pt-10 sm:px-6">
        <div className="text-[11px] uppercase tracking-[0.4em] text-[color:var(--gold)]">Workshop</div>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl">What are you working on?</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Daily tells you what matters. The Workshop is where you actually do it.
        </p>
        <div className="mt-5">
          <Link
            to="/daily"
            className="rounded-full border border-border/70 px-5 py-2 text-xs uppercase tracking-[0.2em]"
          >
            Back to Daily
          </Link>
        </div>

        {/* Create real work */}
        <section className="mt-8 rounded-2xl border border-border/70 bg-background/70 p-4">
          <h2 className="text-[11px] uppercase tracking-[0.35em] text-[color:var(--gold)]">Start something</h2>
          <div className="mt-3 grid gap-2">
            <input
              className="w-full rounded-lg border border-border/70 bg-background px-3 py-3 text-base"
              placeholder="What needs doing?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              aria-label="New work title"
            />
            <textarea
              className="w-full rounded-lg border border-border/70 bg-background px-3 py-3 text-base"
              rows={2}
              placeholder="Any notes (optional)"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              aria-label="New work notes"
            />
            <div className="grid gap-2 sm:grid-cols-2">
              <select
                className="w-full rounded-lg border border-border/70 bg-background px-3 py-3 text-base"
                value={vaultId}
                onChange={(e) => setVaultId(e.target.value)}
                aria-label="Which Vault does this belong to?"
              >
                <option value="">Personal work</option>
                {(vaults ?? []).map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
              <input
                type="date"
                className="w-full rounded-lg border border-border/70 bg-background px-3 py-3 text-base"
                value={due}
                onChange={(e) => setDue(e.target.value)}
                aria-label="Due date"
              />
            </div>
            <button
              type="button"
              className="rounded-full bg-[color:var(--gold)] px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-background disabled:opacity-50"
              disabled={!title.trim() || create.isPending}
              onClick={() => create.mutate()}
            >
              {create.isPending ? "Saving…" : "Add to my work"}
            </button>
            {create.error ? (
              <p className="text-sm text-destructive">{(create.error as Error).message}</p>
            ) : null}
          </div>
        </section>

        {/* Contexts from the member's real Vaults */}
        {grouped.length > 1 ? (
          <section className="mt-8">
            <h2 className="text-[11px] uppercase tracking-[0.35em] text-[color:var(--gold)]">Your work contexts</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {grouped.map(([name, list]) => (
                <span key={name} className="rounded-full border border-border/70 px-3 py-1 text-xs">
                  {name} · {list.length}
                </span>
              ))}
            </div>
          </section>
        ) : null}

        <div className="mt-8 flex gap-2">
          {(["active", "recent", "completed"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-full px-4 py-2 text-xs uppercase tracking-[0.2em] ${
                tab === t ? "bg-[color:var(--gold)] text-background" : "border border-border/70"
              }`}
            >
              {t === "active" ? "Active work" : t === "recent" ? "Recent" : "Completed"}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-3">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Opening your workshop…</p>
          ) : shown.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {tab === "completed"
                ? "Nothing completed yet."
                : "No work here yet. Add the first real thing above."}
            </p>
          ) : (
            shown.map(row)
          )}
        </div>
      </div>
    </SiteShell>
  );
}
