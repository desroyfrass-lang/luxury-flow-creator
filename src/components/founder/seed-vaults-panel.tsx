// FRASS-0561 — Founder Seed Vaults.
// Everything the Founder creates while testing is a real asset, listed here
// with its four possible futures: publish, monetize, teach, or hand over.
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  SEED_VAULT_ACTIONS,
  SEED_VAULT_PROMISE,
  SEED_VAULT_STATUS,
  seedVaultSummary,
  type SeedVault,
  type SeedVaultAction,
} from "@/lib/founder/seed-vaults";
import {
  createSeedVault,
  listSeedVaults,
  updateSeedVault,
} from "@/lib/founder/seed-vaults.functions";

export function SeedVaultsPanel() {
  const load = useServerFn(listSeedVaults);
  const create = useServerFn(createSeedVault);
  const update = useServerFn(updateSeedVault);
  const qc = useQueryClient();

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [pending, setPending] = useState<{ id: string; action: SeedVaultAction } | null>(null);
  const [value, setValue] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["founder-seed-vaults"],
    queryFn: () => load(),
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["founder-seed-vaults"] });

  const addVault = useMutation({
    mutationFn: () => create({ data: { title, summary: summary || null } }),
    onSuccess: () => {
      setTitle("");
      setSummary("");
      refresh();
    },
  });

  const applyAction = useMutation({
    mutationFn: (payload: Record<string, unknown>) => update({ data: payload }),
    onSuccess: () => {
      setPending(null);
      setValue("");
      refresh();
    },
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Opening your Seed Vaults…</p>;
  if (error || !data)
    return <p className="text-sm text-muted-foreground">Seed Vaults are unavailable right now.</p>;

  const vaults = data as SeedVault[];
  const stats = seedVaultSummary(vaults);

  const run = (vault: SeedVault, action: SeedVaultAction) => {
    if (action.needs && !pending) {
      setPending({ id: vault.id, action });
      return;
    }
    const payload: Record<string, unknown> = { id: vault.id, status: action.status };
    if (action.needs === "price") payload.price_cents = Math.round(Number(value || 0) * 100);
    if (action.needs === "path-title") payload.academy_path_title = value;
    if (action.needs === "partner") payload.transferred_to = value;
    applyAction.mutate(payload);
  };

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-[color:var(--gold)]/40 bg-[color:var(--gold)]/5 p-5">
        <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--gold)]">FRASS-0561</p>
        <h2 className="mt-2 text-2xl font-black uppercase tracking-tight">🌱 Founder Seed Vaults</h2>
        <p className="mt-2 text-sm text-muted-foreground">{SEED_VAULT_PROMISE}</p>
        <p className="mt-3 text-sm font-semibold">{stats.plain}</p>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {(
          [
            ["🌱 Seeds", stats.seeds],
            ["📖 Published", stats.published],
            ["💰 Monetized", stats.monetized],
            ["🎓 Builder Paths", stats.academy],
            ["🤝 Transferred", stats.transferred],
          ] as const
        ).map(([label, n]) => (
          <div key={label} className="rounded-xl border border-border/70 p-3">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-xl font-black">{n}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-border/70 p-5">
        <h3 className="text-sm font-bold uppercase tracking-wide">Record a Seed Vault</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Anything you built while walking the platform. It is kept permanently and stays yours.
        </p>
        <div className="mt-4 space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What did you create?"
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
          />
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="What is it worth to a member? (optional)"
            rows={2}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
          />
          <button
            type="button"
            disabled={!title.trim() || addVault.isPending}
            onClick={() => addVault.mutate()}
            className="rounded-full bg-[color:var(--gold)] px-5 py-2 text-xs font-bold uppercase tracking-wide text-black disabled:opacity-40"
          >
            {addVault.isPending ? "Saving…" : "Keep this as a Seed Vault"}
          </button>
        </div>
      </section>

      <section className="space-y-3">
        {vaults.map((v) => {
          const status = SEED_VAULT_STATUS[v.status];
          const editing = pending?.id === v.id ? pending.action : null;
          return (
            <article key={v.id} className="rounded-2xl border border-border/70 p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h4 className="text-base font-bold">{v.title}</h4>
                <span className="rounded-full border border-border px-3 py-1 text-xs">
                  {status.emoji} {status.label}
                </span>
              </div>
              {v.summary && <p className="mt-2 text-sm text-muted-foreground">{v.summary}</p>}
              <p className="mt-1 text-xs text-muted-foreground">{status.plain}</p>
              {v.status === "monetized" && v.price_cents != null && (
                <p className="mt-1 text-xs">Listed at ${(v.price_cents / 100).toFixed(2)}.</p>
              )}
              {v.status === "academy_path" && v.academy_path_title && (
                <p className="mt-1 text-xs">Builder Path: {v.academy_path_title}</p>
              )}
              {v.status === "transferred" && v.transferred_to && (
                <p className="mt-1 text-xs">Now owned by {v.transferred_to}.</p>
              )}

              {editing ? (
                <div className="mt-4 space-y-2">
                  <input
                    autoFocus
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={
                      editing.needs === "price"
                        ? "Price in dollars"
                        : editing.needs === "path-title"
                          ? "Name of the Builder Path"
                          : "Partner's name or Frass Link"
                    }
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={!value.trim() || applyAction.isPending}
                      onClick={() => run(v, editing)}
                      className="rounded-full bg-[color:var(--gold)] px-4 py-1.5 text-xs font-bold uppercase text-black disabled:opacity-40"
                    >
                      Confirm {editing.label}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPending(null);
                        setValue("");
                      }}
                      className="rounded-full border border-border px-4 py-1.5 text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 flex flex-wrap gap-2">
                  {SEED_VAULT_ACTIONS.filter((a) => a.status !== v.status).map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => run(v, a)}
                      title={a.plain}
                      className="rounded-full border border-border px-3 py-1.5 text-xs hover:border-[color:var(--gold)]"
                    >
                      {a.emoji} {a.label}
                    </button>
                  ))}
                </div>
              )}
              <p className="mt-3 text-[11px] text-muted-foreground">
                Protected — Frass will never delete this on its own.
              </p>
            </article>
          );
        })}
      </section>
    </div>
  );
}
