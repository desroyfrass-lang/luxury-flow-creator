// FRASS-0610 — Vault Home. What needs you today, in this Vault only.
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import {
  getVault,
  listVaultRecords,
  listVaultActivity,
  type VaultRow,
  type VaultRecordRow,
  type VaultActivityRow,
} from "@/lib/vault-engine/vaults.functions";
import { moduleById } from "@/lib/vault-engine/registry";

export const Route = createFileRoute("/_authenticated/vaults/$vaultId/")({
  component: VaultHome,
});

function VaultHome() {
  const { vaultId } = Route.useParams();
  const fetchVault = useServerFn(getVault);
  const records = useServerFn(listVaultRecords);
  const activity = useServerFn(listVaultActivity);

  const v = useQuery({ queryKey: ["vault", vaultId], queryFn: () => fetchVault({ data: { vaultId } }) });
  const r = useQuery({
    queryKey: ["vault-records", vaultId],
    queryFn: () => records({ data: { vaultId } }),
  });
  const a = useQuery<VaultActivityRow[]>({
    queryKey: ["vault-activity", vaultId],
    queryFn: () => activity({ data: { vaultId } }),
  });

  const vault = (v.data as { vault: VaultRow } | null | undefined)?.vault;
  const rows = ((r.data ?? []) as VaultRecordRow[]).filter((x) => !x.archived_at);
  const openTasks = rows.filter((x) => x.module_id === "tasks" && x.status !== "done");
  const upcoming = rows
    .filter((x) => x.due_at && new Date(x.due_at).getTime() >= Date.now() - 86400000)
    .sort((x, y) => (x.due_at ?? "").localeCompare(y.due_at ?? ""))
    .slice(0, 5);
  const goals = rows.filter((x) => x.module_id === "goals").slice(0, 3);
  const sections = ((vault?.enabled_modules ?? []) as string[]).filter(
    (m) => m !== "home" && !(vault?.hidden_modules ?? []).includes(m),
  );

  const important =
    typeof vault?.setup_answers?.["most_important"] === "string"
      ? (vault.setup_answers["most_important"] as string)
      : "";

  return (
    <div className="mt-8 grid gap-6">
      {important && (
        <div className="rounded-2xl border border-[color:var(--gold)]/40 bg-background/60 p-6">
          <div className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
            What you told me this Vault is for
          </div>
          <p className="mt-2 text-sm leading-relaxed">{important}</p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-border/70 bg-background/50 p-6">
          <h2 className="font-display text-xl">✅ Still open</h2>
          {openTasks.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Nothing outstanding. That's a real answer, not an empty screen.
            </p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {openTasks.slice(0, 6).map((t) => (
                <li key={t.id} className="text-muted-foreground">
                  · {t.title}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-border/70 bg-background/50 p-6">
          <h2 className="font-display text-xl">📅 Coming up</h2>
          {upcoming.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No dates on the horizon.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {upcoming.map((t) => (
                <li key={t.id} className="text-muted-foreground">
                  · {new Date(t.due_at as string).toLocaleDateString()} — {t.title}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {goals.length > 0 && (
        <section className="rounded-2xl border border-border/70 bg-background/50 p-6">
          <h2 className="font-display text-xl">🏁 Goals</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {goals.map((g) => (
              <li key={g.id}>· {g.title}</li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="font-display text-xl">Your sections</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((id) => {
            const m = moduleById(id);
            if (!m) return null;
            const count = rows.filter((x) => x.module_id === id).length;
            return (
              <Link
                key={id}
                to="/vaults/$vaultId/m/$moduleId"
                params={{ vaultId, moduleId: id }}
                className="rounded-2xl border border-border/70 bg-background/50 p-5 transition hover:border-[color:var(--gold)]"
              >
                <div className="font-display text-lg">
                  {m.glyph} {m.name}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{m.description}</p>
                <p className="mt-3 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  {m.status === "planned" ? "Being fitted" : `${count} recorded`}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-border/70 bg-background/50 p-6">
        <h2 className="font-display text-xl">🕰️ What's happened here</h2>
        {(a.data ?? []).length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Nothing recorded yet.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {(a.data ?? []).slice(0, 10).map((e) => (
              <li key={e.id}>
                · {new Date(e.created_at).toLocaleString()} — {e.summary}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
