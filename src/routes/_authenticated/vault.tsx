import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { SiteShell } from "@/components/site-shell";
import { PageFeedback } from "@/components/page-feedback";
import { VAULT_KINDS } from "@/lib/vault";
import {
  listVaultItems,
  createVaultItem,
  updateVaultItem,
  deleteVaultItem,
  type VaultItem,
} from "@/lib/vault.functions";

export const Route = createFileRoute("/_authenticated/vault")({
  head: () => ({
    meta: [
      { title: "Builder Vault — Frass Operating System" },
      {
        name: "description",
        content:
          "Your living archive inside Frass OS — the work, knowledge, and decisions worth keeping.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: VaultPage,
});

function VaultPage() {
  const load = useServerFn(listVaultItems);
  const create = useServerFn(createVaultItem);
  const update = useServerFn(updateVaultItem);
  const remove = useServerFn(deleteVaultItem);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ["vault"], queryFn: () => load() });

  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<string>("note");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("");
  const [collection, setCollection] = useState("");
  const [tags, setTags] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["vault"] });
  };

  const addItem = useMutation({
    mutationFn: () =>
      create({ data: { title, kind, body, url, collection, tags: tags.split(",") } }),
    onSuccess: () => {
      setTitle("");
      setBody("");
      setUrl("");
      setTags("");
      toast.success("Kept in your Vault.");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const patch = useMutation({
    mutationFn: (vars: { id: string; pinned?: boolean; archived?: boolean }) =>
      update({ data: vars }),
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  const drop = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success("Removed from your Vault.");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const items = data ?? [];
  const collections = useMemo(
    () => Array.from(new Set(items.map((i) => i.collection).filter(Boolean))) as string[],
    [items],
  );

  const visible = items.filter((i) => {
    if (showArchived !== Boolean(i.archived_at)) return false;
    if (filter !== "all" && i.kind !== filter && i.collection !== filter) return false;
    if (query) {
      const hay = `${i.title} ${i.body ?? ""} ${i.tags.join(" ")}`.toLowerCase();
      if (!hay.includes(query.toLowerCase())) return false;
    }
    return true;
  });

  return (
    <SiteShell>
      <div className="mx-auto max-w-5xl px-6 py-16">
        <header className="text-center">
          <div className="text-[11px] uppercase tracking-[0.4em] text-[color:var(--gold)]">
            Builder Vault
          </div>
          <h1 className="mt-4 font-display text-4xl leading-tight md:text-5xl">
            Everything worth keeping.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">
            Your living archive — notes, ideas, links, lessons, and decisions. Private to you,
            carried with you across every district of Frass OS.
          </p>
        </header>

        {/* Keep something */}
        <section className="mt-12 rounded-2xl border border-[color:var(--gold)]/40 bg-background/70 p-8 backdrop-blur">
          <div className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
            Keep something
          </div>
          <form
            className="mt-5 grid gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              addItem.mutate();
            }}
          >
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What is it?"
              className="w-full rounded-sm border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:border-[color:var(--gold)]"
            />
            <div className="grid gap-4 sm:grid-cols-3">
              <select
                value={kind}
                onChange={(e) => setKind(e.target.value)}
                className="rounded-sm border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:border-[color:var(--gold)]"
              >
                {VAULT_KINDS.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.label}
                  </option>
                ))}
              </select>
              <input
                value={collection}
                onChange={(e) => setCollection(e.target.value)}
                placeholder="Collection (optional)"
                className="rounded-sm border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:border-[color:var(--gold)]"
              />
              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Tags, comma separated"
                className="rounded-sm border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:border-[color:var(--gold)]"
              />
            </div>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Link (optional)"
              className="w-full rounded-sm border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:border-[color:var(--gold)]"
            />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              placeholder="The detail — why it matters, what you learned, what to do next."
              className="w-full rounded-sm border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:border-[color:var(--gold)]"
            />
            <div>
              <button
                type="submit"
                disabled={addItem.isPending}
                className="lux-press rounded-sm border border-[color:var(--gold)] bg-[color:var(--gold)] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.3em] text-[color:var(--ink)] disabled:opacity-60"
              >
                {addItem.isPending ? "Keeping…" : "Keep it"}
              </button>
            </div>
          </form>
        </section>

        {/* Filters */}
        <section className="mt-12 flex flex-wrap items-center gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your Vault"
            className="min-w-[200px] flex-1 rounded-sm border border-border bg-background/60 px-4 py-2 text-sm outline-none focus:border-[color:var(--gold)]"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-sm border border-border bg-background/60 px-4 py-2 text-sm outline-none focus:border-[color:var(--gold)]"
          >
            <option value="all">Everything</option>
            {VAULT_KINDS.map((k) => (
              <option key={k.id} value={k.id}>
                {k.label}s
              </option>
            ))}
            {collections.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setShowArchived((v) => !v)}
            className="rounded-sm border border-border px-4 py-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground transition hover:border-[color:var(--gold)]"
          >
            {showArchived ? "Active items" : "Archive"}
          </button>
        </section>

        {/* Items */}
        <section className="mt-8 grid gap-4">
          {isLoading && <p className="text-sm text-muted-foreground">Opening your Vault…</p>}
          {!isLoading && visible.length === 0 && (
            <p className="rounded-2xl border border-border/60 bg-background/40 p-8 text-center text-sm text-muted-foreground">
              {showArchived
                ? "Nothing archived yet."
                : "Your Vault is empty. Keep the first thing worth remembering."}
            </p>
          )}
          {visible.map((item) => (
            <VaultCard
              key={item.id}
              item={item}
              onPin={() => patch.mutate({ id: item.id, pinned: !item.pinned })}
              onArchive={() => patch.mutate({ id: item.id, archived: !item.archived_at })}
              onDelete={() => drop.mutate(item.id)}
            />
          ))}
        </section>

        <div className="mt-16 text-center">
          <Link
            to="/builder-hall"
            className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground transition hover:text-[color:var(--gold)]"
          >
            ← Back to Builder Hall
          </Link>
        </div>

        <PageFeedback pageTitle="Builder Vault" />
      </div>
    </SiteShell>
  );
}

