// FRASS-0610 — One reusable module workspace. Every section of every Vault
// runs through this same screen, which is why the engine scales.
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  listVaultRecords,
  createVaultRecord,
  updateVaultRecord,
  deleteVaultRecord,
  type VaultRecordRow,
} from "@/lib/vault-engine/vaults.functions";
import { moduleById } from "@/lib/vault-engine/registry";

export const Route = createFileRoute("/_authenticated/vaults/$vaultId/m/$moduleId")({
  component: ModuleWorkspace,
});

function ModuleWorkspace() {
  const { vaultId, moduleId } = Route.useParams();
  const mod = moduleById(moduleId);
  const qc = useQueryClient();

  const load = useServerFn(listVaultRecords);
  const add = useServerFn(createVaultRecord);
  const patch = useServerFn(updateVaultRecord);
  const drop = useServerFn(deleteVaultRecord);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [amount, setAmount] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["vault-records", vaultId, moduleId],
    queryFn: () => load({ data: { vaultId, moduleId } }),
  });

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["vault-records", vaultId] });
    void qc.invalidateQueries({ queryKey: ["vault-records", vaultId, moduleId] });
    void qc.invalidateQueries({ queryKey: ["vault-activity", vaultId] });
  };

  const create = useMutation({
    mutationFn: () =>
      add({
        data: {
          vaultId,
          moduleId,
          title,
          body,
          dueAt: dueAt || undefined,
          amount: amount ? Number(amount) : undefined,
        },
      }),
    onSuccess: () => {
      setTitle("");
      setBody("");
      setDueAt("");
      setAmount("");
      toast.success("Saved in this Vault.");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const change = useMutation({
    mutationFn: (vars: { id: string; status?: string; archived?: boolean }) =>
      patch({ data: { ...vars, vaultId } }),
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => drop({ data: { id, vaultId } }),
    onSuccess: () => {
      toast.success("Removed.");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!mod) {
    return (
      <div className="mt-10 rounded-2xl border border-border/60 p-8 text-sm text-muted-foreground">
        That section isn't part of the Vault engine.
      </div>
    );
  }

  const rows = ((data ?? []) as VaultRecordRow[]).filter((r) => Boolean(r.archived_at) === showArchived);
  const wantsDate = mod.shape === "dated" || mod.shape === "tasks";
  const wantsAmount = mod.shape === "money";

  return (
    <div className="mt-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl">
            {mod.glyph} {mod.name}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{mod.description}</p>
        </div>
        <button
          type="button"
          onClick={() => setShowArchived((s) => !s)}
          className="rounded-sm border border-border px-4 py-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground transition hover:border-[color:var(--gold)]"
        >
          {showArchived ? "Active" : "Archive"}
        </button>
      </header>

      {mod.status === "planned" ? (
        <div className="mt-8 rounded-2xl border border-border/60 bg-background/40 p-8 text-sm text-muted-foreground">
          {mod.emptyState}
        </div>
      ) : (
        <>
          <form
            className="mt-8 grid gap-3 rounded-2xl border border-[color:var(--gold)]/40 bg-background/60 p-6"
            onSubmit={(e) => {
              e.preventDefault();
              create.mutate();
            }}
          >
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={mod.createLabel}
              className="w-full rounded-sm border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:border-[color:var(--gold)]"
            />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              placeholder="Detail (optional)"
              className="w-full rounded-sm border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:border-[color:var(--gold)]"
            />
            {(wantsDate || wantsAmount) && (
              <div className="grid gap-3 sm:grid-cols-2">
                {wantsDate && (
                  <input
                    type="date"
                    value={dueAt}
                    onChange={(e) => setDueAt(e.target.value)}
                    className="rounded-sm border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:border-[color:var(--gold)]"
                  />
                )}
                {wantsAmount && (
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Amount"
                    className="rounded-sm border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:border-[color:var(--gold)]"
                  />
                )}
              </div>
            )}
            <div>
              <button
                type="submit"
                disabled={create.isPending}
                className="lux-press rounded-sm border border-[color:var(--gold)] bg-[color:var(--gold)] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.3em] text-[color:var(--ink)] disabled:opacity-60"
              >
                {create.isPending ? "Saving…" : mod.createLabel}
              </button>
            </div>
          </form>

          <section className="mt-8 grid gap-3">
            {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
            {!isLoading && rows.length === 0 && (
              <p className="rounded-2xl border border-border/60 bg-background/40 p-8 text-center text-sm text-muted-foreground">
                {showArchived ? "Nothing archived here." : mod.emptyState}
              </p>
            )}
            {rows.map((r) => (
              <article
                key={r.id}
                className="rounded-2xl border border-border/70 bg-background/50 p-5"
              >
                <div className="flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  <span>{new Date(r.created_at).toLocaleDateString()}</span>
                  {r.due_at && <span>Due {new Date(r.due_at).toLocaleDateString()}</span>}
                  {r.amount !== null && <span>{r.amount}</span>}
                  <span className="text-[color:var(--gold)]">{r.status}</span>
                </div>
                <h3 className="mt-2 font-display text-lg">{r.title}</h3>
                {r.body && (
                  <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{r.body}</p>
                )}
                <div className="mt-4 flex flex-wrap gap-4 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  <button
                    type="button"
                    onClick={() =>
                      change.mutate({ id: r.id, status: r.status === "done" ? "open" : "done" })
                    }
                    className="transition hover:text-[color:var(--gold)]"
                  >
                    {r.status === "done" ? "Reopen" : "Mark done"}
                  </button>
                  <button
                    type="button"
                    onClick={() => change.mutate({ id: r.id, archived: !r.archived_at })}
                    className="transition hover:text-[color:var(--gold)]"
                  >
                    {r.archived_at ? "Restore" : "Archive"}
                  </button>
                  <button
                    type="button"
                    onClick={() => remove.mutate(r.id)}
                    className="transition hover:text-destructive"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </section>
        </>
      )}
    </div>
  );
}
