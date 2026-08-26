// FRASS-0610 — Customize. The member changes their own workspace, in product.
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  getVault,
  updateVaultModules,
  updateVaultDetails,
  deleteVault,
  type VaultRow,
} from "@/lib/vault-engine/vaults.functions";
import { modulesFor } from "@/lib/vault-engine/registry";
import { setActiveVaultId } from "@/lib/vault-engine/active-vault";

export const Route = createFileRoute("/_authenticated/vaults/$vaultId/customize")({
  component: CustomizeVault,
});

function CustomizeVault() {
  const { vaultId } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const fetchVault = useServerFn(getVault);
  const saveModules = useServerFn(updateVaultModules);
  const saveDetails = useServerFn(updateVaultDetails);
  const removeVault = useServerFn(deleteVault);

  const { data } = useQuery({
    queryKey: ["vault", vaultId],
    queryFn: () => fetchVault({ data: { vaultId } }),
  });

  const [enabled, setEnabled] = useState<string[]>([]);
  const [hidden, setHidden] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [confirm, setConfirm] = useState("");

  useEffect(() => {
    const v = (data as { vault: VaultRow } | null | undefined)?.vault;
    if (!v) return;
    setEnabled(v.enabled_modules);
    setHidden(v.hidden_modules);
    setName(v.name);
    setDescription(v.description ?? "");
  }, [data]);

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["vault", vaultId] });
    void qc.invalidateQueries({ queryKey: ["my-vaults"] });
  };

  const persistModules = useMutation({
    mutationFn: () => saveModules({ data: { vaultId, enabled, hidden } }),
    onSuccess: () => {
      toast.success("Your Vault now looks the way you want it.");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const persistDetails = useMutation({
    mutationFn: () => saveDetails({ data: { vaultId, name, description } }),
    onSuccess: () => {
      toast.success("Saved.");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const archive = useMutation({
    mutationFn: () => saveDetails({ data: { vaultId, status: "archived" } }),
    onSuccess: () => {
      toast.success("Archived. Nothing was deleted.");
      invalidate();
      void navigate({ to: "/vaults" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const destroy = useMutation({
    mutationFn: () => removeVault({ data: { vaultId } }),
    onSuccess: () => {
      setActiveVaultId(null);
      toast.success("Vault deleted.");
      invalidate();
      void navigate({ to: "/vaults" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const vault = (data as { vault: VaultRow; role: string } | null | undefined)?.vault;
  const available = modulesFor(vault?.category ?? "business");
  const isOwner = (data as { role?: string } | null | undefined)?.role === "owner";

  return (
    <div className="mt-8 grid gap-8">
      <section className="rounded-2xl border border-border/70 bg-background/50 p-6">
        <h2 className="font-display text-2xl">What this Vault is called</h2>
        <div className="mt-4 grid gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-sm border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:border-[color:var(--gold)]"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="A line about what this Vault is for (optional)"
            className="rounded-sm border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:border-[color:var(--gold)]"
          />
          <div>
            <button
              type="button"
              onClick={() => persistDetails.mutate()}
              className="rounded-sm border border-[color:var(--gold)] px-6 py-3 text-[11px] uppercase tracking-[0.3em] text-[color:var(--gold)]"
            >
              Save
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border/70 bg-background/50 p-6">
        <h2 className="font-display text-2xl">Your sections</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Turn a section on to use it. Hide one to tidy it away — hidden never means deleted, and
          your records stay exactly where you left them.
        </p>
        <div className="mt-5 grid gap-3">
          {available.map((m) => {
            const on = enabled.includes(m.id);
            const isHidden = hidden.includes(m.id);
            return (
              <div
                key={m.id}
                className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4 ${
                  on && !isHidden ? "border-[color:var(--gold)]/50" : "border-border/60"
                }`}
              >
                <div>
                  <div className="font-display text-lg">
                    {m.glyph} {m.name}
                  </div>
                  <p className="text-xs text-muted-foreground">{m.description}</p>
                </div>
                <div className="flex gap-3 text-[10px] uppercase tracking-[0.25em]">
                  <button
                    type="button"
                    disabled={m.id === "home"}
                    onClick={() =>
                      setEnabled((c) => (on ? c.filter((x) => x !== m.id) : [...c, m.id]))
                    }
                    className="rounded-sm border border-border px-4 py-2 text-muted-foreground transition hover:border-[color:var(--gold)] disabled:opacity-40"
                  >
                    {on ? "Turn off" : "Turn on"}
                  </button>
                  <button
                    type="button"
                    disabled={!on || m.id === "home"}
                    onClick={() =>
                      setHidden((c) => (isHidden ? c.filter((x) => x !== m.id) : [...c, m.id]))
                    }
                    className="rounded-sm border border-border px-4 py-2 text-muted-foreground transition hover:border-[color:var(--gold)] disabled:opacity-40"
                  >
                    {isHidden ? "Unhide" : "Hide"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => persistModules.mutate()}
          disabled={persistModules.isPending}
          className="lux-press mt-6 rounded-sm border border-[color:var(--gold)] bg-[color:var(--gold)] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.3em] text-[color:var(--ink)] disabled:opacity-60"
        >
          {persistModules.isPending ? "Saving…" : "Save my layout"}
        </button>
      </section>

      {isOwner && (
        <section className="rounded-2xl border border-destructive/40 bg-background/50 p-6">
          <h2 className="font-display text-2xl">Closing this Vault</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Archiving puts it away and keeps everything. Deleting removes the Vault and its records
            for good — type the Vault's name if you truly mean it.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => archive.mutate()}
              className="rounded-sm border border-border px-5 py-3 text-[11px] uppercase tracking-[0.25em] text-muted-foreground"
            >
              Archive
            </button>
            <input
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder={vault?.name ?? "Vault name"}
              className="rounded-sm border border-border bg-background/60 px-4 py-3 text-sm outline-none"
            />
            <button
              type="button"
              disabled={confirm !== vault?.name || destroy.isPending}
              onClick={() => destroy.mutate()}
              className="rounded-sm border border-destructive px-5 py-3 text-[11px] uppercase tracking-[0.25em] text-destructive disabled:opacity-40"
            >
              Delete for good
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
