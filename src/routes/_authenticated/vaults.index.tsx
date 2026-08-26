// FRASS-0610 — My Vaults. Owned workspaces only. A template is not a Vault.
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { SiteShell } from "@/components/site-shell";
import { listMyVaults, type VaultRow } from "@/lib/vault-engine/vaults.functions";
import { categoryMeta, subtypeName } from "@/lib/vault-engine/registry";
import { getActiveVaultId, setActiveVaultId } from "@/lib/vault-engine/active-vault";

export const Route = createFileRoute("/_authenticated/vaults/")({
  head: () => ({
    meta: [
      { title: "My Vaults — Frass Hill" },
      {
        name: "description",
        content:
          "Your owned workspaces inside Frass Hill. Create, run and change a Vault yourself — no developer needed.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: MyVaultsPage,
});

function MyVaultsPage() {
  const load = useServerFn(listMyVaults);
  const navigate = useNavigate();
  const { data, isLoading, error } = useQuery({ queryKey: ["my-vaults"], queryFn: () => load() });
  const vaults = (data ?? []) as VaultRow[];
  const active = getActiveVaultId();

  useEffect(() => {
    if (active && vaults.length && !vaults.some((v) => v.id === active)) setActiveVaultId(null);
  }, [active, vaults]);

  return (
    <SiteShell>
      <div className="mx-auto max-w-5xl px-6 py-16">
        <header>
          <div className="text-[11px] uppercase tracking-[0.4em] text-[color:var(--gold)]">
            Frass Hill · My Vaults
          </div>
          <h1 className="mt-4 font-display text-4xl leading-tight md:text-5xl">
            The workspaces you own.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            A Vault is yours — not a suggestion, not a template, not an idea on a shelf. You build it
            here, you change it here, and you never need anybody's permission to do it.
          </p>
        </header>

        <div className="mt-8">
          <Link
            to="/vaults/new"
            className="lux-press inline-block rounded-sm border border-[color:var(--gold)] bg-[color:var(--gold)] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.3em] text-[color:var(--ink)]"
          >
            Create a Vault
          </Link>
        </div>

        <section className="mt-12 grid gap-4">
          {isLoading && <p className="text-sm text-muted-foreground">Opening your Vaults…</p>}
          {error && (
            <p className="text-sm text-destructive">
              I couldn't reach your Vaults just now. Try again in a moment.
            </p>
          )}
          {!isLoading && !error && vaults.length === 0 && (
            <div className="rounded-2xl border border-border/60 bg-background/40 p-10 text-center">
              <p className="font-display text-2xl">You don't own a Vault yet.</p>
              <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
                Nothing is pre-filled and nothing is pretend. When you're ready, tell me what you do
                and I'll build the workspace around it.
              </p>
            </div>
          )}
          {vaults.map((v) => {
            const meta = categoryMeta(v.category);
            const sub = subtypeName(v.category, v.subtype);
            const setup = v.status === "setup_in_progress";
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => {
                  setActiveVaultId(v.id);
                  void navigate({
                    to: setup ? "/vaults/new" : "/vaults/$vaultId",
                    params: setup ? undefined : { vaultId: v.id },
                    search: setup ? { vault: v.id } : undefined,
                  });
                }}
                className={`rounded-2xl border bg-background/60 p-6 text-left backdrop-blur transition hover:border-[color:var(--gold)] ${
                  active === v.id ? "border-[color:var(--gold)]/70" : "border-border/70"
                }`}
              >
                <div className="flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
                  <span>
                    {meta?.glyph} {meta?.name ?? v.category}
                  </span>
                  {sub && <span className="text-muted-foreground">{sub}</span>}
                  {setup && <span className="text-muted-foreground">Setup unfinished</span>}
                  {v.status === "archived" && <span className="text-muted-foreground">Archived</span>}
                  {active === v.id && <span className="text-muted-foreground">Where you were</span>}
                </div>
                <h2 className="mt-2 font-display text-2xl">{v.name}</h2>
                {v.description && (
                  <p className="mt-2 text-sm text-muted-foreground">{v.description}</p>
                )}
                <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  {setup
                    ? "Finish setting it up →"
                    : `${v.enabled_modules.length} sections · last touched ${new Date(v.last_activity_at).toLocaleDateString()}`}
                </p>
              </button>
            );
          })}
        </section>

        <p className="mt-14 text-xs leading-relaxed text-muted-foreground">
          Looking for ideas rather than a workspace?{" "}
          <Link to="/business-vaults" className="text-[color:var(--gold)] underline">
            The Future Business Vault library
          </Link>{" "}
          is still there. Those are suggestions. These are yours.
        </p>
      </div>
    </SiteShell>
  );
}