function VaultCard({
  item,
  onPin,
  onArchive,
  onDelete,
}: {
  item: VaultItem;
  onPin: () => void;
  onArchive: () => void;
  onDelete: () => void;
}) {
  const kindLabel = VAULT_KINDS.find((k) => k.id === item.kind)?.label ?? item.kind;
  return (
    <article
      className={`rounded-2xl border bg-background/60 p-6 backdrop-blur transition ${
        item.pinned ? "border-[color:var(--gold)]/60" : "border-border/70"
      }`}
    >
      <div className="flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
        <span>{kindLabel}</span>
        {item.collection && <span className="text-muted-foreground">{item.collection}</span>}
        <span className="text-muted-foreground">
          {new Date(item.created_at).toLocaleDateString()}
        </span>
      </div>
      <h3 className="mt-2 font-display text-xl">{item.title}</h3>
      {item.body && (
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
          {item.body}
        </p>
      )}
      {item.url && (
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-block break-all text-xs text-[color:var(--gold)] underline"
        >
          {item.url}
        </a>
      )}
      {item.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {item.tags.map((t) => (
            <span
              key={t}
              className="rounded-full border border-border px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
            >
              {t}
            </span>
          ))}
        </div>
      )}
      <div className="mt-5 flex flex-wrap gap-4 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
        <button type="button" onClick={onPin} className="transition hover:text-[color:var(--gold)]">
          {item.pinned ? "Unpin" : "Pin"}
        </button>
        <button
          type="button"
          onClick={onArchive}
          className="transition hover:text-[color:var(--gold)]"
        >
          {item.archived_at ? "Restore" : "Archive"}
        </button>
        <button type="button" onClick={onDelete} className="transition hover:text-destructive">
          Delete
        </button>
      </div>
    </article>
  );
}
